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
        data-ai-hint="logo"
      >
        <rect width="112" height="112" rx="16" fill="url(#logo-gradient)" />
        <text
          x="50%"
          y="56%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="36"
          fontWeight="900"
          fill="white"
          letterSpacing="0.05em"
        >
          MILA
        </text>
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="0"
            y1="0"
            x2="112"
            y2="112"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#064E3B" />
            <stop offset="1" stopColor="#052e16" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
