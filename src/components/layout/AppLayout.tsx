
'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';
import { getPageBackgroundClass } from '@/lib/color-utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  const showHeader = pathname !== '/';
  
  // Start with a default, server-safe class name to prevent hydration mismatch.
  const [bodyClassName, setBodyClassName] = useState("flex min-h-screen flex-col bg-slate-100");

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    // Here we can safely calculate and set the dynamic class name.
    let backgroundClasses = '';
    let animationClasses = '';

    if (pathname === '/analysis') {
      backgroundClasses = `bg-gradient-to-b ${getPageBackgroundClass(score, isInitialPageLoad)}`;
    } else if (pathname === '/loading') {
      backgroundClasses = 'bg-gradient-to-r from-white via-sky-200 to-slate-200';
      animationClasses = 'bg-200% animate-gradient-bg';
    } else if (pathname === '/prepare') {
      backgroundClasses = 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200';
    } else {
       backgroundClasses = 'bg-slate-100';
    }

    setBodyClassName(cn("flex min-h-screen flex-col", backgroundClasses, animationClasses));
  }, [pathname, score, isInitialPageLoad]);

  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <div className={bodyClassName}>
      <MainHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
