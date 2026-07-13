/**
 * ============================================================
 * Firebase Client SDK — Singleton Initializer
 * ============================================================
 *
 * FRONTEND ONLY — Never import firebase-admin here.
 *
 * Exports ready-to-use Firebase service instances.
 * Guarded against double-initialization in Next.js dev mode.
 * ============================================================
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth,        type Auth }        from 'firebase/auth';
import { getFirestore,   type Firestore }   from 'firebase/firestore';
import { getDatabase,    type Database }    from 'firebase/database';
import { getStorage,     type FirebaseStorage } from 'firebase/storage';

// ─── Config (loaded from .env.local) ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ─── App singleton (guards against Next.js hot-reload re-init) ───────────────
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ─── Service exports ──────────────────────────────────────────────────────────
export const auth:     Auth            = getAuth(app);
export const db:       Firestore       = getFirestore(app);
export const rtdb:     Database        = getDatabase(app);
export const storage:  FirebaseStorage = getStorage(app);

// Analytics is browser-only (not available during SSR/build)
export const getFirebaseAnalytics = async () => {
  if (typeof window === 'undefined') return null;
  const { getAnalytics } = await import('firebase/analytics');
  return getAnalytics(app);
};

export default app;
