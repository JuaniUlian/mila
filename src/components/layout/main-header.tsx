
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilePlus2, Settings, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { SettingsDialog } from './settings-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from './logo';
import { usePathname, useRouter } from 'next/navigation';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function MainHeader() {
    const { language } = useLanguage();
    const t = useTranslations(language);
    const router = useRouter();
    const pathname = usePathname();
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
    const [isClient, setIsClient] = useState(false);

    const { score, isInitialPageLoad } = useLayout();
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handlePrepareClick = (e: React.MouseEvent) => {
        if (pathname === '/analysis') {
            e.preventDefault();
            setIsConfirmDialogOpen(true);
        } else {
            router.push('/select-module');
        }
    };
    
    const handleConfirmNavigation = () => {
        router.push('/select-module');
    };

    const navActions = [
        {
            name: t('sidebar.prepare'),
            icon: FilePlus2,
            isLink: true,
            href: '/select-module',
            onClick: handlePrepareClick,
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

    const commonButtonClasses = "w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 border border-gray-300/50 flex items-center justify-center transition-all duration-200";

    return (
        <>
            <header className="sticky top-4 z-50 w-fit mx-auto bg-white/50 backdrop-blur-md shadow-lg rounded-full px-4 py-2">
                <nav className="flex items-center justify-center gap-2">
                    {isClient && (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/home" className={commonButtonClasses}>
                                        <Logo variant="monochrome" className="h-full w-full p-1.5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-foreground border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-sm font-semibold">
                                    <p>Inicio</p>
                                </TooltipContent>
                            </Tooltip>

                            {navActions.map((action) => (
                                <Tooltip key={action.name}>
                                    <TooltipTrigger asChild>
                                        {action.href ? (
                                            <Link
                                                href={action.href}
                                                onClick={action.onClick}
                                                target={action.isExternal ? '_blank' : undefined}
                                                rel={action.isExternal ? 'noopener noreferrer' : undefined}
                                                className={commonButtonClasses}
                                                aria-label={action.name}
                                            >
                                                <action.icon className="h-6 w-6" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={action.onClick}
                                                className={commonButtonClasses}
                                                aria-label={action.name}
                                            >
                                                <action.icon className="h-6 w-6" />
                                            </button>
                                        )}
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white text-foreground border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-sm font-semibold">
                                        <p>{action.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    )}
                </nav>
            </header>
            <SettingsDialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent className="glass-card">
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('confirmDialog.description')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>
                        {t('confirmDialog.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmNavigation}
                        className="btn-neu-green"
                    >
                        {t('confirmDialog.continue')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
