
'use client';

import React from 'react';
import { PrepareView } from '@/components/prepare/prepare-view';
import { Microscope } from 'lucide-react';

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' as const },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' as const },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...', status: 'success' as const },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' as const },
    { id: 'reg5', name: 'Decreto 795/96', content: 'Contenido del Decreto 795/96...', status: 'success' as const },
    { id: 'reg-9353', name: 'Ley 9353', content: 'Contenido detallado de la Ley 9353...', status: 'success' as const },
];

const initialFolders = [
  {
    id: 'tech1',
    name: 'Contratar ingeniero para evaluar puente',
    files: [
      { id: 'tech1-file1', name: 'Términos de Referencia.pdf', content: 'Contenido de los términos de referencia...', status: 'success' as const },
      { id: 'tech1-file2', name: 'Estudios Previos.pdf', content: 'Contenido de los estudios previos...', status: 'success' as const },
      { id: 'tech1-file3', name: 'Certificado de Idoneidad.pdf', content: 'Contenido del certificado de idoneidad...', status: 'success' as const },
    ],
  },
  {
    id: 'tech2',
    name: 'Comprar software para registro civil',
    files: [
      { id: 'tech2-file1', name: 'Pliego de Especificaciones Técnicas.docx', content: 'Contenido del pliego...', status: 'success' as const },
      { id: 'tech2-file2', name: 'Análisis de Mercado.pdf', content: 'Contenido del análisis de mercado...', status: 'success' as const },
      { id: 'tech2-file3', name: 'Matriz de Riesgos.pdf', content: 'Contenido de la matriz de riesgos...', status: 'success' as const },
    ],
  },
  {
    id: 'tech3',
    name: 'Comprar equipos para laboratorio de hospital',
    files: [
      { id: 'tech3-file1', name: 'Requerimientos Técnicos.pdf', content: 'Contenido de los requerimientos técnicos...', status: 'success' as const },
      { name: 'Certificaciones INVIMA.pdf', content: 'Contenido de las certificaciones...', status: 'success' as const, id: 'tech3-file2' },
      { id: 'tech3-file3', name: 'Cronograma de Entrega.pdf', content: 'Contenido del cronograma...', status: 'success' as const },
    ],
  },
];

export default function TechnicalModulePage() {
  return (
    <PrepareView
        title="Módulo Técnico"
        titleIcon={Microscope}
        initialFolders={initialFolders}
        initialRegulations={initialRegulations}
        storageKeyPrefix="mila-technical-module"
    />
  );
}

    