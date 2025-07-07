
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertTriangle, MoreVertical, PenLine, Trash2 } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Regulation {
    id: string;
    name: string;
    content: string;
    status?: 'processing' | 'error' | 'success';
    error?: string;
    processingTime?: number;
}

interface RegulationListProps {
    regulations: Regulation[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onRegulationUpload: (file: File) => void;
    onDismissError: (regulationId: string) => void;
    onRename: (regulation: Regulation) => void;
    onDelete: (regulation: Regulation) => void;
}

export function RegulationList({ regulations, selectedIds, onSelectionChange, onRegulationUpload, onDismissError, onRename, onDelete }: RegulationListProps) {
    const { language } = useLanguage();
    const t = useTranslations(language);

    const handleToggleSelection = (regulation: Regulation) => {
        if (regulation.status !== 'success') return;
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
                    variant="outline"
                    className="btn-neu-light w-full sm:w-auto"
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
                                     {regulation.processingTime && (
                                        <p className="text-xs text-destructive/80">
                                            {t('preparePage.processedIn').replace('{time}', regulation.processingTime.toString())}
                                        </p>
                                    )}
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
                              "group/regitem bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm transition-all hover:shadow-md",
                              selectedIds.includes(regulation.id) && "bg-primary/10 border-primary/40",
                              regulation.status === 'success' && "cursor-pointer"
                          )}
                          onClick={() => handleToggleSelection(regulation)}
                        >
                            <div className="flex items-center justify-between gap-4 w-full p-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <Checkbox
                                        id={`checkbox-${regulation.id}`}
                                        checked={selectedIds.includes(regulation.id)}
                                        className="h-5 w-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                        disabled={regulation.status !== 'success'}
                                        tabIndex={-1}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("font-medium text-left text-foreground text-base truncate")} title={regulation.name}>
                                            {regulation.name}
                                        </p>
                                        {regulation.processingTime && (
                                            <p className="text-xs text-muted-foreground">
                                                {t('preparePage.processedIn').replace('{time}', regulation.processingTime.toString())}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {regulation.status === 'success' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full flex-shrink-0 opacity-0 group-hover/regitem:opacity-100 focus:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">{t('preparePage.regulationOptions')}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-48">
                                            <DropdownMenuItem onSelect={() => onRename(regulation)}>
                                                <PenLine className="mr-2 h-4 w-4" />
                                                <span>{t('preparePage.rename')}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onSelect={() => onDelete(regulation)}
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>{t('preparePage.delete')}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
