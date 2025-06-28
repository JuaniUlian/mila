
import type { MilaAppPData, DocumentBlock, Suggestion, SuggestionCategory, SuggestionSeverity } from './types';

const block1Suggestions: Suggestion[] = [ 
  {
    id: 'sug2-obj',
    category: 'Legal',
    severity: 'high',
    text: "Se recomienda incluir la siguiente cláusula en el objeto para evitar costos no planificados: 'El proveedor garantizará la actualización a nuevas versiones del software cubierto por este contrato sin costo adicional para la Entidad durante toda la vigencia del servicio de soporte técnico.'",
    justification: {
      legal: "No prever las actualizaciones futuras va en contra de los principios de economía y eficiencia, pues puede generar costos adicionales no planificados para la entidad.",
      technical: "Garantiza que la entidad se mantenga actualizada tecnológicamente y optimiza la inversión.",
    },
    appliedNorm: "Ley 80 de 1993, Art. 3",
    errorType: "Omisión de Cláusula de Actualización",
    estimatedConsequence: "Posibles costos adicionales no presupuestados para actualizaciones.",
    status: 'pending',
    completenessImpact: 1.0,
    isEditable: false,
  },
  {
    id: 'sug-generic-1-obj',
    category: 'Redacción',
    severity: 'low',
    text: "Para mayor claridad, se sugiere reestructurar el objeto del contrato de la siguiente manera: 'El presente contrato tiene por objeto: 1. La adquisición de [CANTIDAD] licencias de [TIPO DE SOFTWARE]. 2. La prestación de soporte técnico especializado para dichas licencias por un período de 12 meses, conforme a los niveles de servicio detallados en el Anexo I.'",
    justification: {
      legal: "La redacción ambigua y poco estructurada del objeto contractual dificulta la comprensión clara por parte de los proponentes, lo que atenta contra el principio de transparencia.",
      technical: "Facilita la comprensión por parte de los proponentes y reduce el riesgo de interpretaciones erróneas.",
    },
    appliedNorm: "Ley 80 de 1993, Art. 24",
    errorType: "Ambigüedad en el Objeto",
    estimatedConsequence: "Consultas recurrentes, posibles protestas o impugnaciones.",
    status: 'pending',
    completenessImpact: 0.8,
    isEditable: true,
  },
];

const block2Suggestions: Suggestion[] = [ 
   {
    id: 'sug1-req',
    category: 'Legal',
    severity: 'high',
    text: "Para garantizar la objetividad, se debe especificar qué se considera 'experiencia previa' (ej: 'acreditar al menos dos contratos de similar naturaleza y monto en los últimos tres años') y qué 'certificaciones' son requeridas para el personal técnico (ej: 'Certificación oficial del fabricante en la versión X del software').",
    justification: {
      legal: "La ley exige que los criterios de evaluación sean objetivos, claros y completos. El texto original no desagrega los criterios técnicos, lo que podría dar lugar a una evaluación subjetiva.",
      technical: "Permite una evaluación transparente y equitativa de las ofertas.",
    },
    appliedNorm: "Ley 1150 de 2007, Art. 5",
    errorType: "Criterios de habilitación subjetivos",
    estimatedConsequence: "Riesgo de selección no objetiva, posibles demandas.",
    status: 'pending',
    completenessImpact: 1.2,
    isEditable: true,
  },
];


