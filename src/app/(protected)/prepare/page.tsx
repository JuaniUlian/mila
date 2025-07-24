
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
import mammoth from 'mammoth';
import type { ExtractTextFromFileOutput, ExtractTextFromFileInput } from '@/ai/flows/extract-text-from-file';
import JSZip from 'jszip';


type File = {
  id: string;
  name: string;
  content: string;
  status?: 'uploading' | 'processing' | 'error' | 'success';
  error?: string;
  startTime?: number;
  processingTime?: number;
  estimatedTime?: number;
};

type Regulation = {
    id: string;
    name: string;
    content: string;
    status?: 'processing' | 'error' | 'success';
    error?: string;
    startTime?: number;
    processingTime?: number;
    estimatedTime?: number;
};

// Mock Data
const initialFolders = [
  { id: 'f1', name: 'Pliegos 2025', files: [
    { id: 'file1', name: 'Pliego de Bases y Condiciones.pdf', content: 'Contenido simulado del Pliego de Bases y Condiciones. Este documento establece las reglas para la licitación.', status: 'success' as const },
    { id: 'file2', name: 'Anexo I - Especificaciones Técnicas.docx', content: 'Contenido simulado del Anexo I. Detalla los requisitos técnicos de los bienes o servicios a contratar.', status: 'success' as const },
    { id: 'file3', name: 'Anexo II - Minuta de Contrato.pdf', content: 'Contenido simulado del Anexo II. Es el borrador del contrato que se firmará con el adjudicatario.', status: 'success' as const },
  ]},
  { id: 'f2', name: 'Contrataciones Directas', files: [
    { id: 'file-ups', name: '3118772 SERV RECAMBIO UPS 96 FJS (1)', content: 'SOLICITUD: Se solicita con carácter de URGENTE la adquisición e instalación de un (1) sistema de aire acondicionado de precisión y un (1) equipo UPS para el centro de datos principal de la Entidad.\nPROCEDIMIENTO: El presente trámite se sustanciará bajo la modalidad de Licitación Pública.\nPRESUPUESTO OFICIAL: Se adjunta como referencia el presupuesto N° 1234 de la firma EXCELCOM S.A. por un total de USD 50.000.\nPLAZO DE EJECUCIÓN: El plazo máximo para la entrega e instalación será de ciento veinte (120) días.', status: 'success' as const },
    { id: 'file4', name: 'Informe de Contratación Directa.docx', content: 'Contenido simulado del Informe de Contratación Directa.', status: 'success' as const }
  ]},
  { id: 'f3', name: 'Expedientes', files: [
    { id: 'file5', name: 'Resolución de Apertura.pdf', content: 'Contenido simulado de la Resolución de Apertura.', status: 'success' as const },
    { id: 'file6', 'name': 'Dictamen Jurídico Previo.pdf', content: 'Contenido simulado del Dictamen Jurídico Previo.', status: 'success' as const },
  ]},
  { id: 'f4', name: 'Decretos', files: [] },
];

const initialRegulations: Regulation[] = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...', status: 'success' },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' },
    { id: 'reg5', name: 'Decreto 795/96', content: 'Contenido del Decreto 795/96...', status: 'success' },
    { id: 'reg-9353', name: 'Ley 9353', content: 'Contenido detallado de la Ley 9353...', status: 'success' },
];

const FOLDERS_STORAGE_KEY = 'mila-prepare-folders';
const REGULATIONS_STORAGE_KEY = 'mila-prepare-regulations';

const estimateProcessingTime = (file: globalThis.File): number => {
    const sizeInMB = file.size / (1024 * 1024);
    const baseTime = 2; // seconds

    if (file.name.endsWith('.pdf')) {
        // PDFs are slower due to OCR
        return baseTime + sizeInMB * 15; // 15 seconds per MB
    }
    if (file.name.endsWith('.docx')) {
        return baseTime + sizeInMB * 5; // 5 seconds per MB
    }
    // Text files
    return baseTime + sizeInMB * 2; // 2 seconds per MB
};

