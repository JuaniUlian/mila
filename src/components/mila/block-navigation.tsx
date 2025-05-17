
"use client";
import type React from 'react';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { FileText, Layers } from 'lucide-react';
import type { DocumentBlock } from './types';
import { SeverityIndicator } from './severity-indicator';

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

  return (
    <SidebarContent>
      {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
        <SidebarGroup key={category}>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Layers size={16} /> <span>{category}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {categoryBlocks.map((block) => (
              <SidebarMenuItem key={block.id}>
                <SidebarMenuButton
                  onClick={() => onSelectBlock(block.id)}
                  isActive={selectedBlockId === block.id}
                  className="justify-between items-center w-full group/menu-item"
                  tooltip={{
                    content: `${block.name} - ${block.completenessIndex}/${block.maxCompleteness}`,
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
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
