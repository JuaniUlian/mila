
'use client';

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

interface LayoutContextType {
  score: number | null;
  setScore: (score: number | null) => void;
  isInitialPageLoad: boolean;
  setIsInitialPageLoad: (isInitial: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState<number | null>(null);
  const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);

  useEffect(() => {
    // Ensure the app always starts in light mode and remove any dark class.
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  const value = useMemo(() => ({ 
    score, 
    setScore, 
    isInitialPageLoad, 
    setIsInitialPageLoad,
  }), [score, isInitialPageLoad]);

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
