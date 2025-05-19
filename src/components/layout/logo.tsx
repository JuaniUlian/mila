import type React from 'react';
import Image from 'next/image';

export function Logo() {
  // Instructions for the user:
  // 1. Save your logo image (e.g., as 'my-logo.png') in the 'public' folder of your project.
  // 2. Update the src attribute below from the placeholder to '/my-logo.png'.
  // 3. Adjust width and height attributes as needed for your logo's aspect ratio.
  // For the dark theme, ensure your logo has good contrast or use a version suitable for dark backgrounds.
  // The placeholder below is a simple white triangle, which should be visible on the dark sidebar.
  return (
    <div className="p-1"> {/* Added padding around the logo container */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 100 100" 
        fill="hsl(var(--sidebar-primary-foreground))" // Use sidebar primary foreground (white/light)
        xmlns="http://www.w3.org/2000/svg"
        className="transition-opacity hover:opacity-80"
        data-ai-hint="logo app brand"
      >
        <path d="M50 15L15 85H85L50 15Z" />
      </svg>
    </div>
  );
}
