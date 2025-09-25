"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { Search, Upload, BookCheck, FolderPlus, ChevronRight, FileCheck, ChevronLeft, CheckCircle2, ArrowLeft, Loader2, Sparkles, TerminalSquare } from 'lucide-react';
import { FileUploadButton } from './file-upload-button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { RegulationList } from '@/components/prepare/regulation-list';
import JSZip from 'jszip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Textarea } from '../ui/textarea';

// Renombrar el tipo File local para evitar conflicto con el File global del DOM
type DocumentFile = {
  id: string;
  name: string;
  content: string;
  status?: 'uploading' | 'processing' | 'paused' | 'cancelling' | 'error' | 'success';
  error?: string;
  startTime?: number;
  processingTime?: number;
  totalChunks?: number;
  currentChunk?: number;
  totalEstimatedTime?: number;
  elapsedTime?: number;
};

type Regulation = {
  id: string;
  name: string;
  content: string;
  status?: 'processing' | 'error' | 'success';
  error?: string;
  startTime?: number;
  processingTime?: number;
};

type FolderData = {
  id: string;
  name: string;
  files: DocumentFile[];
  fileCount?: number;
};

// Interfaces para los identificadores
interface FileIdentifier {
  fileId: string;
  folderId: string;
  name: string;
  content: string;
}

interface RegulationIdentifier {
  id: string;
  name: string;
  content: string;
}

interface FolderIdentifier {
  id: string;
  name: string;
}

const estimateChunkProcessingTime = (numPages: number): number => {
    const timePerScannedPage = 8;
    return numPages * timePerScannedPage;
};

interface PrepareViewProps {
    title: string;
    titleIcon: React.ElementType;
    initialFolders: Omit<FolderData, 'fileCount'>[];
    initialRegulations?: Regulation[];
    preconfiguredRegulations?: Regulation[];
    storageKeyPrefix: string;
    isModuleView: boolean;
    modulePurpose?: string;
    defaultInstructions?: string;
}

