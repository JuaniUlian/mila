'use client';

import { usePathname } from 'next/navigation';
import { MainHeader } from '@/components/layout/main-header';
import React from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/context/LayoutContext';
import { getPageBackgroundClass } from '@/lib/color-utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { score, isInitialPageLoad } = useLayout();
  const showHeader = pathname !== '/';

  if (!showHeader) {
    return <>{children}</>;
  }
  
  // Base classes for the gradient
  let backgroundClasses = '';
  let animationClasses = '';

  // Page-specific backgrounds
  if (pathname === '/analysis') {
    backgroundClasses = `bg-gradient-to-b ${getPageBackgroundClass(score, isInitialPageLoad)}`;
  } else if (pathname === '/loading') {
    backgroundClasses = 'bg-gradient-to-r from-white via-sky-200 to-slate-200';
    animationClasses = 'bg-200% animate-gradient-bg';
  } else if (pathname === '/prepare') {
    backgroundClasses = 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200';
  } else {
     // A generic fallback, maybe just a solid color.
     backgroundClasses = 'bg-slate-100';
  }

  return (
    <div className={cn("flex min-h-screen flex-col", backgroundClasses, animationClasses)}>
      <MainHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
