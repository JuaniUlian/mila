import type React from 'react';
import Image from 'next/image';

export function Logo() {
  return (
    <div className="p-1">
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 100 100" 
        fill="hsl(var(--foreground))" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-opacity hover:opacity-80"
        data-ai-hint="logo app brand"
      >
        {/* A stylized 'M' or abstract shape, more visible on dark background */}
        <path d="M20 80 L20 25 Q20 15 30 15 L50 15 Q60 15 60 25 L60 55 L70 40 L80 55 L80 25 Q80 15 90 15 L110 15 Q120 15 120 25 L120 80 L100 80 L100 40 L80 65 L60 40 L60 80 L40 80 L40 40 L20 80Z" transform="scale(0.8) translate(0, 5)"/>
         <path d="M15 85 L25 20 L50 70 L75 20 L85 85 L65 85 L50 45 L35 85 Z" />

      </svg>
    </div>
  );
}
