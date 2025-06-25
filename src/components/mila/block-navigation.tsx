
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, FilePlus2, BriefcaseBusiness } from 'lucide-react';
import Link from 'next/link';

interface BlockNavigationProps {
  onGoHome: () => void;
  isHomeActive: boolean;
}

const navItems = [
  {
    name: 'Inicio',
    icon: Home,
    actionType: 'internal' as const,
    href: '#',
  },
  {
    name: 'Nuevo Pliego',
    icon: FilePlus2,
    actionType: 'internal' as const,
    href: '/prepare',
  },
  {
    name: 'PLUS BI',
    icon: BriefcaseBusiness,
    actionType: 'external' as const,
    href: 'https://pluscompol.com',
  },
];

export function BlockNavigation({
  onGoHome,
  isHomeActive,
}: BlockNavigationProps) {
  return (
    <nav className="p-2 space-y-1.5">
      {navItems.map((item) => {
        const isInicio = item.name === 'Inicio';
        const isActive = isInicio && isHomeActive;

        const buttonContent = (
          <>
            <item.icon size={16} className={cn("mr-2.5", isActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/70")} />
            <span className="flex-1 truncate">{item.name}</span>
          </>
        );

        const buttonProps = {
          key: item.name,
          variant: "ghost" as const,
          className: cn(
            "w-full justify-start text-sm font-medium h-9 px-2 rounded-md transition-colors duration-150 ease-in-out",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          ),
          title: item.name,
        };
        
        if (isInicio) {
          return <Button {...buttonProps} onClick={onGoHome}>{buttonContent}</Button>;
        }

        if (item.actionType === 'internal') { // For '/prepare'
          return (
            <Button {...buttonProps} asChild>
              <Link href={item.href}>{buttonContent}</Link>
            </Button>
          );
        }

        // For external links
        return (
          <Button {...buttonProps} asChild>
            <a href={item.href} target="_blank" rel="noopener noreferrer">{buttonContent}</a>
          </Button>
        );
      })}
    </nav>
  );
}
