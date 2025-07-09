'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  useEffect(() => {
    // If Firebase isn't initialized, do nothing. The login form will show an error.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      setAuthError(null); // Clear previous errors on any auth state change
      if (firebaseUser) {
        try {
          // Create session cookie by sending token to server
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: idToken,
          });

          // If the server failed to create a session cookie, something is wrong with the server-side config.
          // We must sign the user out on the client to prevent an inconsistent state.
          if (!response.ok) {
            throw new Error('Error del servidor al crear la sesión. Revisa la configuración de `FIREBASE_ADMIN_CONFIG` en tu archivo .env y los registros del servidor.');
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
            await firebaseSignOut(auth); // This will trigger onIdTokenChanged again with null
           }
           setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        if (document.cookie.includes('__session')) {
          await fetch('/api/auth', { method: 'DELETE' });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
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
  }, [router]);

  const value = useMemo(() => ({ user, loading, authError, signOut, clearAuthError }), [user, loading, authError, signOut, clearAuthError]);

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
