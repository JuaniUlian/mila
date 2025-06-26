
import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, variant = 'color' }: { className?: string, variant?: 'color' | 'monochrome' }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      {variant === 'color' ? (
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          data-ai-hint="logo company"
        >
          {/* Main rectangle with gradient stroke */}
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

          {/* Inner glow effect */}
          <rect
              x="3.5"
              y="3.5"
              width="105"
              height="105"
              rx="18.5"
              ry="18.5"
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
          />

          {/* Text with gradient */}
          <g fontFamily="sans-serif" fontSize="48" fontWeight="600" textAnchor="middle">
              <text x="34" y="48" fill="url(#blue-grad)">M</text>
              <text x="78" y="48" fill="url(#orange-grad)">I</text>
              <text x="34" y="92" fill="url(#blue-grad)">L</text>
              <text x="78" y="92" fill="url(#orange-grad)">A</text>
          </g>

          <defs>
              {/* Blue gradient for M and L */}
              <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>

              {/* Orange gradient for I and A */}
              <linearGradient id="orange-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>

              {/* Border gradient */}
              <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg" data-ai-hint="logo company monochrome silver">
            <rect x="2" y="2" width="108" height="108" rx="20" ry="20" fill="none" stroke="url(#silver-border-grad)" strokeWidth="3"/>
            <rect x="3.5" y="3.5" width="105" height="105" rx="18.5" ry="18.5" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1"/>
            <g fontFamily="sans-serif" fontSize="48" fontWeight="600" textAnchor="middle">
                <text x="34" y="48" fill="url(#silver-text-grad)">M</text>
                <text x="78" y="48" fill="url(#silver-text-grad)">I</text>
                <text x="34" y="92" fill="url(#silver-text-grad)">L</text>
                <text x="78" y="92" fill="url(#silver-text-grad)">A</text>
            </g>
            <defs>
                <linearGradient id="silver-text-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
                <linearGradient id="silver-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#F9FAFB" />
                </linearGradient>
            </defs>
        </svg>
      )}
    </div>
  );
}
