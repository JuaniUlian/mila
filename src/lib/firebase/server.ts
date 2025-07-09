import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const serviceAccount = process.env.FIREBASE_ADMIN_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)
  : undefined;

let adminApp: App;

export function initAdmin() {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return adminApp;
}

initAdmin();

export const adminAuth = getAuth(adminApp);

export async function getAuthenticatedUser(request?: NextRequest) {
  const session = request ? request.cookies.get('__session')?.value : cookies().get('__session')?.value;

  if (!session) {
    return { user: null, token: null };
  }

  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    const user = await adminAuth.getUser(decodedIdToken.uid);
    return { user, token: decodedIdToken };
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return { user: null, token: null };
  }
}
