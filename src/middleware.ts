
import { NextResponse, type NextRequest } from 'next/server';

// This middleware redirects the root path ("/") to the login page.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to the root route to avoid conflicts.
  matcher: '/',
};


  