
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
                        className="flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-primary/50 bg-card/80"
                        onClick={() => handleFolderClick(folder.id)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <Folder className="h-8 w-8 text-primary" />
                                <CardTitle className="text-lg font-semibold">{folder.name}</CardTitle>
                            </div>
                            <DropdownMenu onOpenChange={(open) => { if(open) setOpenFolderId(null) }} >
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Renombrar</DropdownMenuItem>
                                    <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Descargar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{folder.fileCount} archivos</CardDescription>
                        </CardContent>
                        <CardFooter>
                             <FileUploadButton
                                variant="outline"
                                size="sm"
                                className="w-full"
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
                    <h3 className="text-xl font-semibold mb-3">
                        Contenido de: {folders.find(f => f.id === openFolderId)?.name}
                    </h3>
                    <div className="space-y-2">
                        {folders.find(f => f.id === openFolderId)?.files.map(file => (
                             <Card 
                                key={file.id} 
                                className={cn(
                                    "flex items-center justify-between p-3 transition-all bg-background/60",
                                    selectedFileId === file.id && "border-primary ring-2 ring-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button 
                                        variant={selectedFileId === file.id ? "default" : "secondary"} 
                                        size="sm" 
                                        onClick={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                     >
                                        {selectedFileId === file.id ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                        {selectedFileId === file.id ? 'Seleccionado' : 'Seleccionar'}
                                    </Button>
                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Move className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
