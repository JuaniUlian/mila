
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const PROTECTED_ROUTES = ['/prepare', '/loading', '/analysis'];
const ADMIN_ONLY_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');

  const isAuthenticated = !!sessionCookie;

  // If an authenticated user tries to access the login page, redirect them to the prepare page.
  if (isAuthenticated && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/prepare';
    return NextResponse.redirect(url);
  }

  // If a non-authenticated user tries to access a protected route, redirect them to the login page.
  if (!isAuthenticated) {
    const isAccessingProtectedRoute = 
        PROTECTED_ROUTES.some(p => pathname.startsWith(p)) || 
        ADMIN_ONLY_ROUTES.some(p => pathname.startsWith(p));
    
    if (isAccessingProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed. Role-based access control is handled
  // in the respective layout files (e.g., /admin/layout.tsx).
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
