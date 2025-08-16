
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  
  const showHeader = pathname !== '/';

  // Base class name calculation that is safe for SSR
  const baseBodyClassName = useMemo(() => {
    let backgroundClasses = 'bg-slate-100'; // Default background

    if (pathname === '/loading') {
      backgroundClasses = 'bg-gradient-to-r from-white via-sky-200 to-slate-200 bg-200% animate-gradient-bg';
    } else if (pathname === '/prepare') {
      backgroundClasses = 'bg-prepare-page';
    } else if (pathname === '/analysis') {
      // For analysis, we start with a neutral color and change it on the client
      backgroundClasses = 'bg-gradient-to-b from-slate-200/50 via-slate-100/50 to-white';
    }

    return cn("flex min-h-screen flex-col transition-all duration-500", backgroundClasses, showHeader ? "pt-4" : "");
  }, [pathname, showHeader]);

  const [bodyClassName, setBodyClassName] = useState(baseBodyClassName);

  // Effect to update class name on the client side after hydration
  useEffect(() => {
    if (pathname === '/analysis') {
      let backgroundClasses;
      if (isInitialPageLoad || score === null) {
          backgroundClasses = 'bg-gradient-to-b from-slate-200/50 via-slate-100/50 to-white';
      } else if (score < 40) {
          backgroundClasses = 'bg-gradient-to-br from-red-200 via-red-100 to-white';
      } else if (score < 75) {
          backgroundClasses = 'bg-gradient-to-br from-amber-200 via-amber-100 to-white';
      } else if (score < 100) {
          backgroundClasses = 'bg-gradient-to-br from-green-200 via-green-100 to-white';
      } else { // score === 100
          backgroundClasses = 'bg-gradient-to-br from-sky-200 via-sky-100 to-white';
      }
      setBodyClassName(cn("flex min-h-screen flex-col transition-all duration-500", backgroundClasses, showHeader ? "pt-4" : ""));
    } else if (pathname === '/prepare') {
        setBodyClassName(cn("flex min-h-screen flex-col transition-all duration-500", "bg-prepare-page", showHeader ? "pt-4" : ""));
    } else {
      // For other pages, ensure the class name is consistent
      setBodyClassName(baseBodyClassName);
    }
  }, [pathname, score, isInitialPageLoad, showHeader, baseBodyClassName]);


  return (
    <div className={bodyClassName}>
      {showHeader && <MainHeader />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
