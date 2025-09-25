
"use client";

import React from 'react';
import { Folder, FileText, CheckCircle2, Plus, MoreVertical, PenLine, Move, Trash2, AlertTriangle, XCircle, Pause, Play, Loader, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FileUploadButton } from './file-upload-button';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Progress } from '../ui/progress';

interface File {
    id: string;
    name: string;
    content: string;
    status?: 'uploading' | 'processing' | 'paused' | 'cancelling' | 'error' | 'success';
    error?: string;
    processingTime?: number;
    // Chunk-specific
    totalChunks?: number;
    currentChunk?: number;
    totalEstimatedTime?: number;
    elapsedTime?: number;
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
    onFileUploadToFolder: (file: globalThis.File, folderId: string) => void;
    onRenameFile: (file: File, folderId: string) => void;
    onMoveFile: (file: File, folderId: string) => void;
    onDeleteFile: (file: File, folderId: string) => void;
    onDismissError: (file: File, folderId: string) => void;
    onRenameFolder: (folder: FolderData) => void;
    onDeleteFolder: (folder: FolderData) => void;
    onPauseOrResume: (fileId: string) => void;
    onCancel: (fileId: string, folderId: string) => void;
    expandedFolderId: string | null;
    setExpandedFolderId: (id: string | null) => void;
}

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '...';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    if (m > 0) return `${pad(m)}m:${pad(s)}s`;
    return `${s}s`;
}

