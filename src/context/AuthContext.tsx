
'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, User as FirebaseUser, signInWithEmailAndPassword } from 'firebase/auth';
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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  firebaseConfigured: boolean;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const firebaseConfigured = useMemo(() => !!auth, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);
  
  const signOut = useCallback(async () => {
    if (user?.role === 'guest') {
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
      // The onIdTokenChanged listener will handle clearing the user state and cookie
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      setAuthError('Error al cerrar sesión.');
    }
  }, [router, user]);

  const signInAsGuest = useCallback(async () => {
    // Clear any previous state before setting guest user. This logic replaces
    // calling signOut() directly to avoid errors when Firebase is not configured.
    if (auth) {
      // If Firebase is configured, sign out the real user.
      // This will trigger onIdTokenChanged which handles state and cookie cleanup.
      await firebaseSignOut(auth);
    } else {
      // If Firebase is not configured, we manually clear local state and any lingering session cookie.
      setUser(null);
      if (document.cookie.includes('__session')) {
        await fetch('/api/auth', { method: 'DELETE' });
      }
    }

    // Set the guest user and redirect.
    const guestUser: AppUser = {
      uid: 'guest-user',
      email: 'guest@example.com',
      displayName: 'Invitado',
      role: 'guest',
    };
    setUser(guestUser);
    router.push('/prepare');
  }, [router]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!firebaseConfigured || !auth) {
        setAuthError('La configuración de Firebase no está disponible. No se puede iniciar sesión con un usuario real.');
        return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onIdTokenChanged listener will handle session creation and redirect.
    } catch (error: any) {
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            description = 'El correo o la contraseña son incorrectos. Por favor, verifica tus credenciales.';
            break;
          case 'auth/invalid-api-key':
            description = 'La clave de API de Firebase no es válida. Revisa la configuración en tu archivo .env.';
            break;
          case 'auth/network-request-failed':
            description = 'Error de red. Por favor, revisa tu conexión a internet.';
            break;
          case 'auth/too-many-requests':
            description = 'Se han realizado demasiados intentos. Por favor, inténtalo más tarde.';
            break;
          default:
            description = `Ocurrió un error de Firebase: ${error.message}`;
            break;
        }
      }
      setAuthError(description);
    }
  }, [firebaseConfigured]);


  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return; 
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setAuthError(null);
      if (firebaseUser) {
        // If there's a firebase user, we are not a guest.
        if (user?.role === 'guest') setUser(null);

        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: idToken,
          });
          
          if (!response.ok) {
            const serverError = await response.json();
            throw new Error(serverError.message || 'Error del servidor al crear la sesión. Revisa que `FIREBASE_ADMIN_CONFIG` esté bien configurado en `.env` y reinicia el servidor.');
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
          router.push('/prepare');

        } catch (error: any) {
           console.error("Authentication process failed:", error);
           setAuthError(error.message || 'Ocurrió un error inesperado durante la autenticación.');
           if (auth) {
            await firebaseSignOut(auth);
           }
           setUser(null);
        }
      } else {
         // Only clear user if it's not a guest user
        if (user && user.role !== 'guest') {
            setUser(null);
        }
        if (document.cookie.includes('__session')) {
          await fetch('/api/auth', { method: 'DELETE' });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseConfigured, router, user]);

  const value = useMemo(() => ({ 
      user, 
      loading, 
      authError, 
      signOut, 
      signInAsGuest,
      signInWithEmail,
      firebaseConfigured,
      clearAuthError 
  }), [user, loading, authError, signOut, signInAsGuest, signInWithEmail, firebaseConfigured, clearAuthError]);

  if (loading && firebaseConfigured) {
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
