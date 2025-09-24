
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad, setIsInitialPageLoad } = useLayout();
  
  const showHeader = !['/home'].includes(pathname) && !pathname.startsWith('/auth');

  const PREPARE_PATHS = ['/prepare', '/operative-module', '/technical-module', '/strategic-module'];

  useEffect(() => {
    // This effect now correctly handles the client-side state for page load transitions.
    if (pathname === '/analysis' && score !== null && isInitialPageLoad) {
        setIsInitialPageLoad(false);
    } else if (pathname !== '/analysis' && !isInitialPageLoad) {
      // Reset for other pages to ensure correct background on navigation
      setIsInitialPageLoad(true);
    }
  }, [pathname, score, isInitialPageLoad, setIsInitialPageLoad]);


  const bodyClassName = useMemo(() => {
    let backgroundClass = ''; 

    if (pathname === '/home') {
      backgroundClass = 'bg-home-page';
    } else if (pathname === '/loading') {
      backgroundClass = 'bg-loading-page';
    } else if (PREPARE_PATHS.includes(pathname) || pathname === '/select-module') {
      backgroundClass = 'bg-prepare-page';
    } else if (pathname === '/analysis') {
      // During server-render or initial client-render before state is settled, use a default.
      if (isInitialPageLoad || score === null) {
          backgroundClass = 'bg-prepare-page';
      } else if (score <= 50) {
          backgroundClass = 'bg-analysis-grave';
      } else if (score <= 79) {
          backgroundClass = 'bg-analysis-alerta';
      } else { 
          backgroundClass = 'bg-analysis-validado';
      }
    }

    return cn(
      "flex flex-col min-h-screen",
      backgroundClass, 
      showHeader ? "pt-4" : ""
    );
  }, [pathname, score, isInitialPageLoad, showHeader]);
  
  return (
    <div className={bodyClassName}>
      {showHeader && <MainHeader />}
      <main className="flex-1 flex flex-col z-10">
        {children}
      </main>
    </div>
  );
}
