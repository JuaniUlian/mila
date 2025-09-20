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

    // MEJORA: Mejor gestión de colores de fondo que respeta el tema
    let headerBgClass = 'bg-background/90 backdrop-blur-lg dark:bg-slate-900/90';
    if (pathname === '/analysis') {
        if (isInitialPageLoad || score === null) {
            headerBgClass = 'bg-background/90 backdrop-blur-lg dark:bg-slate-900/90';
        } else if (score <= 50) {
            headerBgClass = 'bg-red-50/95 backdrop-blur-lg dark:bg-red-950/90 border-red-200/60 dark:border-red-800/60';
        } else if (score <= 79) {
            headerBgClass = 'bg-amber-50/95 backdrop-blur-lg dark:bg-amber-950/90 border-amber-200/60 dark:border-amber-800/60';
        } else {
            headerBgClass = 'bg-emerald-50/95 backdrop-blur-lg dark:bg-emerald-950/90 border-emerald-200/60 dark:border-emerald-800/60';
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
                    headerBgClass,
                    "border-border/30 dark:border-slate-700/40" // MEJORA: Mejor manejo de bordes
                )}>
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/home" className={cn(
                                    "flex items-center justify-center h-12 w-12 rounded-xl p-1.5 transition-all duration-200",
                                    "bg-background/80 dark:bg-slate-800/80", // MEJORA: Mejor contraste
                                    "border border-border/40 dark:border-slate-600/40",
                                    "shadow-sm hover:shadow-md",
                                    "hover:bg-background/95 dark:hover:bg-slate-700/95"
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
                                "bg-background/80 dark:bg-slate-800/80", // MEJORA: Consistencia de colores
                                "border border-border/40 dark:border-slate-600/40",
                                "shadow-sm hover:shadow-md",
                                "hover:bg-background/95 dark:hover:bg-slate-700/95",
                                "text-foreground dark:text-slate-200"
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
                <AlertDialogContent className="bg-background dark:bg-slate-900 border-border dark:border-slate-700">
                    <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground dark:text-slate-100">{t('confirmDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground dark:text-slate-400">
                        {t('confirmDialog.description')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel className="bg-background dark:bg-slate-800 text-foreground dark:text-slate-200 border-border dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700">
                        {t('confirmDialog.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmNavigation}
                        className="bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700"
                    >
                        {t('confirmDialog.continue')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}