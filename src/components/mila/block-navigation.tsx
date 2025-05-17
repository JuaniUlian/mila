
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
    if (!selectedBlockId) return []; // Start with all categories collapsed if no block is selected
    const selected = blocks.find(b => b.id === selectedBlockId);
    const category = selected?.category || 'General';
    return [category]; // Open the category of the selected block
  }, [blocksByCategory, selectedBlockId, blocks]);

  return (
    <Accordion 
      type="multiple" 
      defaultValue={defaultOpenCategories} 
      className="w-full p-2" // Added padding for sidebar context
      key={selectedBlockId} // Re-render accordion when selectedBlockId changes to apply new defaultValue
    >
      {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
        <AccordionItem value={category} key={category} className="border-b border-sidebar-border last:border-b-0">
          <AccordionTrigger className="text-sm font-medium text-sidebar-foreground/90 hover:no-underline hover:bg-sidebar-accent/80 px-2 py-2.5 data-[state=open]:bg-sidebar-accent/90 rounded-md">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-sidebar-primary"/> <span>{category} ({categoryBlocks.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-1 pl-1 pr-1 bg-sidebar-background"> {/* Changed background to main sidebar bg */}
            <div className="grid grid-cols-1 gap-1 py-1">
              {categoryBlocks.map((block) => (
                <Button
                  key={block.id}
                  variant={selectedBlockId === block.id ? "default" : "ghost"}
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "justify-between items-center w-full h-auto py-1.5 px-2 text-left text-xs rounded-md", 
                    selectedBlockId === block.id 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={`Bloque: ${block.name}\nCategoría: ${block.category}\nCompletitud: ${block.completenessIndex}/${block.maxCompleteness}\nAlertas: ${block.alertLevel !== 'none' ? block.alertLevel.toUpperCase() : 'Ninguna'}`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileText size={14} className={cn("flex-shrink-0", selectedBlockId === block.id ? "text-sidebar-primary-foreground/90" : "text-sidebar-primary" )}/>
                    <span className="truncate font-normal">{block.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <SeverityIndicator level={block.alertLevel} size={3} />
                    <span className={cn("text-xs tabular-nums", 
                      selectedBlockId === block.id ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/60" 
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
