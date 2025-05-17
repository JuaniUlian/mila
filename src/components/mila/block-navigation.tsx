
"use client";
import React from 'react';
// Removed Sidebar specific imports as this is now part of main content
// import {
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
// } from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports
import { FileText, Layers, ListChecks } from 'lucide-react';
import type { DocumentBlock } from './types';
import { SeverityIndicator } from './severity-indicator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // For styling block items

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
    // Open all categories by default in this new layout, or just the first one.
    // Let's open all for now, can be adjusted.
    return Object.keys(blocksByCategory);
    // if (!selectedBlockId) return [];
    // const selected = blocks.find(b => b.id === selectedBlockId);
    // const category = selected?.category || 'General';
    // return [category];
  }, [blocksByCategory]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Navegación por Bloques del Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0"> {/* Remove padding from CardContent to allow Accordion to fill */}
        <Accordion 
          type="multiple" 
          defaultValue={defaultOpenCategories} 
          className="w-full"
        >
          {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => (
            <AccordionItem value={category} key={category} className="border-b last:border-b-0">
              <AccordionTrigger className="text-base font-medium text-foreground/80 hover:no-underline hover:bg-muted/50 px-4 py-3 data-[state=open]:bg-muted/60">
                <div className="flex items-center gap-2">
                  <Layers size={18} /> <span>{category} ({categoryBlocks.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-2 px-2 bg-muted/20"> {/* Added some padding inside content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                  {categoryBlocks.map((block) => (
                    <Button
                      key={block.id}
                      variant={selectedBlockId === block.id ? "default" : "outline"}
                      onClick={() => onSelectBlock(block.id)}
                      className={cn(
                        "justify-between items-center w-full h-auto py-2 px-3 text-left",
                        selectedBlockId === block.id 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-card hover:bg-accent/70 hover:text-accent-foreground"
                      )}
                      // No complex tooltip needed here as it's in main view
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="flex-shrink-0" />
                        <span className="truncate font-normal">{block.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <SeverityIndicator level={block.alertLevel} size={4} />
                        <span className={cn("text-xs", selectedBlockId === block.id ? "text-primary-foreground/80" : "text-muted-foreground" )}>
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
      </CardContent>
    </Card>
  );
}
