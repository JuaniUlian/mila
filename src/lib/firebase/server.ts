import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

let adminApp: App | undefined;
let adminAuthInstance: Auth | undefined;

// This function initializes the Firebase Admin SDK in a lazy, idempotent manner.
function initAdmin() {
  if (getApps().length > 0) {
    // If already initialized, use the existing app.
    if (!adminApp) {
        adminApp = getApps()[0];
        adminAuthInstance = getAuth(adminApp);
    }
    return;
  }
  
  try {
    const serviceAccountConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountConfig) {
        console.warn("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication is disabled.");
        return;
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountConfig);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    adminAuthInstance = getAuth(adminApp);
  } catch (e: any) {
    console.error("Failed to initialize Firebase Admin SDK:", e.message);
  }
}

export async function getAuthenticatedUser(request?: NextRequest) {
  initAdmin(); // Ensure admin is initialized before use
  if (!adminAuthInstance) {
    return { user: null, token: null }; // Return if initialization failed
  }

  const session = request ? request.cookies.get('__session')?.value : cookies().get('__session')?.value;

  if (!session) {
    return { user: null, token: null };
  }

  try {
    const decodedIdToken = await adminAuthInstance.verifySessionCookie(session, true);
    const user = await adminAuthInstance.getUser(decodedIdToken.uid);
    return { user, token: decodedIdToken };
  } catch (error) {
    // This is a common case if the cookie is expired or invalid.
    return { user: null, token: null };
  }
}

// A safe getter for adminAuth, used in API routes.
export const getAdminAuth = (): Auth => {
    initAdmin(); // Ensure initialization
    if (!adminAuthInstance) {
        throw new Error("Firebase Admin SDK not initialized. Make sure FIREBASE_ADMIN_CONFIG is set in your environment variables.");
    }
    return adminAuthInstance;
}