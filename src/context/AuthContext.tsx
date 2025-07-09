
'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setUser(null);
    router.push('/login');
    setLoading(false);
  }, [router]);

  const signInAsGuest = useCallback(async () => {
    setLoading(true);
    const guestUser: AppUser = {
      uid: 'guest-user',
      email: 'guest@example.com',
      displayName: 'Invitado',
      role: 'guest',
    };
    setUser(guestUser);
    router.push('/prepare');
    setLoading(false);
  }, [router]);

  const signInAsDemoAdmin = useCallback(async (email: string) => {
    const demoUser: AppUser = {
      uid: 'demo-admin-user',
      email: email,
      displayName: 'Juan Ulian',
      role: 'admin',
    };
    setUser(demoUser);
    router.push('/prepare');
    setLoading(false);
  }, [router]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);
    
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    if (email.toLowerCase() === 'juanulian@mila.app' && password === 'password') {
      await signInAsDemoAdmin(email);
    } else {
      setAuthError('Credenciales incorrectas. Para esta demostración, use juanulian@mila.app con la contraseña "password", o ingrese como invitado.');
      setLoading(false);
    }
  }, [signInAsDemoAdmin]);
  
  // This effect handles redirects if the user manually changes the URL
  // while in a logged-out state.
  useEffect(() => {
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
