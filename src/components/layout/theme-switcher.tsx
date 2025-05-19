
"use client";

import type React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThemeSwitcherProps {
  currentTheme: string;
  setTheme: (theme: 'light' | 'dark' | 'violet') => void;
}

export function ThemeSwitcher({ currentTheme, setTheme }: ThemeSwitcherProps) {
  const themes = [
    { name: 'light', icon: <Sun size={16} /> },
    { name: 'dark', icon: <Moon size={16} /> },
    { name: 'violet', icon: <Palette size={16} /> },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-full bg-[rgba(var(--muted-rgb),0.2)]">
      {themes.map((themeOption) => (
        <Button
          key={themeOption.name}
          variant="ghost"
          size="icon"
          className={`
            h-7 w-7 rounded-full transition-all duration-150 ease-in-out
            ${currentTheme === themeOption.name 
              ? 'bg-[rgba(var(--primary-rgb),1)] text-[rgb(var(--primary-foreground-rgb))] shadow-md' 
              : 'text-[rgb(var(--muted-foreground-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] hover:text-[rgb(var(--accent-rgb))]'}
          `}
          onClick={() => setTheme(themeOption.name)}
          aria-label={`Switch to ${themeOption.name} theme`}
        >
          {themeOption.icon}
        </Button>
      ))}
    </div>
  );
}
