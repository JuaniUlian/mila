
'use client';

import React from 'react';
import { Logo } from './logo';
import { BlockNavigation } from '../mila/block-navigation';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';

export function MainSidebar() {
    const { score } = useLayout();

    const getSidebarBackgroundClass = (currentScore: number | null): string => {
        const baseStyle = "bg-[linear-gradient(180deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.03)_15%,transparent_100%)]";
        const defaultBg = `bg-slate-900/80 ${baseStyle}`;
        
        if (currentScore === null) return defaultBg; // Default style for other pages
        if (currentScore === 100) return `bg-sky-900/90 ${baseStyle}`; // Special blue for 100%
        if (currentScore >= 95) return defaultBg; // Slate for 95-99
        if (currentScore < 40) return `bg-rose-900/90 ${baseStyle}`;
        if (currentScore < 60) return `bg-orange-900/90 ${baseStyle}`;
        if (currentScore < 75) return `bg-amber-900/90 ${baseStyle}`;
        if (currentScore < 85) return `bg-lime-900/90 ${baseStyle}`;
        if (currentScore < 95) return `bg-sky-900/90 ${baseStyle}`;
        
        return defaultBg; // Fallback
    };

    const backgroundClass = getSidebarBackgroundClass(score);

    return (
        <aside className={cn(
            "w-64 flex-shrink-0 backdrop-blur-xl text-white p-4 flex flex-col border-r border-white/10 transition-colors duration-1000",
            backgroundClass
        )}>
            <div className="flex justify-center items-center py-4">
                <Logo />
            </div>
            <nav className="mt-8 flex-1">
                <BlockNavigation />
            </nav>
        </aside>
    );
};
