
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, FileText, MoreVertical, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploadButton } from './file-upload-button';

interface File {
    id: string;
    name: string;
}

interface FolderData {
    id: string;
    name: string;
    fileCount: number;
    files: File[];
}

interface FolderGridProps {
    folders: FolderData[];
    selectedFileId: string | null;
    onSelectFile: (id: string | null) => void;
    onFileUpload: (folderId: string, fileName: string) => void;
    searchQuery: string;
}

export function FolderGrid({ folders, selectedFileId, onSelectFile, onFileUpload, searchQuery }: FolderGridProps) {
    const isSearching = !!searchQuery;

    if (folders.length === 0 && isSearching) {
        return <p className="text-sm text-gray-500 text-center py-4">No se encontraron archivos con ese nombre.</p>
    }

    // When searching, we use a single column list for better readability of filtered results.
    const gridClasses = isSearching 
        ? "grid grid-cols-1 gap-4"
        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";

    return (
        <div className={gridClasses}>
            {folders.map(folder => (
                <Card key={folder.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b">
                        <div className="flex items-center gap-3 min-w-0">
                            <Folder className="h-6 w-6 text-blue-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <CardTitle className="text-base font-semibold truncate">{folder.name}</CardTitle>
                                <CardDescription>{folder.fileCount} archivos</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                             <FileUploadButton
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-600 hover:bg-gray-200/50"
                                onClick={(e) => e.stopPropagation()}
                                onFileSelect={(fileName) => onFileUpload(folder.id, fileName)}
                            >
                                <Plus className="h-4 w-4" />
                            </FileUploadButton>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-200/50" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2 p-4">
                        {folder.files.length > 0 ? folder.files.map(file => (
                            <div 
                                key={file.id} 
                                className={cn(
                                    "flex items-center justify-between p-2 text-sm transition-all bg-slate-50/70 rounded-lg border",
                                    selectedFileId === file.id 
                                        ? "border-blue-500 ring-1 ring-blue-500" 
                                        : "border-gray-200 hover:border-blue-400/50"
                                )}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-900 truncate">{file.name}</span>
                                </div>
                                <Button 
                                    variant={selectedFileId === file.id ? "default" : "secondary"}
                                    className={cn(
                                        "ml-2 text-xs h-7 px-2.5",
                                        selectedFileId === file.id 
                                            ? "bg-blue-600 hover:bg-blue-700" 
                                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    )}
                                    size="sm" 
                                    onClick={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                 >
                                    {selectedFileId === file.id ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : null}
                                    {selectedFileId === file.id ? 'Seleccionado' : 'Seleccionar'}
                                </Button>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">Esta carpeta está vacía.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
