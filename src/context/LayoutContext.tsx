
'use client';

import React, { createContext, useState, useContext, useMemo } from 'react';

interface LayoutContextType {
  score: number | null;
  setScore: (score: number | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState<number | null>(null);

  const value = useMemo(() => ({ score, setScore }), [score]);

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
