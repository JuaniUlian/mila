import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

function getAdminApp(): App {
    // If the app is already initialized, return it.
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const serviceAccountConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountConfig) {
        throw new Error("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication is disabled.");
    }
    
    try {
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountConfig);
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_ADMIN_CONFIG or initialize app: ${e.message}`);
    }
}

export function getAdminAuth(): Auth {
    return getAuth(getAdminApp());
}

export async function getAuthenticatedUser(request?: NextRequest) {
    try {
        const adminAuth = getAdminAuth();
        const session = request ? request.cookies.get('__session')?.value : cookies().get('__session')?.value;

        if (!session) {
            return { user: null, token: null };
        }

        const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
        const user = await adminAuth.getUser(decodedIdToken.uid);
        return { user, token: decodedIdToken };
    } catch (error) {
        // This will catch errors from getAdminAuth() if config is missing, or from cookie verification.
        // It's safe to return null here, as it means the user is not authenticated.
        return { user: null, token: null };
    }
}