export const mockData: MilaAppPData = {
  documentTitle: "Evaluación Pliego XYZ-2025",
  overallComplianceScore: 55, 
  overallCompletenessIndex: 5.5, 
  blocks: [
    {
      id: 'objeto',
      name: 'Objeto',
      category: 'Definiciones Fundamentales',
      alertLevel: 'grave',
      completenessIndex: 3.0, 
      maxCompleteness: 10,
      originalText: "OBJETO: El objeto del presente proceso de contratación es la adquisición de licencias de software para la entidad, así como el soporte técnico especializado durante un periodo de 12 meses. Este contrato busca cubrir todas las necesidades de software de la organización.",
      suggestions: block1Suggestions,
      alerts: [
        { id: 'al1-obj', severity: 'grave', description: 'Falta especificidad en tipos y cantidades de licencias.' },
        { id: 'al2-obj', severity: 'media', description: 'No se detallan niveles de servicio para soporte.' },
      ],
      missingConnections: [
        { id: 'mc1-obj', description: 'Falta referencia a política interna de adquisición de TIC (Resolución 123).' },
      ],
      applicableNorms: [
        { id: 'an1-obj', name: 'Decreto 1082 de 2015', article: 'Art. 2.2.1.1.2.1.1 (Estudios Previos)'},
        { id: 'an2-obj', name: 'Ley 80 de 1993', article: 'Art. 3 (Fines de la contratación)'},
      ],
      legalRisk: 'Alto: Riesgo de ofertas no conformes y posibles sobrecostos por falta de detalle.',
    },
    {
      id: 'requisitos',
      name: 'Requisitos',
      category: 'Condiciones y Habilitantes',
      alertLevel: 'media',
      completenessIndex: 4.0, 
      maxCompleteness: 10,
      originalText: "REQUISITOS HABILITANTES: Los proponentes deberán cumplir con los requisitos financieros y técnicos establecidos. Se requiere experiencia previa en contratos con el estado. El personal técnico debe estar certificado. Deben presentar el RUT y certificado de existencia.",
      suggestions: block2Suggestions,
      alerts: [
        { id: 'al1-req', severity: 'media', description: 'Criterios de experiencia podrían ser más específicos.' },
        { id: 'al2-req', severity: 'leve', description: 'No se indica versión de certificaciones requeridas.' },
      ],
      missingConnections: [
         { id: 'mc1-req', description: 'No se vincula con el manual de contratación de la entidad.' },
      ],
      applicableNorms: [
        { id: 'an1-req', name: 'Ley 1150 de 2007', article: 'Art. 5 (Selección Objetiva)'},
        { id: 'an2-req', name: 'Decreto 1082 de 2015', article: 'Art. 2.2.1.1.1.5.2 (Capacidad Jurídica)'},
      ],
      legalRisk: 'Medio: Posibilidad de interpretaciones diversas en criterios de habilitación.',
    },
    {
      id: 'criterios',
      name: 'Criterios de Evaluación',
      category: 'Ponderación y Selección',
      alertLevel: 'leve',
      completenessIndex: 7.0,
      maxCompleteness: 10,
      originalText: "CRITERIOS DE EVALUACIÓN: La evaluación se basará en: Precio (50%), Calidad Técnica (30%), Experiencia (20%). Se asignarán puntos adicionales por innovación. La calidad se medirá según la propuesta técnica.",
      suggestions: [
        {
          id: 'sug1-crit',
          category: 'Administrativa',
          severity: 'medium',
          text: "Para evitar subjetividad, la 'Calidad Técnica' debe desagregarse. Propuesta: a) Metodología (15 pts), b) Cumplimiento de especificaciones avanzadas (10 pts), c) Plan de capacitación (5 pts). La 'Innovación' (hasta 5 pts adicionales) se medirá por la incorporación de tecnologías emergentes que aporten valor agregado.",
          justification: { 
            legal: "La selección objetiva requiere que los criterios de evaluación y sus puntajes estén claramente definidos. No detallar los sub-criterios de 'Calidad Técnica' introduce un elemento de subjetividad.", 
            technical: "Evita discrecionalidad y facilita la preparación de ofertas competitivas." 
          },
          appliedNorm: "Ley 1150 de 2007, Art. 5", errorType: "Falta de detalle en criterios", estimatedConsequence: "Riesgo de impugnaciones por subjetividad.", status: 'pending',
          completenessImpact: 1.0,
          isEditable: true,
        }
      ],
      alerts: [
        { id: 'al1-crit', severity: 'leve', description: 'Fórmula de asignación de puntaje para precio podría ser más explícita.' },
      ],
      missingConnections: [],
      applicableNorms: [
         { id: 'an1-crit', name: 'Colombia Compra Eficiente', article: 'Guía para la elaboración de pliegos tipo'},
      ],
      legalRisk: 'Bajo: Principalmente mejoras en la claridad de fórmulas de calificación.',
    },
    {
      id: 'sanciones',
      name: 'Régimen Sancionatorio',
      category: 'Incumplimientos y Multas',
      alertLevel: 'none',
      completenessIndex: 8.0,
      maxCompleteness: 10,
      originalText: "SANCIONES: El incumplimiento de las obligaciones contractuales dará lugar a las multas y sanciones previstas en la Ley y en el contrato. Las multas no podrán superar el 10% del valor del contrato.",
      suggestions: [
         {
          id: 'sug1-san',
          category: 'Legal',
          severity: 'low',
          text: "Se debe incluir un apartado que garantice el debido proceso: 'Para la imposición de multas, se seguirá el siguiente procedimiento: 1. Notificación formal al contratista detallando el presunto incumplimiento. 2. Otorgamiento de un plazo de cinco (5) días hábiles para presentar descargos. 3. Emisión de acto administrativo motivado que decide sobre la multa, contra el cual procederán los recursos de ley.'",
          justification: { 
            legal: "La imposición de multas es un acto administrativo que debe respetar el debido proceso. Omitir el procedimiento para descargos puede viciar de nulidad la sanción.", 
            technical: "Brinda seguridad jurídica a las partes." 
          },
          appliedNorm: "Ley 1437 de 2011", errorType: "Omisión de Procedimiento", estimatedConsequence: "Posibles nulidades en la imposición de sanciones.", status: 'pending',
          completenessImpact: 0.5,
          isEditable: false,
        }
      ],
      alerts: [],
      missingConnections: [],
      applicableNorms: [
        { id: 'an1-san', name: 'Ley 1474 de 2011', article: 'Art. 86 (Multas)'},
        { id: 'an2-san', name: 'Ley 80 de 1993', article: 'Art. 4 (Derechos y Deberes)'},
      ],
       legalRisk: 'Bajo: El régimen está referenciado, pero podría detallarse más el procedimiento.',
    },
  ],
};
