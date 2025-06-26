
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  // In a real app, this would trigger i18n logic
  const handleSelectLanguage = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    console.log(`Language changed to ${lang.name}`);
    // Here you would typically call i18n.changeLanguage(lang.code)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            className={cn(
                "w-full justify-start text-base h-12 px-3 rounded-lg transition-colors duration-150 ease-in-out",
                "text-slate-300 hover:bg-white/5 hover:text-white"
            )}>
          <span className="mr-3 text-lg">{selectedLanguage.flag}</span>
          <span className="flex-1 truncate font-medium">{selectedLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top" align="start">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onSelect={() => handleSelectLanguage(lang)}>
            <span className="mr-2 text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {selectedLanguage.code === lang.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
