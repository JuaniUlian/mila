
"use client";

import React from 'react';
import { Folder, FileText, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploadButton } from './file-upload-button';

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
    onFileUploadToFolder: (folderId: string, fileName: string) => void;
}

const FileItem: React.FC<{ file: File; isSelected: boolean; onSelect: () => void }> = ({ file, isSelected, onSelect }) => (
    <div 
        onClick={onSelect}
        className={cn(
            "flex items-center justify-between p-2 text-sm transition-all hover:bg-primary/10 rounded-lg cursor-pointer border border-transparent",
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

export function FolderGrid({ folders, selectedFileId, onSelectFile, searchQuery, onFileUploadToFolder }: FolderGridProps) {
    if (folders.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-100/50 rounded-lg">
                <p className="text-base text-muted-foreground">
                    {searchQuery ? 'No se encontraron archivos que coincidan con su búsqueda.' : 'No hay carpetas o archivos.'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {folders.map(folder => (
                <Card 
                    key={folder.id} 
                    className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg transition-shadow hover:shadow-xl flex flex-col rounded-2xl"
                >
                    <CardHeader className='pb-3 flex flex-row items-start justify-between'>
                        <div className='flex-1'>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Folder className="h-6 w-6 text-primary" />
                                {folder.name}
                            </CardTitle>
                            <CardDescription>{folder.files.length} {folder.files.length === 1 ? 'archivo' : 'archivos'}</CardDescription>
                        </div>
                        <FileUploadButton
                            onFileSelect={(fileName) => onFileUploadToFolder(folder.id, fileName)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full flex-shrink-0"
                            title={`Añadir archivo a ${folder.name}`}
                        >
                            <Plus className="h-5 w-5" />
                            <span className="sr-only">Añadir archivo</span>
                        </FileUploadButton>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-1 p-3">
                        {folder.files.length > 0 ? (
                            folder.files.map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    isSelected={selectedFileId === file.id}
                                    onSelect={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                />
                            ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">Esta carpeta está vacía.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
