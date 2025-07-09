import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

const ADMIN_APP_NAME = 'firebase-admin-app-mila';

function getAdminApp(): App | null {
    // Check if the app is already initialized
    const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME);
    if (existingApp) {
        return existingApp;
    }

    const serviceAccountConfig = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountConfig) {
        console.error("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication features will be disabled.");
        return null;
    }
    
    try {
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountConfig);
        // Initialize the app with a unique name
        return initializeApp({
            credential: cert(serviceAccount),
        }, ADMIN_APP_NAME);
    } catch (e: any) {
        console.error(`Failed to parse FIREBASE_ADMIN_CONFIG or initialize app: ${e.message}`);
        return null;
    }
}

export function getAdminAuth(): Auth | null {
    const adminApp = getAdminApp();
    if (!adminApp) {
        return null;
    }
    try {
      return getAuth(adminApp);
    } catch (error) {
        console.error("Firebase Admin Auth could not be initialized:", error);
        return null;
    }
}

export async function getAuthenticatedUser() {
    const adminAuth = getAdminAuth();
    
    if (!adminAuth) {
        return { user: null };
    }

    try {
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
