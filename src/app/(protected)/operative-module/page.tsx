
'use client';

import React from 'react';
import { PrepareView } from '@/components/prepare/prepare-view';
import { ClipboardCheck } from 'lucide-react';

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' as const },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' as const },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario', content: 'Contenido detallado del Decreto 1082...', status: 'success' as const },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' as const },
];

const initialFolders = [
  {
    id: 'op1',
    name: 'Autorizar evento en espacio público',
    files: [
      { id: 'op1-file1', name: 'Solicitud de Evento.pdf', content: 'Contenido simulado de la solicitud del evento...', status: 'success' as const },
      { id: 'op1-file2', name: 'Plan de Seguridad.pdf', content: 'Contenido simulado del plan de seguridad...', status: 'success' as const },
      { id: 'op1-file3', name: 'Póliza de Seguro.pdf', content: 'Contenido simulado de la póliza...', status: 'success' as const },
    ],
  },
  {
    id: 'op2',
    name: 'Comprar combustible para vehículos oficiales',
    files: [
      { id: 'op2-file1', name: 'Requisición de Compra.docx', content: 'Contenido simulado de la requisición...', status: 'success' as const },
      { id: 'op2-file2', name: 'Cotización Proveedor A.pdf', content: 'Contenido simulado de la cotización A...', status: 'success' as const },
      { id: 'op2-file3', name: 'Cotización Proveedor B.pdf', content: 'Contenido simulado de la cotización B...', status: 'success' as const },
    ],
  },
  {
    id: 'op3',
    name: 'Dar permiso para puesto en la vía pública',
    files: [
      { id: 'op3-file1', name: 'Solicitud de Permiso.pdf', content: 'Contenido simulado de la solicitud de permiso...', status: 'success' as const },
      { id: 'op3-file2', name: 'Certificado de Sanidad.pdf', content: 'Contenido simulado del certificado de sanidad...', status: 'success' as const },
      { id: 'op3-file3', name: 'Mapa de Ubicación.pdf', content: 'Contenido simulado del mapa de ubicación...', status: 'success' as const },
    ],
  },
];


export default function OperativeModulePage() {

  return (
    <PrepareView
        title="Módulo Operativo"
        titleIcon={ClipboardCheck}
        initialFolders={initialFolders}
        preconfiguredRegulations={initialRegulations}
        storageKeyPrefix="mila-operative-module"
        isModuleView={true}
    />
  );
}
