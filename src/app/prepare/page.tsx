"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderGrid } from '@/components/prepare/folder-grid';
import { RegulationList } from '@/components/prepare/regulation-list';
import { Search } from 'lucide-react';

// Mock Data
const initialFolders = [
  { id: 'f1', name: 'Pliegos 2024', fileCount: 3, files: [
    { id: 'file1', name: 'Pliego-Licitacion-XYZ.pdf' },
    { id: 'file2', name: 'Anexo-Tecnico.docx' },
    { id: 'file3', name: 'Borrador-Contrato.pdf' },
  ]},
  { id: 'f2', name: 'Contrataciones Directas', fileCount: 1, files: [
    { id: 'file4', name: 'CD-Software-2024.docx' }
  ]},
  { id: 'f3', name: 'Normativas Internas', fileCount: 2, files: [
    { id: 'file5', name: 'Manual-Contratacion-v3.pdf' },
    { id: 'file6', name: 'Politica-Adquisiciones.pdf' },
  ]},
  { id: 'f4', name: 'Proyectos Archivados', fileCount: 0, files: [] },
];

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...' },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...' },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...' },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...' },
];

export default function PreparePage() {
  const router = useRouter();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState<string[]>([]);

  const isValidationReady = selectedFileId !== null && selectedRegulationIds.length > 0;

  const handleValidate = () => {
    if (isValidationReady) {
      router.push('/loading');
    }
  };

  return (
    // We apply a background that matches the light theme for consistency
    <div className="min-h-screen w-full p-4 md:p-8" style={{
      background: 'linear-gradient(145deg, rgba(255, 192, 203, 1) 0%, rgba(173, 216, 230, 1) 40%, rgba(255, 160, 122, 1) 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section 1: Upload and Organize */}
        <Card className="glass-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              📄 Paso 1: Subí, buscá y organizá tus pliegos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o palabra clave"
                className="pl-10 w-full md:w-1/2"
              />
            </div>
            <FolderGrid 
              folders={initialFolders} 
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
            />
          </CardContent>
        </Card>

        {/* Section 2: Select Regulations */}
        <Card className="glass-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              ⚖️ Paso 2: Seleccioná las normativas para el análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegulationList 
              regulations={initialRegulations}
              selectedIds={selectedRegulationIds}
              onSelectionChange={setSelectedRegulationIds}
            />
          </CardContent>
        </Card>

        {/* Section 3: Validation Button */}
        <div className="flex justify-center pt-4">
            <Button
              size="lg"
              className="text-lg font-semibold px-12 py-7 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
