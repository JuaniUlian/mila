'use client';

import React from 'react';
import Link from 'next/link';
import { FilePlus2, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { SettingsDialog } from './settings-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from './logo';

export function MainHeader() {
    const { language } = useLanguage();
    const t = useTranslations(language);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

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
                <header className="backdrop-blur-lg sticky top-4 z-50 w-fit mx-auto rounded-full border border-slate-200/50 shadow-lg p-2">
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/" aria-label={t('sidebar.home') || 'Inicio'} className="flex items-center justify-center h-12 w-12 btn-neu-light rounded-full p-1.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-200 ease-in-out">
                                    <Logo variant="color" className="h-full w-full" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('sidebar.home') || 'Inicio'}</p>
                            </TooltipContent>
                        </Tooltip>

                        {navActions.map((action) => {
                             const commonProps = {
                                variant: "outline" as const,
                                size: "icon" as const,
                                className: "btn-neu-light rounded-full h-12 w-12",
                                "aria-label": action.name
                            };

                            return (
                                <Tooltip key={action.name}>
                                    <TooltipTrigger asChild>
                                        {action.isLink ? (
                                            <Button {...commonProps} asChild>
                                                <Link href={action.href!} target={action.isExternal ? '_blank' : undefined} rel={action.isExternal ? 'noopener noreferrer' : undefined}>
                                                    <action.icon className="h-6 w-6" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button {...commonProps} onClick={action.onClick}>
                                                <action.icon className="h-6 w-6" />
                                            </Button>
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
