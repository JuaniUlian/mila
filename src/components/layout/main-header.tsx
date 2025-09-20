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

    // CORRECCIÓN: Isla translúcida blanca en modo claro, sólida oscura en modo oscuro
    let headerBgClass = 'bg-white/60 backdrop-blur-lg border-white/30 dark:bg-slate-900/95 dark:border-slate-700/50';
    
    if (pathname === '/analysis') {
        if (isInitialPageLoad || score === null) {
            headerBgClass = 'bg-white/60 backdrop-blur-lg border-white/30 dark:bg-slate-900/95 dark:border-slate-700/50';
        } else if (score <= 50) {
            headerBgClass = 'bg-red-50/80 backdrop-blur-lg border-red-200/60 dark:bg-red-950/90 dark:border-red-800/60';
        } else if (score <= 79) {
            headerBgClass = 'bg-amber-50/80 backdrop-blur-lg border-amber-200/60 dark:bg-amber-950/90 dark:border-amber-800/60';
        } else {
            headerBgClass = 'bg-emerald-50/80 backdrop-blur-lg border-emerald-200/60 dark:bg-emerald-950/90 dark:border-emerald-800/60';
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
            href: '/select-module',
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
                    "sticky top-4 z-50 w-fit mx-auto rounded-2xl border shadow-lg p-2 transition-all duration-500",
                    headerBgClass
                )}>
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/home" className={cn(
                                    "flex items-center justify-center h-12 w-12 rounded-xl p-1.5 transition-all duration-200",
                                    "bg-white/70 dark:bg-slate-800/80", // CORRECCIÓN: Translúcido blanco en claro
                                    "border border-white/40 dark:border-slate-600/40",
                                    "shadow-sm hover:shadow-md",
                                    "hover:bg-white/90 dark:hover:bg-slate-700/95"
                                )}>
                                    <Logo variant="color" className="h-full w-full" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Inicio</p>
                            </TooltipContent>
                        </Tooltip>

                        {navActions.map((action) => {
                             const commonClasses = cn(
                                "flex items-center justify-center rounded-xl h-12 w-12 transition-all duration-200",
                                "bg-white/70 dark:bg-slate-800/80", // CORRECCIÓN: Consistencia translúcida
                                "border border-white/40 dark:border-slate-600/40",
                                "shadow-sm hover:shadow-md",
                                "hover:bg-white/90 dark:hover:bg-slate-700/95",
                                "text-gray-700 dark:text-slate-200"
                             );

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
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                    <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-slate-100">{t('confirmDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
                        {t('confirmDialog.description')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                        {t('confirmDialog.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmNavigation}
                        className="bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700"
                    >
                        {t('confirmDialog.continue')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}