
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilePlus2, Globe, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Separator } from '../ui/separator';

type NavItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
};

export function BlockNavigation({ onSettingsClick }: { onSettingsClick: () => void }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems: NavItem[] = [
    {
      name: t('sidebar.prepare'),
      icon: FilePlus2,
      href: '/prepare',
    },
    {
      name: t('sidebar.settings'),
      icon: Settings,
      onClick: onSettingsClick,
    },
  ];

  const neumorphicClasses = "bg-slate-800 text-slate-200 font-semibold border-transparent shadow-[5px_5px_10px_#1f2937,-5px_-5px_10px_#475569] hover:bg-slate-800 hover:text-slate-100 hover:shadow-[2px_2px_5px_#1f2937,-2px_-2px_5px_#475569] active:shadow-[inset_2px_2px_5px_#1f2937,inset_-2px_-2px_5px_#475569] transition-shadow duration-200 ease-in-out";

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = isClient && item.href ? (item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)) : false;
          const isSpecialButton = item.href === '/prepare' || item.name === t('sidebar.settings');

          const buttonContent = (
            <>
              <item.icon size={20} className={cn("mr-3", isSpecialButton || isActive ? "text-white" : "text-slate-400")} />
              <span className="flex-1 truncate font-medium">{item.name}</span>
            </>
          );

          const buttonProps = {
            variant: "ghost" as const,
            className: cn(
              "w-full justify-start text-base h-12 px-3 rounded-lg",
              isSpecialButton
                ? neumorphicClasses
                : cn(
                    "transition-colors duration-150 ease-in-out",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )
            ),
            title: item.name,
            suppressHydrationWarning: true,
          };
          
          if (item.onClick) {
            return (
              <Button key={item.name} {...buttonProps} onClick={item.onClick}>
                {buttonContent}
              </Button>
            );
          }

          if (item.href) {
            return (
              <Button key={item.name} {...buttonProps} asChild>
                <Link href={item.href}>{buttonContent}</Link>
              </Button>
            );
          }
          
          return null;
        })}
      </nav>

      <div className="mt-auto">
        <Separator className="my-2 bg-white/10" />
        <Button
          variant="ghost"
          className="w-full justify-start text-base h-12 px-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
          asChild
          suppressHydrationWarning
        >
          <a href="https://pluscompol.com" target="_blank" rel="noopener noreferrer">
            <Globe size={20} className="mr-3 text-slate-400" />
            <span className="flex-1 truncate font-medium">{t('sidebar.plusBI')}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
