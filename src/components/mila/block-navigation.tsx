
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, FilePlus2, BriefcaseBusiness } from 'lucide-react';

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
    actionType: 'external' as const,
    href: 'https://plusbi.docufy.ar',
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
    <nav className="p-2 space-y-1.5"> {/* Changed p-3 to p-2 */}
      {navItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={item.actionType === 'internal' ? onGoHome : undefined}
          asChild={item.actionType === 'external'}
          className={cn(
            "w-full justify-start text-sm font-medium h-9 px-2 rounded-md transition-colors duration-150 ease-in-out", // Changed px-3 to px-2
            item.name === 'Inicio' && isHomeActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          title={item.name}
        >
          {item.actionType === 'external' ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
              <item.icon size={16} className={cn("mr-2.5", item.name === 'Inicio' && isHomeActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/70")} />
              <span className="flex-1 truncate">{item.name}</span>
            </a>
          ) : (
            <>
              <item.icon size={16} className={cn("mr-2.5", item.name === 'Inicio' && isHomeActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/70")} />
              <span className="flex-1 truncate">{item.name}</span>
            </>
          )}
        </Button>
      ))}
    </nav>
  );
}
