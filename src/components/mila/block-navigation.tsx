
"use client";
import React from 'react';
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
import { Button } from '@/components/ui/button';

interface BlockNavigationProps {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

export function BlockNavigation({ blocks, selectedBlockId, onSelectBlock }: BlockNavigationProps) {
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
  }, [selectedBlockId, blocks]); // Simplified dependencies as blocksByCategory isn't directly used here

  return (
    <Accordion 
      type="multiple" 
      defaultValue={defaultOpenCategories} 
      className="w-full p-2 space-y-1" // Added space-y-1 for slight separation between categories
      key={selectedBlockId} // Force re-render on selection change to update defaultOpenCategories
    >
      {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
        <AccordionItem value={category} key={category} className="border-b border-sidebar-border last:border-b-0 rounded-md overflow-hidden">
          <AccordionTrigger className="text-sm font-medium text-sidebar-foreground/90 hover:no-underline hover:bg-sidebar-accent/80 px-3 py-2.5 data-[state=open]:bg-sidebar-accent/90 rounded-t-md data-[state=open]:text-sidebar-accent-foreground transition-colors duration-150 ease-in-out">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-sidebar-primary"/> <span>{category} ({categoryBlocks.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2 px-1.5 bg-sidebar-background/70 rounded-b-md">
            <div className="grid grid-cols-1 gap-1 py-1">
              {categoryBlocks.map((block) => (
                <Button
                  key={block.id}
                  variant="ghost" // Default to ghost, selected state will override
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "justify-between items-center w-full h-auto py-2 px-2.5 text-left text-xs rounded-md font-normal", 
                    selectedBlockId === block.id 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={`Bloque: ${block.name}\nCategoría: ${block.category}\nCompletitud: ${block.completenessIndex}/${block.maxCompleteness}\nAlertas: ${block.alertLevel !== 'none' ? block.alertLevel.toUpperCase() : 'Ninguna'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={15} className={cn("flex-shrink-0", selectedBlockId === block.id ? "text-sidebar-primary-foreground/90" : "text-sidebar-primary" )}/>
                    <span className="truncate">{block.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <SeverityIndicator level={block.alertLevel} size={3} />
                    <span className={cn("text-xs tabular-nums font-medium", 
                      selectedBlockId === block.id ? "text-sidebar-primary-foreground/90" : "text-sidebar-foreground/70" 
                    )}>
                      {block.completenessIndex}/{block.maxCompleteness}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

