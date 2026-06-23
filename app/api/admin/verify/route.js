import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebaseAdmin';

/**
 * POST /api/admin/verify
 *
 * Accepts a Firebase ID Token from the client, verifies it with
 * Firebase Admin SDK, then checks the Firestore `admins/{uid}` document
 * for role === 'admin'.
 *
 * The secret service-account key and admin role data never leave the server.
 */
export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ authorized: false, error: 'No token provided' }, { status: 400 });
    }

    // Lazily initialize Admin SDK (skipped during build, only runs at request time)
    const { adminAuth, adminDb } = await getAdminServices();

    // 1. Verify the Firebase ID Token server-side
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ authorized: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // 2. Check Firestore admins collection for role
    const adminDoc = await adminDb.collection('admins').doc(uid).get();

    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ authorized: false, error: 'Access denied: not an admin' }, { status: 403 });
    }

    return NextResponse.json({ authorized: true, uid });
  } catch (err) {
    console.error('[Admin Verify] Unexpected error:', err);
    return NextResponse.json({ authorized: false, error: 'Server error' }, { status: 500 });
  }
}
