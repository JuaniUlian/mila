
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  
  const showHeader = pathname !== '/';
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bodyClassName = useMemo(() => {
    if (!isMounted) {
      return "flex min-h-screen flex-col bg-slate-100";
    }

    let backgroundClasses = 'bg-slate-100';
    let animationClasses = '';

    if (pathname === '/analysis') {
        if (isInitialPageLoad || score === null) {
            backgroundClasses = 'bg-gradient-to-b from-slate-200/50 via-slate-100/50 to-white';
        } else if (score < 40) {
            backgroundClasses = 'bg-gradient-to-b from-red-400/40 via-red-100/40 to-white';
        } else if (score < 75) {
            backgroundClasses = 'bg-gradient-to-b from-amber-400/40 via-amber-100/40 to-white';
        } else if (score < 100) {
            backgroundClasses = 'bg-gradient-to-b from-green-400/40 via-green-100/40 to-white';
        } else { // score === 100
            backgroundClasses = 'bg-gradient-to-b from-sky-400/40 via-sky-100/40 to-white';
        }
    } else if (pathname === '/loading') {
      backgroundClasses = 'bg-gradient-to-r from-white via-sky-200 to-slate-200';
      animationClasses = 'bg-200% animate-gradient-bg';
    } else if (pathname === '/prepare') {
      backgroundClasses = 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200';
    }

    return cn("flex min-h-screen flex-col transition-all duration-500", backgroundClasses, animationClasses);
  }, [isMounted, pathname, score, isInitialPageLoad]);


  return (
    <div className={bodyClassName}>
      {showHeader && <MainHeader />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
