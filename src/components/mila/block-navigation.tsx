
"use client";
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DocumentBlock } from './types';
import { Layers, FileText, ChevronDown, ShieldAlert } from 'lucide-react';

interface BlockNavigationProps {
  blocks: DocumentBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  // onGoHome and isHomeActive are no longer needed as this component reverts to block list
}

export function BlockNavigation({
  blocks,
  selectedBlockId,
  onSelectBlock,
}: BlockNavigationProps) {
  const categories = React.useMemo(() => {
    const grouped: { [key: string]: DocumentBlock[] } = {};
    blocks.forEach(block => {
      if (!grouped[block.category]) {
        grouped[block.category] = [];
      }
      grouped[block.category].push(block);
    });
    return Object.entries(grouped).map(([categoryName, blocksInCategory]) => ({
      name: categoryName,
      blocks: blocksInCategory,
    }));
  }, [blocks]);

  const defaultOpenCategories: string[] = React.useMemo(() => {
    if (!selectedBlockId) return []; // Start with all categories collapsed
    const selectedBlockDetails = blocks.find(b => b.id === selectedBlockId);
    return selectedBlockDetails ? [selectedBlockDetails.category] : [];
  }, [selectedBlockId, blocks]);

  return (
    <nav className="p-3 space-y-1.5">
      <Accordion key={selectedBlockId} type="multiple" defaultValue={defaultOpenCategories} className="w-full space-y-1.5">
        {categories.map((category) => (
          <AccordionItem value={category.name} key={category.name} className="border-none">
            <AccordionTrigger
              className={cn(
                "w-full flex items-center justify-between p-2.5 text-xs font-medium rounded-md hover:no-underline transition-colors duration-150 ease-in-out group",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-sidebar-foreground/80 group-data-[state=open]:text-sidebar-accent-foreground" />
                <span>{category.name} ({category.blocks.length})</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-sidebar-accent-foreground" />
            </AccordionTrigger>
            <AccordionContent className="pt-1.5 pb-0 space-y-1 bg-transparent pl-3 pr-1">
              {category.blocks.map((block) => {
                const blockRiskPercentage = 100 - ((block.completenessIndex / block.maxCompleteness) * 100);
                let riskColorClass = 'text-[rgb(var(--custom-severity-low-fg-rgb))]'; 
                if (blockRiskPercentage > 50) {
                    riskColorClass = 'text-[rgb(var(--custom-severity-high-fg-rgb))]';
                } else if (blockRiskPercentage >= 25) {
                    riskColorClass = 'text-[rgb(var(--custom-severity-medium-fg-rgb))]';
                }

                return (
                  <Button
                    key={block.id}
                    variant="ghost"
                    onClick={() => onSelectBlock(block.id)}
                    className={cn(
                      "w-full justify-start text-xs font-normal h-auto py-1.5 px-2.5 rounded-md transition-colors duration-150 ease-in-out",
                      selectedBlockId === block.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={`Bloque: ${block.name}\nRiesgo: ${blockRiskPercentage.toFixed(0)}%\nAlertas: ${block.alerts.length}`}
                  >
                    <FileText size={14} className={cn("mr-2", selectedBlockId === block.id ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/70")} />
                    <span className="flex-1 truncate">{block.name}</span>
                    <span className={cn("text-xs ml-auto font-medium", selectedBlockId === block.id ? "text-sidebar-primary-foreground/90" : riskColorClass)}>
                       {blockRiskPercentage.toFixed(0)}%
                    </span>
                  </Button>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </nav>
  );
}
