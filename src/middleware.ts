import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser } from './lib/firebase/server';

const PROTECTED_ROUTES = ['/prepare', '/loading', '/analysis'];
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { user, token } = await getAuthenticatedUser(request);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // If the user is not authenticated
  if (!user) {
    if (isProtectedRoute || isAdminRoute) {
      // Redirect to login page if trying to access a protected route
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If the user is authenticated
  const userRole = token?.role;

  // If trying to access the login page while authenticated, redirect to prepare
  if (pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/prepare';
    return NextResponse.redirect(url);
  }
  
  // If a regular user tries to access an admin route, redirect them
  if (isAdminRoute && userRole !== 'admin') {
     const url = request.nextUrl.clone();
     url.pathname = '/prepare';
     return NextResponse.redirect(url);
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.png).*)',
  ],
};
