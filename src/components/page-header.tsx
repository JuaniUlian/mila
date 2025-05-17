import type React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { FileSearch, Download } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onValidate: () => void;
  isLoading: boolean;
}

export function PageHeader({ title, onValidate, isLoading }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      <Button 
        onClick={onValidate} 
        disabled={isLoading}
        className="bg-validation-blue text-white hover:bg-opacity-90"
      >
        <FileSearch className="mr-2 h-4 w-4" />
        {isLoading ? 'Analyzing...' : 'Validate Sheet'}
      </Button>
    </header>
  );
}
