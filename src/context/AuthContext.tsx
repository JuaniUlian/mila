'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  firebaseConfigured: boolean;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // This state will be true only if the client-side Firebase config is valid.
  const firebaseConfigured = useMemo(() => !!auth, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signInAsGuest = useCallback(() => {
    const guestUser: AppUser = {
      uid: 'guest-user',
      email: 'guest@example.com',
      displayName: 'Invitado',
      role: 'guest',
      isGuest: true,
    };
    setUser(guestUser);
    setLoading(false);
  }, []);


  useEffect(() => {
    // If Firebase isn't configured, we don't need to listen for auth changes.
    // The login form will show the guest mode option.
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setAuthError(null);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: idToken,
          });

          if (!response.ok) {
            const serverError = await response.json();
            throw new Error(serverError.message || 'Error del servidor al crear la sesión. Revisa la configuración de `FIREBASE_ADMIN_CONFIG` en tu archivo .env y los registros del servidor.');
          }
          
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = (tokenResult.claims.role as string) || 'user';
          
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
          };

          setUser(appUser);
        } catch (error: any) {
           console.error("Authentication process failed:", error);
           setAuthError(error.message || 'Ocurrió un error inesperado durante la autenticación.');
           if (auth) {
            await firebaseSignOut(auth);
           }
           setUser(null);
        }
      } else {
        setUser(null);
        if (document.cookie.includes('__session')) {
          await fetch('/api/auth', { method: 'DELETE' });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseConfigured]);

  const signOut = useCallback(async () => {
    if (user?.isGuest) {
        setUser(null);
        router.push('/login');
        return;
    }

    if (!auth) {
      console.error('Firebase not initialized, cannot sign out.');
      return;
    }
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      setAuthError('Error al cerrar sesión.');
    }
  }, [router, user]);

  const value = useMemo(() => ({ user, loading, authError, firebaseConfigured, signInAsGuest, signOut, clearAuthError }), [user, loading, authError, firebaseConfigured, signInAsGuest, signOut, clearAuthError]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
