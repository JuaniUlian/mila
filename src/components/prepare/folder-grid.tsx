"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
}

export function FolderGrid({ folders, selectedFileId, onSelectFile, onFileUpload }: FolderGridProps) {
    const defaultValue = folders.length > 0 ? folders[0].id : undefined;

    return (
        <Accordion type="single" collapsible defaultValue={defaultValue} className="w-full space-y-3">
            {folders.map(folder => (
                <AccordionItem key={folder.id} value={folder.id} className="border border-gray-200/80 rounded-xl bg-white shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="flex items-center w-full hover:bg-gray-50/50 transition-colors">
                        <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline text-left">
                           <div className="flex items-center gap-3">
                               <Folder className="h-6 w-6 text-blue-500" />
                               <div className="flex flex-col text-left">
                                <span className="font-semibold text-gray-800">{folder.name}</span>
                                <span className="text-sm text-gray-500">{folder.fileCount} archivos</span>
                               </div>
                           </div>
                        </AccordionTrigger>
                        <div className="pr-4 flex items-center gap-1">
                            <FileUploadButton
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:bg-gray-200/50"
                                onClick={(e) => e.stopPropagation()}
                                onFileSelect={(fileName) => onFileUpload(folder.id, fileName)}
                            >
                                <Plus className="h-4 w-4" />
                            </FileUploadButton>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-200/50" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <AccordionContent className="pt-0 pb-4 px-4 bg-slate-50/70">
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            {folder.files.length > 0 ? folder.files.map(file => (
                                <div 
                                    key={file.id} 
                                    className={cn(
                                        "flex items-center justify-between p-3 transition-all bg-white rounded-xl border",
                                        selectedFileId === file.id 
                                            ? "border-blue-500 ring-2 ring-blue-500" 
                                            : "border-gray-200 hover:border-blue-400/50 hover:bg-blue-50/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 truncate">{file.name}</span>
                                    </div>
                                    <Button 
                                        variant={selectedFileId === file.id ? "default" : "secondary"}
                                        className={cn(
                                            "ml-4",
                                            selectedFileId === file.id 
                                                ? "bg-blue-600 hover:bg-blue-700" 
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                        )}
                                        size="sm" 
                                        onClick={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                     >
                                        {selectedFileId === file.id ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                        {selectedFileId === file.id ? 'Seleccionado' : 'Seleccionar'}
                                    </Button>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">Esta carpeta está vacía.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
