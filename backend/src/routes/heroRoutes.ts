import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ApiError } from '../middleware/error';

const router = Router();

// Validation Schemas
const bannerSchema = z.object({
  heading: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  buttonText: z.string().default('Shop Now'),
  buttonUrl: z.string().default('/'),
  desktopImageUrl: z.string(),
  tabletImageUrl: z.string().optional().nullable(),
  mobileImageUrl: z.string().optional().nullable(),
  discountBadge: z.string().optional().nullable(),
  overlayColor: z.string().default('rgba(0,0,0,0.3)'),
  duration: z.number().int().min(1).default(5),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

const promoCardSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  discountText: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  buttonText: z.string().default('Explore'),
  buttonUrl: z.string().default('/'),
  imageUrl: z.string(),
  isActive: z.boolean().default(true),
  showOnDesktop: z.boolean().default(true),
  showOnLaptop: z.boolean().default(true),
  showOnTablet: z.boolean().default(true),
  showOnMobile: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// @route   GET /api/hero/banners
// Fetch active, currently scheduled banners
router.get('/hero/banners', async (req, res, next) => {
  try {
    const now = new Date();
    const banners = await prisma.heroBanner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(banners);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/hero/cards
// Fetch active, currently scheduled promotional cards
router.get('/hero/cards', async (req, res, next) => {
  try {
    const now = new Date();
    const cards = await prisma.promoCard.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(cards);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN ENDPOINTS (CRUD Banners)
// ==========================================

// Get all banners (including inactive ones)
router.get('/admin/hero/banners', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(banners);
  } catch (err) {
    next(err);
  }
});

// Create Hero Banner
router.post('/admin/hero/banners', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = bannerSchema.parse(req.body);
    const banner = await prisma.heroBanner.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    return res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
});

// Update Hero Banner
router.put('/admin/hero/banners/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = bannerSchema.parse(req.body);
    const banner = await prisma.heroBanner.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    return res.json(banner);
  } catch (err) {
    next(err);
  }
});

// Delete Hero Banner
router.delete('/admin/hero/banners/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    await prisma.heroBanner.delete({
      where: { id: req.params.id }
    });
    return res.json({ message: 'Hero banner deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN ENDPOINTS (CRUD Promo Cards)
// ==========================================

// Get all promo cards (including inactive ones)
router.get('/admin/hero/cards', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const cards = await prisma.promoCard.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(cards);
  } catch (err) {
    next(err);
  }
});

// Create Promo Card
router.post('/admin/hero/cards', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = promoCardSchema.parse(req.body);
    const card = await prisma.promoCard.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    return res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

// Update Promo Card
router.put('/admin/hero/cards/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const data = promoCardSchema.parse(req.body);
    const card = await prisma.promoCard.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      }
    });
    return res.json(card);
  } catch (err) {
    next(err);
  }
});

// Delete Promo Card
router.delete('/admin/hero/cards/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    await prisma.promoCard.delete({
      where: { id: req.params.id }
    });
    return res.json({ message: 'Promo card deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/settings
// Fetch public website settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const formatted: { [key: string]: string } = {};
    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });
    return res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
