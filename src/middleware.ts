
import { NextResponse, type NextRequest } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';

// This middleware redirects the root path ("/") to the "/prepare" page.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const prepareUrl = new URL('/prepare', request.url);
    return NextResponse.redirect(prepareUrl);
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
     * - assets in public folder
     */
    '/((?!api|_next/static|_next/image|favicon.png|assets|.*\\..*).*)',
    // Apply middleware only to the root route.
    '/' 
  ],
};
