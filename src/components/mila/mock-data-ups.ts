import type { MilaAppPData, Suggestion } from './types';

const block1Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-1',
    category: 'Legal',
    severity: 'high',
    text: "Se solicita la adquisición con carácter de URGENCIA, fundamentado en el informe técnico adjunto (fs. X) que detalla el estado crítico de los equipos y el riesgo inminente de falla que compromete la continuidad del servicio, de acuerdo al Art. 1422 del Reglamento de Contrataciones. Se recomienda adjuntar dicho informe para cumplir con el requisito de 'fundarse fehacientemente'.",
    justification: {
      legal: "El Art. 1422 del Reglamento de Contrataciones exige que las razones de urgencia 'deberán fundarse fehacientemente'. La simple mención de la palabra 'URGENTE' sin pruebas documentales es insuficiente y puede llevar al rechazo del procedimiento.",
      technical: "Aporta la evidencia necesaria para que los organismos de control y la autoridad competente puedan validar la procedencia de un trámite acelerado, si correspondiera.",
    },
    appliedNorm: "Reglamento de Contrataciones, Art. 1422",
    errorType: "Justificación de urgencia insuficiente",
    estimatedConsequence: "Nulidad de la justificación de urgencia, responsabilidad del funcionario solicitante, retrasos significativos en la contratación.",
    status: 'pending',
    completenessImpact: 2.5,
  },
];

const block2Suggestions: Suggestion[] = [
   {
    id: 'sug-ups-2',
    category: 'Administrativa',
    severity: 'high',
    text: "Para alinear el procedimiento con la urgencia declarada, se debe optar por una de las siguientes vías: a) Tramitar la contratación bajo la modalidad de Contratación Directa por Urgencia, invocando explícitamente el Art. X de la Ley de Contrataciones, o b) Eliminar la mención 'URGENTE' del objeto y proceder como Licitación Pública regular para evitar vicios de procedimiento.",
    justification: {
      legal: "Existe una contradicción insalvable entre tramitar una Licitación Pública con plazos y pasos regulares, y declarar una urgencia no fundamentada. Esto crea inseguridad jurídica y vicia el procedimiento.",
      technical: "La coherencia del documento es clave para la correcta interpretación por parte de los oferentes y fiscalizadores. Procedimientos contradictorios generan confusión.",
    },
    appliedNorm: "Leyes de Contrataciones, Art. 26",
    errorType: "Contradicción entre urgencia y procedimiento",
    estimatedConsequence: "Nulidad del proceso por vicios de procedimiento, rechazo por parte de los organismos de control.",
    status: 'pending',
    completenessImpact: 2.5,
    isEditable: true,
  },
];

const block3Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-3',
    category: 'Administrativa',
    severity: 'low',
    text: "Se solicita que la cotización se realice en dólares estadounidenses. Para robustecer la justificación, se adjunta un informe de mercado (fs. Y) que demuestra que los bienes a adquirir, por su origen importado, son exclusiva o mayoritariamente cotizados en dicha moneda, a fin de garantizar la mayor concurrencia de ofertas y dar cumplimiento al Art. 150 del Reglamento.",
    justification: {
      legal: "Si bien la normativa permite cotizar en moneda extranjera con justificación, la solidez de dicha justificación es clave para evitar observaciones de los organismos de control sobre la transparencia y conveniencia económica.",
      technical: "Un informe de mercado proporciona evidencia objetiva que respalda la decisión administrativa y protege al proceso de futuros cuestionamientos.",
    },
    appliedNorm: "Reglamento de Contrataciones, Art. 150",
    errorType: "Fundamentación débil para cotización en USD",
    estimatedConsequence: "Observaciones menores de auditoría por falta de evidencia que respalde la decisión.",
    status: 'pending',
    completenessImpact: 1.0,
  }
];

const block4Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-4',
    category: 'Administrativa',
    severity: 'high',
    text: "Las especificaciones técnicas del presente pliego deben ser genéricas y objetivas. Se debe eliminar cualquier referencia a marcas o presupuestos de proveedores específicos (ej. EXCELCOM S.A.) para garantizar la libre competencia e imparcialidad, conforme al Art. 11 de la Ley de Contrataciones. Se sugiere reemplazarlo por un presupuesto oficial desglosado y anónimo.",
    justification: {
      legal: "El Art. 11 de la Ley de Contrataciones prohíbe la inclusión de especificaciones que direccionen la contratación hacia un oferente particular. Incluir un presupuesto de una firma específica vulnera los principios de imparcialidad y libre concurrencia.",
      technical: "Asegura que el proceso sea competitivo y que la evaluación se base en las capacidades técnicas y económicas de todos los oferentes, no en la propuesta de uno solo.",
    },
    appliedNorm: "Ley de Contrataciones, Art. 11",
    errorType: "Potencial direccionamiento y falta de imparcialidad",
    estimatedConsequence: "Riesgo de impugnaciones, anulación del proceso por favorecer a un oferente, y cuestionamientos de los organismos de control.",
    status: 'pending',
    completenessImpact: 3.0,
    isEditable: true,
  },
];

