'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { onIdTokenChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: (User & { role?: string }) | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const role = (tokenResult.claims.role as string) || 'user';
        
        setUser({ ...firebaseUser, role });

        // Create session cookie by sending token to server
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: idToken,
        });

      } else {
        setUser(null);
        // Clear session cookie if user is not signed in
        await fetch('/api/auth', { method: 'DELETE' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
    // The onIdTokenChanged listener will handle the rest (clearing user and cookie)
  };

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
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
