
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { RegulationList } from '@/components/prepare/regulation-list';
import { Search, Upload, FileSignature, BookCheck, FolderPlus } from 'lucide-react';
import { FileUploadButton } from '@/components/prepare/file-upload-button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

// Mock Data
const initialFolders = [
  { id: 'f1', name: 'Pliegos 2025', files: [
    { id: 'file1', name: 'Pliego de Bases y Condiciones.pdf' },
    { id: 'file2', name: 'Anexo I - Especificaciones Técnicas.docx' },
    { id: 'file3', name: 'Anexo II - Minuta de Contrato.pdf' },
  ]},
  { id: 'f2', name: 'Contrataciones Directas', files: [
    { id: 'file4', name: 'Informe de Contratación Directa.docx' }
  ]},
  { id: 'f3', name: 'Expedientes', files: [
    { id: 'file5', name: 'Resolución de Apertura.pdf' },
    { id: 'file6', 'name': 'Dictamen Jurídico Previo.pdf' },
  ]},
  { id: 'f4', name: 'Decretos', files: [] },
];

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...' },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...' },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...' },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...' },
];

export default function PreparePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const [folders, setFolders] = useState(initialFolders.map(f => ({ ...f, fileCount: f.files.length })));
  const [regulations, setRegulations] = useState(initialRegulations);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    document.title = 'MILA | Más Inteligencia Legal y Administrativa';
  }, []);

  const isValidationReady = selectedFileId !== null && selectedRegulationIds.length > 0;

  const handleValidate = () => {
    if (isValidationReady) {
      const allFiles = folders.flatMap(folder => folder.files);
      const selectedFile = allFiles.find(file => file.id === selectedFileId);

      if (selectedFile) {
        localStorage.setItem('selectedDocumentName', selectedFile.name);
      } else {
        localStorage.setItem('selectedDocumentName', 'Documento no encontrado');
      }
      
      router.push('/loading');
    }
  };
  
  const showToast = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const handleFileUploadToFolder = (folderId: string, fileName: string) => {
    setFolders(prevFolders => {
        const newFolders = prevFolders.map(folder => {
            if (folder.id === folderId) {
                const updatedFolder = { ...folder };
                const newFile = { id: `file-${Date.now()}`, name: fileName };
                updatedFolder.files = [...updatedFolder.files, newFile];
                updatedFolder.fileCount = updatedFolder.files.length;
                return updatedFolder;
            }
            return folder;
        });
        return newFolders;
    });
    showToast(t('preparePage.toastFileUploaded'), t('preparePage.toastFileAdded').replace('{fileName}', fileName));
  };

  const handleFileUploadedToRoot = (fileName: string) => {
    if (folders.length > 0) {
      handleFileUploadToFolder(folders[0].id, fileName);
    } else {
       toast({
          title: t('preparePage.toastError'),
          description: t('preparePage.toastNoFolders'),
          variant: 'destructive', 
        });
    }
  };
  
  const handleRegulationUpload = (fileName: string) => {
    setRegulations(prevRegulations => {
        const newRegulation = {
            id: `reg-${Date.now()}`,
            name: fileName,
            content: 'Contenido del archivo de normativa subido...'
        };
        return [...prevRegulations, newRegulation];
    });
    showToast(t('preparePage.toastFileUploaded'), t('preparePage.toastFileAdded').replace('{fileName}', fileName));
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: t('preparePage.toastError'),
        description: t('preparePage.toastEmptyFolderName'),
        variant: "destructive",
      });
      return;
    }

    const newFolder = {
      id: `f${Date.now()}`,
      name: newFolderName,
      files: [],
      fileCount: 0,
    };

    setFolders(prevFolders => [...prevFolders, newFolder]);
    toast({
      title: t('preparePage.toastFolderCreated'),
      description: t('preparePage.toastFolderCreatedDesc').replace('{folderName}', newFolderName),
    });

    setNewFolderName('');
    setIsCreateFolderModalOpen(false);
  };

  const filteredFolders = useMemo(() => {
    if (!searchQuery) {
      return folders;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return folders
      .map(folder => {
        const matchingFiles = folder.files.filter(file =>
          file.name.toLowerCase().includes(lowercasedQuery)
        );
        return { ...folder, files: matchingFiles, fileCount: matchingFiles.length };
      })
      .filter(folder => folder.files.length > 0);
  }, [searchQuery, folders]);


  return (
    <div 
        className="min-h-screen w-full p-4 md:p-8 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 text-foreground"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-white/20 backdrop-blur-md border-white/30 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/20 border-b border-white/20 p-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileSignature className="h-8 w-8 text-primary"/>
              {t('preparePage.step1')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={t('preparePage.searchPlaceholder')}
                  className="pl-12 py-6 w-full bg-slate-100/70 text-foreground rounded-lg border-slate-200 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
               <FileUploadButton
                variant="ghost"
                className="w-full sm:w-auto flex-shrink-0 h-full py-3 px-6 rounded-xl bg-white text-foreground font-semibold shadow-lg hover:shadow-md transition-all duration-300 active:shadow-inner active:bg-slate-50"
                onFileSelect={handleFileUploadedToRoot}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('preparePage.uploadFile')}
              </FileUploadButton>
              <Button
                variant="ghost"
                className="w-full sm:w-auto flex-shrink-0 h-full py-3 px-6 rounded-xl bg-white text-foreground font-semibold shadow-lg hover:shadow-md transition-all duration-300 active:shadow-inner active:bg-slate-50"
                onClick={() => setIsCreateFolderModalOpen(true)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                {t('preparePage.newFolder')}
              </Button>
            </div>
            <FolderGrid 
              folders={filteredFolders} 
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
              searchQuery={searchQuery}
              onFileUploadToFolder={handleFileUploadToFolder}
            />
          </CardContent>
        </Card>

        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1" className="border-none">
                <Card className="bg-white/20 backdrop-blur-md border-white/30 shadow-lg rounded-2xl overflow-hidden">
                <AccordionTrigger className="w-full p-0 hover:no-underline [&[data-state=open]]:bg-white/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/20">
                    <div className="p-6 w-full text-left flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <BookCheck className="h-8 w-8 text-primary"/>
                            {t('preparePage.step2')}
                        </CardTitle>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                    <CardContent className="p-6">
                        <RegulationList 
                        regulations={regulations}
                        selectedIds={selectedRegulationIds}
                        onSelectionChange={setSelectedRegulationIds}
                        onRegulationUpload={handleRegulationUpload}
                        />
                    </CardContent>
                </AccordionContent>
                </Card>
            </AccordionItem>
        </Accordion>

        <div className="flex justify-center pt-4">
            <Button
              className="text-xl font-semibold px-16 py-8 rounded-2xl bg-white text-foreground shadow-xl hover:shadow-lg hover:brightness-95 active:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
              onClick={handleValidate}
              disabled={!isValidationReady}
            >
              {t('preparePage.validateButton')}
            </Button>
        </div>
      </div>

      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.createFolderTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="folder-name" className="text-foreground">
                {t('preparePage.folderNameLabel')}
            </Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={t('preparePage.folderNamePlaceholder')}
              className="bg-white/70"
            />
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setNewFolderName('')}>{t('preparePage.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleCreateFolder}>{t('preparePage.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
