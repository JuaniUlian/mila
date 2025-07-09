
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is simplified for the demo environment.
// Route protection is now handled by client-side layouts.
export function middleware(request: NextRequest) {
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
