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

  const { firebaseConfigured } = context;

  const signInWithEmail = async (email: string, password: string) => {
    // This function should only be called if Firebase is configured.
    // The UI should prevent this, but this is a safeguard.
    if (!firebaseConfigured || !auth) {
      const error = new Error('Firebase no está configurado. Por favor, revisa que las variables `NEXT_PUBLIC_FIREBASE_*` estén correctas en tu archivo `.env`. Si las acabas de añadir, recuerda reiniciar el servidor.');
      // Manually set authError in context if needed, though the effect should handle it.
      console.error(error.message);
      // For more direct feedback, we can throw the error to be caught in the form handler
      throw error;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onIdTokenChanged listener in AuthContext will handle success.
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
      
      // We throw a new error with the user-friendly description
      // to be caught by the login form's try-catch block.
      throw new Error(description);
    }
  };

  return { 
    ...context,
    signInWithEmail,
  };
};
