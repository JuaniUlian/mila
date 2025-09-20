
'use client';

import React from 'react';
import { PrepareView } from '@/components/prepare/prepare-view';
import { PieChart } from 'lucide-react';

const initialRegulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' as const },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' as const },
    { id: 'reg5', name: 'Ley de Asociaciones Público-Privadas', content: 'Contenido de la ley APP...', status: 'success' as const },
    { id: 'reg6', name: 'Normativa de Crédito Público', content: 'Contenido de la normativa de crédito público...', status: 'success' as const },
];

const initialFolders = [
  {
    id: 'strat1',
    name: 'Licitar construcción de centro cívico',
    files: [
      { id: 'strat1-file1', name: 'Pliego de Licitación Pública.pdf', content: 'Contenido simulado del pliego de licitación...', status: 'success' as const },
      { id: 'strat1-file2', name: 'Estudio de Factibilidad.pdf', content: 'Contenido simulado del estudio de factibilidad...', status: 'success' as const },
      { id: 'strat1-file3', name: 'Certificación Presupuestaria.pdf', content: 'Contenido simulado de la certificación presupuestaria...', status: 'success' as const },
    ],
  },
  {
    id: 'strat2',
    name: 'Concesionar servicios',
    files: [
      { id: 'strat2-file1', name: 'Borrador de Contrato de Concesión.docx', content: 'Contenido simulado del borrador del contrato...', status: 'success' as const },
      { id: 'strat2-file2', name: 'Modelo Financiero.xlsx', content: 'Contenido simulado del modelo financiero...', status: 'success' as const },
      { id: 'strat2-file3', name: 'Análisis de Riesgos de Concesión.pdf', content: 'Contenido simulado del análisis de riesgos...', status: 'success' as const },
    ],
  },
  {
    id: 'strat3',
    name: 'Solicitud financiamiento internacional',
    files: [
      { id: 'strat3-file1', name: 'Memorando de Solicitud.pdf', content: 'Contenido simulado del memorando de solicitud...', status: 'success' as const },
      { id: 'strat3-file2', name: 'Plan de Inversiones.pdf', content: 'Contenido simulado del plan de inversiones...', status: 'success' as const },
      { id: 'strat3-file3', name: 'Marco Legal del Proyecto.pdf', content: 'Contenido simulado del marco legal...', status: 'success' as const },
    ],
  },
];

const strategicModulePurpose = "El Módulo Estratégico está diseñado para proyectos de gran escala y alto impacto, como obras públicas, concesiones o financiamientos. Su finalidad es analizar la viabilidad legal, económica y financiera, asegurando que la estructura del proyecto sea sólida y esté alineada con las políticas públicas y los marcos normativos complejos.";

const strategicDefaultInstructions = `Analizar el documento en busca de "red flags" estratégicas, financieras y de gobernanza. Prestar especial atención a:
1.  **Sustento y Viabilidad:** Verificar la existencia y solidez de estudios de factibilidad, análisis de costo-beneficio y planes de inversión que justifiquen la magnitud del proyecto.
2.  **Estructura Financiera y Presupuestaria:** Comprobar la claridad en las fuentes de financiamiento, la existencia de certificaciones presupuestarias completas y la coherencia del modelo financiero. Detectar cláusulas de ajuste de precios o de riesgo cambiario que puedan ser desfavorables para el Estado.
3.  **Asignación de Riesgos:** Evaluar si la matriz de riesgos es completa y si la asignación de riesgos entre el sector público y el privado es equitativa y está bien fundamentada, especialmente en contratos de concesión o APP.
4.  **Marco Legal y Gobernanza:** Asegurar que el proyecto se enmarque en las leyes de crédito público, asociaciones público-privadas y normativas sectoriales. Verificar que los mecanismos de supervisión, control y resolución de controversias sean robustos.
5.  **Impacto a Largo Plazo:** Identificar posibles consecuencias no deseadas a largo plazo, como la creación de monopolios, impacto ambiental no mitigado, u obligaciones contingentes significativas para el Estado.`;

export default function StrategicModulePage() {
  return (
    <PrepareView
        title="Módulo Estratégico"
        titleIcon={PieChart}
        initialFolders={initialFolders}
        preconfiguredRegulations={initialRegulations}
        storageKeyPrefix="mila-strategic-module"
        isModuleView={true}
        modulePurpose={strategicModulePurpose}
        defaultInstructions={strategicDefaultInstructions}
    />
  );
}
