
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser } from './lib/firebase/server';

// Force the middleware to run on the Node.js runtime.
// This is required because `firebase-admin` is not compatible with the Edge runtime.
export const runtime = 'nodejs';

const PROTECTED_ROUTES = ['/prepare', '/loading', 'analysis'];
const ADMIN_ONLY_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { token } = await getAuthenticatedUser(request);
  const { pathname } = request.nextUrl;

  const userRole = token?.role || null;
  const isAuthenticated = !!token;

  // --- Redirect authenticated users from public pages ---
  if (isAuthenticated && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/prepare';
    return NextResponse.redirect(url);
  }

  // --- Handle unauthenticated users ---
  if (!isAuthenticated) {
    // Allow access to login page
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    // For any other protected or admin route, redirect to login
    const isAccessingProtected = PROTECTED_ROUTES.some(p => pathname.startsWith(p)) || ADMIN_ONLY_ROUTES.some(p => pathname.startsWith(p));
    if (isAccessingProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Allow access to public pages like '/'
    return NextResponse.next();
  }
  
  // --- Handle authenticated users ---

  // Handle Admin routes
  const isAccessingAdminRoute = ADMIN_ONLY_ROUTES.some(p => pathname.startsWith(p));
  if (isAccessingAdminRoute && userRole !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/prepare'; // Redirect non-admins away
    return NextResponse.redirect(url);
  }
  
  // No specific rules needed for guests or users on protected routes,
  // as the pages themselves will handle feature availability based on role.
  // The AI flows are also protected on the server side.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.png (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.png).*)',
  ],
};
