
import type { MilaAppPData, DocumentBlock } from './types';

const commonSuggestions = [
  {
    id: 'sug-generic-1', // Applied to 'objeto'
    text: "El presente contrato tiene por objeto: 1. La adquisición de licencias de software para la entidad. 2. La prestación de soporte técnico especializado durante 12 meses. Este acuerdo busca asegurar la continuidad operativa, la actualización tecnológica de las plataformas institucionales y cubrir integralmente las necesidades de software de la organización.",
    justification: {
      legal: "Principios de transparencia y publicidad (Ley 80 de 1993, Art. 24).",
      technical: "Facilita la comprensión por parte de los proponentes y reduce el riesgo de interpretaciones erróneas.",
    },
    appliedNorm: "Ley 80 de 1993, Art. 24",
    errorType: "Ambigüedad, Falta de claridad",
    estimatedConsequence: "Consultas recurrentes, posibles protestas o impugnaciones.",
    status: 'pending' as 'pending' | 'applied' | 'discarded',
  },
  {
    id: 'sug-generic-2', // Applied to 'requisitos'
    text: "Los proponentes deben satisfacer los requisitos financieros y técnicos especificados. Es mandatorio poseer experiencia previa en contrataciones con el sector público. El equipo técnico asignado deberá contar con las certificaciones vigentes pertinentes. La oferta técnica incluirá un cronograma de ejecución detallado. Se adjuntará el Registro Único Tributario (RUT) y el certificado de existencia y representación legal.",
    justification: {
      legal: "Principio de buena fe contractual.",
      technical: "Evita confusiones y contradicciones internas.",
    },
    appliedNorm: "Código Civil, Art. 1603",
    errorType: "Inconsistencia terminológica",
    estimatedConsequence: "Dificultad en la interpretación y aplicación del pliego.",
    status: 'pending' as 'pending' | 'applied' | 'discarded',
  }
];

const block1Suggestions = [ // For 'objeto'
  {
    id: 'sug1-obj',
    text: "El objeto del presente proceso de contratación es la adquisición de 100 licencias de software de tipo 'Suscripción Anual' para las herramientas ofimáticas y 20 licencias 'Perpetuas' para el software de diseño especializado. Adicionalmente, se contratará el soporte técnico especializado por 12 meses, con un tiempo de respuesta máximo de 4 horas para incidentes críticos y disponibilidad 24/7. Se busca garantizar la continuidad operativa y la actualización tecnológica de las plataformas institucionales.",
    justification: {
      legal: "Artículo 2.2.1.1.2.1.1 del Decreto 1082 de 2015 - Estudios y documentos previos.",
      technical: "Asegura una evaluación precisa de las ofertas y evita ambigüedades que puedan generar sobrecostos o incumplimientos.",
    },
    appliedNorm: "Decreto 1082 de 2015, Art. 2.2.1.1.2.1.1",
    errorType: "Omisión de información esencial",
    estimatedConsequence: "Riesgo de recibir propuestas no ajustadas, posibles controversias contractuales.",
    status: 'pending' as 'pending' | 'applied' | 'discarded',
  },
  {
    id: 'sug2-obj',
    text: "Adicionalmente, el proveedor garantizará la actualización a nuevas versiones del software cubierto por este contrato sin costo adicional para la Entidad durante toda la vigencia del servicio de soporte técnico, siempre que el modelo de licenciamiento adquirido así lo contemple.",
    justification: {
      legal: "Principio de eficiencia y economía en la contratación estatal.",
      technical: "Garantiza que la entidad se mantenga actualizada tecnológicamente y optimiza la inversión.",
    },
    appliedNorm: "Ley 80 de 1993, Art. 3",
    errorType: "Falta de previsión contractual",
    estimatedConsequence: "Posibles costos adicionales no presupuestados para actualizaciones.",
    status: 'applied' as 'pending' | 'applied' | 'discarded',
  }
];

