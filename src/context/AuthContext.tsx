'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// A simplified user object for our app's context
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
  providerId: string; // 'firebase' or 'guest'
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  const signInAsGuest = useCallback(() => {
    const guestUser: AppUser = {
        uid: 'guest-user',
        email: 'guest@example.com',
        displayName: 'Invitado',
        role: 'guest',
        providerId: 'guest'
    };
    setUser(guestUser);
    router.push('/prepare');
  }, [router]);

  useEffect(() => {
    // If Firebase isn't initialized, enable demo mode and do nothing else.
    if (!auth) {
      console.warn('Firebase not configured. App is running in demo mode.');
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = (tokenResult.claims.role as string) || 'user'; // Default to user if no role
          
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
            providerId: 'firebase',
          };
          setUser(appUser);

          // Create session cookie by sending token to server
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: idToken,
          });
        } catch (error) {
           console.error("Error during token processing or session creation:", error);
           // Sign out if session creation or token validation fails
           if (auth) {
            await firebaseSignOut(auth);
           }
           setUser(null);
        }
      } else {
        setUser(null);
        // Clear session cookie if user is not signed in
        await fetch('/api/auth', { method: 'DELETE' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    // Handle guest user sign out
    if (user?.providerId === 'guest') {
      setUser(null);
      router.push('/login');
      return;
    }

    // Handle Firebase user sign out
    if (!auth) {
      console.error('Firebase not initialized, cannot sign out.');
      return;
    }
    try {
      await firebaseSignOut(auth);
      // The onIdTokenChanged listener will handle the rest (clearing user and cookie)
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router, user]);

  const value = useMemo(() => ({ user, loading, isDemoMode, signOut, signInAsGuest }), [user, loading, isDemoMode, signOut, signInAsGuest]);

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
