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
        console.warn("FIREBASE_ADMIN_CONFIG is not set. Server-side authentication features will be disabled.");
        return null;
    }
    
    try {
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountConfig);
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

interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  role?: string;
  isGuest?: boolean;
}

export async function getAuthenticatedUser(): Promise<{ user: AppUser | null }> {
    const session = cookies().get('__session')?.value;

    if (session === 'guest-session') {
        return { 
            user: {
                uid: 'guest-user',
                email: 'guest@example.com',
                displayName: 'Invitado',
                role: 'guest',
                isGuest: true,
            }
        };
    }
    
    if (!session) {
        return { user: null };
    }

    const adminAuth = getAdminAuth();
    
    if (!adminAuth) {
        return { user: null };
    }

    try {
        const decodedIdToken = await adminAuth.verifySessionCookie(session, true);
        const user = await adminAuth.getUser(decodedIdToken.uid);

        const enrichedUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: decodedIdToken.role,
        };
        
        return { user: enrichedUser };
    } catch (error) {
        return { user: null };
    }
}
