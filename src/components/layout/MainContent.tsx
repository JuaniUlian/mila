
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad, setIsInitialPageLoad } = useLayout();
  
  const showHeader = !['/home'].includes(pathname) && !pathname.startsWith('/auth');

  const PREPARE_PATHS = ['/prepare', '/operative-module', '/technical-module', '/strategic-module'];

  // State to hold the dynamic background class, applied only on the client
  const [backgroundClass, setBackgroundClass] = useState('');

  useEffect(() => {
    // Determine the background class on the client side
    let newBgClass = '';
    if (pathname === '/home') {
      newBgClass = 'bg-home-page';
    } else if (pathname === '/loading') {
      newBgClass = 'bg-loading-page';
    } else if (PREPARE_PATHS.includes(pathname) || pathname === '/select-module') {
      newBgClass = 'bg-prepare-page';
    } else if (pathname === '/analysis') {
      if (score === null) {
          newBgClass = 'bg-prepare-page';
      } else if (score <= 50) {
          newBgClass = 'bg-analysis-grave';
      } else if (score <= 79) {
          newBgClass = 'bg-analysis-alerta';
      } else { 
          newBgClass = 'bg-analysis-validado';
      }
    }
    setBackgroundClass(newBgClass);
  }, [pathname, score, PREPARE_PATHS]);


  useEffect(() => {
    if (pathname === '/analysis' && score !== null && isInitialPageLoad) {
        setIsInitialPageLoad(false);
    } else if (pathname !== '/analysis' && !isInitialPageLoad) {
      setIsInitialPageLoad(true);
    }
  }, [pathname, score, isInitialPageLoad, setIsInitialPageLoad]);


  const bodyClassName = cn(
    "flex flex-col min-h-screen",
    backgroundClass, // Apply dynamic class on client
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
