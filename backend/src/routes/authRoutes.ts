import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { cacheSet, cacheGet, cacheDel } from '../lib/redis';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../middleware/error';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jaraviea_super_secret_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jaraviea_refresh_secret_key_999';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper to generate tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Count users to assign role: first user becomes SUPERADMIN, others default to CUSTOMER
    const count = await prisma.user.count();
    const role = count === 0 ? 'SUPERADMIN' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role,
      },
    });

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    
    // Store refresh token in cache/redis for rotation validation
    await cacheSet(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    await cacheSet(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    return res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token required');
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      throw new ApiError(403, 'Invalid or expired refresh token');
    }

    // Verify refresh token matches stored token in cache
    const storedToken = await cacheGet<string>(`refresh_token:${payload.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(403, 'Token revoked or invalid');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    await cacheSet(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    return res.json({
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user) {
      await cacheDel(`refresh_token:${req.user.id}`);
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });
    
    if (!user) throw new ApiError(404, 'User not found');

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/users (Admin only)
router.get('/users', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/auth/users/:id/role (Superadmin only)
router.put('/users/:id/role', authenticateToken, requireRole(['SUPERADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['SUPERADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'].includes(role)) {
      throw new ApiError(400, 'Invalid role assignment');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });

    return res.json({ message: 'User role updated successfully', user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
