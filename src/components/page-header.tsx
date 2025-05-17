
import type React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BookCheck } from 'lucide-react'; // Changed icon

interface PageHeaderProps {
  title: string;
  // onValidate and isLoading are removed as per new requirements
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <BookCheck className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>
      {/* Removed Validate Sheet button. Other global actions can be added here if needed later. */}
      {/* Example:
      <Button 
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar Todo
      </Button> 
      */}
    </header>
  );
}
