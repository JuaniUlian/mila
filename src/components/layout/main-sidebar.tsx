'use client';

import React from 'react';
import { Logo } from './logo';
import { BlockNavigation } from '../mila/block-navigation';

export function MainSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-sky-950 via-slate-800 to-slate-950 text-white p-4 flex flex-col">
            <div className="flex justify-center items-center py-4">
                <Logo />
            </div>
            <nav className="mt-8 flex-1">
                <BlockNavigation />
            </nav>
        </aside>
    );
};
