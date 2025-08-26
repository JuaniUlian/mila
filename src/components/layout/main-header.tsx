

'use client';

import React from 'react';
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

    const { score, isInitialPageLoad } = useLayout();

    let headerBgClass = 'bg-slate-100/60 dark:bg-slate-800/60';
    if (pathname === '/analysis') {
        if (isInitialPageLoad || score === null) {
            headerBgClass = 'bg-slate-100/60 dark:bg-slate-800/60';
        } else if (score <= 50) {
            headerBgClass = 'bg-red-200/60 dark:bg-red-900/60';
        } else if (score <= 79) {
            headerBgClass = 'bg-amber-200/60 dark:bg-amber-900/60';
        } else {
            headerBgClass = 'bg-sky-200/60 dark:bg-sky-900/60';
        }
    }
    
    const handlePrepareClick = (e: React.MouseEvent) => {
        if (pathname === '/analysis') {
            e.preventDefault();
            setIsConfirmDialogOpen(true);
        }
    };
    
    const handleConfirmNavigation = () => {
        router.push('/prepare');
    };

    const navActions = [
        {
            name: t('sidebar.prepare'),
            href: '/prepare',
            icon: FilePlus2,
            isLink: true,
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

    return (
        <>
            <TooltipProvider delayDuration={100}>
                <header className={cn(
                    "backdrop-blur-lg sticky top-4 z-50 w-fit mx-auto rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-2 transition-colors duration-500",
                    headerBgClass
                )}>
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/home" className="flex items-center justify-center h-12 w-12 rounded-full p-1.5 bg-white/30 dark:bg-slate-700/30 backdrop-blur-md border border-white/20 dark:border-slate-600/30 shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200">
                                    <Logo variant="color" className="h-full w-full" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('sidebar.home') || 'Inicio'}</p>
                            </TooltipContent>
                        </Tooltip>

                        {navActions.map((action) => {
                             const commonClasses = "flex items-center justify-center rounded-full h-12 w-12 bg-white/30 dark:bg-slate-700/30 backdrop-blur-md border border-white/20 dark:border-slate-600/30 shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50 text-foreground dark:text-slate-200 transition-all duration-200";

                            return (
                                <Tooltip key={action.name}>
                                    <TooltipTrigger asChild>
                                        {action.isLink ? (
                                            <Link
                                                href={action.href!}
                                                onClick={action.onClick}
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
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('confirmDialog.description')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('confirmDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmNavigation}>
                        {t('confirmDialog.continue')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
