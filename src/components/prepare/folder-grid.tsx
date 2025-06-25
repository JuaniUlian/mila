
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
            "flex items-center justify-between p-2 text-sm transition-all bg-slate-200/40 hover:bg-slate-200/60 rounded-lg border",
            isSelected 
                ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-100/50" 
                : "border-slate-300/30"
        )}
    >
        <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 text-gray-700 flex-shrink-0" />
            <span className="font-medium text-gray-900 truncate">{file.name}</span>
        </div>
        <Button 
            variant={isSelected ? "default" : "secondary"}
            className={cn(
                "ml-2 text-xs h-7 px-2.5",
                isSelected 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-white/70 hover:bg-white border border-slate-300/70 text-gray-800"
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
     <Card className="bg-slate-50/50 backdrop-blur-xl shadow-lg border border-white/20 rounded-xl flex flex-col col-span-full">
        <CardHeader className="py-3 px-4">
            <CardTitle className="text-base font-semibold text-gray-800">{folder.name}</CardTitle>
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
                <p className="text-sm text-gray-500 text-center py-4">Esta carpeta está vacía.</p>
            )}
        </CardContent>
    </Card>
);

export function FolderGrid({ folders, selectedFileId, onSelectFile, searchQuery }: FolderGridProps) {
    const isSearching = !!searchQuery;

    if (folders.length === 0 && isSearching) {
        return <p className="text-sm text-gray-500 text-center py-4">No se encontraron archivos con ese nombre.</p>
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
                    className="border-none rounded-xl bg-slate-50/50 backdrop-blur-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-400 border border-white/20"
                >
                    <AccordionTrigger className="p-0 hover:no-underline rounded-t-xl w-full h-full flex flex-col justify-center items-center cursor-pointer data-[state=open]:bg-slate-100/20">
                        <div className="flex flex-col items-center justify-center p-4 text-gray-800">
                             <Folder className="h-12 w-12 text-blue-600 mb-2" />
                             <span className="font-semibold text-center text-sm">{folder.name}</span>
                             <span className="text-xs text-gray-500">{folder.files.length} archivos</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 bg-transparent rounded-b-xl border-t border-white/20">
                        <div className="space-y-2">
                             {folder.files.length > 0 ? folder.files.map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    isSelected={selectedFileId === file.id}
                                    onSelect={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                />
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-2">Carpeta vacía.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
