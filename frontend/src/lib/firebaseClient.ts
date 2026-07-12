/**
 * ============================================================
 * Firebase Client SDK — Singleton Initializer
 * ============================================================
 *
 * FRONTEND ONLY — Safe to import in browser code.
 *
 * Uses VITE_ prefixed environment variables which are embedded
 * into the browser bundle at build time.
 *
 * NEVER import firebase-admin or any Admin SDK here.
 * NEVER put FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL here.
 * ============================================================
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

// ─── Client SDK configuration (public — safe in browser) ─────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN            || 'zarevia.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID             || 'zarevia',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET         || 'zarevia.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Singleton initialization ─────────────────────────────────────────────────
let app: FirebaseApp;
let storage: FirebaseStorage;
let auth: Auth;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app     = initializeApp(firebaseConfig);
} else {
  app     = getApp();
}

storage = getStorage(app);
auth    = getAuth(app);

// Analytics only works in the browser (not SSR / Node)
isSupported().then((supported) => {
  if (supported && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    analytics = getAnalytics(app);
  }
});

export { app, storage, auth, analytics };
