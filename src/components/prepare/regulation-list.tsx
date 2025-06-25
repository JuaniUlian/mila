
"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';

interface Regulation {
    id: string;
    name: string;
    content: string;
}

interface RegulationListProps {
    regulations: Regulation[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onRegulationUpload: (fileName: string) => void;
}

export function RegulationList({ regulations, selectedIds, onSelectionChange, onRegulationUpload }: RegulationListProps) {
    
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
                    <AccordionItem key={regulation.id} value={regulation.id} className="border rounded-lg bg-white/40 border-gray-200/80">
                        <AccordionTrigger className="p-4 hover:no-underline hover:bg-gray-100/50 rounded-t-lg">
                            <div className="flex items-center gap-4 w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCheckboxChange(regulation.id); }}>
                                 <Checkbox
                                    id={`checkbox-${regulation.id}`}
                                    checked={selectedIds.includes(regulation.id)}
                                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    readOnly
                                />
                                <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer text-gray-800">
                                    {regulation.name}
                                </label>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-2 border-t border-gray-200/80">
                            <p className="text-gray-600">{regulation.content}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="flex justify-end">
                <FileUploadButton
                    variant="outline"
                    className="bg-white/50 hover:bg-white/80 border-gray-300"
                    onFileSelect={onRegulationUpload}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Subir nueva normativa
                </FileUploadButton>
            </div>
        </div>
    );
}
