import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      <div className="w-28 h-28 p-2 border-2 border-slate-400/50 rounded-2xl bg-black/20" data-ai-hint="logo">
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-1 text-slate-200 font-black text-4xl tracking-widest">
              <span className="flex items-center justify-center">M</span>
              <span className="flex items-center justify-center">I</span>
              <span className="flex items-center justify-center">L</span>
              <span className="flex items-center justify-center">A</span>
          </div>
      </div>
    </div>
  );
}
