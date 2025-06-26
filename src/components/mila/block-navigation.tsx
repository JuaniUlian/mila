
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilePlus2, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

export function BlockNavigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const navItems = [
    {
      name: t('sidebar.prepare'),
      icon: FilePlus2,
      href: '/',
    },
    {
      name: t('sidebar.plusBI'),
      icon: Globe,
      href: 'https://pluscompol.com',
      external: true,
    },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

        const buttonContent = (
          <>
            <item.icon size={20} className={cn("mr-3", isActive ? "text-white" : "text-slate-400")} />
            <span className="flex-1 truncate font-medium">{item.name}</span>
          </>
        );

        const buttonProps = {
          variant: "ghost" as const,
          className: cn(
            "w-full justify-start text-base h-12 px-3 rounded-lg transition-colors duration-150 ease-in-out",
            isActive
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          ),
          title: item.name,
        };
        
        if (item.external) {
           return (
             <Button key={item.name} {...buttonProps} asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">{buttonContent}</a>
            </Button>
          );
        }

        return (
          <Button key={item.name} {...buttonProps} asChild>
            <Link href={item.href}>{buttonContent}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
