import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/server';

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const adminAuth = getAdminAuth();
    const idToken = await request.text();

    // The session cookie will be valid for 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
  
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ status: 'error' }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    cookies().delete('__session');
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting session cookie:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
