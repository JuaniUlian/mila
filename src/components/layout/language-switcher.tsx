
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

// Added a variant prop to handle different backgrounds (light/dark)
export function LanguageSwitcher({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            className={cn(
                "w-full justify-start text-base h-12 px-3 rounded-lg transition-colors duration-150 ease-in-out",
                // Conditional styling based on the variant prop
                variant === 'dark' && "text-slate-300 hover:bg-white/5 hover:text-white",
                variant === 'light' && "text-gray-600 hover:bg-slate-200/50"
            )}>
          <Globe className="mr-3 h-5 w-5" />
          <span className="flex-1 truncate font-medium">{selectedLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            onSelect={() => setSelectedLanguage(lang)}
            className="flex items-center cursor-pointer w-full"
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
