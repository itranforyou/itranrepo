import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebaseAdmin';
import { JWT } from 'google-auth-library';

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

    const { adminAuth, adminDb } = await getAdminServices();
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

    // 2. Check GA4 and Service Account configuration
    const propertyId = process.env.GA4_PROPERTY_ID || '538126375';
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!propertyId || !clientEmail || !privateKey) {
      return NextResponse.json({
        configured: false,
        message: 'Google Analytics 4 Property ID or Service Account credentials not configured.',
      });
    }

    // 3. Acquire Google OAuth2 Access Token
    let accessToken;
    try {
      const authClient = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });
      const tokenRes = await authClient.getAccessToken();
      accessToken = tokenRes?.token;
    } catch (authErr) {
      console.error('[GA4 Visitors API] Service account auth error:', authErr);
      return NextResponse.json({
        configured: false,
        message: 'Failed to authenticate Google Cloud service account.',
      });
    }

    if (!accessToken) {
      return NextResponse.json({
        configured: false,
        message: 'Could not obtain Google Analytics access token.',
      });
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
      console.warn('[GA4 Visitors API] Data API response:', apiErr);

      // Gracefully detect permission or enablement requirement
      if (apiErr?.error?.status === 'PERMISSION_DENIED' || apiErr?.error?.code === 403) {
        return NextResponse.json({
          configured: false,
          permissionRequired: true,
          serviceAccount: clientEmail,
          propertyId,
          message: `Service account (${clientEmail}) needs Viewer access in GA4 Property ${propertyId} (Admin > Property Access Management).`,
        });
      }

      return NextResponse.json({
        configured: false,
        message: apiErr?.error?.message || 'Unable to retrieve GA4 metrics.',
      });
    }
  } catch (err) {
    console.error('[GA4 Visitors API] Unexpected server error:', err);
    return NextResponse.json(
      { configured: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
