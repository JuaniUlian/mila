
"use client";
import React from 'react'; // Added this line
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Layers } from 'lucide-react';
import type { DocumentBlock } from './types';
import { SeverityIndicator } from './severity-indicator';
import { cn } from '@/lib/utils';

interface BlockNavigationProps {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

export function BlockNavigation({ blocks, selectedBlockId, onSelectBlock }: BlockNavigationProps) {
  // Group blocks by category
  const blocksByCategory: Record<string, DocumentBlock[]> = blocks.reduce((acc, block) => {
    const category = block.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(block);
    return acc;
  }, {} as Record<string, DocumentBlock[]>);

  const defaultOpenCategories = React.useMemo(() => {
    if (!selectedBlockId) return [];
    const selected = blocks.find(b => b.id === selectedBlockId);
    const category = selected?.category || 'General';
    return [category];
  }, [selectedBlockId, blocks]);

  return (
    <SidebarContent className="p-0">
      <Accordion 
        type="multiple" 
        defaultValue={defaultOpenCategories} 
        className="w-full"
      >
        {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
          <AccordionItem value={category} key={category} className="border-b-0 group/sidebar-group">
            <AccordionTrigger className="text-sm font-medium text-sidebar-foreground/70 hover:no-underline hover:bg-sidebar-accent/50 px-4 py-3 data-[state=open]:bg-sidebar-accent/60">
              <div className="flex items-center gap-2">
                <Layers size={16} /> <span>{category} ({categoryBlocks.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <SidebarMenu className="pl-2 pr-1 pt-1 pb-2"> 
                {categoryBlocks.map((block) => (
                  <SidebarMenuItem key={block.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectBlock(block.id)}
                      isActive={selectedBlockId === block.id}
                      className="justify-between items-center w-full group/menu-item"
                      tooltip={{
                        content: (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{block.name}</span>
                            <span className="text-xs">Completitud: {block.completenessIndex}/{block.maxCompleteness}</span>
                            <span className="text-xs">Alertas: {block.alerts.length}</span>
                          </div>
                        ),
                        side: "right",
                        align: "center",
                      }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="flex-shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{block.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 group-data-[collapsible=icon]:hidden">
                        <SeverityIndicator level={block.alertLevel} size={4} />
                        <span className="text-xs text-sidebar-foreground/70">
                          {block.completenessIndex}/{block.maxCompleteness}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SidebarContent>
  );
}
