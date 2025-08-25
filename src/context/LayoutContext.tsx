
'use client';

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface LayoutContextType {
  score: number | null;
  setScore: (score: number | null) => void;
  isInitialPageLoad: boolean;
  setIsInitialPageLoad: (isInitial: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState<number | null>(null);
  const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = useMemo(() => ({ 
    score, 
    setScore, 
    isInitialPageLoad, 
    setIsInitialPageLoad,
    theme,
    setTheme
  }), [score, isInitialPageLoad, theme]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
