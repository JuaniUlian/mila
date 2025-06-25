
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { Button } from '../ui/button';

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
            <div className="w-full space-y-3">
                {regulations.map(regulation => (
                    <div 
                      key={regulation.id} 
                      className="border rounded-lg bg-card transition-shadow hover:shadow-lg"
                      onClick={() => handleCheckboxChange(regulation.id)}
                    >
                        <div className="flex items-center gap-4 w-full p-4 cursor-pointer">
                            <Checkbox
                                id={`checkbox-${regulation.id}`}
                                checked={selectedIds.includes(regulation.id)}
                                onCheckedChange={() => handleCheckboxChange(regulation.id)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer text-foreground">
                                {regulation.name}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-2">
                <FileUploadButton
                    variant="outline"
                    onFileSelect={onRegulationUpload}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Subir nueva normativa
                </FileUploadButton>
            </div>
        </div>
    );
}
