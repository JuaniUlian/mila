import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

const ADMIN_APP_NAME = 'firebase-admin-app-mila';

function getAdminApp(): App {
    // Check if the app is already initialized
    const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME);
    if (existingApp) {
        return existingApp;
    }

    const serviceAccountConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountConfig) {
        throw new Error("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication is disabled.");
    }
    
    try {
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountConfig);
        // Initialize the app with a unique name
        return initializeApp({
            credential: cert(serviceAccount),
        }, ADMIN_APP_NAME);
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_ADMIN_CONFIG or initialize app: ${e.message}`);
    }
}

export function getAdminAuth(): Auth {
    try {
      return getAuth(getAdminApp());
    } catch (error) {
        // This will catch the error from getAdminApp if config is missing
        console.error("Firebase Admin Auth could not be initialized:", error);
        // Re-throw to make it clear that auth-dependent features will fail.
        throw error;
    }
}

export async function getAuthenticatedUser() {
    try {
        const adminAuth = getAdminAuth();
        const session = cookies().get('__session')?.value;

        if (!session) {
            return { user: null };
        }

        const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
        const user = await adminAuth.getUser(decodedIdToken.uid);

        // We add the role from the custom claims to the user object we return
        const enrichedUser = {
            ...user,
            role: decodedIdToken.role,
        };
        
        return { user: enrichedUser };
    } catch (error) {
        // This can happen if the cookie is invalid or expired.
        // It's safe to return null, as it indicates an unauthenticated state.
        return { user: null };
    }
}
