import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ApiError } from '../middleware/error';
import { isFirebaseReady, uploadToFirebase } from '../lib/firebase';

const router = Router();

// Ensure local public upload directory exists (used for fallback)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer in-memory storage configuration
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// @route   POST /api/upload
// Authorized for admins/managers/superadmins
router.post('/upload', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), upload.single('image'), async (req: any, res: Response, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    let fileUrl = '';
    let filename = '';

    if (isFirebaseReady) {
      // 1. Upload to Firebase Storage
      filename = `${Date.now()}-${req.file.originalname}`;
      fileUrl = await uploadToFirebase(req.file.buffer, req.file.originalname, req.file.mimetype);
      console.log(`[Firebase Storage] Uploaded file: ${filename}`);
    } else {
      // 2. Fall back to local disk storage
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      filename = 'img-' + uniqueSuffix + path.extname(req.file.originalname);
      const filePath = path.join(UPLOAD_DIR, filename);
      
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/${filename}`;
      console.log(`[Local Upload] Saved file: ${filename}`);
    }

    return res.json({
      url: fileUrl,
      filename,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
