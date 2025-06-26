'use client';

import { usePathname } from 'next/navigation';
import { MainSidebar } from '@/components/layout/main-sidebar';
import React from 'react';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { focusedIncidentId, setFocusedIncidentId } = useLayout();

  // Only show the sidebar on pages that are not the root landing page.
  const showSidebar = pathname !== '/';
  const isFocusMode = showSidebar && pathname === '/analysis' && !!focusedIncidentId;


  if (!showSidebar) {
    // For the landing page, just render the content without any layout wrapper.
    return <>{children}</>;
  }

  // For all other pages, wrap them in the main layout with a sidebar.
  return (
    <>
      {isFocusMode && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setFocusedIncidentId(null)}
        />
      )}
      <div className="relative flex min-h-screen bg-slate-100">
        <MainSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
