import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// ── Step 1: Load .env ────────────────────────────────────────────────────────
dotenv.config();

// ── Step 2: Validate every required environment variable at startup ──────────
// This must run BEFORE importing any module that reads process.env (Firebase,
// Prisma, JWT, etc.) so that a clear diagnostic is printed on misconfiguration.
import { validateEnv } from './lib/envValidator';
validateEnv();

// Import Routes & Middlewares
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import heroRoutes from './routes/heroRoutes';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allows images to be loaded on frontend
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Rate Limiter for APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', apiLimiter);

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // registers /api/products, /api/categories, /api/reviews
app.use('/api', orderRoutes);   // registers /api/orders, /api/coupons
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);  // registers /api/upload
app.use('/api', heroRoutes);    // registers /api/hero/banners, /api/hero/cards

// Root endpoint for status checks
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Centralized Error Handler
app.use(errorHandler);

// Start listening
const server = app.listen(PORT, () => {
  console.log(`[Jaraviea Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

export default server;
