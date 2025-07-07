'use client';

import React from 'react';
import { BlockNavigation } from '../mila/block-navigation';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';
import { SettingsDialog } from './settings-dialog';

export function MainSidebar() {
    const { score, isInitialPageLoad } = useLayout();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

    const getSidebarBackgroundClass = (currentScore: number | null, isInitial: boolean): string => {
        const baseStyle = "bg-[linear-gradient(180deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.03)_15%,transparent_100%)]";
        const defaultBg = `bg-slate-900/80 ${baseStyle}`;
        
        if (isInitial || currentScore === null) return defaultBg; // Default style for initial load or other pages
        if (currentScore === 100) return `bg-slate-900/80 ${baseStyle}`;
        if (currentScore >= 95) return `bg-slate-900/90 ${baseStyle}`; // Slate for 95-99
        if (currentScore < 40) return `bg-rose-900/90 ${baseStyle}`;
        if (currentScore < 60) return `bg-orange-900/90 ${baseStyle}`;
        if (currentScore < 75) return `bg-amber-900/90 ${baseStyle}`;
        if (currentScore < 85) return `bg-lime-900/90 ${baseStyle}`;
        if (currentScore < 95) return `bg-blue-900/90 ${baseStyle}`;
        
        return defaultBg; // Fallback
    };

    const backgroundClass = getSidebarBackgroundClass(score, isInitialPageLoad);

    return (
        <aside className={cn(
            "w-64 flex-shrink-0 backdrop-blur-xl text-white p-4 flex flex-col border-r border-white/10 transition-all duration-500",
            backgroundClass
        )}>
            <div className="flex justify-center items-center py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" className="w-28 h-28">
                  <defs>
                    <linearGradient id="gradSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#e0e0e0"/>
                      <stop offset="100%" stop-color="#b0b0b0"/>
                    </linearGradient>
                  </defs>
                  <rect x="32" y="32" width="448" height="448" rx="64" ry="64"
                        fill="none" stroke="url(#gradSilver)" stroke-width="16"/>
                  <text x="176" y="240"
                        font-family="Nunito, sans-serif"
                        font-size="160"
                        font-weight="600"
                        fill="url(#gradSilver)"
                        text-anchor="middle">M</text>
                  <text x="156" y="380"
                        font-family="Nunito, sans-serif"
                        font-size="160"
                        font-weight="600"
                        fill="url(#gradSilver)"
                        text-anchor="middle">L</text>
                  <text x="336" y="240"
                        font-family="Nunito, sans-serif"
                        font-size="160"
                        font-weight="600"
                        fill="url(#gradSilver)"
                        text-anchor="middle">I</text>
                  <text x="336" y="380"
                        font-family="Nunito, sans-serif"
                        font-size="160"
                        font-weight="600"
                        fill="url(#gradSilver)"
                        text-anchor="middle">A</text>
                </svg>
            </div>
            <nav className="mt-8 flex-1 flex flex-col">
                <BlockNavigation onSettingsClick={() => setIsSettingsModalOpen(true)} />
            </nav>
            <SettingsDialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
        </aside>
    );
};
