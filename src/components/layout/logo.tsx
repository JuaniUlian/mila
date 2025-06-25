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
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        data-ai-hint="logo company"
      >
        {/* Rounded rectangle border with gradient */}
        <rect
          x="2"
          y="2"
          width="108"
          height="108"
          rx="20"
          ry="20"
          fill="none"
          stroke="url(#border-grad)"
          strokeWidth="3"
        />
        
        {/* Text with gradient */}
        <g fontFamily="sans-serif" fontSize="48" fontWeight="600" fill="url(#text-grad)" textAnchor="middle">
            {/* Top Row: MI */}
            <text x="34" y="48">M</text>
            <text x="78" y="48">I</text>

            {/* Bottom Row: LA */}
            <text x="34" y="92">L</text>
            <text x="78" y="92">A</text>
        </g>

        <defs>
            <linearGradient id="text-grad" x1="0" y1="0" x2="0" y2="112">
                <stop offset="0%" stopColor="#EAEAEA" />
                <stop offset="100%" stopColor="#A0A0A0" />
            </linearGradient>
             <linearGradient id="border-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#A9A9A9" />
            </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
