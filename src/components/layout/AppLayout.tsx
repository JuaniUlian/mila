'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showHeader = pathname !== '/';

  if (!showHeader) {
    // For the landing page, just render the content without any layout wrapper.
    return <>{children}</>;
  }

  // For all other pages, wrap them in the main layout with a header.
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
