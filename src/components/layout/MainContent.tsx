
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

  const PREPARE_PATHS = useMemo(() => ['/prepare', '/operative-module', '/technical-module', '/strategic-module'], []);

  const backgroundClass = useMemo(() => {
    if (pathname === '/home') return 'bg-home-page';
    if (pathname === '/loading') return 'bg-loading-page';
    if (PREPARE_PATHS.includes(pathname) || pathname === '/select-module') {
      return 'bg-prepare-page';
    }
    if (pathname === '/analysis') {
      if (score === null || isInitialPageLoad) {
        return 'bg-prepare-page';
      }
      if (score <= 50) return 'bg-analysis-grave';
      if (score <= 79) return 'bg-analysis-alerta';
      return 'bg-analysis-validado';
    }
    return '';
  }, [pathname, score, isInitialPageLoad, PREPARE_PATHS]);

  useEffect(() => {
    if (pathname !== '/analysis' && !isInitialPageLoad) {
      setIsInitialPageLoad(true);
    }
  }, [pathname, isInitialPageLoad, setIsInitialPageLoad]);

  const bodyClassName = cn(
    "flex flex-col min-h-screen",
    backgroundClass,
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