export function PrepareView({ title, titleIcon: TitleIcon, initialFolders: rawInitialFolders, initialRegulations, preconfiguredRegulations, storageKeyPrefix, isModuleView, modulePurpose, defaultInstructions }: PrepareViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const FOLDERS_STORAGE_KEY = `${storageKeyPrefix}-folders`;
  const REGULATIONS_STORAGE_KEY = `${storageKeyPrefix}-regulations`;
  const INSTRUCTIONS_STORAGE_KEY = `${storageKeyPrefix}-instructions`;

  const initialFolders = useMemo(() => rawInitialFolders.map(f => ({ ...f, files: f.files as DocumentFile[], fileCount: f.files.length })), [rawInitialFolders]);
  
  const [folders, setFolders] = useState<FolderData[]>(initialFolders);
  const [regulations, setRegulations] = useState<Regulation[]>(initialRegulations || []);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

  const [customInstructions, setCustomInstructions] = useState(defaultInstructions || '');
  const [isInstructionsValidated, setIsInstructionsValidated] = useState(true);
  const [isInstructionValidationLoading, setIsInstructionValidationLoading] = useState(false);

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [fileToAction, setFileToAction] = useState<FileIdentifier | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [regulationToAction, setRegulationToAction] = useState<RegulationIdentifier | null>(null);
  const [isRenameRegulationModalOpen, setIsRenameRegulationModalOpen] = useState(false);
  const [newRegulationName, setNewRegulationName] = useState('');
  const [isDeleteRegulationModalOpen, setIsDeleteRegulationModalOpen] = useState(false);
  
  const [folderToAction, setFolderToAction] = useState<FolderIdentifier | null>(null);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [renamedFolderName, setRenamedFolderName] = useState('');
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [fileToCancel, setFileToCancel] = useState<{fileId: string, folderId: string} | null>(null);
  
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  const isPausedRef = useRef<Map<string, boolean>>(new Map());
  const abortControllerRef = useRef<Map<string, AbortController>>(new Map());
  const timerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    document.title = `MILA | ${title}`;
    try {
      if (!isModuleView) {
        const savedFoldersRaw = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (savedFoldersRaw) {
          const savedFolders = JSON.parse(savedFoldersRaw);
          const sanitizedFolders = savedFolders.map((folder: any) => ({
            ...folder,
            files: folder.files.map((file: any) => ({ ...file, status: file.status || 'success' }))
          }));
          setFolders(sanitizedFolders);
        }
        
        const savedRegulationsRaw = localStorage.getItem(REGULATIONS_STORAGE_KEY);
        if (savedRegulationsRaw) {
          const savedRegulations = JSON.parse(savedRegulationsRaw);
          const sanitizedRegulations = savedRegulations.map((reg: any) => ({ ...reg, status: reg.status || 'success' }));
          setRegulations(sanitizedRegulations);
        }
      }

      const savedInstructions = localStorage.getItem(INSTRUCTIONS_STORAGE_KEY);
      if (savedInstructions) {
        setCustomInstructions(savedInstructions);
      } else {
        setCustomInstructions(defaultInstructions || '');
      }

      if (preconfiguredRegulations) {
        setSelectedRegulationIds(preconfiguredRegulations.map(r => r.id));
      }
    } catch (error) {
      console.error('Error loading data from localStorage', error);
    }
    setLoadedFromStorage(true);
  }, [FOLDERS_STORAGE_KEY, REGULATIONS_STORAGE_KEY, INSTRUCTIONS_STORAGE_KEY, title, isModuleView, preconfiguredRegulations, defaultInstructions]);

  useEffect(() => {
    if (loadedFromStorage) {
        try {
            if (!isModuleView) {
                const foldersToSave = folders.map(folder => ({ ...folder, files: folder.files.filter(file => file.status === 'success') }));
                localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(foldersToSave));
                
                const regulationsToSave = regulations.filter(reg => reg.status === 'success');
                localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(regulationsToSave));
            }
            localStorage.setItem(INSTRUCTIONS_STORAGE_KEY, customInstructions);
        } catch (error) {
            console.error('Error saving data to localStorage', error);
        }
    }
  }, [folders, regulations, customInstructions, loadedFromStorage, FOLDERS_STORAGE_KEY, REGULATIONS_STORAGE_KEY, INSTRUCTIONS_STORAGE_KEY, isModuleView]);

  const selectedFile = useMemo(() => {
    if (!selectedFileId) return null;
    for (const folder of folders) {
        const file = folder.files.find(f => f.id === selectedFileId);
        if (file) return file;
    }
    return null;
  }, [selectedFileId, folders]);

  const isValidationReady = selectedFileId !== null && selectedRegulationIds.length > 0 && isInstructionsValidated;

  const handleValidate = () => {
    if (!isValidationReady || !selectedFile) return;
    
    const finalRegulations = isModuleView ? preconfiguredRegulations : regulations.filter(r => selectedRegulationIds.includes(r.id) && r.status === 'success');
    
    if (!finalRegulations || finalRegulations.length === 0) {
        toast({ title: "Error", description: "No regulations selected for validation.", variant: "destructive" });
        return;
    }
    
    const regulationsToStore = finalRegulations.map(r => ({ name: r.name, content: r.content }));
    
    localStorage.setItem('selectedRegulations', JSON.stringify(regulationsToStore));
    localStorage.setItem('selectedDocumentName', selectedFile.name);
    localStorage.setItem('selectedDocumentContent', selectedFile.content);
    if(customInstructions && customInstructions !== defaultInstructions) {
      localStorage.setItem('customInstructions', customInstructions);
    } else {
      localStorage.removeItem('customInstructions');
    }
    router.push('/loading');
  };

  const handleValidateInstructions = async () => {
    const currentDefault = defaultInstructions || '';
    const currentCustom = customInstructions.trim();

    if (!currentCustom || currentCustom === currentDefault) {
        setIsInstructionsValidated(true);
        setCustomInstructions(currentDefault);
        toast({ title: "Instrucciones por Defecto", description: "Se usarán las instrucciones estándar para el análisis." });
        return;
    }

    const defaultDirectives = currentDefault.match(/(\d\.|-)\s/g) || [];
    const customDirectives = currentCustom.match(/(\d\.|-)\s/g) || [];

    if (customDirectives.length < defaultDirectives.length) {
        setCustomInstructions(currentDefault);
        setIsInstructionsValidated(false); 
        toast({
            title: "Instrucciones Inválidas",
            description: "No se pueden eliminar las directivas predefinidas, ya que son indispensables para un análisis correcto. Se han restaurado las instrucciones originales.",
            variant: "destructive",
            duration: 8000,
        });
        setTimeout(() => setIsInstructionsValidated(true), 100); 
        return;
    }

    // Validación básica sin llamar a función externa
    setIsInstructionValidationLoading(true);
    try {
        // Validar que las instrucciones tengan contenido relevante
        const hasRelevantKeywords = customInstructions.toLowerCase().includes('cumplimiento') ||
                                   customInstructions.toLowerCase().includes('normativ') ||
                                   customInstructions.toLowerCase().includes('regulación') ||
                                   customInstructions.toLowerCase().includes('análisis');

        if (!hasRelevantKeywords) {
            setIsInstructionsValidated(false);
            setCustomInstructions(defaultInstructions || '');
            toast({
                title: "Instrucciones Inválidas",
                description: "Las instrucciones deben estar relacionadas con análisis de cumplimiento normativo.",
                variant: "destructive",
                duration: 8000,
            });
        } else {
            setIsInstructionsValidated(true);
            toast({
                title: "Validación Exitosa",
                description: "Las instrucciones personalizadas han sido validadas correctamente.",
            });
        }
    } catch (error) {
        setIsInstructionsValidated(false);
        setCustomInstructions(defaultInstructions || '');
        const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado al validar.";
        toast({
            title: "Error de Validación",
            description: errorMessage,
            variant: "destructive",
        });
        console.error("Error validating custom instructions:", error);
    } finally {
        setIsInstructionValidationLoading(false);
    }
  };

  const cleanupProcess = (fileId: string): void => {
    isPausedRef.current.delete(fileId);
    abortControllerRef.current.delete(fileId);
    const timer = timerRef.current.get(fileId);
    if (timer) {
      clearInterval(timer);
      timerRef.current.delete(fileId);
    }
  };

  const getFriendlyErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        if (error.includes('504') || error.includes('deadline')) return 'El servidor tardó demasiado en responder (timeout). El chunk del documento era demasiado complejo. Por favor, intente de nuevo.';
        if (error.includes('API key')) return 'La clave de API para el servicio de IA no es válida o está ausente. Revise la configuración del servidor.';
        return error;
    }
    if (error instanceof Error) return getFriendlyErrorMessage(error.message);
    return 'Ocurrió un error inesperado durante el procesamiento.';
  };

  const handlePauseOrResume = (fileId: string) => {
    isPausedRef.current.set(fileId, !isPausedRef.current.get(fileId));
    setFolders(prev => prev.map((f: FolderData) => ({ ...f, files: f.files.map((file: DocumentFile) => file.id === fileId ? { ...file, status: isPausedRef.current.get(fileId) ? 'paused' : 'processing' } : file) })));
  };

  const handleCancel = (fileId: string, folderId: string) => {
    isPausedRef.current.set(fileId, true);
    abortControllerRef.current.get(fileId)?.abort();
    cleanupProcess(fileId);
    setFolders(prev => prev.map((f: FolderData) => f.id === folderId ? { ...f, files: f.files.filter((file: DocumentFile) => file.id !== fileId) } : f));
    toast({ title: "Proceso Cancelado", description: "La carga del archivo ha sido cancelada.", variant: "destructive" });
  };

  const processSingleDocument = async (rawFile: File, folderId: string) => {
    const tempId = `temp-${Date.now()}`;
    isPausedRef.current.set(tempId, false);
    abortControllerRef.current.set(tempId, new AbortController());

    const updateFileState = (update: Partial<DocumentFile>) => setFolders(prev => prev.map((f: FolderData) => f.id === folderId ? { ...f, files: f.files.map((file: DocumentFile) => file.id === tempId ? { ...file, ...update } : file) } : f));
    
    setFolders(prev => prev.map((f: FolderData) => f.id === folderId ? { ...f, files: [...f.files, { id: tempId, name: rawFile.name, content: '', status: 'processing', startTime: Date.now() }] } : f));
    
    try {
        const formData = new FormData();
        formData.append('file', rawFile);

        const response = await fetch('/api/extract-text', { 
            method: 'POST', 
            body: formData,
            signal: abortControllerRef.current.get(tempId)?.signal 
        });

        if (!response.ok) {
            throw new Error(getFriendlyErrorMessage(await response.text().catch(() => `Server error: ${response.status}`)));
        }

        const result = await response.json();
        
        updateFileState({ 
            status: 'success', 
            content: result.extractedText, 
            processingTime: (Date.now() - (folders.find((f: FolderData) => f.id === folderId)?.files.find((fi: DocumentFile) => fi.id === tempId)?.startTime ?? Date.now())) / 1000 
        });
        
        toast({ title: t('preparePage.toastFileUploaded'), description: t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name) });

    } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'Cancelled') {
            updateFileState({ 
                status: 'error', 
                error: getFriendlyErrorMessage(err), 
                processingTime: (Date.now() - (folders.find((f: FolderData) => f.id === folderId)?.files.find((fi: DocumentFile) => fi.id === tempId)?.startTime ?? Date.now())) / 1000 
            });
        }
    } finally {
        cleanupProcess(tempId);
    }
  };

  const handleFileUpload = async (rawFile: File, folderId: string): Promise<void> => {
    if (rawFile.name.endsWith('.zip')) {
        const jszip = new JSZip();
        try {
            const zip = await jszip.loadAsync(rawFile);
            const filesInZip = Object.values(zip.files).filter(file => !file.dir && !file.name.startsWith('__MACOSX/'));
            toast({ title: t('preparePage.unzippingZip'), description: t('preparePage.unzippingZipDesc').replace('{count}', filesInZip.length.toString()) });
            for (const zipEntry of filesInZip) {
                const fileBlob = await zipEntry.async('blob');
                const extension = zipEntry.name.split('.').pop()?.toLowerCase() || '';
                
                const mimeTypes: Record<string, string> = {
                  'pdf': 'application/pdf',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'txt': 'text/plain',
                  'md': 'text/markdown'
                };
                
                const file = new File([fileBlob], zipEntry.name, { 
                  type: mimeTypes[extension] || fileBlob.type 
                });
                
                if (file.type || ['pdf', 'docx', 'txt', 'md'].includes(extension)) {
                  await processSingleDocument(file, folderId);
                } else {
                  console.warn(`Skipping unsupported file in ZIP: ${zipEntry.name}`);
                }
            }
        } catch (error) {
            console.error('ZIP processing error:', error);
            toast({ title: t('preparePage.zipErrorTitle'), description: t('preparePage.zipErrorDesc'), variant: 'destructive' });
        }
    } else {
        await processSingleDocument(rawFile, folderId);
    }
  };
  
  const handleFileUploadedToRoot = (rawFile: File) => folders.length > 0 ? handleFileUpload(rawFile, folders[0].id) : toast({ title: t('preparePage.toastError'), description: t('preparePage.toastNoFolders'), variant: 'destructive' });

  const processSingleRegulation = async (rawFile: File) => {
    const tempId = `reg-${Date.now()}`;
    setRegulations((prev: Regulation[]) => [...prev, { id: tempId, name: rawFile.name, content: '', status: 'processing', startTime: Date.now() }]);
    const updateRegulationState = (id: string, update: Partial<Regulation>) => setRegulations((prev: Regulation[]) => prev.map((reg: Regulation) => reg.id === id ? { ...reg, ...update, processingTime: reg.startTime ? parseFloat(((Date.now() - reg.startTime) / 1000).toFixed(2)) : undefined } : reg));
    try {
        const formData = new FormData();
        formData.append('file', rawFile);
        const response = await fetch('/api/extract-text', { method: 'POST', body: formData });
        if (!response.ok) throw new Error(getFriendlyErrorMessage(await response.text().catch(() => `Server error: ${response.status}`)));
        updateRegulationState(tempId, { content: (await response.json()).extractedText || 'No se pudo extraer contenido.', status: 'success' });
        toast({ title: t('preparePage.toastFileUploaded'), description: t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name) });
    } catch (err) {
        updateRegulationState(tempId, { status: 'error', error: getFriendlyErrorMessage(err) });
    }
  };

  const handleRegulationUpload = async (rawFile: File): Promise<void> => {
     if (rawFile.name.endsWith('.zip')) {
        const jszip = new JSZip();
        try {
            const zip = await jszip.loadAsync(rawFile);
            const filesInZip = Object.values(zip.files).filter(file => !file.dir && !file.name.startsWith('__MACOSX/'));
            toast({ title: t('preparePage.unzippingZip'), description: t('preparePage.unzippingZipDesc').replace('{count}', filesInZip.length.toString()) });
            for (const zipEntry of filesInZip) {
                const fileBlob = await zipEntry.async('blob');
                const extension = zipEntry.name.split('.').pop()?.toLowerCase() || '';
                
                const mimeTypes: Record<string, string> = {
                  'pdf': 'application/pdf',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'txt': 'text/plain',
                  'md': 'text/markdown'
                };
                
                const file = new File([fileBlob], zipEntry.name, { 
                  type: mimeTypes[extension] || fileBlob.type 
                });
                
                if (file.type || ['pdf', 'docx', 'txt', 'md'].includes(extension)) {
                  await processSingleRegulation(file);
                } else {
                  console.warn(`Skipping unsupported file in ZIP: ${zipEntry.name}`);
                }
            }
        } catch (error) {
            console.error('ZIP processing error:', error);
            toast({ title: t('preparePage.zipErrorTitle'), description: t('preparePage.zipErrorDesc'), variant: 'destructive' });
        }
    } else {
        await processSingleRegulation(rawFile);
    }
  };

  const handleDismissRegulationError = (regulationId: string) => setRegulations((prev: Regulation[]) => prev.filter((r: Regulation) => r.id !== regulationId));

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) { toast({ title: t('preparePage.toastError'), description: t('preparePage.toastEmptyFolderName'), variant: "destructive" }); return; }
    setFolders(prev => [...prev, { id: `f${Date.now()}`, name: newFolderName, files: [], fileCount: 0 }]);
    toast({ title: t('preparePage.toastFolderCreated'), description: t('preparePage.toastFolderCreatedDesc').replace('{folderName}', newFolderName) });
    setNewFolderName('');
    setIsCreateFolderModalOpen(false);
  };

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    return folders
      .map(folder => ({ ...folder, files: folder.files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))}))
      .filter(folder => folder.files.length > 0);
  }, [searchQuery, folders]);
  
  const handleOpenRenameModal = (file: DocumentFile, folderId: string) => { setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content }); setNewFileName(file.name); setIsRenameModalOpen(true); };
  const handleRenameFile = () => {
    if (!fileToAction || !newFileName.trim()) return;
    setFolders(prev => prev.map((f: FolderData) => f.id === fileToAction.folderId ? { ...f, files: f.files.map((file: DocumentFile) => file.id === fileToAction.fileId ? { ...file, name: newFileName.trim() } : file) } : f));
    toast({ title: t('preparePage.renameFile'), description: `"${fileToAction.name}" ${t('preparePage.renamedTo')} "${newFileName.trim()}".` });
    setIsRenameModalOpen(false);
  };

  const handleOpenMoveModal = (file: DocumentFile, folderId: string) => { setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content }); setMoveToFolderId(null); setIsMoveModalOpen(true); };
  const handleMoveFile = () => {
    if (!fileToAction || !moveToFolderId) return;
    let fileToMove: DocumentFile | undefined;
    const foldersWithoutFile = folders.map((f: FolderData) => {
        if (f.id === fileToAction.folderId) {
            fileToMove = f.files.find((fi: DocumentFile) => fi.id === fileToAction.fileId);
            return { ...f, files: f.files.filter((fi: DocumentFile) => fi.id !== fileToAction.fileId) };
        }
        return f;
    });
    if (!fileToMove) return;
    setFolders(foldersWithoutFile.map((f: FolderData) => f.id === moveToFolderId ? { ...f, files: [...f.files, fileToMove!] } : f));
    toast({ title: t('preparePage.moveFile'), description: `"${fileToMove.name}" ${t('preparePage.movedTo')} "${folders.find((f: FolderData) => f.id === moveToFolderId)?.name}".` });
    setIsMoveModalOpen(false);
  };
  
  const handleOpenCancelConfirm = (fileId: string, folderId: string) => { setFileToCancel({ fileId, folderId }); setIsCancelConfirmOpen(true); };
  const handleConfirmCancel = () => { if (fileToCancel) handleCancel(fileToCancel.fileId, fileToCancel.folderId); setIsCancelConfirmOpen(false); };

  const handleOpenDeleteModal = (file: DocumentFile, folderId: string) => { setFileToAction({ fileId: file.id, folderId, name: file.name, content: file.content }); setIsDeleteModalOpen(true); };
  const handleDeleteFile = () => {
    if (!fileToAction) return;
    setFolders(prev => prev.map((f: FolderData) => f.id === fileToAction.folderId ? { ...f, files: f.files.filter((fi: DocumentFile) => fi.id !== fileToAction.fileId) } : f));
    if (selectedFileId === fileToAction.fileId) setSelectedFileId(null);
    toast({ title: t('preparePage.deleteFile'), description: `"${fileToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteModalOpen(false);
  };
  
  const handleDismissFileError = (fileId: string, folderId: string) => setFolders(prev => prev.map((f: FolderData) => f.id === folderId ? { ...f, files: f.files.filter((fi: DocumentFile) => fi.id !== fileId) } : f));

  const handleOpenRenameRegulationModal = (regulation: Regulation) => { setRegulationToAction({ id: regulation.id, name: regulation.name, content: regulation.content }); setNewRegulationName(regulation.name); setIsRenameRegulationModalOpen(true); };
  const handleRenameRegulation = () => {
    if (!regulationToAction || !newRegulationName.trim()) return;
    setRegulations(prev => prev.map((reg: Regulation) => reg.id === regulationToAction.id ? { ...reg, name: newRegulationName.trim() } : reg));
    toast({ title: 'Normativa Renombrada', description: `"${regulationToAction.name}" ${t('preparePage.renamedTo')} "${newRegulationName.trim()}".` });
    setIsRenameRegulationModalOpen(false);
  };

  const handleOpenDeleteRegulationModal = (regulation: Regulation) => { setRegulationToAction({ id: regulation.id, name: regulation.name, content: regulation.content }); setIsDeleteRegulationModalOpen(true); };
  const handleDeleteRegulation = () => {
    if (!regulationToAction) return;
    setRegulations(prev => prev.filter((r: Regulation) => r.id !== regulationToAction.id));
    setSelectedRegulationIds(prev => prev.filter(id => id !== regulationToAction.id));
    toast({ title: 'Normativa Eliminada', description: `"${regulationToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteRegulationModalOpen(false);
  };
  
  const handleOpenRenameFolderModal = (folder: {id: string, name: string}) => { setFolderToAction(folder); setRenamedFolderName(folder.name); setIsRenameFolderModalOpen(true); };
  const handleRenameFolder = () => {
    if (!folderToAction || !renamedFolderName.trim()) return;
    setFolders(prev => prev.map((f: FolderData) => f.id === folderToAction.id ? { ...f, name: renamedFolderName.trim() } : f));
    toast({ title: t('preparePage.renameFolderTitle'), description: `"${folderToAction.name}" ${t('preparePage.renamedTo')} "${renamedFolderName.trim()}".` });
    setIsRenameFolderModalOpen(false);
  };

  const handleOpenDeleteFolderModal = (folder: {id: string, name: string}) => { setFolderToAction(folder); setIsDeleteFolderModalOpen(true); };
  const handleDeleteFolder = () => {
    if (!folderToAction) return;
    if (folders.find((f: FolderData) => f.id === folderToAction.id)?.files.some((file: DocumentFile) => file.id === selectedFileId)) setSelectedFileId(null);
    setFolders(prev => prev.filter((f: FolderData) => f.id !== folderToAction.id));
    toast({ title: t('preparePage.deleteFolderTitle'), description: `"${folderToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteFolderModalOpen(false);
  };
  
  const currentViewFolders = expandedFolderId ? folders.filter((f: FolderData) => f.id === expandedFolderId) : filteredFolders;

  return (
    <div className="w-full p-4 md:p-8 text-foreground">
      <div className={cn("max-w-7xl mx-auto items-start", isModuleView ? "grid lg:grid-cols-3 gap-8" : "space-y-8")}>
        
        <div className={cn("animate-in fade-in duration-500", isModuleView ? "lg:col-span-2" : "w-full")}>
           <div className="bg-white/80 backdrop-blur-lg border border-slate-200/60 shadow-lg flex flex-col rounded-2xl">
              <CardHeader className='p-6 flex flex-row items-center justify-between'>
                <div className="flex items-center gap-3">
                  {isModuleView && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-foreground hover:bg-black/5" onClick={() => router.push('/select-module')}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <TitleIcon className="h-8 w-8 text-primary"/>
                  <h1 className="text-2xl font-bold text-foreground">
                      {title}: {t('preparePage.selectDocument')}
                  </h1>
                </div>
              </CardHeader>
              <div className="p-6 pt-0 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input placeholder={t('preparePage.searchPlaceholder')} className="pl-12 py-6 w-full bg-white text-foreground placeholder:text-slate-500 rounded-lg border-slate-300 focus:bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  {!isModuleView && (
                    <>
                      <FileUploadButton variant="outline" className="btn-neu-light rounded-xl py-3 px-5 w-full sm:w-auto flex-shrink-0" onFileSelect={handleFileUploadedToRoot}>
                        <Upload className="mr-2 h-4 w-4" />{t('preparePage.uploadFile')}
                      </FileUploadButton>
                      <Button variant="outline" className="btn-neu-light rounded-xl py-3 px-5 w-full sm:w-auto flex-shrink-0" onClick={() => setIsCreateFolderModalOpen(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" />{t('preparePage.newFolder')}
                      </Button>
                    </>
                  )}
                </div>
                <FolderGrid 
                    folders={currentViewFolders} 
                    selectedFileId={selectedFileId} 
                    onSelectFile={setSelectedFileId} 
                    searchQuery={searchQuery} 
                    onFileUploadToFolder={handleFileUpload} 
                    onRenameFile={handleOpenRenameModal} 
                    onMoveFile={handleOpenMoveModal} 
                    onDeleteFile={handleOpenDeleteModal} 
                    onDismissError={(file, folderId) => handleDismissFileError(file.id, folderId)} 
                    onRenameFolder={handleOpenRenameFolderModal} 
                    onDeleteFolder={handleOpenDeleteFolderModal} 
                    onPauseOrResume={handlePauseOrResume} 
                    onCancel={handleOpenCancelConfirm}
                    expandedFolderId={expandedFolderId}
                    setExpandedFolderId={setExpandedFolderId}
                />
              </div>
            </div>
        </div>

        <div className={cn("lg:col-span-1 sticky top-28 flex flex-col gap-8", isModuleView ? "flex" : "hidden")}>
            <div className="bg-slate-50/50 backdrop-blur-sm border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow flex flex-col rounded-2xl">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                     <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-black/5 [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-200/80">
                       <div className="w-full text-left flex items-center justify-between group">
                          <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                               <BookCheck className="h-6 w-6 text-primary"/>
                               Normas del Módulo
                           </h2>
                           <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]:rotate-90" />
                         </div>
                     </AccordionTrigger>
                     <AccordionContent className="p-4 pt-0">
                         <RegulationList 
                             isModuleView={true}
                             regulations={preconfiguredRegulations || []}
                             selectedIds={selectedRegulationIds}
                             onSelectionChange={() => {}}
                         />
                     </AccordionContent>
                   </AccordionItem>
                 </Accordion>
               </div>

            <div className="bg-slate-50/50 backdrop-blur-sm border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow flex flex-col rounded-2xl">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:bg-black/5 [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-200/80">
                      <div className="w-full text-left flex items-center justify-between group">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                            <TerminalSquare className="h-6 w-6 text-primary"/>
                            Instrucciones del Módulo
                        </h2>
                        <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]:rotate-90" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <p className="text-sm text-slate-600 mb-4">
                          Estas son las directivas predefinidas para el análisis. Puede editarlas para enfocar la búsqueda, pero sus cambios serán revisados por Mila para asegurar la integridad del proceso.
                        </p>
                        <Textarea
                          value={customInstructions}
                          onChange={e => {
                              setCustomInstructions(e.target.value);
                              setIsInstructionsValidated(false);
                          }}
                          placeholder="Ej: 'Prestar especial atención a los plazos de entrega y las multas por incumplimiento...'"
                          rows={6}
                          className="bg-white/70 placeholder-slate-500 border-slate-300 focus:bg-white"
                        />
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleValidateInstructions} disabled={isInstructionValidationLoading || isInstructionsValidated} className="btn-bg-image">
                                {isInstructionValidationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Validar
                            </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
               </div>
        </div>

         <div className={cn(isModuleView ? "hidden" : "block", "w-full")}>
            <div className="bg-slate-50/50 backdrop-blur-sm border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow flex flex-col rounded-2xl">
                <div className="p-6 border-b border-slate-200/80">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                        <BookCheck className="h-7 w-7 text-primary"/>
                        {t('preparePage.step2')}
                    </h2>
                </div>
                <div className="p-6">
                    <RegulationList
                        isModuleView={false}
                        regulations={regulations}
                        selectedIds={selectedRegulationIds}
                        onSelectionChange={setSelectedRegulationIds}
                        onRegulationUpload={handleRegulationUpload}
                        onDismissError={handleDismissRegulationError}
                        onRename={handleOpenRenameRegulationModal}
                        onDelete={handleOpenDeleteRegulationModal}
                    />
                </div>
              </div>
        </div>
        
        {isValidationReady && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl animate-in slide-in-from-bottom-full fade-in duration-700 ease-out z-20">
                <div className="bg-slate-100/80 backdrop-blur-lg border border-slate-200/60 p-4 mx-4 rounded-2xl flex items-center justify-between gap-6 shadow-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <CheckCircle2 className="h-7 w-7 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                             <span className="text-xs text-muted-foreground">{t('preparePage.selectedFilePrompt')}</span>
                             <p className="font-semibold text-foreground truncate" title={selectedFile?.name}>{selectedFile?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button className="btn-bg-image py-3 px-4 rounded-xl" onClick={handleValidate} disabled={!isValidationReady}>{t('preparePage.validateButton')}<ChevronRight className="ml-1 h-5 w-5" /></Button>
                    </div>
                </div>
            </div>
        )}
      </div>

      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.createFolderTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="folder-name" className="text-foreground">{t('preparePage.folderNameLabel')}</Label>
            <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder={t('preparePage.folderNamePlaceholder')} className="bg-white/70" />
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild><Button variant="ghost" onClick={() => setNewFolderName('')}>{t('preparePage.cancel')}</Button></DialogClose>
            <Button onClick={handleCreateFolder}>{t('preparePage.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.renameFile')}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2"><Label htmlFor="file-name">{t('preparePage.newFileNameLabel').replace('{fileName}', fileToAction?.name || '')}</Label><Input id="file-name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} /></div>
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button onClick={handleRenameFile}>{t('preparePage.rename')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.moveFile')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2"><p>{t('preparePage.moveFileToLabel').replace('{fileName}', fileToAction?.name || '')}</p>
            <RadioGroup value={moveToFolderId ?? ""} onValueChange={setMoveToFolderId} className="max-h-60 overflow-y-auto">
              {folders.filter((f: FolderData) => f.id !== fileToAction?.folderId).map((folder: FolderData) => (<div key={folder.id} className="flex items-center space-x-2"><RadioGroupItem value={folder.id} id={`move-${folder.id}`} /><Label htmlFor={`move-${folder.id}`}>{folder.name}</Label></div>))}
            </RadioGroup>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button onClick={handleMoveFile} disabled={!moveToFolderId}>{t('preparePage.move')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.confirmDeleteTitle')}</DialogTitle></DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteDesc').replace('{fileName}', `<strong>${fileToAction?.name || ''}</strong>`)}} />
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button variant="destructive" onClick={handleDeleteFile}>{t('preparePage.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
            <DialogHeader><DialogTitle>Confirmar Cancelación</DialogTitle><DialogDescription>¿Está seguro de que desea cancelar el procesamiento de este archivo? Todo el progreso se perderá.</DialogDescription></DialogHeader>
            <DialogFooter><DialogClose asChild><Button variant="ghost">Volver</Button></DialogClose><Button variant="destructive" onClick={handleConfirmCancel}>Sí, Cancelar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameRegulationModalOpen} onOpenChange={setIsRenameRegulationModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.renameRegulation')}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2"><Label htmlFor="regulation-name">{t('preparePage.newRegulationNameLabel').replace('{regulationName}', regulationToAction?.name || '')}</Label><Input id="regulation-name" value={newRegulationName} onChange={(e) => setNewRegulationName(e.target.value)} /></div>
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button onClick={handleRenameRegulation}>{t('preparePage.rename')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteRegulationModalOpen} onOpenChange={setIsDeleteRegulationModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.confirmDeleteRegulationTitle')}</DialogTitle></DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteRegulationDesc').replace('{regulationName}', `<strong>${regulationToAction?.name || ''}</strong>`)}} />
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button variant="destructive" onClick={handleDeleteRegulation}>{t('preparePage.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRenameFolderModalOpen} onOpenChange={setIsRenameFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.renameFolderTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2"><Label htmlFor="renamed-folder-name">{t('preparePage.newFolderNameLabel').replace('{folderName}', folderToAction?.name || '')}</Label><Input id="renamed-folder-name" value={renamedFolderName} onChange={(e) => setRenamedFolderName(e.target.value)} /></div>
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button onClick={handleRenameFolder}>{t('preparePage.rename')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteFolderModalOpen} onOpenChange={setIsDeleteFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader><DialogTitle>{t('preparePage.confirmDeleteFolderTitle')}</DialogTitle></DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteFolderDesc').replace('{folderName}', `<strong>${folderToAction?.name || ''}</strong>`)}} />
          <DialogFooter><DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose><Button variant="destructive" onClick={handleDeleteFolder}>{t('preparePage.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}