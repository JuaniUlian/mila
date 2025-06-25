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
        className="rounded-2xl shadow-lg"
        data-ai-hint="logo company"
      >
        <rect width="112" height="112" rx="16" fill="black" />
        
        {/* Border with gradient to simulate bevel */}
        <rect x="5" y="5" width="102" height="102" rx="12" fill="none" stroke="url(#border-grad)" strokeWidth="2"/>

        {/* Text with gradient */}
        <g fontFamily="Nunito, sans-serif" fontSize="48" fontWeight="800" fill="url(#text-grad)" textAnchor="middle">
            {/* Top Row: MI */}
            <text x="38" y="46">M</text>
            <text x="74" y="46">I</text>

            {/* Bottom Row: LA */}
            <text x="38" y="86">L</text>
            <text x="74" y="86">A</text>
        </g>

        <defs>
            <linearGradient id="border-grad" x1="0" y1="0" x2="112" y2="112">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="#888888" />
            </linearGradient>
            <linearGradient id="text-grad" x1="0" y1="0" x2="0" y2="112">
                <stop offset="0%" stopColor="#EAEAEA" />
                <stop offset="100%" stopColor="#A0A0A0" />
            </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
