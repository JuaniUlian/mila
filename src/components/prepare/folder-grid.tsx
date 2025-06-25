
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, FileText, MoreVertical, Plus, Download, Trash2, Edit, Move, CheckCircle2 } from 'lucide-react';
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
}

export function FolderGrid({ folders, selectedFileId, onSelectFile, onFileUpload }: FolderGridProps) {
    const [openFolderId, setOpenFolderId] = useState<string | null>(folders.length > 0 ? folders[0].id : null);

    const handleFolderClick = (folderId: string) => {
        setOpenFolderId(prevId => (prevId === folderId ? null : folderId));
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map(folder => (
                    <Card 
                        key={folder.id} 
                        className="flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-blue-400/50 glass-card border-gray-200/50"
                        onClick={() => handleFolderClick(folder.id)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <Folder className="h-8 w-8 text-blue-600" />
                                <CardTitle className="text-lg font-semibold text-gray-800">{folder.name}</CardTitle>
                            </div>
                            <DropdownMenu onOpenChange={(open) => { if(open) setOpenFolderId(null) }} >
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-200/50">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem className="text-gray-800 focus:bg-gray-200/50"><Edit className="mr-2 h-4 w-4" />Renombrar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-800 focus:bg-gray-200/50"><Download className="mr-2 h-4 w-4" />Descargar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-red-100/50"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription className="text-gray-600">{folder.fileCount} archivos</CardDescription>
                        </CardContent>
                        <CardFooter>
                             <FileUploadButton
                                variant="outline"
                                size="sm"
                                className="w-full bg-white/50 hover:bg-white/80 border-gray-300 text-gray-800"
                                onClick={(e) => e.stopPropagation()}
                                onFileSelect={(fileName) => onFileUpload(folder.id, fileName)}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Subir archivo
                            </FileUploadButton>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {openFolderId && folders.find(f => f.id === openFolderId)?.files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                        Contenido de: {folders.find(f => f.id === openFolderId)?.name}
                    </h3>
                    <div className="space-y-2">
                        {folders.find(f => f.id === openFolderId)?.files.map(file => (
                             <Card 
                                key={file.id} 
                                className={cn(
                                    "flex items-center justify-between p-3 transition-all bg-white/60",
                                    selectedFileId === file.id ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium text-gray-800">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button 
                                        variant={selectedFileId === file.id ? "default" : "secondary"}
                                        className={selectedFileId === file.id ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}
                                        size="sm" 
                                        onClick={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                     >
                                        {selectedFileId === file.id ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                        {selectedFileId === file.id ? 'Seleccionado' : 'Seleccionar'}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-200/50"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-200/50"><Move className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-100/50"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
