
import { NextResponse, type NextRequest } from 'next/server';

// This middleware redirects the root path ("/") to the "/prepare" page.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const prepareUrl = new URL('/prepare', request.url);
    return NextResponse.redirect(prepareUrl);
  }
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to the root route to avoid conflicts.
  matcher: '/',
};
