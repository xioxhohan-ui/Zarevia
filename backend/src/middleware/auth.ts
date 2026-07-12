import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RoleName } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'jaraviea_super_secret_key_123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: RoleName;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }

    req.user = decoded as { id: string; email: string; role: RoleName };
    next();
  });
};

export const requireRole = (allowedRoles: RoleName[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};
