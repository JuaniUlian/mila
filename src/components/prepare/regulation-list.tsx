
"use client";

import React, { useState, useEffect } from 'react';
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
    estimatedTime?: number;
}

interface RegulationItemProps {
    regulation: Regulation;
    isSelected: boolean;
    onToggleSelection: () => void;
    onRename: (regulation: Regulation) => void;
    onDelete: (regulation: Regulation) => void;
    onDismissError: (regulationId: string) => void;
}

const RegulationItem: React.FC<RegulationItemProps> = ({ regulation, isSelected, onToggleSelection, onRename, onDelete, onDismissError }) => {
    const { language } = useLanguage();
    const t = useTranslations(language);
    const [countdown, setCountdown] = useState(regulation.estimatedTime ? Math.round(regulation.estimatedTime) : 0);

    useEffect(() => {
        if (regulation.status === 'processing' && regulation.estimatedTime) {
            setCountdown(Math.round(regulation.estimatedTime));
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0; // Hold at 0
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [regulation.status, regulation.estimatedTime]);

    if (regulation.status === 'processing') {
        return (
            <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm p-4 flex items-center gap-4">
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-medium text-foreground">{regulation.name}</p>
                    <p className="text-sm text-muted-foreground">{t('preparePage.processingStatus')}... {countdown > 0 ? `~${countdown}s restantes` : ''}</p>
                </div>
            </div>
        );
    }

    if (regulation.status === 'error') {
        return (
            <div className="bg-destructive/10 rounded-xl border border-destructive/20 shadow-sm p-4 flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-medium text-destructive">{regulation.name}</p>
                    <p className="text-sm text-destructive/80">{regulation.error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDismissError(regulation.id)} className="text-xs h-auto p-1 mt-1 text-destructive hover:bg-destructive/20">
                    {t('preparePage.dismissError')}
                </Button>
            </div>
        );
    }
    
    return (
        <div
          className={cn(
              "group/regitem bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm transition-all hover:shadow-md",
              isSelected && "bg-primary/10 border-primary/40",
              regulation.status === 'success' && "cursor-pointer"
          )}
          onClick={onToggleSelection}
        >
            <div className="flex items-center justify-between gap-4 w-full p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Checkbox
                        id={`checkbox-${regulation.id}`}
                        checked={isSelected}
                        className="h-5 w-5 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                        disabled={regulation.status !== 'success'}
                        tabIndex={-1}
                    />
                    <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-left text-foreground text-base truncate")} title={regulation.name}>
                            {regulation.name}
                        </p>
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
};


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
                {regulations.map(regulation => (
                   <RegulationItem 
                    key={regulation.id}
                    regulation={regulation}
                    isSelected={selectedIds.includes(regulation.id)}
                    onToggleSelection={() => handleToggleSelection(regulation)}
                    onRename={onRename}
                    onDelete={onDelete}
                    onDismissError={onDismissError}
                   />
                ))}
            </div>
        </div>
    );
}

    