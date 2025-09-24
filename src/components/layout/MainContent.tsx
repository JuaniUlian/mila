
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

const BACKGROUND_CLASSES = [
  'bg-home-page',
  'bg-loading-page',
  'bg-prepare-page',
  'bg-analysis-grave',
  'bg-analysis-alerta',
  'bg-analysis-validado',
];

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad, setIsInitialPageLoad } = useLayout();
  
  const PREPARE_PATHS = useMemo(() => ['/prepare', '/operative-module', '/technical-module', '/strategic-module', '/select-module'], []);

  useEffect(() => {
    let backgroundClass = '';
    
    if (pathname === '/home') backgroundClass = 'bg-home-page';
    else if (pathname === '/loading') backgroundClass = 'bg-loading-page';
    else if (PREPARE_PATHS.includes(pathname)) backgroundClass = 'bg-prepare-page';
    else if (pathname === '/analysis') {
      if (score === null || isInitialPageLoad) {
        backgroundClass = 'bg-prepare-page';
      } else {
        if (score <= 50) backgroundClass = 'bg-analysis-grave';
        else if (score <= 79) backgroundClass = 'bg-analysis-alerta';
        else backgroundClass = 'bg-analysis-validado';
      }
    }

    document.body.classList.remove(...BACKGROUND_CLASSES);
    if (backgroundClass) {
      document.body.classList.add(backgroundClass);
    }
    
    // Cleanup function to remove class when component unmounts or path changes
    return () => {
       if (backgroundClass) {
         document.body.classList.remove(backgroundClass);
       }
    };
  }, [pathname, score, isInitialPageLoad, PREPARE_PATHS]);


  // Effect to reset the initial page load flag when navigating away from the analysis page
  useEffect(() => {
    if (pathname !== '/analysis' && !isInitialPageLoad) {
      setIsInitialPageLoad(true);
    }
  }, [pathname, isInitialPageLoad, setIsInitialPageLoad]);

  const showHeader = !['/home'].includes(pathname) && !pathname.startsWith('/auth');

  const bodyClassName = cn(
    "flex flex-col min-h-screen",
    showHeader ? "pt-4" : ""
  );
  
  return (
    <div className={bodyClassName}>
      {showHeader && <MainHeader />}
      <main className="flex-1 flex flex-col z-10">
        {children}
      </main>
    </div>
  );
}
