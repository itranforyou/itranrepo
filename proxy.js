import { NextResponse } from 'next/server';

/**
 * Next.js Proxy (formerly Middleware) — route-level guard for /change-product.
 *
 * Firebase Auth tokens are managed client-side (not in HTTP cookies by default),
 * so this proxy adds a security header that the page can read to confirm
 * the route is protected. The real auth gate is the onAuthStateChanged check
 * inside the page itself, backed by the server-side /api/admin/verify endpoint.
 *
 * To enable full cookie-based proxy protection in the future, implement
 * Firebase Session Cookies (firebase-admin createSessionCookie) and check the
 * cookie here instead.
 */
export function proxy(request) {
  const response = NextResponse.next();
  // Mark this response as an admin-protected route so the page knows
  // it must enforce authentication before rendering any content.
  response.headers.set('x-admin-protected', 'true');
  return response;
}

export const config = {
  matcher: ['/change-product'],
};
