/**
 * ============================================================
 * Firebase Admin SDK — Singleton Initializer
 * ============================================================
 *
 * BACKEND ONLY — Never import this in frontend code.
 *
 * All credentials are loaded from environment variables.
 * Firebase is initialized only once (guarded against hot-reload
 * double-initialization in ts-node-dev and Next.js dev mode).
 *
 * Private key \n escaping is handled automatically.
 * ============================================================
 */

import admin from 'firebase-admin';

// ─── Credential extraction ────────────────────────────────────────────────────
const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const bucketName  = process.env.FIREBASE_STORAGE_BUCKET;

// Automatically convert escaped \n (from .env files and Vercel) into real newlines
const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// ─── State ────────────────────────────────────────────────────────────────────
export let isFirebaseReady = false;
export let bucket: ReturnType<ReturnType<typeof admin.storage>['bucket']> | null = null;

// ─── Initialization guard (singleton) ─────────────────────────────────────────
if (projectId && clientEmail && privateKey && bucketName) {
  if (!admin.apps.length) {
    // First initialization — no existing app
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: bucketName,
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
      });
      bucket = admin.storage().bucket();
      isFirebaseReady = true;
      console.log('[Firebase Admin] ✓ SDK initialized successfully.');
    } catch (err) {
      console.error('[Firebase Admin] ✗ Initialization failed:', err);
    }
  } else {
    // Already initialized (hot-reload / multiple imports)
    bucket = admin.storage().bucket();
    isFirebaseReady = true;
    console.log('[Firebase Admin] ✓ Reusing existing app instance.');
  }
} else {
  const missing = [
    !projectId   && 'FIREBASE_PROJECT_ID',
    !clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !privateKey  && 'FIREBASE_PRIVATE_KEY',
    !bucketName  && 'FIREBASE_STORAGE_BUCKET',
  ].filter(Boolean);

  console.warn(
    `[Firebase Admin] ⚠ Credentials missing: ${missing.join(', ')}. ` +
    'Storage uploads will fall back to local disk.'
  );
}

// ─── Storage: Upload ──────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Firebase Cloud Storage.
 * Returns a permanent public download URL.
 *
 * @param fileBuffer   Raw file bytes
 * @param originalName Original filename (used to build the storage path)
 * @param mimeType     MIME type e.g. 'image/webp'
 * @param folder       Destination folder: 'products' | 'banners' | 'avatars' | etc.
 */
export const uploadToFirebase = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: StorageFolder = 'uploads'
): Promise<string> => {
  if (!isFirebaseReady || !bucket) {
    throw new Error('[Firebase Admin] Storage not initialized — check credentials.');
  }

  const safeName   = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${folder}/${Date.now()}-${safeName}`;
  const file        = bucket.file(storagePath);

  await file.save(fileBuffer, { metadata: { contentType: mimeType } });
  await file.makePublic();

  const url = `https://storage.googleapis.com/${bucketName}/${storagePath}`;
  console.log(`[Firebase Storage] ✓ Uploaded → ${url}`);
  return url;
};

/**
 * Delete a file from Firebase Cloud Storage by its storage path.
 */
export const deleteFromFirebaseStorage = async (storagePath: string): Promise<void> => {
  if (!isFirebaseReady || !bucket) return;
  try {
    await bucket.file(storagePath).delete();
    console.log(`[Firebase Storage] ✓ Deleted: ${storagePath}`);
  } catch (err) {
    console.error(`[Firebase Storage] ✗ Delete failed for ${storagePath}:`, err);
  }
};

// ─── Realtime Database: Sync ──────────────────────────────────────────────────

/**
 * Write/overwrite a node in Firebase Realtime Database.
 */
export const syncToFirebase = async (path: string, data: unknown): Promise<void> => {
  if (!isFirebaseReady) return;
  try {
    const sanitized = JSON.parse(JSON.stringify(data)); // strip Dates, Decimals, BigInts
    await admin.database().ref(path).set(sanitized);
  } catch (err) {
    console.error(`[Firebase DB] ✗ Sync error at ${path}:`, err);
  }
};

/**
 * Remove a node from Firebase Realtime Database.
 */
export const deleteFromFirebase = async (path: string): Promise<void> => {
  if (!isFirebaseReady) return;
  try {
    await admin.database().ref(path).remove();
  } catch (err) {
    console.error(`[Firebase DB] ✗ Delete error at ${path}:`, err);
  }
};

// ─── Storage folder type ──────────────────────────────────────────────────────
export type StorageFolder =
  | 'products'     // Product images, galleries, zoom images
  | 'categories'   // Category banners and thumbnails
  | 'banners'      // Hero slider banners
  | 'promos'       // Promotional offer card images
  | 'brands'       // Brand logo images
  | 'reviews'      // Customer review photos and videos
  | 'avatars'      // User profile pictures
  | 'blog'         // Blog post images
  | 'cms'          // CMS page images
  | 'email'        // Email template assets
  | 'uploads';     // Generic / unclassified uploads
