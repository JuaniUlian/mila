
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { Search, Upload, FileSignature, BookCheck, FolderPlus, ChevronRight, FileCheck, ChevronLeft, CheckCircle2, PenLine, Move, Trash2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { RegulationList } from '@/components/prepare/regulation-list';

type File = {
  id: string;
  name: string;
  content: string;
};

type Regulation = {
    id: string;
    name: string;
    content: string;
};

// Mock Data
const initialFolders = [
  { id: 'f1', name: 'Pliegos 2025', files: [
    { id: 'file1', name: 'Pliego de Bases y Condiciones.pdf', content: 'Contenido simulado del Pliego de Bases y Condiciones. Este documento establece las reglas para la licitación.' },
    { id: 'file2', name: 'Anexo I - Especificaciones Técnicas.docx', content: 'Contenido simulado del Anexo I. Detalla los requisitos técnicos de los bienes o servicios a contratar.' },
    { id: 'file3', name: 'Anexo II - Minuta de Contrato.pdf', content: 'Contenido simulado del Anexo II. Es el borrador del contrato que se firmará con el adjudicatario.' },
  ]},
  { id: 'f2', name: 'Contrataciones Directas', files: [
    { id: 'file-ups', name: '3118772 SERV RECAMBIO UPS 96 FJS (1)', content: 'SOLICITUD: Se solicita con carácter de URGENTE la adquisición e instalación de un (1) sistema de aire acondicionado de precisión y un (1) equipo UPS para el centro de datos principal de la Entidad.\nPROCEDIMIENTO: El presente trámite se sustanciará bajo la modalidad de Licitación Pública.\nPRESUPUESTO OFICIAL: Se adjunta como referencia el presupuesto N° 1234 de la firma EXCELCOM S.A. por un total de USD 50.000.\nPLAZO DE EJECUCIÓN: El plazo máximo para la entrega e instalación será de ciento veinte (120) días.' },
    { id: 'file4', name: 'Informe de Contratación Directa.docx', content: 'Contenido simulado del Informe de Contratación Directa.' }
  ]},
  { id: 'f3', name: 'Expedientes', files: [
    { id: 'file5', name: 'Resolución de Apertura.pdf', content: 'Contenido simulado de la Resolución de Apertura.' },
    { id: 'file6', 'name': 'Dictamen Jurídico Previo.pdf', content: 'Contenido simulado del Dictamen Jurídico Previo.' },
  ]},
  { id: 'f4', name: 'Decretos', files: [] },
];

const initialRegulations: Regulation[] = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...' },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...' },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...' },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...' },
    { id: 'reg5', name: 'Decreto 795/96', content: 'Contenido del Decreto 795/96...' },
    { id: 'reg-9353', name: 'Ley 9353', content: 'Contenido detallado de la Ley 9353...' },
];

const FOLDERS_STORAGE_KEY = 'mila-prepare-folders';
const REGULATIONS_STORAGE_KEY = 'mila-prepare-regulations';


