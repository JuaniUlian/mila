
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/prepare', '/loading', '/analysis', '/admin'];
const PUBLIC_ROUTES = ['/login', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');

  const isAuthenticated = !!sessionCookie;

  // If user is authenticated and tries to access login, redirect to prepare
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/prepare', request.url));
  }

  // If user is not authenticated and tries to access a protected route, redirect to login
  const isAccessingProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

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
