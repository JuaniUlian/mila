import type { MilaAppPData, Suggestion } from './types';

const block1Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-1',
    category: 'Legal',
    severity: 'medium',
    text: "Se deberá establecer una única fecha y hora para la apertura de ofertas, por ejemplo: 'La apertura de ofertas se realizará el día 15 de agosto de 2025 a las 10:00 horas, en la oficina de contrataciones, sita en Calle Falsa 123'. Cualquier referencia a múltiples fechas u horarios debe ser eliminada para evitar ambigüedades.",
    justification: {
      legal: "El Art. 212 del Reglamento de Contrataciones exige que se determine un día y hora únicos para la apertura de ofertas. La existencia de múltiples fechas o información contradictoria invalida el acto y atenta contra el principio de transparencia.",
      technical: "Proporciona certeza a los proponentes y asegura un proceso de apertura ordenado y conforme a la normativa, evitando impugnaciones.",
    },
    appliedNorm: "Reglamento de Contrataciones, Art. 212",
    errorType: "Ambigüedad técnica en fecha de apertura",
    estimatedConsequence: "Riesgo de impugnaciones, nulidad del acto de apertura, retrasos en el proceso de contratación.",
    status: 'pending',
    completenessImpact: 2.0,
  },
];

const block2Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-2',
    category: 'Legal',
    severity: 'medium',
    text: "Se debe incorporar una cláusula que especifique que la adquisición se realiza bajo el régimen de la Ley Provincial N° 9.353, incluyendo las disposiciones sobre garantías mínimas, plazos de entrega y servicio post-venta que dicha ley establece para bienes tecnológicos.",
    justification: {
      legal: "La Ley Provincial Nº 9.353 establece un marco regulatorio específico para la adquisición de bienes y servicios tecnológicos. La omisión de las cláusulas exigidas por su Art. 3 deja al contrato sin el respaldo normativo provincial, pudiendo ser observado por organismos de control.",
      technical: "Asegura que la adquisición cumpla con los estándares técnicos y de garantía definidos por la legislación provincial, protegiendo la inversión de la entidad.",
    },
    appliedNorm: "Ley Provincial Nº 9.353, Art. 3",
    errorType: "Falta de respaldo normativo (Ley Provincial)",
    estimatedConsequence: "Incumplimiento de la normativa provincial, observaciones de auditoría, adquisición de bienes que no cumplen con los estándares legales.",
    status: 'pending',
    completenessImpact: 2.5,
  },
];

const block3Suggestions: Suggestion[] = [
  {
    id: 'sug-ups-3',
    category: 'Legal',
    severity: 'medium',
    text: "En la sección de 'Modalidad de Contratación', se debe indicar explícitamente: 'El presente procedimiento se enmarca en una Licitación Pública, de acuerdo a lo estipulado en el Art. 26 de la Ley X.XXX, debido a que el monto estimado de la contratación supera el umbral establecido para contrataciones directas o concursos de precios'.",
    justification: {
      legal: "El Art. 26 de la ley de contrataciones aplicable exige que se justifique la elección del procedimiento de selección. Al no especificarse el tipo de procedimiento y su justificación, se incumple un requisito fundamental de la normativa.",
      technical: "Aporta transparencia al proceso, permitiendo a los interesados y a los organismos de control verificar que se ha seleccionado la modalidad de contratación correcta.",
    },
    appliedNorm: "Leyes de Contrataciones, Art. 26",
    errorType: "Omisión del tipo de procedimiento de contratación",
    estimatedConsequence: "Vicio en el procedimiento que puede llevar a la nulidad de la licitación y sanciones administrativas.",
    status: 'pending',
    completenessImpact: 2.5,
  },
];


export const upsMockData: MilaAppPData = {
  documentTitle: "Evaluación 3118772 SERV RECAMBIO UPS 96 FJS (1)",
  overallComplianceScore: 40,
  overallCompletenessIndex: 4.0,
  blocks: [
    {
      id: 'condiciones-particulares',
      name: 'Condiciones Particulares',
      category: 'Términos y Plazos',
      alertLevel: 'media',
      completenessIndex: 4.0,
      maxCompleteness: 10,
      originalText: "La fecha de apertura de ofertas será informada oportunamente. Consultar el cronograma adjunto para más detalles. La apertura podría realizarse la próxima semana.",
      suggestions: block1Suggestions,
      alerts: [{ id: 'al1-ups', severity: 'media', description: 'Fecha de apertura ambigua.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an1-ups', name: 'Reglamento de Contrataciones', article: 'Art. 212' }],
      legalRisk: 'Medio: Riesgo de impugnaciones por falta de certeza en la fecha de apertura.',
    },
    {
      id: 'especificaciones-tecnicas',
      name: 'Especificaciones Técnicas',
      category: 'Requerimientos del Producto',
      alertLevel: 'media',
      completenessIndex: 3.0,
      maxCompleteness: 10,
      originalText: "Se requiere la provisión e instalación de una solución de Aire Acondicionado de precisión y una UPS para el data center. El proveedor deberá garantizar el correcto funcionamiento.",
      suggestions: block2Suggestions,
      alerts: [{ id: 'al2-ups', severity: 'media', description: 'No se mencionan normativas provinciales específicas.' }],
      missingConnections: [],
      applicableNorms: [{ id: 'an2-ups', name: 'Ley Provincial Nº9.353', article: 'Art. 3' }],
      legalRisk: 'Medio: El contrato podría no cumplir con la normativa provincial para adquisiciones tecnológicas.',
    },
    {
        id: 'procedimiento',
        name: 'Procedimiento de Contratación',
        category: 'Marco Legal',
        alertLevel: 'media',
        completenessIndex: 5.0,
        maxCompleteness: 10,
        originalText: "La presente contratación se realizará mediante el procedimiento que corresponda según el monto y objeto. Se invita a los interesados a presentar sus propuestas.",
        suggestions: block3Suggestions,
        alerts: [{ id: 'al3-ups', severity: 'media', description: 'No se especifica el tipo de procedimiento (Licitación Pública, etc.).' }],
        missingConnections: [],
        applicableNorms: [{ id: 'an3-ups', name: 'Leyes de Contrataciones', article: 'Art. 26' }],
        legalRisk: 'Medio: La omisión del tipo de procedimiento puede ser un vicio legal que afecte la validez del proceso.',
      },
  ],
};
