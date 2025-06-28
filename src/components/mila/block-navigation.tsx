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
import { useLayout } from '@/context/LayoutContext';

type NavItem = {
  name: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
};

const getNeumorphicClasses = (score: number | null): string => {
    const base = "font-semibold border-transparent transition-all duration-200 ease-in-out";
    
    let colors = {
        bg: "bg-slate-800",
        text: "text-slate-200",
        hoverText: "hover:text-slate-100",
        shadow: "shadow-[4px_4px_8px_#1e293b,-4px_-4px_8px_#475569]",
        hoverShadow: "hover:shadow-[2px_2px_4px_#1e293b,-2px_-2px_4px_#475569]",
        activeShadow: "active:shadow-[inset_2px_2px_4px_#1e293b,inset_-2px_-2px_4px_#475569]",
    };

    if (score !== null) {
        if (score >= 95) { // Slate for 95-100
            // It uses the default, so no change needed here.
        } else if (score >= 85) { // Blue
             colors = {
                ...colors,
                bg: "bg-blue-800",
                text: "text-blue-100",
                shadow: "shadow-[4px_4px_8px_#172554,-4px_-4px_8px_#1d4ed8]",
                hoverShadow: "hover:shadow-[2px_2px_4px_#172554,-2px_-2px_4px_#1d4ed8]",
                activeShadow: "active:shadow-[inset_2px_2px_4px_#172554,inset_-2px_-2px_4px_#1d4ed8]",
            };
        } else if (score >= 75) { // Lime
            colors = {
                ...colors,
                bg: "bg-lime-800",
                text: "text-lime-100",
                shadow: "shadow-[4px_4px_8px_#1a2e05,-4px_-4px_8px_#4d7c0f]",
                hoverShadow: "hover:shadow-[2px_2px_4px_#1a2e05,-2px_-2px_4px_#4d7c0f]",
                activeShadow: "active:shadow-[inset_2px_2px_4px_#1a2e05,inset_-2px_-2px_4px_#4d7c0f]",
            };
        } else if (score >= 60) { // Amber
            colors = {
                ...colors,
                bg: "bg-amber-800",
                text: "text-amber-100",
                shadow: "shadow-[4px_4px_8px_#451a03,-4px_-4px_8px_#b45309]",
                hoverShadow: "hover:shadow-[2px_2px_4px_#451a03,-2px_-2px_4px_#b45309]",
                activeShadow: "active:shadow-[inset_2px_2px_4px_#451a03,inset_-2px_-2px_4px_#b45309]",
            };
        } else if (score >= 40) { // Orange
            colors = {
                ...colors,
                bg: "bg-orange-800",
                text: "text-orange-100",
                shadow: "shadow-[4px_4px_8px_#431407,-4px_-4px_8px_#c2410c]",
                hoverShadow: "hover:shadow-[2px_2px_4px_#431407,-2px_-2px_4px_#c2410c]",
                activeShadow: "active:shadow-[inset_2px_2px_4px_#431407,inset_-2px_-2px_4px_#c2410c]",
            };
        } else { // < 40 Rose
            colors = {
                ...colors,
                bg: "bg-rose-800",
                text: "text-rose-100",
                shadow: "shadow-[4px_4px_8px_#4c0519,-4px_-4px_8px_#be123c]",
                hoverShadow: "hover:shadow-[2px_2px_4px_#4c0519,-2px_-2px_4px_#be123c]",
                activeShadow: "active:shadow-[inset_2px_2px_4px_#4c0519,inset_-2px_-2px_4px_#be123c]",
            };
        }
    }
    
    const hoverBg = `hover:${colors.bg}`;

    return `${base} ${colors.bg} ${colors.text} ${hoverBg} ${colors.hoverText} ${colors.shadow} ${colors.hoverShadow} ${colors.activeShadow}`;
};


export function BlockNavigation({ onSettingsClick }: { onSettingsClick: () => void }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [isClient, setIsClient] = useState(false);
  const { score } = useLayout();

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

  const neumorphicClasses = getNeumorphicClasses(score);

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-4">
        {navItems.map((item) => {
          const isActive = isClient && item.href ? (item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)) : false;
          const isSpecialButton = item.name === t('sidebar.prepare') || item.name === t('sidebar.settings');

          const buttonContent = (
            <>
              <item.icon size={20} className={cn("mr-3", isClient && (isSpecialButton || isActive) ? "text-white" : "text-slate-400")} />
              <span className="truncate font-medium">{item.name}</span>
            </>
          );

          const buttonProps = {
            variant: "ghost" as const,
            className: cn(
              "w-full text-base h-12 px-3 rounded-lg justify-center",
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
          className="w-full text-base h-12 px-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white justify-center"
          asChild
          suppressHydrationWarning
        >
          <a href="https://pluscompol.com" target="_blank" rel="noopener noreferrer">
            <Globe size={20} className="mr-3 text-slate-400" />
            <span className="truncate font-medium">{t('sidebar.plusBI')}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
