import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase if all the necessary config values are provided.
// This prevents crashes if the .env file is missing or incomplete.
if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // If initialization fails for any reason, `auth` will remain `null`.
    // The rest of the app is designed to handle this state gracefully.
  }
} else {
  // This message will be visible in the browser's developer console
  console.warn(
    'Firebase API Key, Auth Domain, or Project ID is missing. Please set the NEXT_PUBLIC_FIREBASE_* variables in your .env file. Firebase features will be disabled.'
  );
}

export { app, auth };
