import { NextResponse } from 'next/server';
import { getAdminServices, formatPrivateKey } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

/**
 * Generate a Google OAuth2 access token for Google Analytics Data API
 * using standard Node.js crypto module (zero external dependencies).
 */
async function getGoogleAnalyticsToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = `${base64url(header)}.${base64url(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  sign.end();
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || errorData.error || 'Failed to exchange JWT for Google access token');
  }

  const data = await res.json();
  return data.access_token;
}

async function queryActiveUsers(accessToken, propertyId, startDate, endDate) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'activeUsers' }],
    }),
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw data;
  }

  const rawValue = data?.rows?.[0]?.metricValues?.[0]?.value;
  return rawValue ? parseInt(rawValue, 10) : 0;
}

export async function GET(request) {
  try {
    // 1. Authenticate admin using existing Firebase Admin authorization pattern
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
    }

    // 2. Safely verify environment variable presence (booleans only, never expose values)
    const projectId = (
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID
    )?.trim();

    const envPresence = {
      projectIdPresent: Boolean(projectId),
      clientEmailPresent: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim()),
      privateKeyPresent: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()),
      ga4PropertyIdPresent: Boolean((process.env.GA4_PROPERTY_ID || '538126375')?.trim()),
    };

    console.log('[GA4 Visitors API] Runtime environment presence:', envPresence);

    if (!envPresence.projectIdPresent || !envPresence.clientEmailPresent || !envPresence.privateKeyPresent) {
      console.warn('[GA4 Visitors API] Missing Firebase Admin environment variables:', envPresence);
      return NextResponse.json({
        configured: false,
        reason: 'missing_environment_variable',
        message: 'Firebase Admin credentials missing or unconfigured in production environment.',
      }, { status: 200 });
    }

    let adminAuth, adminDb;
    try {
      const services = await getAdminServices();
      adminAuth = services.adminAuth;
      adminDb = services.adminDb;
    } catch (adminInitErr) {
      console.error('[GA4 Visitors API] Firebase Admin initialization error:', adminInitErr.code || adminInitErr.message);

      if (adminInitErr.code === 'INVALID_PRIVATE_KEY') {
        return NextResponse.json({
          configured: false,
          reason: 'private_key_parse_error',
          message: 'Firebase Admin private key format is invalid. Check private key in Vercel environment variables.',
        }, { status: 200 });
      }

      if (adminInitErr.code === 'MISSING_ENV_VARS') {
        return NextResponse.json({
          configured: false,
          reason: 'missing_environment_variable',
          message: 'Firebase Admin credentials missing or unconfigured in production environment.',
        }, { status: 200 });
      }

      return NextResponse.json({
        configured: false,
        reason: 'firebase_admin_initialization_failed',
        message: 'Firebase Admin initialization failed in production environment.',
      }, { status: 200 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: invalid or expired token' }, { status: 401 });
    }

    const uid = decoded.uid;
    const adminDoc = await adminDb.collection('admins').doc(uid).get();

    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // 3. Check GA4 and Service Account configuration
    const propertyId = process.env.GA4_PROPERTY_ID || '538126375';
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
    const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

    if (!propertyId || !clientEmail || !privateKey) {
      return NextResponse.json({
        configured: false,
        reason: 'missing_environment_variable',
        message: 'Google Analytics 4 Property ID or Service Account credentials not configured.',
      }, { status: 200 });
    }

    // 4. Acquire Google OAuth2 Access Token via native crypto
    let accessToken;
    try {
      accessToken = await getGoogleAnalyticsToken(clientEmail, privateKey);
    } catch (authErr) {
      console.error('[GA4 Visitors API] Service account auth error:', authErr.message || authErr);
      return NextResponse.json({
        configured: false,
        reason: 'google_oauth_failed',
        message: 'Failed to authenticate Google Cloud service account with Google Analytics.',
      }, { status: 200 });
    }

    if (!accessToken) {
      return NextResponse.json({
        configured: false,
        reason: 'google_oauth_failed',
        message: 'Could not obtain Google Analytics access token.',
      }, { status: 200 });
    }

    // 4. Query GA4 Data API for Today, Last 7 Days, and Last 30 Days
    try {
      const [today, last7Days, last30Days] = await Promise.all([
        queryActiveUsers(accessToken, propertyId, 'today', 'today'),
        queryActiveUsers(accessToken, propertyId, '7daysAgo', 'today'),
        queryActiveUsers(accessToken, propertyId, '30daysAgo', 'today'),
      ]);

      return NextResponse.json({
        configured: true,
        today,
        last7Days,
        last30Days,
      });
    } catch (apiErr) {
      console.warn('[GA4 Visitors API] Data API response error:', apiErr);

      // Gracefully detect permission requirement
      if (apiErr?.error?.status === 'PERMISSION_DENIED' || apiErr?.error?.code === 403) {
        return NextResponse.json({
          configured: false,
          permissionRequired: true,
          serviceAccount: clientEmail,
          propertyId,
          message: `Service account (${clientEmail}) needs Viewer access in GA4 Property ${propertyId} (Admin > Property Access Management).`,
        }, { status: 200 });
      }

      return NextResponse.json({
        configured: false,
        message: apiErr?.error?.message || 'Unable to retrieve GA4 metrics at this time.',
      }, { status: 200 });
    }
  } catch (err) {
    console.error('[GA4 Visitors API] Unexpected server error:', err);
    return NextResponse.json({
      configured: false,
      message: 'Analytics service temporarily unavailable.',
    }, { status: 200 });
  }
}
