'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus2, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { SettingsDialog } from './settings-dialog';
import { LanguageSwitcher } from './language-switcher';

export function MainHeader() {
    const pathname = usePathname();
    const { language } = useLanguage();
    const t = useTranslations(language);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    
    const navItems = [
        {
            name: t('sidebar.prepare'),
            icon: FilePlus2,
            href: '/prepare',
        },
    ];

    return (
        <>
            <header className="bg-slate-50/60 backdrop-blur-lg sticky top-4 z-50 mx-4 mt-4 rounded-2xl border border-slate-200/50 shadow-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-10 w-auto">
                              <defs>
                                <linearGradient id="gradBorderHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0D2B3E"/>
                                  <stop offset="100%" stopColor="#DA623C"/>
                                </linearGradient>
                              </defs>
                              <rect x="32" y="32" width="448" height="448" rx="64" ry="64"
                                    fill="none" stroke="url(#gradBorderHeader)" strokeWidth="32"/>
                              <text x="176" y="240"
                                    fontFamily="Nunito, sans-serif"
                                    fontSize="160"
                                    fontWeight="600"
                                    fill="#0D2B3E"
                                    textAnchor="middle">M</text>
                                <text x="156" y="380"
                                    fontFamily="Nunito, sans-serif"
                                    fontSize="160"
                                    fontWeight="600"
                                    fill="#0D2B3E"
                                    textAnchor="middle">L</text>
                              <text x="336" y="240"
                                    fontFamily="Nunito, sans-serif"
                                    fontSize="160"
                                    fontWeight="600"
                                    fill="#DA623C"
                                    textAnchor="middle">I</text>
                                <text x="336" y="380"
                                    fontFamily="Nunito, sans-serif"
                                    fontSize="160"
                                    fontWeight="600"
                                    fill="#DA623C"
                                    textAnchor="middle">A</text>
                            </svg>
                           <span className="font-bold text-xl text-foreground hidden sm:inline">MILA</span>
                        </Link>
                    </div>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        {navItems.map((item) => {
                             const isActive = item.href ? pathname.startsWith(item.href) : false;
                             return (
                                <Button key={item.name} asChild variant={isActive ? "secondary" : "ghost"} className="rounded-lg">
                                    <Link href={item.href!}>
                                        <item.icon className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">{item.name}</span>
                                    </Link>
                                </Button>
                             )
                        })}

                        <Button variant="ghost" onClick={() => setIsSettingsModalOpen(true)} className="rounded-lg">
                            <Settings className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">{t('sidebar.settings')}</span>
                        </Button>

                        <LanguageSwitcher variant="light" />
                        
                        <Button variant="ghost" className="rounded-lg" asChild>
                          <a href="https://pluscompol.com" target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">{t('sidebar.plusBI')}</span>
                          </a>
                        </Button>
                    </nav>
                </div>
            </header>
            <SettingsDialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
        </>
    );
}
