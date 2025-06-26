
'use client';

import React, { useState, useEffect } from 'react';
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
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

// Added a variant prop to handle different backgrounds (light/dark)
export function LanguageSwitcher({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const [currentUrl, setCurrentUrl] = useState('');

  // Get the current URL on the client side to avoid hydration errors.
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const getTranslateUrl = (langCode: string) => {
    if (!currentUrl) return '#';
    // Using auto-detection for source language (sl=auto).
    return `https://translate.google.com/translate?sl=auto&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
  };
  
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
          {/* Using a generic label as selection is now external */}
          <span className="flex-1 truncate font-medium">Idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {languages.map((lang) => (
          // DropdownMenuItem with asChild prop will render its child (the <a> tag) and pass props to it.
          <DropdownMenuItem key={lang.code} asChild>
            <a href={getTranslateUrl(lang.code)} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer w-full">
                <span className="mr-2 text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