export default function PreparePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [folders, setFolders] = useState(initialFolders.map(f => ({ ...f, files: f.files, fileCount: f.files.length })));
  const [regulations, setRegulations] = useState(initialRegulations);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // State for file actions
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  type FileIdentifier = { fileId: string; folderId: string; name: string; content: string } | null;
  const [fileToAction, setFileToAction] = useState<FileIdentifier>(null);
  const [newFileName, setNewFileName] = useState('');
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);


  // Load from localStorage on mount
  useEffect(() => {
    document.title = 'MILA | Más Inteligencia Legal y Administrativa';
    try {
        const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (savedFolders) setFolders(JSON.parse(savedFolders));
        
        const savedRegulations = localStorage.getItem(REGULATIONS_STORAGE_KEY);
        if (savedRegulations) setRegulations(JSON.parse(savedRegulations));
    } catch (error) {
        console.error('Error loading data from localStorage', error);
    }
    setLoadedFromStorage(true);
  }, []);

  // Save to localStorage on changes, but only after initial load
  useEffect(() => {
    if (loadedFromStorage) {
        try {
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
        } catch (error) {
            console.error('Error saving folders to localStorage', error);
        }
    }
  }, [folders, loadedFromStorage]);

  useEffect(() => {
      if (loadedFromStorage) {
          try {
              localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(regulations));
          } catch (error) {
              console.error('Error saving regulations to localStorage', error);
          }
      }
  }, [regulations, loadedFromStorage]);

  const selectedFile = useMemo(() => {
    if (!selectedFileId) return null;
    for (const folder of folders) {
        const file = folder.files.find(f => f.id === selectedFileId);
        if (file) return file;
    }
    return null;
  }, [selectedFileId, folders]);

  const isValidationReady = selectedFileId !== null && selectedRegulationIds.length > 0;

  const handleNextStep = () => {
    if (selectedFileId) {
        setCurrentStep(2);
    }
  };
  
  const handlePrevStep = () => setCurrentStep(1);

  const handleValidate = () => {
    if (isValidationReady && selectedFile) {
        const selectedRegulationsData = regulations
            .filter(r => selectedRegulationIds.includes(r.id))
            .map(r => ({ name: r.name, content: r.content }));
        
        localStorage.setItem('selectedRegulations', JSON.stringify(selectedRegulationsData));
        localStorage.setItem('selectedDocumentName', selectedFile.name);
        localStorage.setItem('selectedDocumentContent', selectedFile.content);
        router.push('/loading');
    }
  };
  
  const showToast = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const handleFileUploadToFolder = (folderId: string, file: { name: string, content: string }) => {
    setFolders(prevFolders => {
        const newFolders = prevFolders.map(folder => {
            if (folder.id === folderId) {
                const updatedFolder = { ...folder };
                const newFile = { id: `file-${Date.now()}`, name: file.name, content: file.content };
                updatedFolder.files = [...updatedFolder.files, newFile];
                updatedFolder.fileCount = updatedFolder.files.length;
                return updatedFolder;
            }
            return folder;
        });
        return newFolders;
    });
    showToast(t('preparePage.toastFileUploaded'), t('preparePage.toastFileAdded').replace('{fileName}', file.name));
  };

  const handleFileUploadedToRoot = (file: { name: string, content: string }) => {
    if (folders.length > 0) {
      handleFileUploadToFolder(folders[0].id, file);
    } else {
       toast({
          title: t('preparePage.toastError'),
          description: t('preparePage.toastNoFolders'),
          variant: 'destructive', 
        });
    }
  };
  
  const handleRegulationUpload = (file: { name: string, content: string }) => {
    setRegulations(prevRegulations => {
        const newRegulation: Regulation = {
            id: `reg-${Date.now()}`,
            name: file.name,
            content: file.content
        };
        return [...prevRegulations, newRegulation];
    });
    showToast(t('preparePage.toastFileUploaded'), t('preparePage.toastFileAdded').replace('{fileName}', file.name));
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

  // File action handlers
  const handleOpenRenameModal = (file: File, folderId: string) => {
    setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content });
    setNewFileName(file.name);
    setIsRenameModalOpen(true);
  };

  const handleRenameFile = () => {
    if (!fileToAction || !newFileName.trim()) {
      toast({ title: t('preparePage.toastError'), description: t('preparePage.toastEmptyFolderName'), variant: 'destructive' });
      return;
    }
    setFolders(prevFolders =>
      prevFolders.map(folder => {
        if (folder.id === fileToAction.folderId) {
          return {
            ...folder,
            files: folder.files.map(file =>
              file.id === fileToAction.fileId ? { ...file, name: newFileName.trim() } : file
            ),
          };
        }
        return folder;
      })
    );
    toast({ title: t('preparePage.renameFile'), description: `"${fileToAction.name}" ${t('preparePage.renamedTo')} "${newFileName.trim()}".` });
    setIsRenameModalOpen(false);
    setFileToAction(null);
  };

  const handleOpenMoveModal = (file: File, folderId: string) => {
    setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content });
    setMoveToFolderId(null);
    setIsMoveModalOpen(true);
  };

  const handleMoveFile = () => {
    if (!fileToAction || !moveToFolderId) {
      toast({ title: t('preparePage.toastError'), description: t('preparePage.selectDestinationFolder'), variant: 'destructive' });
      return;
    }
    let fileToMove: File | undefined;
    const foldersWithoutFile = folders.map(folder => {
      if (folder.id === fileToAction.folderId) {
        fileToMove = folder.files.find(f => f.id === fileToAction.fileId);
        return { ...folder, files: folder.files.filter(f => f.id !== fileToAction.fileId), fileCount: folder.files.length - 1 };
      }
      return folder;
    });
    if (!fileToMove) return;
    const foldersWithMovedFile = foldersWithoutFile.map(folder => {
      if (folder.id === moveToFolderId) {
        return { ...folder, files: [...folder.files, fileToMove!], fileCount: folder.files.length + 1 };
      }
      return folder;
    });
    setFolders(foldersWithMovedFile);
    toast({ title: t('preparePage.moveFile'), description: `"${fileToMove.name}" ${t('preparePage.movedTo')} "${folders.find(f=>f.id === moveToFolderId)?.name}".` });
    setIsMoveModalOpen(false);
    setFileToAction(null);
  };

  const handleOpenDeleteModal = (file: File, folderId: string) => {
    setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFile = () => {
    if (!fileToAction) return;
    setFolders(prevFolders =>
      prevFolders.map(folder => {
        if (folder.id === fileToAction.folderId) {
          return { ...folder, files: folder.files.filter(f => f.id !== fileToAction.fileId), fileCount: folder.files.length - 1 };
        }
        return folder;
      })
    );
    if (selectedFileId === fileToAction.fileId) {
      setSelectedFileId(null);
    }
    toast({ title: t('preparePage.deleteFile'), description: `"${fileToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteModalOpen(false);
    setFileToAction(null);
  };

  return (
    <div 
        className="min-h-screen w-full p-4 md:p-8 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 text-foreground"
    >
      <div className="max-w-7xl mx-auto space-y-8 relative">
        {currentStep === 1 && (
            <div className="animate-in fade-in duration-500">
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
                            suppressHydrationWarning
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
                            suppressHydrationWarning
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
                          onRenameFile={handleOpenRenameModal}
                          onMoveFile={handleOpenMoveModal}
                          onDeleteFile={handleOpenDeleteModal}
                        />
                    </CardContent>
                </Card>
            </div>
        )}

        {currentStep === 2 && (
            <div className="animate-in fade-in duration-500">
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1" className="border-none">
                        <Card className="bg-white/20 backdrop-blur-md border-white/30 shadow-lg rounded-2xl overflow-hidden">
                        <AccordionTrigger suppressHydrationWarning className="w-full p-0 hover:no-underline [&[data-state=open]]:bg-white/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/20">
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
            </div>
        )}

        {selectedFile && currentStep === 1 && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-lg animate-in slide-in-from-bottom-8 fade-in duration-500 z-20">
                <div className={cn("glass p-3 mx-4 rounded-2xl flex items-center justify-between gap-4")}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileCheck className="h-7 w-7 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground">{t('preparePage.selectedFilePrompt')}</span>
                            <p className="font-semibold text-foreground truncate" title={selectedFile.name}>{selectedFile.name}</p>
                        </div>
                    </div>
                    <Button
                        suppressHydrationWarning
                        className="text-base font-semibold px-6 py-5 rounded-xl btn-neu-green flex-shrink-0"
                        onClick={handleNextStep}
                    >
                        {t('preparePage.nextButton')}
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        )}

        {currentStep === 2 && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-500 z-20">
                <div className={cn("glass p-4 mx-4 rounded-2xl flex items-center justify-between gap-6")}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {isValidationReady ? (
                            <CheckCircle2 className="h-7 w-7 text-primary flex-shrink-0" />
                        ) : (
                            <BookCheck className="h-7 w-7 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            {isValidationReady ? (
                                <>
                                    <span className="text-xs text-muted-foreground">{t('preparePage.readyToValidate')}</span>
                                    <p className="font-semibold text-foreground" title={`${selectedRegulationIds.length} ${selectedRegulationIds.length === 1 ? t('preparePage.regulationSelected') : t('preparePage.regulationsSelected')}`}>
                                        {selectedRegulationIds.length} {selectedRegulationIds.length === 1 ? t('preparePage.regulationSelected') : t('preparePage.regulationsSelected')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs text-muted-foreground">{t('preparePage.step2')}</span>
                                    <p className="font-semibold text-foreground">{t('preparePage.selectRegulationsPrompt')}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                            variant="ghost"
                            onClick={handlePrevStep}
                            className="py-3 px-4 rounded-xl btn-neu-light"
                            suppressHydrationWarning
                        >
                            <ChevronLeft className="mr-1 h-5 w-5" />
                            {t('preparePage.backButton')}
                        </Button>
                        <Button
                            suppressHydrationWarning
                            className="py-3 px-4 rounded-xl btn-neu-green"
                            onClick={handleValidate}
                            disabled={!isValidationReady}
                        >
                            {t('preparePage.validateButton')}
                            <ChevronRight className="ml-1 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        )}
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
            <Button suppressHydrationWarning onClick={handleCreateFolder}>{t('preparePage.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Action Dialogs */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.renameFile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="file-name">{t('preparePage.newFileNameLabel').replace('{fileName}', fileToAction?.name || '')}</Label>
            <Input id="file-name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button onClick={handleRenameFile}>{t('preparePage.rename')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.moveFile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p>{t('preparePage.moveFileToLabel').replace('{fileName}', fileToAction?.name || '')}</p>
            <RadioGroup value={moveToFolderId ?? ""} onValueChange={setMoveToFolderId} className="max-h-60 overflow-y-auto">
              {folders.filter(f => f.id !== fileToAction?.folderId).map(folder => (
                <div key={folder.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={folder.id} id={`move-${folder.id}`} />
                  <Label htmlFor={`move-${folder.id}`}>{folder.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button onClick={handleMoveFile} disabled={!moveToFolderId}>{t('preparePage.move')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.confirmDeleteTitle')}</DialogTitle>
          </DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteDesc').replace('{fileName}', `<strong>${fileToAction?.name || ''}</strong>`)}} />
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteFile}>{t('preparePage.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
