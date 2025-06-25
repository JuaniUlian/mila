"use client";

import React from 'react';
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
            <div className="w-full space-y-3">
                {regulations.map(regulation => (
                    <div key={regulation.id} className="border border-gray-200/80 rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
                        <div className="flex items-center gap-4 w-full p-3 hover:bg-gray-50/50 transition-colors rounded-xl">
                            <Checkbox
                                id={`checkbox-${regulation.id}`}
                                checked={selectedIds.includes(regulation.id)}
                                onCheckedChange={() => handleCheckboxChange(regulation.id)}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer text-gray-800">
                                {regulation.name}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
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