const FileItem: React.FC<{
  file: File;
  folderId: string;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (file: File, folderId: string) => void;
  onMove: (file: File, folderId: string) => void;
  onDelete: (file: File, folderId: string) => void;
  onDismissError: (file: File, folderId: string) => void;
  onPauseOrResume: (fileId: string) => void;
  onCancel: (fileId: string, folderId: string) => void;
}> = ({ file, folderId, isSelected, onSelect, onRename, onMove, onDelete, onDismissError, onPauseOrResume, onCancel }) => {
  const { language } = useLanguage();
  const t = useTranslations(language);

  if (['uploading', 'processing', 'paused'].includes(file.status || '')) {
    const isProcessing = file.status === 'processing';
    const isPaused = file.status === 'paused';
    const progressPercentage = (file.totalChunks && file.currentChunk) 
      ? ((file.currentChunk -1) / file.totalChunks) * 100
      : (file.elapsedTime && file.totalEstimatedTime)
      ? (file.elapsedTime / file.totalEstimatedTime) * 100
      : 0;

    const remainingTime = Math.max(0, (file.totalEstimatedTime || 0) - (file.elapsedTime || 0));

    let statusText = 'Analizando Archivo...';
    if(isPaused) statusText = 'Proceso Pausado';
    else if(isProcessing && file.totalChunks) {
        statusText = `Procesando parte ${file.currentChunk} de ${file.totalChunks}`
    }

    return (
      <div className="p-3 text-sm rounded-lg border bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Loader className="h-5 w-5 text-blue-600 flex-shrink-0 animate-spin" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground truncate block">{file.name}</span>
          </div>
        </div>
        <div className='space-y-2'>
            <div className='flex justify-between items-baseline text-xs'>
                <span className='text-blue-700 font-medium'>{statusText}</span>
                {isProcessing && <span className='text-muted-foreground font-mono'>~{formatTime(remainingTime)} restantes</span>}
            </div>
            <Progress value={progressPercentage} className='h-1.5' indicatorClassName='bg-blue-600' />
            <div className='flex items-center justify-end gap-2 pt-1'>
                {isProcessing && (
                    <Button variant="ghost" size="sm" onClick={() => onPauseOrResume(file.id)} className='text-xs h-7 px-2 text-primary hover:bg-primary/10'>
                        <Pause className='h-3 w-3 mr-1'/> Pausar
                    </Button>
                )}
                 {isPaused && (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => onPauseOrResume(file.id)} className='text-xs h-7 px-2 text-green-600 hover:bg-green-100'>
                            <Play className='h-3 w-3 mr-1'/> Reanudar
                        </Button>
                         <Button variant="ghost" size="sm" onClick={() => onCancel(file.id, folderId)} className='text-xs h-7 px-2 text-destructive hover:bg-destructive/10'>
                            <XCircle className='h-3 w-3 mr-1'/> Cancelar
                        </Button>
                    </>
                 )}
            </div>
        </div>
      </div>
    );
  }

  if (file.status === 'error') {
    return (
      <div className="p-2 text-sm bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
           <div className="flex-1 min-w-0">
            <span className="font-medium text-destructive truncate">{file.name}</span>
          </div>
        </div>
        <p className="text-xs text-destructive mt-1">{file.error}</p>
        <Button variant="ghost" size="sm" onClick={() => onDismissError(file, folderId)} className="text-xs h-auto p-1 mt-1 text-destructive hover:bg-destructive/20">
            {t('preparePage.dismissError')}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group/fileitem flex items-center justify-between p-2 text-sm transition-all rounded-lg border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300',
        isSelected && 'bg-primary/10 border-primary/40'
      )}
    >
      <div
        onClick={onSelect}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground truncate block" title={file.name}>{file.name}</span>
        </div>
      </div>

      <div className="flex items-center">
        {isSelected && (
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mx-2" />
        )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full flex-shrink-0 opacity-0 group-hover/fileitem:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('preparePage.fileOptions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-48">
              <DropdownMenuItem onSelect={() => onRename(file, folderId)}>
                <PenLine className="mr-2 h-4 w-4" />
                <span>{t('preparePage.rename')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onMove(file, folderId)}>
                <Move className="mr-2 h-4 w-4" />
                <span>{t('preparePage.move')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(file, folderId)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t('preparePage.delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>
  );
};

export function FolderGrid({ 
    folders, 
    selectedFileId, 
    onSelectFile, 
    searchQuery, 
    onFileUploadToFolder,
    onRenameFile,
    onMoveFile,
    onDeleteFile,
    onDismissError,
    onRenameFolder,
    onDeleteFolder,
    onPauseOrResume,
    onCancel,
    expandedFolderId,
    setExpandedFolderId,
}: FolderGridProps) {
    const { language } = useLanguage();
    const t = useTranslations(language);

    if (folders.length === 0 && !expandedFolderId) {
        return (
            <div className="text-center py-10 bg-background/50 rounded-lg">
                <p className="text-base text-muted-foreground">
                    {searchQuery ? t('preparePage.noFilesFound') : t('preparePage.noFoldersOrFiles')}
                </p>
            </div>
        );
    }
    
    if (expandedFolderId) {
        const folder = folders.find(f => f.id === expandedFolderId);
        if (!folder) return null;

        return (
            <div className="bg-slate-50/50 backdrop-blur-sm border-slate-200/80 shadow-sm flex flex-col rounded-2xl">
                <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                    <div className='flex-1 flex items-center gap-4'>
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setExpandedFolderId(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                <Folder className="h-6 w-6 text-primary" />
                                {folder.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">{folder.files.filter(f => f.status === 'success').length} {t('preparePage.files')}</CardDescription>
                        </div>
                    </div>
                    <FileUploadButton
                        onFileSelect={(file) => onFileUploadToFolder(file, folder.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground"
                        title={t('preparePage.addFileTo').replace('{folderName}', folder.name)}
                    >
                        <Plus className="h-5 w-5" />
                    </FileUploadButton>
                </CardHeader>
                <CardContent className="flex-1 space-y-1 p-3">
                    {folder.files.length > 0 ? (
                        folder.files.map(file => (
                            <FileItem
                                key={file.id}
                                file={file}
                                folderId={folder.id}
                                isSelected={selectedFileId === file.id && file.status === 'success'}
                                onSelect={() => file.status === 'success' && onSelectFile(selectedFileId === file.id ? null : file.id)}
                                onRename={onRenameFile}
                                onMove={onMoveFile}
                                onDelete={onDeleteFile}
                                onDismissError={onDismissError}
                                onPauseOrResume={onPauseOrResume}
                                onCancel={onCancel}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">{t('preparePage.folderEmpty')}</p>
                    )}
                </CardContent>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map(folder => (
                <div 
                    key={folder.id} 
                    className="relative group bg-gradient-to-br from-slate-50/50 to-slate-100/50 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col rounded-2xl cursor-pointer aspect-square"
                    onClick={() => setExpandedFolderId(folder.id)}
                >
                    <div className="absolute top-2 right-2 flex items-center z-10" onClick={e => e.stopPropagation()}>
                        <FileUploadButton
                            onFileSelect={(file) => onFileUploadToFolder(file, folder.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:bg-black/10 hover:text-foreground"
                            title={t('preparePage.addFileTo').replace('{folderName}', folder.name)}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">{t('preparePage.addFile')}</span>
                        </FileUploadButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:bg-black/10 hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                                >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">{t('preparePage.folderOptions')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="w-48">
                                <DropdownMenuItem onSelect={() => onRenameFolder(folder)}>
                                <PenLine className="mr-2 h-4 w-4" />
                                <span>{t('preparePage.rename')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                onSelect={() => onDeleteFolder(folder)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{t('preparePage.delete')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Folder className="h-16 w-16 text-primary mb-3" />
                        <CardTitle className="text-base font-semibold text-foreground break-words w-full">
                            {folder.name}
                        </CardTitle>
                    </div>
                </div>
            ))}
        </div>
    );
}

