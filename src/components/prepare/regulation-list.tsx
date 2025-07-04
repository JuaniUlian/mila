
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface Regulation {
    id: string;
    name: string;
    content: string;
}

interface RegulationListProps {
    regulations: Regulation[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onRegulationUpload: (file: File) => void;
}

export function RegulationList({ regulations, selectedIds, onSelectionChange, onRegulationUpload }: RegulationListProps) {
    const { language } = useLanguage();
    const t = useTranslations(language);

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
                      className={cn(
                          "bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm transition-all hover:shadow-md cursor-pointer",
                          selectedIds.includes(regulation.id) && "ring-2 ring-primary"
                      )}
                      onClick={() => handleCheckboxChange(regulation.id)}
                    >
                        <div className="flex items-center gap-4 w-full p-4">
                            <Checkbox
                                id={`checkbox-${regulation.id}`}
                                checked={selectedIds.includes(regulation.id)}
                                onCheckedChange={() => handleCheckboxChange(regulation.id)}
                                className="h-5 w-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={`checkbox-${regulation.id}`} className="font-medium text-left flex-1 cursor-pointer text-foreground text-base">
                                {regulation.name}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4">
                <FileUploadButton
                    variant="outline"
                    className="rounded-lg border-dashed py-3 px-5"
                    onFileSelect={onRegulationUpload}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('preparePage.uploadRegulation')}
                </FileUploadButton>
            </div>
        </div>
    );
}
