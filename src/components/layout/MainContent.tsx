
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
    if (pathname === '/analysis' && score !== null && isInitialPageLoad) {
      // Small delay to allow the initial background to render before transitioning
      const timer = setTimeout(() => {
        setIsInitialPageLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    } else if (pathname !== '/analysis' && !isInitialPageLoad) {
      // Reset for other pages
      setIsInitialPageLoad(true);
    }
  }, [pathname, score, isInitialPageLoad, setIsInitialPageLoad]);


  const bodyClassName = useMemo(() => {
    let backgroundClasses = ''; 

    if (pathname === '/home') {
      backgroundClasses = 'bg-home-page';
    } else if (pathname === '/loading') {
      backgroundClasses = 'bg-loading-page';
    } else if (PREPARE_PATHS.includes(pathname) || pathname === '/select-module') {
      backgroundClasses = 'bg-prepare-page';
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
      "flex flex-col min-h-screen",
      backgroundClasses, 
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
