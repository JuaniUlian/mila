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
      throw new Error('Firebase is not configured. Please check your .env file.');
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  return { 
    ...context,
    signInWithEmail,
  };
};
