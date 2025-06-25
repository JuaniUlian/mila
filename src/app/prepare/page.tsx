
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { RegulationList } from '@/components/prepare/regulation-list';
import { Search, Upload, FileSignature, BookCheck } from 'lucide-react';
import { FileUploadButton } from '@/components/prepare/file-upload-button';
import { useToast } from '@/hooks/use-toast';

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
  const [folders, setFolders] = useState(initialFolders.map(f => ({ ...f, fileCount: f.files.length })));
  const [regulations, setRegulations] = useState(initialRegulations);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isValidationReady = selectedFileId !== null && selectedRegulationIds.length > 0;

  const handleValidate = () => {
    if (isValidationReady) {
      router.push('/loading');
    }
  };
  
  const showToast = (fileName: string) => {
    toast({
      title: "Archivo Subido (Simulado)",
      description: `El archivo "${fileName}" se ha agregado.`,
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
    showToast(fileName);
  };

  const handleFileUploadedToRoot = (fileName: string) => {
    // Add file to the first folder as a default behavior for simulation
    if (folders.length > 0) {
      handleFileUploadToFolder(folders[0].id, fileName);
    } else {
       toast({
          title: "Error",
          description: `No hay carpetas para agregar el archivo.`,
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
    showToast(fileName);
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
        className="min-h-screen w-full p-4 md:p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-foreground"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section 1: Upload and Organize */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/20 border-b border-white/20 p-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileSignature className="h-8 w-8 text-primary"/>
              Paso 1: Seleccionar documento a validar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar documento por nombre o palabra clave..."
                  className="pl-12 py-6 w-full bg-slate-100/70 text-foreground rounded-lg border-slate-200 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
               <FileUploadButton
                variant="outline"
                className="w-full sm:w-auto flex-shrink-0 h-full py-3 px-6 rounded-lg border-dashed"
                onFileSelect={handleFileUploadedToRoot}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir nuevo archivo
              </FileUploadButton>
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

        {/* Section 2: Select Regulations */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white/20 border-b border-white/20 p-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BookCheck className="h-8 w-8 text-primary"/>
              Paso 2: Seleccionar normativas para el análisis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RegulationList 
              regulations={regulations}
              selectedIds={selectedRegulationIds}
              onSelectionChange={setSelectedRegulationIds}
              onRegulationUpload={handleRegulationUpload}
            />
          </CardContent>
        </Card>

        {/* Section 3: Validation Button */}
        <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="text-xl font-semibold px-16 py-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/40"
              onClick={handleValidate}
              disabled={!isValidationReady}
            >
              Validar Pliego
            </Button>
        </div>
      </div>
    </div>
  );
}
