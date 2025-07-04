
"use client";

import React from 'react';
import { Folder, FileText, CheckCircle2, Plus, MoreVertical, PenLine, Move, Trash2 } from 'lucide-react';
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
    onRenameFile: (file: File, folderId: string) => void;
    onMoveFile: (file: File, folderId: string) => void;
    onDeleteFile: (file: File, folderId: string) => void;
}

const FileItem: React.FC<{
  file: File;
  folderId: string;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (file: File, folderId: string) => void;
  onMove: (file: File, folderId: string) => void;
  onDelete: (file: File, folderId: string) => void;
}> = ({ file, folderId, isSelected, onSelect, onRename, onMove, onDelete }) => {
  const { language } = useLanguage();
  const t = useTranslations(language);

  return (
    <div
      className={cn(
        'group/fileitem flex items-center justify-between p-2 text-sm transition-all hover:bg-primary/10 rounded-lg border border-transparent',
        isSelected && 'bg-primary/20 ring-2 ring-primary'
      )}
    >
      <div
        onClick={onSelect}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-foreground truncate" title={file.name}>{file.name}</span>
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
    onDeleteFile
}: FolderGridProps) {
    const { language } = useLanguage();
    const t = useTranslations(language);

    if (folders.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-100/50 rounded-lg">
                <p className="text-base text-muted-foreground">
                    {searchQuery ? t('preparePage.noFilesFound') : t('preparePage.noFoldersOrFiles')}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {folders.map(folder => (
                <Card 
                    key={folder.id} 
                    className="bg-white/30 backdrop-blur-sm border-white/20 shadow-md hover:shadow-lg transition-shadow flex flex-col rounded-2xl"
                >
                    <CardHeader className='pb-3 flex flex-row items-start justify-between'>
                        <div className='flex-1'>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Folder className="h-6 w-6 text-primary" />
                                {folder.name}
                            </CardTitle>
                            <CardDescription>{folder.files.length} {folder.files.length === 1 ? t('preparePage.file') : t('preparePage.files')}</CardDescription>
                        </div>
                        <FileUploadButton
                            onFileSelect={(fileName) => onFileUploadToFolder(folder.id, fileName)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full flex-shrink-0"
                            title={t('preparePage.addFileTo').replace('{folderName}', folder.name)}
                        >
                            <Plus className="h-5 w-5" />
                            <span className="sr-only">{t('preparePage.addFile')}</span>
                        </FileUploadButton>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-1 p-3">
                        {folder.files.length > 0 ? (
                            folder.files.map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    folderId={folder.id}
                                    isSelected={selectedFileId === file.id}
                                    onSelect={() => onSelectFile(selectedFileId === file.id ? null : file.id)}
                                    onRename={onRenameFile}
                                    onMove={onMoveFile}
                                    onDelete={onDeleteFile}
                                />
                            ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">{t('preparePage.folderEmpty')}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
