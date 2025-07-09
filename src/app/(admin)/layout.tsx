import { getAuthenticatedUser } from '@/lib/firebase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/prepare'); 
  }

  return <>{children}</>;
}
