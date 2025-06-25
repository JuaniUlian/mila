
"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

interface Regulation {
    id: string;
    name: string;
    content: string;
}

interface RegulationListProps {
    regulations: Regulation[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function RegulationList({ regulations, selectedIds, onSelectionChange }: RegulationListProps) {
    
    const handleCheckboxChange = (regulationId: string) => {
        onSelectionChange(
            selectedIds.includes(regulationId)
                ? selectedIds.filter(id => id !== regulationId)
                : [...selectedIds, regulationId]
        );
    };

    return (
        <div className="space-y-4">
            <Accordion type="multiple" className="w-full space-y-2">
                {regulations.map(regulation => (
                    <AccordionItem key={regulation.id} value={regulation.id} className="border rounded-lg bg-background/50 glass-accordion-item">
                        <AccordionTrigger className="p-4 hover:no-underline glass-accordion-trigger">
                            <div className="flex items-center gap-4 w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCheckboxChange(regulation.id); }}>
                                 <Checkbox
                                    id={`checkbox-${regulation.id}`}
                                    checked={selectedIds.includes(regulation.id)}
                                    readOnly
                                />
                                <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer">
                                    {regulation.name}
                                </label>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0 glass-accordion-content">
                            <p className="text-muted-foreground">{regulation.content}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="flex justify-end">
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Subir nueva normativa
                </Button>
            </div>
        </div>
    );
}
