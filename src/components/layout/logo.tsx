import type React from 'react';
import Image from 'next/image';

export function Logo() {
  // Instructions for the user:
  // 1. Save your logo image (e.g., as 'my-logo.png') in the 'public' folder of your project.
  // 2. Update the src attribute below from the placeholder to '/my-logo.png'.
  // 3. Adjust width and height attributes as needed for your logo's aspect ratio.
  return (
    <Image
      src="https://placehold.co/32x32.png" // Replace this with the path to your logo, e.g., "/my-logo.png"
      alt="App Logo"
      width={32}
      height={32}
      data-ai-hint="logo" // This hint is for the placeholder
      className="rounded-sm" // Added a slight rounding, adjust as needed
    />
  );
}
