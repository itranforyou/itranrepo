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

/**
 * Safely parses and normalizes a private key string.
 * Handles:
 * - Trimming surrounding whitespace
 * - Stripping accidental outer single or double quotes
 * - Converting literal \n sequences to actual newlines
 * - Preserving PEM header/footer and newline structure
 */
export function formatPrivateKey(rawKey) {
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, '').trim();
  return unquoted.replace(/\\n/g, '\n');
}

export async function getAdminServices() {
  if (_adminAuth && _adminDb) {
    return { adminAuth: _adminAuth, adminDb: _adminDb };
  }

  const projectId = (
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID
  )?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    const err = new Error(
      'Firebase Admin SDK environment variables are missing. ' +
      'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
    err.code = 'MISSING_ENV_VARS';
    throw err;
  }

  const privateKey = formatPrivateKey(rawKey);

  if (!privateKey || !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    const err = new Error(
      'Firebase Admin private key format is invalid. Ensure PEM header "-----BEGIN PRIVATE KEY-----" is present.'
    );
    err.code = 'INVALID_PRIVATE_KEY';
    throw err;
  }

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');

  let app;
  try {
    app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
  } catch (initErr) {
    const isKeyError =
      initErr.message?.includes('DECODER') ||
      initErr.message?.includes('private key') ||
      initErr.code === 'ERR_CRYPTO_' ||
      initErr.code === 'ERR_OSSL_';
    const err = new Error(
      'Firebase Admin initialization failed: ' + (isKeyError ? 'private key parse error' : initErr.message)
    );
    err.code = isKeyError ? 'INVALID_PRIVATE_KEY' : 'INIT_FAILED';
    throw err;
  }

  _adminAuth = getAuth(app);
  _adminDb = getFirestore(app);

  return { adminAuth: _adminAuth, adminDb: _adminDb };
}

