
import type React from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCheck, Download, HelpCircle, Zap } from 'lucide-react';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <Card className="my-4 md:my-6 mx-auto max-w-4xl shadow-xl rounded-2xl glass-card">
      <CardHeader className="pb-2 md:pb-3">
        {/* Changed sm:justify-between to sm:justify-center here */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <BookCheck className="h-6 w-6 md:h-7 md:w-7 text-accent flex-shrink-0" />
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      {/* CardContent removed as per previous request */}
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-white/10 dark:bg-slate-900/20 p-3 md:p-4 rounded-b-2xl border-t border-white/20 dark:border-slate-700/40">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto text-accent hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors duration-150 border-white/50 dark:border-slate-700/70"
        >
          <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Ver Guía
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto text-accent hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors duration-150 border-white/50 dark:border-slate-700/70"
        >
          <Zap className="mr-1.5 h-3.5 w-3.5" /> Reportar Error
        </Button>
        <Button 
          size="sm" 
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-150"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar Todo
        </Button>
      </CardFooter>
    </Card>
  );
}
