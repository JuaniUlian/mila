
"use client";

import React from 'react';
import { Folder, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface File {
    id: string;
    name: string;
}

interface FolderData {
    id: string;
    name: string;
    files: File[];
}

interface FolderGridProps {
    folders: FolderData[];
    selectedFileId: string | null;
    onSelectFile: (id: string | null) => void;
    searchQuery: string;
}

const FileItem: React.FC<{ file: File; isSelected: boolean; onSelect: () => void }> = ({ file, isSelected, onSelect }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "flex items-center justify-between p-3 text-sm transition-all hover:bg-primary/10 rounded-lg cursor-pointer",
            isSelected && "bg-primary/20 ring-2 ring-primary"
        )}
    >
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{file.name}</span>
        </div>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
    </div>
);

export function FolderGrid({ folders, selectedFileId, onSelectFile, searchQuery }: FolderGridProps) {
    if (folders.length === 0) {
        return <p className="text-base text-muted-foreground text-center py-8">No se encontraron archivos o carpetas.</p>
    }

    return (
        <Accordion type="multiple" className="w-full space-y-3">
            {folders.map(folder => (
                <AccordionItem 
                    value={folder.id} 
                    key={folder.id} 
                    className="bg-white rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                >
                    <AccordionTrigger className="p-4 font-semibold w-full flex text-lg hover:no-underline rounded-t-lg">
                        <div className="flex items-center gap-3 flex-1 text-left">
                            <Folder className="h-6 w-6 text-primary" />
                            {folder.name}
                            <span className="text-sm font-normal text-muted-foreground ml-2">({folder.files.length} archivos)</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <div className="space-y-1 border-t pt-3 mt-2">
                            {folder.files.length > 0 ? folder.files.map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    isSelected={selectedFileId === file.id}
                                    onSelect={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                />
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Esta carpeta está vacía.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
