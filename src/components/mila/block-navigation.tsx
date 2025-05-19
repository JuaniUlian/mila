
"use client";
import React from 'react';
import { Home, FilePlus2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BlockNavigationProps {
  onGoHome: () => void;
  isHomeActive: boolean;
}

export function BlockNavigation({ onGoHome, isHomeActive }: BlockNavigationProps) {
  const navItems = [
    {
      label: "Inicio",
      icon: Home,
      action: onGoHome,
      isActive: isHomeActive,
      isExternal: false,
    },
    {
      label: "Nuevo Pliego",
      icon: FilePlus2,
      href: "https://plusbi.docufy.ar",
      isExternal: true,
    },
    {
      label: "PLUS BI",
      icon: Briefcase,
      href: "https://pluscompol.com",
      isExternal: true,
    },
  ];

  return (
    <nav className="p-3 space-y-1.5"> {/* Reduced space-y */}
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          onClick={item.action}
          className={cn(
            "w-full justify-start text-sm font-medium transition-colors duration-150 ease-in-out rounded-lg h-10 px-3 py-2", // Added rounded-lg and specific padding/height
            item.isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          asChild={item.isExternal}
        >
          {item.isExternal ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </a>
          ) : (
            <>
              <item.icon size={18} className="mr-3" />
              {item.label}
            </>
          )}
        </Button>
      ))}
    </nav>
  );
}
