
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
  signInAsDemoUser: (email: string) => Promise<void>;
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
    if (user?.role === 'guest' || user?.uid === 'demo-user-real-flow') {
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
  
  const cleanUpSession = useCallback(async () => {
    if (auth) {
      await firebaseSignOut(auth);
    } else {
      setUser(null);
      if (document.cookie.includes('__session')) {
        await fetch('/api/auth', { method: 'DELETE' });
      }
    }
  }, []);
  
  const signInAsGuest = useCallback(async () => {
    await cleanUpSession();
    const guestUser: AppUser = {
      uid: 'guest-user',
      email: 'guest@example.com',
      displayName: 'Invitado',
      role: 'guest',
    };
    setUser(guestUser);
    router.push('/prepare');
  }, [router, cleanUpSession]);

  const signInAsDemoUser = useCallback(async (email: string) => {
    await cleanUpSession();
    const demoUser: AppUser = {
      uid: 'demo-user-real-flow',
      email: email,
      displayName: 'Juan Ulian (Admin Demo)',
      role: 'admin',
    };
    setUser(demoUser);
    router.push('/prepare');
  }, [router, cleanUpSession]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!firebaseConfigured || !auth) {
        setAuthError('La configuración de Firebase no está disponible. No se puede iniciar sesión con un usuario real.');
        return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        if (user?.role === 'guest' || user?.uid === 'demo-user-real-flow') setUser(null);

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
        if (user && user.role !== 'guest' && user.uid !== 'demo-user-real-flow') {
            setUser(null);
        }
        if (document.cookie.includes('__session')) {
          await fetch('/api/auth', { method: 'DELETE' });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseConfigured, router]);

  const value = useMemo(() => ({ 
      user, 
      loading, 
      authError, 
      signOut, 
      signInAsGuest,
      signInAsDemoUser,
      signInWithEmail,
      firebaseConfigured,
      clearAuthError 
  }), [user, loading, authError, signOut, signInAsGuest, signInAsDemoUser, signInWithEmail, firebaseConfigured, clearAuthError]);

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
