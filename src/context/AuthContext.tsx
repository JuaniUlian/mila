
'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client'; // Real Firebase client auth
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple mock for guest access without hitting Firebase
const GUEST_USER: AppUser = {
  uid: 'guest-user',
  email: 'guest@example.com',
  displayName: 'Invitado',
  role: 'guest',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const handleAuthChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: (tokenResult.claims.role as string) || 'paid', // Default to 'paid' if no role
        };
        setUser(appUser);
    } else {
        setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!auth) {
        console.warn("Firebase Auth no está inicializado. El modo de autenticación real está deshabilitado.");
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return () => unsubscribe();
  }, [handleAuthChange]);


  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);
    if (!auth) {
        setAuthError("El servicio de autenticación no está disponible. Verifique la configuración de Firebase.");
        setLoading(false);
        return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Create session cookie on the server
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: idToken,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error al crear la sesión del servidor.');
        }

        router.push('/prepare');
    } catch (error: any) {
        console.error("Authentication error:", error);
        setAuthError(error.message || 'Credenciales incorrectas o error de red.');
    } finally {
        setLoading(false);
    }
  }, [router]);

  const signInAsGuest = useCallback(async () => {
    setLoading(true);
    setUser(GUEST_USER);
    router.push('/prepare');
    setLoading(false);
  }, [router]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
        if (user?.role !== 'guest' && auth) {
            await firebaseSignOut(auth);
            await fetch('/api/auth', { method: 'DELETE' });
        }
    } catch (error) {
        console.error("Error signing out:", error);
    } finally {
        setUser(null);
        router.push('/login');
        setLoading(false);
    }
  }, [router, user]);

  useEffect(() => {
    // This effect handles redirects if the user manually changes the URL
    // while in a logged-out state.
    const isProtectedRoute = ['/prepare', '/analysis', '/loading', '/admin'].some(p => pathname.startsWith(p));
    if (!loading && !user && isProtectedRoute) {
        router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    signOut,
    signInWithEmail,
    signInAsGuest,
    clearAuthError,
  }), [user, loading, authError, signOut, signInWithEmail, signInAsGuest, clearAuthError]);

  if (loading && !user) {
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
