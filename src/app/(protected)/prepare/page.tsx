
"use client";

import React from 'react';
import { PrepareView } from '@/components/prepare/prepare-view';
import { FileSignature } from 'lucide-react';

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

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' as const },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' as const },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...', status: 'success' as const },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' as const },
    { id: 'reg5', name: 'Decreto 795/96', content: 'Contenido del Decreto 795/96...', status: 'success' as const },
    { id: 'reg-9353', name: 'Ley 9353', content: 'Contenido detallado de la Ley 9353...', status: 'success' as const },
];

export default function PreparePage() {
  return (
      <PrepareView 
        title="Modo Manual"
        titleIcon={FileSignature}
        initialFolders={initialFolders}
        initialRegulations={initialRegulations}
        storageKeyPrefix="mila-prepare"
      />
  );
}

    