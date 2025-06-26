'use client';

import { usePathname } from 'next/navigation';
import { MainSidebar } from '@/components/layout/main-sidebar';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showSidebar = pathname !== '/';

  if (!showSidebar) {
    // For the landing page, just render the content without any layout wrapper.
    return <>{children}</>;
  }

  // For all other pages, wrap them in the main layout with a sidebar.
  return (
    <div className="relative flex min-h-screen bg-slate-100">
      <MainSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
