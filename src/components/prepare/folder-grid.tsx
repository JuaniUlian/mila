
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        className={cn(
            "flex items-center justify-between p-2.5 text-sm transition-all bg-secondary/50 hover:bg-secondary rounded-lg",
            isSelected && "ring-2 ring-primary bg-blue-100/50" 
        )}
    >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{file.name}</span>
        </div>
        <Button 
            variant={isSelected ? "default" : "secondary"}
            className={cn(
                "ml-2 text-xs h-7 px-2.5",
                !isSelected && "bg-background hover:bg-background/80"
            )}
            size="sm" 
            onClick={onSelect}
         >
            {isSelected ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : null}
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
        </Button>
    </div>
);

const ExpandedFolderView: React.FC<Omit<FolderGridProps, 'searchQuery' | 'folders'> & { folder: FolderData }> = ({ folder, selectedFileId, onSelectFile }) => (
     <Card className="flex flex-col col-span-full">
        <CardHeader className="py-3 px-4">
            <CardTitle className="text-base font-semibold text-foreground">{folder.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
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
        </CardContent>
    </Card>
);

export function FolderGrid({ folders, selectedFileId, onSelectFile, searchQuery }: FolderGridProps) {
    const isSearching = !!searchQuery;

    if (folders.length === 0 && isSearching) {
        return <p className="text-sm text-muted-foreground text-center py-4">No se encontraron archivos con ese nombre.</p>
    }
    
    if (isSearching) {
        return (
            <div className="grid grid-cols-1 gap-4">
                {folders.map(folder => (
                    <ExpandedFolderView key={folder.id} folder={folder} selectedFileId={selectedFileId} onSelectFile={onSelectFile} />
                ))}
            </div>
        )
    }

    // Default view: Grid of expandable folder icons
    return (
        <Accordion type="single" collapsible className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map(folder => (
                <AccordionItem 
                    value={folder.id} 
                    key={folder.id} 
                    className="border-none bg-card rounded-lg shadow-md transition-shadow hover:shadow-xl focus-within:ring-2 focus-within:ring-primary"
                >
                    <AccordionTrigger className="p-0 hover:no-underline rounded-t-lg w-full h-full flex flex-col justify-center items-center cursor-pointer data-[state=open]:bg-secondary/50">
                        <div className="flex flex-col items-center justify-center p-4 text-foreground">
                             <Folder className="h-12 w-12 text-primary mb-2" />
                             <span className="font-semibold text-center text-sm">{folder.name}</span>
                             <span className="text-xs text-muted-foreground">{folder.files.length} archivos</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 bg-transparent rounded-b-lg border-t">
                        <div className="space-y-2">
                             {folder.files.length > 0 ? folder.files.map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    isSelected={selectedFileId === file.id}
                                    onSelect={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                />
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-2">Carpeta vacía.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
