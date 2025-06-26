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
        <g fontFamily="sans-serif" fontSize="48" fontWeight="600" textAnchor="middle">
            {/* Top Row: MI */}
            <text x="34" y="48" fill="url(#blue-grad)">M</text>
            <text x="78" y="48" fill="url(#orange-grad)">I</text>

            {/* Bottom Row: LA */}
            <text x="34" y="92" fill="url(#blue-grad)">L</text>
            <text x="78" y="92" fill="url(#orange-grad)">A</text>
        </g>

        <defs>
            {/* Metallic blue gradient */}
            <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="45%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#93C5FD" />
                <stop offset="55%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>

            {/* Metallic orange gradient */}
            <linearGradient id="orange-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="45%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#FEF9C3" />
                <stop offset="55%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Metallic/Chrome border gradient */}
             <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6B7280" />
                <stop offset="25%" stopColor="#F9FAFB" />
                <stop offset="50%" stopColor="#D1D5DB" />
                <stop offset="75%" stopColor="#F9FAFB" />
                <stop offset="100%" stopColor="#4B5563" />
            </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
