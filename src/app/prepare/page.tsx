
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { RegulationList } from '@/components/prepare/regulation-list';
import { Search, Upload } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileUploadButton } from '@/components/prepare/file-upload-button';
import { useToast } from '@/hooks/use-toast';

// Mock Data
const initialFolders = [
  { id: 'f1', name: 'Pliegos 2024', files: [
    { id: 'file1', name: 'Pliego-Licitacion-XYZ.pdf' },
    { id: 'file2', name: 'Anexo-Tecnico.docx' },
    { id: 'file3', name: 'Borrador-Contrato.pdf' },
  ]},
  { id: 'f2', name: 'Contrataciones Directas', files: [
    { id: 'file4', name: 'CD-Software-2024.docx' }
  ]},
  { id: 'f3', name: 'Normativas Internas', files: [
    { id: 'file5', name: 'Manual-Contratacion-v3.pdf' },
    { id: 'file6', 'name': 'Politica-Adquisiciones.pdf' },
  ]},
  { id: 'f4', name: 'Proyectos Archivados', files: [] },
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
        className="min-h-screen w-full p-4 md:p-8 text-gray-800" 
        style={{
            background: 'linear-gradient(135deg, #F0F4FF 0%, #F8FAFC 50%, #FFFFFF 100%)',
            backgroundAttachment: 'fixed'
        }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section 1: Upload and Organize */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              📄 Paso 1: Seleccionar documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre o palabra clave"
                  className="pl-10 w-full bg-white/80 border-gray-300 text-gray-900 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
               <FileUploadButton
                variant="outline"
                className="w-full sm:w-auto flex-shrink-0 bg-white/80 hover:bg-white border-gray-300 text-gray-800"
                onFileSelect={handleFileUploadedToRoot}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo
              </FileUploadButton>
            </div>
            <FolderGrid 
              folders={filteredFolders} 
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
              searchQuery={searchQuery}
            />
          </CardContent>
        </Card>

        {/* Section 2: Select Regulations */}
        <Accordion type="single" collapsible className="w-full" defaultValue="regulations">
          <AccordionItem value="regulations" className="border-b-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border-gray-200/50">
            <AccordionTrigger className="p-6 hover:no-underline w-full text-left">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                ⚖️ Paso 2: Seleccioná las normativas para el análisis
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent className="px-6 pt-0 pb-6">
              <RegulationList 
                regulations={regulations}
                selectedIds={selectedRegulationIds}
                onSelectionChange={setSelectedRegulationIds}
                onRegulationUpload={handleRegulationUpload}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 3: Validation Button */}
        <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="text-lg font-semibold px-12 py-7 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              onClick={handleValidate}
              disabled={!isValidationReady}
            >
              Validar pliego
            </Button>
        </div>
      </div>
    </div>
  );
}
