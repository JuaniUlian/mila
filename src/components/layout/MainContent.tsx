
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  
  const showHeader = pathname !== '/';

  // Calculate className consistently on both server and client to avoid hydration errors
  const bodyClassName = useMemo(() => {
    let backgroundClasses = 'bg-slate-100'; // Default background

    if (pathname === '/loading') {
      backgroundClasses = 'bg-loading-page';
    } else if (pathname === '/prepare') {
      backgroundClasses = 'bg-prepare-page';
    } else if (pathname === '/analysis') {
      if (isInitialPageLoad || score === null) {
          backgroundClasses = 'bg-analysis-celeste';
      } else if (score <= 50) {
          backgroundClasses = 'bg-analysis-grave';
      } else if (score <= 79) {
          backgroundClasses = 'bg-analysis-alerta';
      } else { // score >= 80
          backgroundClasses = 'bg-analysis-celeste';
      }
    }

    return cn(
      "flex min-h-screen flex-col transition-all duration-500", 
      backgroundClasses, 
      showHeader ? "pt-4" : ""
    );
  }, [pathname, score, isInitialPageLoad, showHeader]);
  
  return (
    <div className={bodyClassName} suppressHydrationWarning={true}>
      {showHeader && <MainHeader />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
