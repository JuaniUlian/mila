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

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase no está configurado. Por favor, revisa que las variables `NEXT_PUBLIC_FIREBASE_*` estén correctas en tu archivo `.env`. Si las acabas de añadir, recuerda reiniciar el servidor.');
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  return { 
    ...context,
    signInWithEmail,
  };
};