const block2Suggestions = [ // For 'requisitos'
   {
    id: 'sug1-req',
    text: "Los proponentes deberán cumplir con los siguientes requisitos técnicos mínimos obligatorios: [Detallar aquí: e.g., Certificación ISO 9001, Nivel de seguridad X]. Adicionalmente, se valorarán como deseables, otorgando puntaje adicional, los siguientes aspectos: [Detallar aquí: e.g., Personal con certificación Y (hasta Z puntos)]. No se admitirán criterios de evaluación subjetivos.",
    justification: {
      legal: "Ley 1150 de 2007, Art. 5 - De la selección objetiva.",
      technical: "Permite una evaluación transparente y equitativa de las ofertas.",
    },
    appliedNorm: "Ley 1150 de 2007, Art. 5",
    errorType: "Criterios subjetivos o ambiguos",
    estimatedConsequence: "Riesgo de selección no objetiva, posibles demandas.",
    status: 'pending' as 'pending' | 'applied' | 'discarded',
  },
  {
    id: 'sug2-req',
    text: "Como requisito habilitante, se requiere experiencia previa demostrable en al menos tres (3) contratos ejecutados y terminados con entidades estatales en los últimos cinco (5) años, cuyo objeto sea similar al del presente proceso y cuya sumatoria de valores sea igual o superior a quinientos (500) SMMLV. Para cada contrato acreditado, se deberá adjuntar copia del mismo y certificación de cumplimiento expedida por la entidad contratante.",
    justification: {
      legal: "Decreto 1082 de 2015, Art. 2.2.1.1.1.5.2 - Capacidad jurídica y condiciones de experiencia.",
      technical: "Asegura la idoneidad del contratista para ejecutar el objeto contractual.",
    },
    appliedNorm: "Decreto 1082 de 2015, Art. 2.2.1.1.1.5.2",
    errorType: "Requisitos de experiencia insuficientes",
    estimatedConsequence: "Contratación de proponentes sin la experiencia adecuada.",
    status: 'applied' as 'pending' | 'applied' | 'discarded',
  }
];


export const mockData: MilaAppPData = {
  documentTitle: "Pliego Normativo XYZ-2024",
  overallComplianceScore: 78, // Example overall score (percentage)
  overallCompletenessIndex: 8.2, // Example overall score (index)
  blocks: [
    {
      id: 'objeto',
      name: 'Objeto',
      category: 'Definiciones Fundamentales',
      alertLevel: 'grave',
      completenessIndex: 5.6,
      maxCompleteness: 10,
      originalText: "El objeto del presente proceso de contratación es la adquisición de licencias de software para la entidad, así como el soporte técnico especializado durante un periodo de 12 meses. Se busca garantizar la continuidad operativa y la actualización tecnológica de las plataformas institucionales. Este contrato busca cubrir todas las necesidades de software de la organización.",
      suggestions: [...block1Suggestions, commonSuggestions[0]],
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
      completenessIndex: 7.2,
      maxCompleteness: 10,
      originalText: "Los proponentes deberán cumplir con los requisitos financieros y técnicos establecidos. Se requiere experiencia previa en contratos con el estado. El personal técnico debe estar certificado. La propuesta debe incluir un plan de trabajo detallado. Deben presentar el RUT y certificado de existencia.",
      suggestions: [...block2Suggestions, commonSuggestions[1]],
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
      completenessIndex: 8.9,
      maxCompleteness: 10,
      originalText: "La evaluación se basará en: Precio (50%), Calidad Técnica (30%), Experiencia (20%). Se asignarán puntos adicionales por innovación. El precio más bajo obtendrá el máximo puntaje. La calidad se medirá según la propuesta técnica.",
      suggestions: [
        {
          id: 'sug1-crit',
          text: "La evaluación se basará en: Precio (50%), Calidad Técnica (30%), y Experiencia (20%). Para la 'Calidad Técnica' (30 puntos), se evaluarán los siguientes sub-criterios: a) Metodología propuesta (hasta 15 puntos), b) Cumplimiento de especificaciones avanzadas (hasta 10 puntos), c) Plan de capacitación (hasta 5 puntos). La 'Innovación', que podrá otorgar hasta 5 puntos adicionales sobre el total, se medirá considerando la incorporación de tecnologías emergentes y soluciones creativas que aporten valor agregado.",
          justification: { legal: "Principio de transparencia y selección objetiva.", technical: "Evita discrecionalidad y facilita la preparación de ofertas competitivas." },
          appliedNorm: "Ley 1150 de 2007, Art. 5", errorType: "Falta de detalle en criterios", estimatedConsequence: "Riesgo de impugnaciones por subjetividad.", status: 'pending'
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
      completenessIndex: 9.5,
      maxCompleteness: 10,
      originalText: "El incumplimiento de las obligaciones contractuales dará lugar a las multas y sanciones previstas en la Ley y en el contrato. Se aplicará el artículo 86 de la Ley 1474 de 2011. Las multas no podrán superar el 10% del valor del contrato.",
      suggestions: [
         {
          id: 'sug1-san',
          text: "Para la imposición de multas por incumplimiento, se seguirá el siguiente procedimiento garantizando el debido proceso: 1. Comunicación formal al contratista detallando el presunto incumplimiento y la multa aplicable. 2. Otorgamiento de un plazo de cinco (5) días hábiles al contratista para presentar descargos y pruebas. 3. Análisis de los descargos por parte de la Entidad. 4. Emisión de acto administrativo motivado que decide sobre la imposición de la multa, contra el cual procederán los recursos de ley.",
          justification: { legal: "Ley 1437 de 2011 (CPACA) - Debido Proceso Administrativo.", technical: "Brinda seguridad jurídica a las partes." },
          appliedNorm: "Ley 1437 de 2011", errorType: "Omisión procedimental", estimatedConsequence: "Posibles nulidades en la imposición de sanciones.", status: 'pending'
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


    
