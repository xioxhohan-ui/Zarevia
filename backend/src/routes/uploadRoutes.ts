import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireRole } from '../middleware/auth';
import { ApiError } from '../middleware/error';
import { isFirebaseReady, uploadToFirebase, deleteFromFirebaseStorage } from '../lib/firebase';
import prisma from '../lib/prisma';

const router = Router();

// Local upload directory path — only used as a fallback when Firebase is unavailable.
// NOTE: Do NOT create the directory at module load time; serverless environments
// (e.g., AWS Lambda /var/task) have a read-only filesystem.
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Local Upload] Could not create upload directory (read-only filesystem?):', err);
  }
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
      ensureUploadDir();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      filename = 'img-' + uniqueSuffix + path.extname(req.file.originalname);
      const filePath = path.join(UPLOAD_DIR, filename);
      
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/${filename}`;
      console.log(`[Local Upload] Saved file: ${filename}`);
    }

    // 3. Create MediaLibrary metadata record in PostgreSQL
    const media = await prisma.mediaLibrary.create({
      data: {
        fileName: req.file.originalname,
        storagePath: isFirebaseReady ? `uploads/${filename}` : `/uploads/${filename}`,
        downloadUrl: fileUrl,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedById: req.user?.id || null,
        folder: 'uploads',
        status: 'ACTIVE',
      }
    });

    return res.json({
      url: fileUrl,
      filename,
      size: req.file.size,
      mediaId: media.id,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/upload/:id
// Authorized for admins/managers/superadmins
router.delete('/upload/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MANAGER']), async (req: any, res: Response, next) => {
  try {
    const { id } = req.params;
    
    // Find the record in PostgreSQL
    const media = await prisma.mediaLibrary.findUnique({
      where: { id }
    });
    
    if (!media) {
      throw new ApiError(404, 'Media file not found');
    }
    
    if (isFirebaseReady && media.storagePath.startsWith('uploads/')) {
      // 1. Delete from Firebase Storage
      await deleteFromFirebaseStorage(media.storagePath);
    } else {
      // 2. Delete from local disk
      const cleanPath = media.storagePath.replace(/^\//, ''); // Strip leading slash if present
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Local Upload] Deleted local file: ${media.storagePath}`);
      }
    }
    
    // 3. Delete the metadata record in PostgreSQL (or soft delete)
    await prisma.mediaLibrary.delete({
      where: { id }
    });
    
    return res.json({ success: true, message: 'Media file deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
