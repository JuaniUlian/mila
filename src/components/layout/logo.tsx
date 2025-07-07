
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
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" data-ai-hint="logo company">
            <defs>
                <linearGradient id="gradBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D2B3E"/>
                <stop offset="100%" stopColor="#DA623C"/>
                </linearGradient>
            </defs>

            <rect x="32" y="32" width="448" height="448" rx="64" ry="64"
                fill="none" stroke="url(#gradBorder)" strokeWidth="16"/>

            <text x="176" y="240"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="#0D2B3E"
                textAnchor="middle">M</text>

            <text x="156" y="380"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="#0D2B3E"
                textAnchor="middle">L</text>

            <text x="336" y="240"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="#DA623C"
                textAnchor="middle">I</text>

            <text x="336" y="380"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="#DA623C"
                textAnchor="middle">A</text>
        </svg>
      ) : (
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" data-ai-hint="logo company monochrome silver">
            <defs>
                <linearGradient id="silver-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9FAFB" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#F9FAFB" />
                </linearGradient>
                <linearGradient id="silver-text-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
            </defs>
            <rect x="32" y="32" width="448" height="448" rx="64" ry="64"
                fill="none" stroke="url(#silver-border-grad)" strokeWidth="16"/>
            <text x="176" y="240"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="url(#silver-text-grad)"
                textAnchor="middle">M</text>
            <text x="156" y="380"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="url(#silver-text-grad)"
                textAnchor="middle">L</text>
            <text x="336" y="240"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="url(#silver-text-grad)"
                textAnchor="middle">I</text>
            <text x="336" y="380"
                fontFamily="Nunito, sans-serif"
                fontSize="160"
                fontWeight="600"
                fill="url(#silver-text-grad)"
                textAnchor="middle">A</text>
        </svg>
      )}
    </div>
  );
}
