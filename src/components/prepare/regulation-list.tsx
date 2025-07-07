"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface Regulation {
    id: string;
    name: string;
    content: string;
    status?: 'processing' | 'error' | 'success';
    error?: string;
}

interface RegulationListProps {
    regulations: Regulation[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onRegulationUpload: (file: File) => void;
    onDismissError: (regulationId: string) => void;
}

export function RegulationList({ regulations, selectedIds, onSelectionChange, onRegulationUpload, onDismissError }: RegulationListProps) {
    const { language } = useLanguage();
    const t = useTranslations(language);

    const handleCheckboxChange = (regulation: Regulation) => {
        if (regulation.status !== 'success') return; // Don't allow selecting non-successful uploads
        onSelectionChange(
            selectedIds.includes(regulation.id)
                ? selectedIds.filter(id => id !== regulation.id)
                : [...selectedIds, regulation.id]
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <FileUploadButton
                    className="btn-neu-light rounded-xl py-3 px-5"
                    onFileSelect={onRegulationUpload}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('preparePage.uploadRegulation')}
                </FileUploadButton>
            </div>
            <div className="w-full space-y-3">
                {regulations.map(regulation => {
                    if (regulation.status === 'processing') {
                        return (
                            <div key={regulation.id} className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4 flex items-center gap-4">
                                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{regulation.name}</p>
                                    <p className="text-sm text-muted-foreground">{t('preparePage.processingStatus')}</p>
                                </div>
                            </div>
                        )
                    }

                    if (regulation.status === 'error') {
                        return (
                            <div key={regulation.id} className="bg-destructive/10 rounded-xl border border-destructive/20 shadow-sm p-4 flex items-center gap-4">
                                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-destructive">{regulation.name}</p>
                                    <p className="text-sm text-destructive/80">{regulation.error}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => onDismissError(regulation.id)} className="text-xs h-auto p-1 mt-1 text-destructive hover:bg-destructive/20">
                                    {t('preparePage.dismissError')}
                                </Button>
                            </div>
                        )
                    }

                    return (
                        <div 
                          key={regulation.id} 
                          className={cn(
                              "bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm transition-all hover:shadow-md",
                              regulation.status === 'success' ? 'cursor-pointer' : 'cursor-default',
                              selectedIds.includes(regulation.id) && "ring-2 ring-primary"
                          )}
                          onClick={() => handleCheckboxChange(regulation)}
                        >
                            <div className="flex items-center gap-4 w-full p-4">
                                <Checkbox
                                    id={`checkbox-${regulation.id}`}
                                    checked={selectedIds.includes(regulation.id)}
                                    onCheckedChange={() => handleCheckboxChange(regulation)}
                                    className="h-5 w-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    disabled={regulation.status !== 'success'}
                                />
                                <label htmlFor={`checkbox-${regulation.id}`} className={cn("font-medium text-left flex-1 text-foreground text-base", regulation.status === 'success' ? 'cursor-pointer' : 'cursor-default')}>
                                    {regulation.name}
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
