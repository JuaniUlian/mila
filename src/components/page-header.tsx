
import type React from 'react';
import { Button } from '@/components/ui/button';
// import { SidebarTrigger } from '@/components/ui/sidebar'; // Removed
import { BookCheck } from 'lucide-react';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {/* <SidebarTrigger className="md:hidden" /> */} {/* Removed */}
        <BookCheck className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      {/* Potentially add other header elements here, e.g., user menu */}
    </header>
  );
}

