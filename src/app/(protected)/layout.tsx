import { getAuthenticatedUser } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