const block5Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-5',
    category: 'Legal',
    severity: 'medium',
    text: "Para mantener la coherencia con el carácter de urgencia invocado, se propone modificar el plazo de ejecución a un máximo de treinta (30) días corridos a partir de la firma del contrato. Un plazo de 120 días resulta incongruente con una necesidad impostergable.",
    justification: {
      legal: "El Art. 1422 del Reglamento de Contrataciones, que regula la urgencia, presupone plazos de ejecución acordes. Un plazo de 120 días debilita la justificación para cualquier tratamiento preferencial o procedimiento de excepción.",
      technical: "Aclara las expectativas reales del plazo de entrega y asegura la coherencia interna del documento, evitando confusiones a los oferentes y fiscalizadores.",
    },
    appliedNorm: "Reglamento de Contrataciones, Art. 1422",
    errorType: "Incongruencia entre urgencia y plazo de ejecución",
    estimatedConsequence: "Debilitamiento de la justificación de urgencia, posibles observaciones de los organismos de control por inconsistencias en el pliego.",
    status: 'pending',
    completenessImpact: 1.5,
    isEditable: true,
  },
];


export const upsMockData: MilaAppPData = {
  documentTitle: "Evaluación 3118772 SERV RECAMBIO UPS 96 FJS (1)",
  overallComplianceScore: 35,
  overallCompletenessIndex: 4.0,
  blocks: [
    {
      id: 'justificacion-urgencia',
      name: 'Justificación de Urgencia',
      category: 'Fundamentos del Proceso',
      alertLevel: 'grave',
      completenessIndex: 2.0,
      maxCompleteness: 10,
      originalText: "En la nota inicial (fs. 1-2), el Director General de Informática solicita la adquisición 'con carácter de URGENTE' de un sistema de aire acondicionado de precisión y UPS, pero no se presenta documentación que acredite fehacientemente la urgencia.",
      suggestions: block1Suggestions,
      alerts: [{ id: 'al1-ups', severity: 'grave', description: 'Urgencia no fundamentada fehacientemente.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an1-ups', name: 'Reglamento de Contrataciones', article: 'Art. 1422' }],
      legalRisk: 'Alto: La falta de fundamento puede llevar al rechazo del procedimiento y a la responsabilidad del funcionario solicitante.',
    },
    {
      id: 'procedimiento-contratacion',
      name: 'Procedimiento de Contratación',
      category: 'Marco Legal',
      alertLevel: 'grave',
      completenessIndex: 3.0,
      maxCompleteness: 10,
      originalText: "A pesar de invocar urgencia, se tramita como Licitación Pública regular, con plazos normales, lo que contradice la supuesta urgencia.",
      suggestions: block2Suggestions,
      alerts: [{ id: 'al2-ups', severity: 'grave', description: 'Contradicción entre urgencia invocada y procedimiento regular.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an2-ups', name: 'Leyes de Contrataciones', article: 'Art. 26' }],
      legalRisk: 'Alto: La inconsistencia procesal puede ser un vicio legal que afecte la validez de todo el proceso.',
    },
    {
      id: 'presupuesto-especificaciones',
      name: 'Presupuesto y Especificaciones',
      category: 'Imparcialidad del Proceso',
      alertLevel: 'grave',
      completenessIndex: 4.0,
      maxCompleteness: 10,
      originalText: "Se observa que inicialmente se incluyó un presupuesto de una firma específica (EXCELCOM S.A.), lo cual podría comprometer la imparcialidad del proceso. La UCC solicitó el desglose para evitar dar ventajas.",
      suggestions: block4Suggestions,
      alerts: [{ id: 'al4-ups', severity: 'grave', description: 'Inclusión de presupuesto de proveedor específico direcciona la compra.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an4-ups', name: 'Ley de Contrataciones', article: 'Art. 11' }],
      legalRisk: 'Alto: La inclusión de un presupuesto específico puede ser interpretada como un direccionamiento de la contratación, viciando el proceso de nulidad.',
    },
    {
        id: 'plazo-ejecucion',
        name: 'Plazo de Ejecución',
        category: 'Términos y Plazos',
        alertLevel: 'media',
        completenessIndex: 5.0,
        maxCompleteness: 10,
        originalText: "Se establece un plazo de entrega de 120 días, lo que nuevamente contradice la supuesta urgencia invocada inicialmente.",
        suggestions: block5Suggestions,
        alerts: [{ id: 'al5-ups', severity: 'media', description: 'Plazo de 120 días contradice la urgencia declarada.' }],
        missingConnections: [],
        applicableNorms: [{ id: 'an5-ups', name: 'Reglamento de Contrataciones', article: 'Art. 1422' }],
        legalRisk: 'Medio: La contradicción entre el plazo y la urgencia puede invalidar la justificación de urgencia si se quisiera usar para un procedimiento de excepción.',
    },
    {
      id: 'cotizacion-moneda',
      name: 'Cotización en Moneda Extranjera',
      category: 'Aspectos Financieros',
      alertLevel: 'leve',
      completenessIndex: 7.0,
      maxCompleteness: 10,
      originalText: "Se solicita que la contratación se realice en dólares estadounidenses 'por el origen de los productos'. Esta justificación es aceptable, pero debería estar mejor fundamentada.",
      suggestions: block3Suggestions,
      alerts: [{ id: 'al3-ups', severity: 'leve', description: 'Justificación para cotizar en USD podría ser más robusta.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an3-ups', name: 'Reglamento de Contrataciones', article: 'Art. 150' }],
      legalRisk: 'Bajo: Es poco probable que invalide el proceso, pero puede generar solicitudes de información adicional por parte de los organismos de control.',
    },
  ],
};
