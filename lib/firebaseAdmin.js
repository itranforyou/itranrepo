/**
 * Firebase Admin SDK — server-side only. Lazy initialization.
 * Credentials are loaded exclusively from environment variables.
 * Never imported by any client-side ('use client') module.
 *
 * Initialization is deferred to the first call of getAdminServices()
 * so that next build does not try to parse credentials during
 * static page generation.
 */

let _adminAuth = null;
let _adminDb = null;

export async function getAdminServices() {
  if (_adminAuth && _adminDb) {
    return { adminAuth: _adminAuth, adminDb: _adminDb };
  }

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
    throw new Error(
      'Firebase Admin SDK environment variables are missing. ' +
      'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
  }

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey,
          }),
        });

  _adminAuth = getAuth(app);
  _adminDb = getFirestore(app);

  return { adminAuth: _adminAuth, adminDb: _adminDb };
}
