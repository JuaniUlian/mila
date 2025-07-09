
'use client';

import { useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthContext } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { firebaseConfigured, signInAsGuest } = context;

  const signInWithEmail = async (email: string, password: string) => {
    // Check for special demo credentials first.
    if (email.toLowerCase() === 'admin@mila.com' && password === 'password') {
      // Use the guest flow for the demo user
      await signInAsGuest();
      return;
    }
    
    // For any other credentials, require Firebase to be configured.
    if (!firebaseConfigured || !auth) {
      throw new Error('Para iniciar sesión con credenciales reales, Firebase debe estar configurado. Por favor, revisa tu archivo .env. Para explorar, usa las credenciales de demo.');
    }
    
    // Proceed with real Firebase authentication.
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onIdTokenChanged listener in AuthContext will handle success and redirect.
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
      throw new Error(description);
    }
  };

  return { 
    ...context,
    signInWithEmail,
  };
};
