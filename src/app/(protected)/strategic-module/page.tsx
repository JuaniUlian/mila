
'use client';

import React from 'react';
import { PrepareView } from '@/components/prepare/prepare-view';
import { Landmark } from 'lucide-react';

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' as const },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' as const },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...', status: 'success' as const },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' as const },
    { id: 'reg5', name: 'Ley de Asociaciones Público-Privadas', content: 'Contenido de la ley APP...', status: 'success' as const },
    { id: 'reg6', name: 'Normativa de Crédito Público', content: 'Contenido de la normativa de crédito público...', status: 'success' as const },
];

const initialFolders = [
  {
    id: 'strat1',
    name: 'Licitar construcción de centro cívico',
    files: [
      { id: 'strat1-file1', name: 'Pliego de Licitación Pública.pdf', content: 'Contenido del pliego de licitación...', status: 'success' as const },
      { id: 'strat1-file2', name: 'Estudio de Factibilidad.pdf', content: 'Contenido del estudio de factibilidad...', status: 'success' as const },
      { id: 'strat1-file3', name: 'Certificación Presupuestaria.pdf', content: 'Contenido de la certificación presupuestaria...', status: 'success' as const },
    ],
  },
  {
    id: 'strat2',
    name: 'Concesionar servicios',
    files: [
      { id: 'strat2-file1', name: 'Borrador de Contrato de Concesión.docx', content: 'Contenido del borrador del contrato...', status: 'success' as const },
      { id: 'strat2-file2', name: 'Modelo Financiero.xlsx', content: 'Contenido del modelo financiero...', status: 'success' as const },
      { id: 'strat2-file3', name: 'Análisis de Riesgos de Concesión.pdf', content: 'Contenido del análisis de riesgos...', status: 'success' as const },
    ],
  },
  {
    id: 'strat3',
    name: 'Solicitud financiamiento internacional',
    files: [
      { id: 'strat3-file1', name: 'Memorando de Solicitud.pdf', content: 'Contenido del memorando de solicitud...', status: 'success' as const },
      { id: 'strat3-file2', name: 'Plan de Inversiones.pdf', content: 'Contenido del plan de inversiones...', status: 'success' as const },
      { id: 'strat3-file3', name: 'Marco Legal del Proyecto.pdf', content: 'Contenido del marco legal...', status: 'success' as const },
    ],
  },
];

export default function StrategicModulePage() {
  return (
    <PrepareView
        title="Módulo Estratégico"
        titleIcon={Landmark}
        initialFolders={initialFolders}
        initialRegulations={initialRegulations}
        storageKeyPrefix="mila-strategic-module"
    />
  );
}

    