'use client';

import React from 'react';
import { Logo } from './logo';
import { BlockNavigation } from '../mila/block-navigation';

export function MainSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 bg-slate-900/70 backdrop-blur-xl text-white p-4 flex flex-col border-r border-white/10">
            <div className="flex justify-center items-center py-4">
                <Logo />
            </div>
            <nav className="mt-8 flex-1">
                <BlockNavigation />
            </nav>
        </aside>
    );
};
