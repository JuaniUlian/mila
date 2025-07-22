
'use client';

import React from 'react';
import Link from 'next/link';
import { FilePlus2, Settings, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { SettingsDialog } from './settings-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from './logo';
import { usePathname } from 'next/navigation';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';

export function MainHeader() {
    const { language } = useLanguage();
    const t = useTranslations(language);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const { score, isInitialPageLoad } = useLayout();
    const pathname = usePathname();

    let headerBgClass = 'bg-slate-100/60';
    if (pathname === '/analysis') {
        if (isInitialPageLoad || score === null) {
            headerBgClass = 'bg-slate-100/60';
        } else if (score < 40) {
            headerBgClass = 'bg-red-200/60';
        } else if (score < 75) {
            headerBgClass = 'bg-amber-200/60';
        } else if (score < 100) {
            headerBgClass = 'bg-green-200/60';
        } else {
            headerBgClass = 'bg-sky-200/60';
        }
    }

    const navActions = [
        {
            name: t('sidebar.prepare'),
            href: '/prepare',
            icon: FilePlus2,
            isLink: true,
        },
        {
            name: t('sidebar.settings'),
            onClick: () => setIsSettingsModalOpen(true),
            icon: Settings,
            isLink: false,
        },
        {
            name: t('sidebar.plusBI'),
            href: 'https://pluscompol.com',
            icon: Globe,
            isLink: true,
            isExternal: true,
        },
    ];

    return (
        <>
            <TooltipProvider delayDuration={100}>
                <header className={cn(
                    "backdrop-blur-lg sticky top-4 z-50 w-fit mx-auto rounded-full border border-slate-200/50 shadow-lg p-2 transition-colors duration-500",
                    headerBgClass
                )}>
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/" aria-label={t('sidebar.home') || 'Inicio'} className="flex items-center justify-center h-12 w-12 rounded-full p-1.5 bg-white/30 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/50 transition-all duration-200">
                                    <Logo variant="color" className="h-full w-full" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('sidebar.home') || 'Inicio'}</p>
                            </TooltipContent>
                        </Tooltip>

                        {navActions.map((action) => {
                             const commonClasses = "flex items-center justify-center rounded-full h-12 w-12 bg-white/30 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/50 text-foreground transition-all duration-200";

                            return (
                                <Tooltip key={action.name}>
                                    <TooltipTrigger asChild>
                                        {action.isLink ? (
                                            <Link
                                                href={action.href!}
                                                target={action.isExternal ? '_blank' : undefined}
                                                rel={action.isExternal ? 'noopener noreferrer' : undefined}
                                                className={commonClasses}
                                                aria-label={action.name}
                                                suppressHydrationWarning
                                            >
                                                <action.icon className="h-6 w-6" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={action.onClick}
                                                className={commonClasses}
                                                aria-label={action.name}
                                                suppressHydrationWarning
                                            >
                                                <action.icon className="h-6 w-6" />
                                            </button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{action.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </nav>
                </header>
            </TooltipProvider>
            <SettingsDialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
        </>
    );
}
