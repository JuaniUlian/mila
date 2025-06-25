"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { Button } from '@/components/ui/button';

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
            <Accordion type="multiple" className="w-full space-y-3">
                {regulations.map(regulation => (
                    <AccordionItem key={regulation.id} value={regulation.id} className="border border-gray-200/80 rounded-xl bg-white shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                        <div className="flex items-center gap-4 w-full p-3 hover:bg-gray-50/50 transition-colors">
                            <Checkbox
                                id={`checkbox-${regulation.id}`}
                                checked={selectedIds.includes(regulation.id)}
                                onCheckedChange={() => handleCheckboxChange(regulation.id)}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <AccordionTrigger className="p-0 hover:no-underline flex-1 w-full justify-between">
                                <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer text-gray-800">
                                    {regulation.name}
                                </label>
                            </AccordionTrigger>
                        </div>
                        <AccordionContent className="p-4 pt-2 border-t border-gray-200 bg-slate-50/70">
                            <p className="text-sm text-gray-700">{regulation.content}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="flex justify-end">
                <FileUploadButton
                    variant="outline"
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-800"
                    onFileSelect={onRegulationUpload}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Subir nueva normativa
                </FileUploadButton>
            </div>
        </div>
    );
}
