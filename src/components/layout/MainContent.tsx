'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  
  const showHeader = !['/', '/home'].includes(pathname);

  // Define module paths that should share the prepare page background
  const PREPARE_PATHS = ['/prepare', '/operative-module', '/technical-module', '/strategic-module', '/select-module'];

  // Calculate className consistently on both server and client to avoid hydration errors
  const bodyClassName = useMemo(() => {
    let backgroundClasses = 'bg-background dark:bg-slate-900'; // Default background

    if (pathname === '/loading') {
      backgroundClasses = 'bg-loading-page';
    } else if (pathname === '/home') {
      // CORRECCIÓN: /home usa el degradado blanco-plateado
      backgroundClasses = 'bg-home-page';
    } else if (PREPARE_PATHS.includes(pathname)) {
      backgroundClasses = 'bg-prepare-page';
    } else if (pathname === '/analysis') {
      if (isInitialPageLoad || score === null) {
          backgroundClasses = 'bg-prepare-page'; // Start with prepare background
      } else if (score <= 50) {
          backgroundClasses = 'bg-analysis-grave';
      } else if (score <= 79) {
          backgroundClasses = 'bg-analysis-alerta';
      } else { // score >= 80
          backgroundClasses = 'bg-analysis-validado';
      }
    }

    return cn(
      "flex flex-col min-h-screen transition-all duration-1000 ease-in-out",
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
