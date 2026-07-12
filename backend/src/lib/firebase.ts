import admin from 'firebase-admin';

// Check if credentials exist in env
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Fix private key formatting from env variables (replaces escaped newlines)
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

export let isFirebaseReady = false;
let bucket: any = null;

if (projectId && clientEmail && privateKey && bucketName) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: bucketName,
      databaseURL: "https://zarevia-default-rtdb.firebaseio.com"
    });
    bucket = admin.storage().bucket();
    isFirebaseReady = true;
    console.log('[Firebase Storage] SDK initialized successfully.');
  } catch (err) {
    console.warn('[Firebase Storage] Failed to initialize:', err);
  }
} else {
  console.info('[Firebase Storage] Credentials not configured. Local disk storage fallback will be active.');
}

/**
 * Uploads a file buffer directly to Firebase Storage bucket and returns a public URL.
 */
export const uploadToFirebase = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  if (!isFirebaseReady || !bucket) {
    throw new Error('Firebase Storage is not initialized.');
  }

  // Create a unique destination path
  const file = bucket.file(`uploads/${Date.now()}-${fileName}`);

  // Upload file buffer
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
    },
  });

  // Make the file publicly readable
  await file.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${bucketName}/${file.name}`;
};

/**
 * Syncs a document/object to Firebase Realtime Database.
 */
export const syncToFirebase = async (path: string, data: any) => {
  if (!isFirebaseReady) return;
  try {
    const db = admin.database();
    // Replace Decimal objects, Date objects, or BigInts with standard JSON primitives before pushing to Firebase
    const sanitized = JSON.parse(JSON.stringify(data));
    await db.ref(path).set(sanitized);
  } catch (err) {
    console.error(`[Firebase DB] Sync error at path ${path}:`, err);
  }
};

/**
 * Removes a document/object from Firebase Realtime Database.
 */
export const deleteFromFirebase = async (path: string) => {
  if (!isFirebaseReady) return;
  try {
    const db = admin.database();
    await db.ref(path).remove();
  } catch (err) {
    console.error(`[Firebase DB] Delete error at path ${path}:`, err);
  }
};

/**
 * Deletes a file from Firebase Cloud Storage bucket.
 */
export const deleteFromFirebaseStorage = async (storagePath: string) => {
  if (!isFirebaseReady || !bucket) return;
  try {
    const file = bucket.file(storagePath);
    await file.delete();
    console.log(`[Firebase Storage] Deleted file: ${storagePath}`);
  } catch (err) {
    console.error(`[Firebase Storage] Failed to delete file ${storagePath}:`, err);
  }
};
