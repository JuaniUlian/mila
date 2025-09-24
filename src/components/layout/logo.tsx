import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, variant = 'color' }: { className?: string, variant?: 'color' | 'monochrome' }) {
    const logoSrc = variant === 'color' 
        ? "/logo/Logo MILA (sin fondo).png" 
        : "/logo/Logo MILA (monocromo).png";

    return (
        <Image
            src={logoSrc}
            alt="MILA Logo"
            width={512}
            height={512}
            className={cn("h-full w-full", className)}
            unoptimized
        />
    );
}
