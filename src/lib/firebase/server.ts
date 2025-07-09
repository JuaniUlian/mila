import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

let adminApp: App | undefined;
let adminAuthInstance: Auth | undefined;

// This logic safely initializes the Firebase Admin SDK.
// It checks for the existence of the configuration environment variable
// and wraps the initialization in a try-catch block to prevent crashes.
if (process.env.FIREBASE_ADMIN_CONFIG) {
  try {
    const serviceAccount: ServiceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      adminApp = getApps()[0];
    }
    adminAuthInstance = getAuth(adminApp);
  } catch (e) {
    console.error("Error initializing Firebase Admin SDK:", e);
  }
} else {
  // This warning will be shown in the server console if the config is missing
  console.warn("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication is disabled.");
}

export const adminAuth = adminAuthInstance;

export async function getAuthenticatedUser(request?: NextRequest) {
  const session = request ? request.cookies.get('__session')?.value : cookies().get('__session')?.value;

  if (!session || !adminAuth) {
    return { user: null, token: null };
  }

  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
    const user = await adminAuth.getUser(decodedIdToken.uid);
    return { user, token: decodedIdToken };
  } catch (error) {
    // This is a common case if the cookie is expired or invalid.
    // It's not a server error, so we don't need to log it.
    return { user: null, token: null };
  }
}
