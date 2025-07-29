// src/lib/firebase/server.ts
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_ADMIN_CONFIG;
  if (!serviceAccount) {
    throw new Error('FIREBASE_ADMIN_CONFIG environment variable is not set.');
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
