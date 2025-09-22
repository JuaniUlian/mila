
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

    const commonButtonClasses = cn(
      "w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 border border-gray-300/50 flex items-center justify-center transition-all duration-200"
    );

    return (
        <>
            <TooltipProvider delayDuration={100}>
                <header className={cn(
                    "sticky top-4 z-50 w-fit mx-auto shadow-lg",
                    "bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full px-4 py-2"
                )}>
                    <nav className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/home" className={commonButtonClasses}>
                                    <Logo variant="color" className="h-full w-full p-1.5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                                    Inicio
                                </span>
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
                                <TooltipContent>
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                                      {action.name}
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        ))}
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
                    <AlertDialogCancel>
                        {t('confirmDialog.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleConfirmNavigation}
                    >
                        {t('confirmDialog.continue')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
