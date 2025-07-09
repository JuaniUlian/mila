import { getAuthenticatedUser } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = await getAuthenticatedUser();

  if (!token) {
    redirect('/login');
  }

  if (token.role !== 'admin') {
    redirect('/prepare'); 
  }

  return <>{children}</>;
}
