
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  
  const showHeader = !['/home'].includes(pathname) && !pathname.startsWith('/auth');

  const PREPARE_PATHS = ['/prepare', '/operative-module', '/technical-module', '/strategic-module'];

  const bodyClassName = useMemo(() => {
    let backgroundClasses = 'bg-background'; 

    if (pathname === '/home') {
      backgroundClasses = 'bg-home-page';
    } else if (pathname === '/loading') {
      backgroundClasses = 'bg-loading-page';
    } else if (PREPARE_PATHS.includes(pathname)) {
      backgroundClasses = 'bg-prepare-page';
    } else if (pathname === '/select-module') {
      backgroundClasses = 'bg-slate-100';
    } else if (pathname === '/analysis') {
      if (isInitialPageLoad || score === null) {
          backgroundClasses = 'bg-prepare-page';
      } else if (score <= 50) {
          backgroundClasses = 'bg-analysis-grave';
      } else if (score <= 79) {
          backgroundClasses = 'bg-analysis-alerta';
      } else { 
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
    <div className={bodyClassName}>
      {showHeader && <MainHeader />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