// Function to call the Genkit flow via a direct HTTP request
async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const response = await fetch('/api/genkit/extractTextFromFile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Genkit API error response:", errorBody);
    throw new Error(`Server returned status ${response.status}: ${errorBody || response.statusText}`);
  }

  return response.json();
}


export default function PreparePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [folders, setFolders] = useState(() => initialFolders.map(f => ({ ...f, files: f.files as File[], fileCount: f.files.length })));
  const [regulations, setRegulations] = useState<Regulation[]>(initialRegulations);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // State for file actions
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  type FileIdentifier = { fileId: string; folderId: string; name: string; content: string; } | null;
  const [fileToAction, setFileToAction] = useState<FileIdentifier>(null);
  const [newFileName, setNewFileName] = useState('');
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);

  // State for regulation actions
  const [isRenameRegulationModalOpen, setIsRenameRegulationModalOpen] = useState(false);
  const [isDeleteRegulationModalOpen, setIsDeleteRegulationModalOpen] = useState(false);
  type RegulationIdentifier = { id: string; name: string; content: string; } | null;
  const [regulationToAction, setRegulationToAction] = useState<RegulationIdentifier>(null);
  const [newRegulationName, setNewRegulationName] = useState('');
  
  // State for folder actions
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  type FolderIdentifier = { id: string; name: string } | null;
  const [folderToAction, setFolderToAction] = useState<FolderIdentifier>(null);
  const [renamedFolderName, setRenamedFolderName] = useState('');


  const [loadedFromStorage, setLoadedFromStorage] = useState(false);


  // Load from localStorage on mount
  useEffect(() => {
    document.title = 'MILA | Más Inteligencia Legal y Administrativa';
    
    try {
        const savedFoldersRaw = localStorage.getItem(FOLDERS_STORAGE_KEY);
        if (savedFoldersRaw) {
            const savedFolders = JSON.parse(savedFoldersRaw);
            // Ensure all files have a success status if they don't have one
            const sanitizedFolders = savedFolders.map((folder: any) => ({
                ...folder,
                files: folder.files.map((file: any) => ({
                    ...file,
                    status: file.status || 'success'
                }))
            }));
            setFolders(sanitizedFolders);
        }
        
        const savedRegulationsRaw = localStorage.getItem(REGULATIONS_STORAGE_KEY);
        if (savedRegulationsRaw) {
            const savedRegulations = JSON.parse(savedRegulationsRaw);
            // Add status for backward compatibility
            const sanitizedRegulations = savedRegulations.map((reg: any) => ({
                ...reg,
                status: reg.status || 'success'
            }));
            setRegulations(sanitizedRegulations);
        }
    } catch (error) {
        console.error('Error loading data from localStorage', error);
    }
    setLoadedFromStorage(true);
  }, []);

  // Save to localStorage on changes, but only after initial load
  useEffect(() => {
    if (loadedFromStorage) {
        try {
            const foldersToSave = folders.map(folder => ({
                ...folder,
                files: folder.files.filter(file => file.status === 'success') // Only save successful files
            }));
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(foldersToSave));
        } catch (error) {
            console.error('Error saving folders to localStorage', error);
        }
    }
  }, [folders, loadedFromStorage]);

  useEffect(() => {
      if (loadedFromStorage) {
          try {
              const regulationsToSave = regulations.filter(reg => reg.status === 'success');
              localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(regulationsToSave));
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
    if (!isValidationReady || !selectedFile) return;

    const selectedRegulationsData = regulations
        .filter(r => selectedRegulationIds.includes(r.id) && r.status === 'success')
        .map(r => ({ name: r.name, content: r.content }));
    
    localStorage.setItem('selectedRegulations', JSON.stringify(selectedRegulationsData));
    localStorage.setItem('selectedDocumentName', selectedFile.name);
    localStorage.setItem('selectedDocumentContent', selectedFile.content);
    router.push('/loading');
  };
  
  const showToast = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const getFriendlyErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        try {
            const parsed = JSON.parse(error);
            if (parsed.message) return parsed.message;
        } catch(e) {
            // Not a JSON string, return as is
        }
        return error;
    }
    if (error instanceof Error) {
        // For Genkit errors or others that might not be JSON
        if (error.message.includes('deadline')) {
            return 'The request to the AI server timed out. Please try again.';
        }
        if (error.message.includes('API key')) {
            return 'The AI API key is invalid or missing. Please check your server configuration.';
        }
        if (error.message.includes('status 500')) {
             return 'An unexpected response was received from the server.'
        }
        if (error.message.includes('Failed to fetch')) {
             return 'Could not connect to the processing server. Please check your connection and try again.';
        }
        return error.message;
    }
    return 'An unexpected error occurred during processing.';
  }

  const processSingleDocument = async (rawFile: globalThis.File, folderId: string) => {
    if (rawFile.name.endsWith('.zip')) {
        toast({
            title: t('preparePage.unsupportedInZip'),
            description: t('preparePage.unsupportedInZipDesc').replace('{fileName}', rawFile.name),
            variant: 'destructive',
        });
        return;
    }

    const tempId = `temp-${Date.now()}`;
    const estimatedTime = estimateProcessingTime(rawFile);
    const filePlaceholder: File = {
      id: tempId,
      name: rawFile.name,
      content: '',
      status: 'uploading',
      startTime: Date.now(),
      estimatedTime,
    };

    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId
          ? { ...folder, files: [...folder.files, filePlaceholder] }
          : folder
      )
    );

    const reader = new FileReader();
    reader.onload = async (e) => {
      setFolders(prev => prev.map(f => ({ ...f, files: f.files.map(file => file.id === tempId ? { ...file, status: 'processing' } : file) })));
      const fileData = e.target?.result;
      
      try {
        if (!fileData) throw new Error("Could not read file data.");
        
        let extractedContent: string;
        if (rawFile.name.endsWith('.docx')) {
          extractedContent = (await mammoth.extractRawText({ arrayBuffer: fileData as ArrayBuffer })).value;
        } else if (rawFile.name.endsWith('.pdf')) {
          extractedContent = (await extractTextFromFile({ fileDataUri: fileData as string })).extractedText;
        } else if (rawFile.type.startsWith('text/')) {
          extractedContent = fileData as string;
        } else {
          throw new Error('Unsupported file type.');
        }

        setFolders(prevFolders =>
          prevFolders.map(folder => ({
            ...folder,
            files: folder.files.map(f => {
              if (f.id === tempId) {
                const processingTime = f.startTime ? parseFloat(((Date.now() - f.startTime) / 1000).toFixed(2)) : undefined;
                return { ...f, content: extractedContent || "No content extracted.", status: 'success', processingTime };
              }
              return f;
            }),
          }))
        );
        showToast(t('preparePage.toastFileUploaded'), t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name));
      
      } catch (err) {
        const errorMessage = getFriendlyErrorMessage(err);
        setFolders(prevFolders =>
          prevFolders.map(folder => ({
            ...folder,
            files: folder.files.map(f => {
              if (f.id === tempId) {
                const processingTime = f.startTime ? parseFloat(((Date.now() - f.startTime) / 1000).toFixed(2)) : undefined;
                return { ...f, status: 'error', error: errorMessage, processingTime };
              }
              return f;
            }),
          }))
        );
      }
    };
    
    reader.onerror = () => {
        const errorMessage = 'Error reading file data.';
        setFolders(prevFolders =>
          prevFolders.map(folder => ({
            ...folder,
            files: folder.files.map(f => {
              if (f.id === tempId) {
                const processingTime = f.startTime ? parseFloat(((Date.now() - f.startTime) / 1000).toFixed(2)) : undefined;
                return { ...f, status: 'error', error: errorMessage, processingTime };
              }
              return f;
            }),
          }))
        );
    };

    if (rawFile.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(rawFile);
    } else if (rawFile.name.endsWith('.pdf')) {
      reader.readAsDataURL(rawFile);
    } else if (rawFile.type.startsWith('text/')) {
      reader.readAsText(rawFile);
    } else {
      const errorMessage = 'Unsupported file type.';
      setFolders(prevFolders =>
        prevFolders.map(folder => ({
          ...folder,
          files: folder.files.map(f => {
            if (f.id === tempId) {
              const processingTime = f.startTime ? parseFloat(((Date.now() - f.startTime) / 1000).toFixed(2)) : undefined;
              return { ...f, status: 'error', error: errorMessage, processingTime };
            }
            return f;
          }),
        }))
      );
    }
  };

  const handleFileUpload = async (rawFile: globalThis.File, folderId: string) => {
    if (rawFile.name.endsWith('.zip')) {
        const jszip = new JSZip();
        try {
            const zip = await jszip.loadAsync(rawFile);
            const filesInZip = Object.values(zip.files).filter(file => !file.dir && !file.name.startsWith('__MACOSX/'));

            toast({
                title: t('preparePage.unzippingZip'),
                description: t('preparePage.unzippingZipDesc').replace('{count}', filesInZip.length.toString())
            });

            for (const zipEntry of filesInZip) {
                const fileBlob = await zipEntry.async('blob');
                const supportedTypes: { [key: string]: string } = {
                  'pdf': 'application/pdf',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'txt': 'text/plain',
                  'md': 'text/markdown'
                };
                const ext = zipEntry.name.split('.').pop()?.toLowerCase() || '';
                const file = new File([fileBlob], zipEntry.name, { type: supportedTypes[ext] || fileBlob.type });
                await processSingleDocument(file, folderId);
            }
        } catch (error) {
            console.error("Error processing zip file", error);
            toast({
                title: t('preparePage.zipErrorTitle'),
                description: t('preparePage.zipErrorDesc'),
                variant: 'destructive',
            });
        }
    } else {
        await processSingleDocument(rawFile, folderId);
    }
  };

  const handleFileUploadToFolder = (rawFile: globalThis.File, folderId: string) => {
    handleFileUpload(rawFile, folderId);
  };
  
  const handleFileUploadedToRoot = (rawFile: globalThis.File) => {
    if (folders.length > 0) {
      handleFileUpload(rawFile, folders[0].id);
    } else {
       toast({
          title: t('preparePage.toastError'),
          description: t('preparePage.toastNoFolders'),
          variant: 'destructive', 
        });
    }
  };
  
  const processSingleRegulation = async (rawFile: globalThis.File) => {
    if (rawFile.name.endsWith('.zip')) {
        toast({
            title: t('preparePage.unsupportedInZip'),
            description: t('preparePage.unsupportedInZipDesc').replace('{fileName}', rawFile.name),
            variant: 'destructive',
        });
        return;
    }

    const tempId = `reg-${Date.now()}`;
    const estimatedTime = estimateProcessingTime(rawFile);
    const regulationPlaceholder: Regulation = {
        id: tempId,
        name: rawFile.name,
        content: '',
        status: 'processing',
        startTime: Date.now(),
        estimatedTime,
    };

    setRegulations(prev => [...prev, regulationPlaceholder]);

    const updateRegulationState = (id: string, update: Partial<Regulation>) => {
      setRegulations(prev =>
        prev.map(reg => {
          if (reg.id === id) {
            const processingTime = reg.startTime ? parseFloat(((Date.now() - reg.startTime) / 1000).toFixed(2)) : undefined;
            return { ...reg, ...update, processingTime };
          }
          return reg;
        })
      );
    };

    const handleError = (errorMsg: string) => {
      updateRegulationState(tempId, { status: 'error', error: errorMsg });
      toast({
        title: `Error al procesar ${rawFile.name}`,
        description: errorMsg,
        variant: 'destructive',
      });
    };
    
    const reader = new FileReader();

    try {
      if (rawFile.name.endsWith('.docx')) {
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result;
          if (arrayBuffer) {
            try {
              const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer as ArrayBuffer });
              updateRegulationState(tempId, { 
                  content: result.value || 'No se pudo extraer contenido.',
                  status: 'success'
              });
              toast({
                title: t('preparePage.toastFileUploaded'),
                description: t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name),
              });
            } catch (err) {
               handleError('Falló al analizar el archivo .docx.');
            }
          }
        };
        reader.readAsArrayBuffer(rawFile);
      } else if (rawFile.name.endsWith('.pdf')) {
        reader.onload = async (e) => {
          const fileDataUri = e.target?.result as string;
          if (fileDataUri) {
            try {
              const result = await extractTextFromFile({ fileDataUri });
              updateRegulationState(tempId, { 
                  content: result.extractedText || 'No se pudo extraer texto del PDF.',
                  status: 'success'
              });
              toast({
                title: t('preparePage.toastFileUploaded'),
                description: t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name),
              });
            } catch (error) {
              handleError(getFriendlyErrorMessage(error));
            }
          }
        };
        reader.readAsDataURL(rawFile);
      } else if (rawFile.type.startsWith('text/')) {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          updateRegulationState(tempId, { 
              content: content || "No se pudo leer el contenido.",
              status: 'success'
          });
          toast({
            title: t('preparePage.toastFileUploaded'),
            description: t('preparePage.toastFileAdded').replace('{fileName}', rawFile.name),
          });
        };
        reader.readAsText(rawFile);
      } else {
        handleError('Tipo de archivo no soportado para normativas.');
      }
    } catch (err) {
      handleError(getFriendlyErrorMessage(err));
    }
  };

  const handleRegulationUpload = async (rawFile: globalThis.File) => {
     if (rawFile.name.endsWith('.zip')) {
        const jszip = new JSZip();
        try {
            const zip = await jszip.loadAsync(rawFile);
            const filesInZip = Object.values(zip.files).filter(file => !file.dir && !file.name.startsWith('__MACOSX/'));
            
            toast({
                title: t('preparePage.unzippingZip'),
                description: t('preparePage.unzippingZipDesc').replace('{count}', filesInZip.length.toString())
            });
            
            for (const zipEntry of filesInZip) {
                const fileBlob = await zipEntry.async('blob');
                const supportedTypes: {[key: string]: string} = {
                  'pdf': 'application/pdf',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'txt': 'text/plain',
                  'md': 'text/markdown'
                };
                const ext = zipEntry.name.split('.').pop()?.toLowerCase() || '';
                const file = new File([fileBlob], zipEntry.name, { type: supportedTypes[ext] || fileBlob.type });
                await processSingleRegulation(file);
            }
        } catch (error) {
            console.error("Error processing zip file", error);
            toast({
                title: t('preparePage.zipErrorTitle'),
                description: t('preparePage.zipErrorDesc'),
                variant: 'destructive',
            });
        }
    } else {
        await processSingleRegulation(rawFile);
    }
  };


  const handleDismissRegulationError = (regulationId: string) => {
    setRegulations(prev => prev.filter(r => r.id !== regulationId));
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
        return { ...folder, files: matchingFiles };
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
            const updatedFiles = folder.files.filter(f => f.id !== fileToAction.fileId);
            return { ...folder, files: updatedFiles, fileCount: updatedFiles.length };
        }
        return folder;
    });
    if (!fileToMove) return;
    const foldersWithMovedFile = foldersWithoutFile.map(folder => {
        if (folder.id === moveToFolderId) {
            const updatedFiles = [...folder.files, fileToMove!];
            return { ...folder, files: updatedFiles, fileCount: updatedFiles.length };
        }
        return folder;
    });
    setFolders(foldersWithMovedFile);
    toast({ title: t('preparePage.moveFile'), description: `"${fileToMove.name}" ${t('preparePage.movedTo')} "${folders.find(f => f.id === moveToFolderId)?.name}".` });
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
          const updatedFiles = folder.files.filter(f => f.id !== fileToAction.fileId);
          return { ...folder, files: updatedFiles, fileCount: updatedFiles.length };
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
  
  const handleDismissFileError = (fileToDismiss: File, folderId: string) => {
     setFolders(prevFolders =>
      prevFolders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, files: folder.files.filter(f => f.id !== fileToDismiss.id) };
        }
        return folder;
      })
    );
  };

  // Regulation action handlers
  const handleOpenRenameRegulationModal = (regulation: Regulation) => {
    setRegulationToAction({ id: regulation.id, name: regulation.name, content: regulation.content });
    setNewRegulationName(regulation.name);
    setIsRenameRegulationModalOpen(true);
  };

  const handleRenameRegulation = () => {
    if (!regulationToAction || !newRegulationName.trim()) {
      toast({ title: t('preparePage.toastError'), description: 'El nombre no puede estar vacío.', variant: 'destructive' });
      return;
    }
    setRegulations(prevRegulations =>
      prevRegulations.map(reg =>
        reg.id === regulationToAction.id ? { ...reg, name: newRegulationName.trim() } : reg
      )
    );
    toast({ title: 'Normativa Renombrada', description: `"${regulationToAction.name}" ${t('preparePage.renamedTo')} "${newRegulationName.trim()}".` });
    setIsRenameRegulationModalOpen(false);
    setRegulationToAction(null);
  };

  const handleOpenDeleteRegulationModal = (regulation: Regulation) => {
    setRegulationToAction({ id: regulation.id, name: regulation.name, content: regulation.content });
    setIsDeleteRegulationModalOpen(true);
  };

  const handleDeleteRegulation = () => {
    if (!regulationToAction) return;

    setRegulations(prevRegulations =>
      prevRegulations.filter(r => r.id !== regulationToAction.id)
    );
    
    setSelectedRegulationIds(prevIds => prevIds.filter(id => id !== regulationToAction.id));

    toast({ title: 'Normativa Eliminada', description: `"${regulationToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteRegulationModalOpen(false);
    setRegulationToAction(null);
  };

  // Folder action handlers
  const handleOpenRenameFolderModal = (folder: {id: string, name: string}) => {
    setFolderToAction(folder);
    setRenamedFolderName(folder.name);
    setIsRenameFolderModalOpen(true);
  };

  const handleRenameFolder = () => {
    if (!folderToAction || !renamedFolderName.trim()) {
      toast({ title: t('preparePage.toastError'), description: t('preparePage.toastEmptyFolderName'), variant: 'destructive' });
      return;
    }
    setFolders(prevFolders =>
      prevFolders.map(f =>
        f.id === folderToAction.id ? { ...f, name: renamedFolderName.trim() } : f
      )
    );
    toast({ title: t('preparePage.renameFolderTitle'), description: `"${folderToAction.name}" ${t('preparePage.renamedTo')} "${renamedFolderName.trim()}".` });
    setIsRenameFolderModalOpen(false);
    setFolderToAction(null);
  };

  const handleOpenDeleteFolderModal = (folder: {id: string, name: string}) => {
    setFolderToAction(folder);
    setIsDeleteFolderModalOpen(true);
  };

  const handleDeleteFolder = () => {
    if (!folderToAction) return;

    const folderToDelete = folders.find(f => f.id === folderToAction.id);
    if (!folderToDelete) return;

    const fileIsSelectedInFolder = folderToDelete.files.some(file => file.id === selectedFileId);
    if (fileIsSelectedInFolder) {
      setSelectedFileId(null);
    }

    setFolders(prevFolders =>
      prevFolders.filter(f => f.id !== folderToAction.id)
    );
    
    toast({ title: t('preparePage.deleteFolderTitle'), description: `"${folderToAction.name}" ${t('preparePage.deletedSuccess')}`, variant: 'destructive' });
    setIsDeleteFolderModalOpen(false);
    setFolderToAction(null);
  };


  return (
    <div 
        className="w-full p-4 md:p-8 text-foreground"
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
                            variant="outline"
                            className="btn-neu-light rounded-xl py-3 px-5 w-full sm:w-auto flex-shrink-0"
                            onFileSelect={handleFileUploadedToRoot}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {t('preparePage.uploadFile')}
                        </FileUploadButton>
                        <Button
                            variant="outline"
                            suppressHydrationWarning
                            className="btn-neu-light rounded-xl py-3 px-5 w-full sm:w-auto flex-shrink-0"
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
                          onDismissError={handleDismissFileError}
                          onRenameFolder={handleOpenRenameFolderModal}
                          onDeleteFolder={handleOpenDeleteFolderModal}
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
                        <AccordionTrigger suppressHydrationWarning className="w-full p-0 hover:no-underline [&[data-state=open]]:bg-white/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-white/20" onClick={(e) => {
                            // Prevents the click from propagating and selecting the row
                            e.preventDefault();
                            e.stopPropagation();
                            // Manually toggle the accordion
                            const trigger = e.currentTarget;
                            const content = trigger.nextElementSibling;
                            if (trigger.getAttribute('data-state') === 'open') {
                                trigger.setAttribute('data-state', 'closed');
                                if(content) content.setAttribute('data-state', 'closed');
                            } else {
                                trigger.setAttribute('data-state', 'open');
                                if(content) content.setAttribute('data-state', 'open');
                            }
                        }}>
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
                                onDismissError={handleDismissRegulationError}
                                onRename={handleOpenRenameRegulationModal}
                                onDelete={handleOpenDeleteRegulationModal}
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

      {/* Regulation Action Dialogs */}
      <Dialog open={isRenameRegulationModalOpen} onOpenChange={setIsRenameRegulationModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.renameRegulation')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="regulation-name">{t('preparePage.newRegulationNameLabel').replace('{regulationName}', regulationToAction?.name || '')}</Label>
            <Input id="regulation-name" value={newRegulationName} onChange={(e) => setNewRegulationName(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button onClick={handleRenameRegulation}>{t('preparePage.rename')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteRegulationModalOpen} onOpenChange={setIsDeleteRegulationModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.confirmDeleteRegulationTitle')}</DialogTitle>
          </DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteRegulationDesc').replace('{regulationName}', `<strong>${regulationToAction?.name || ''}</strong>`)}} />
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteRegulation}>{t('preparePage.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Folder Action Dialogs */}
      <Dialog open={isRenameFolderModalOpen} onOpenChange={setIsRenameFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.renameFolderTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="renamed-folder-name">{t('preparePage.newFolderNameLabel').replace('{folderName}', folderToAction?.name || '')}</Label>
            <Input id="renamed-folder-name" value={renamedFolderName} onChange={(e) => setRenamedFolderName(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button onClick={handleRenameFolder}>{t('preparePage.rename')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteFolderModalOpen} onOpenChange={setIsDeleteFolderModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-xl border-white/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('preparePage.confirmDeleteFolderTitle')}</DialogTitle>
          </DialogHeader>
          <p dangerouslySetInnerHTML={{ __html: t('preparePage.confirmDeleteFolderDesc').replace('{folderName}', `<strong>${folderToAction?.name || ''}</strong>`)}} />
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('preparePage.cancel')}</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteFolder}>{t('preparePage.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    

    