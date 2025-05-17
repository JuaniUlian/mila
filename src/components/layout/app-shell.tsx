
"use client"
import type React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  // SidebarContent, // Replaced by specific Mila BlockNavigation
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Settings, LayoutDashboard } from 'lucide-react';
import { BlockNavigation } from '@/components/mila/block-navigation'; // Import new component
import type { DocumentBlock } from '@/components/mila/types'; // Import types
import { Logo } from './logo'; // Import the new Logo component

interface AppShellProps {
  children: React.ReactNode;
  blocks: DocumentBlock[]; // Pass blocks for navigation
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

export function AppShell({ children, blocks, selectedBlockId, onSelectBlock }: AppShellProps) {
  return (
    // defaultOpen can be controlled by user preference later
    <SidebarProvider defaultOpen={true}> 
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Logo /> {/* Use the Logo component here */}
            <h1 className="text-xl font-semibold text-sidebar-foreground">Mila</h1>
          </div>
          <p className="text-xs text-sidebar-foreground/80">Plantilla Viva</p>
        </SidebarHeader>
        
        {/* Replace existing SidebarContent with BlockNavigation */}
        <BlockNavigation 
          blocks={blocks} 
          selectedBlockId={selectedBlockId} 
          onSelectBlock={onSelectBlock} 
        />

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Dashboard (Próximamente)">
                <LayoutDashboard />
                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
              </SidebarMenuButton>
               <div className="px-4 py-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                (Próximamente)
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Configuración (Próximamente)">
                <Settings />
                <span className="group-data-[collapsible=icon]:hidden">Configuración</span>
              </SidebarMenuButton>
              <div className="px-4 py-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                (Próximamente)
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
