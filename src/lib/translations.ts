
export type Language = 'es' | 'en' | 'fr' | 'pt';

type TextRecord = {
  [lang in Language]?: string;
};

const t = (es: string, en: string): TextRecord => ({ es, en });

export const translations = {
  nav: {
    demo: t('Ir a Demo', 'Go to Demo'),
    deck: t('Descargar Deck', 'Download Deck'),
  },
  hero: {
    title: t('MILA', 'MILA'),
    subtitle: t('La herramienta para gobiernos que acelera procesos, evita errores y asegura el cumplimiento normativo.', 'The tool for governments that accelerates processes, prevents errors, and ensures regulatory compliance.'),
  },
  whatIsMila: {
    title: t('¿Qué hace MILA?', 'What does MILA do?'),
    analysisTitle: t('Análisis inteligente', 'Intelligent analysis'),
    analysisText: t('Divide los documentos en bloques y analiza punto por punto para detectar errores y riesgos.', 'Divides documents into blocks and analyzes point by point to detect errors and risks.'),
    alertsTitle: t('Alertas automáticas', 'Automatic alerts'),
    alertsText: t('Clasifica los errores en niveles de riesgo (rojo, amarillo, verde) para que sepas qué atender primero.', 'Classifies errors into risk levels (red, yellow, green) so you know what to address first.'),
    editingTitle: t('Edición ágil', 'Agile editing'),
    editingText: t('Editá y corregí desde la plataforma, con control de versiones y sugerencias integradas.', 'Edit and correct from the platform, with version control and integrated suggestions.'),
    scoreTitle: t('Puntaje legal', 'Legal score'),
    scoreText: t('Recibí una puntuación por documento o bloque, según el cumplimiento normativo.', 'Receive a score per document or block, according to regulatory compliance.'),
    normsTitle: t('Normas vinculadas', 'Linked regulations'),
    normsText: t('MILA te muestra en qué norma o resolución se basa cada sugerencia.', 'MILA shows you which regulation or resolution each suggestion is based on.'),
    exportTitle: t('Exportá y compartí', 'Export and share'),
    exportText: t('Generá una versión corregida del documento para compartir fácilmente.', 'Generate a corrected version of the document to share easily.'),
  },
  results: {
    title: t('Resultados Reales', 'Real Results'),
    disclaimer: t('*Basado en promedios de uso en gobiernos de distintas escalas', '*Based on usage averages in governments of different scales'),
    stat1: t('Errores detectados vs revisión humana', 'Errors detected vs human review'),
    stat2: t('Tiempo de revisión MILA vs circuito tradicional', 'MILA review time vs traditional circuit'),
    stat3: t('Gobiernos reportan mejoras en control interno', 'Governments report improvements in internal control'),
    stat4: t('Reducción de tiempos en validación de circuitos internos', 'Reduction in internal circuit validation times'),
    stat5: t('Tipos de documentos ya validados en municipios reales', 'Types of documents already validated in real municipalities'),
    stat6: t('Conformidad con criterios de control legal y administrativo', 'Compliance with legal and administrative control criteria'),
  },
  differentiators: {
    title: t('¿En qué se diferencia de ChatGPT y otras IA?', 'How is it different from ChatGPT and other AIs?'),
    trainingTitle: t('Entrenamiento especializado', 'Specialized training'),
    trainingText: t('MILA está entrenada específicamente con normativa local que le cargues, prácticas de control interno y criterios de auditoría. No es una IA genérica.', 'MILA is specifically trained with local regulations you upload, internal control practices, and audit criteria. It is not a generic AI.'),
    docsTitle: t('Entiende documentos públicos', 'Understands public documents'),
    docsText: t('Puede identificar contratos, decretos, resoluciones y documentos administrativos con lógica jurídica-administrativa, no solo texto libre.', 'It can identify contracts, decrees, resolutions, and administrative documents with legal-administrative logic, not just free text.'),
    risksTitle: t('Detecta riesgos, no solo errores', 'Detects risks, not just errors'),
    risksText: t('MILA no corrige ortografía: clasifica observaciones por riesgo legal, operativo o de control, con semáforo y recomendaciones aplicables.', 'MILA does not correct spelling: it classifies observations by legal, operational, or control risk, with a traffic light system and applicable recommendations.'),
    govTitle: t('Diseñada para gobiernos', 'Designed for governments'),
    govText: t('Desde la carga hasta los reportes, todo está pensado para secretarías legales, equipos técnicos y áreas administrativas del Estado.', 'From uploading to reports, everything is designed for legal secretariats, technical teams, and administrative areas of the State.'),
  },
  faq: {
    title: t('Preguntas Frecuentes', 'Frequently Asked Questions'),
    q1: t('¿Reemplaza al equipo legal?', 'Does it replace the legal team?'),
    a1: t('No. Lo potencia. MILA automatiza lo repetitivo y permite al equipo enfocarse en lo importante.', 'No. It enhances it. MILA automates the repetitive and allows the team to focus on what\'s important.'),
    q2: t('¿Se pueden subir nuestras normativas internas?', 'Can we upload our internal regulations?'),
    a2: t('Sí. Podés incorporar reglamentos propios y MILA los usará como referencia.', 'Yes. You can incorporate your own regulations and MILA will use them as a reference.'),
    q3: t('¿Qué pasa si mi municipio no tiene sistema de gestión documental?', 'What if my municipality does not have a document management system?'),
    a3: t('No hay problema. MILA funciona con carga directa de archivos Word o PDF.', 'No problem. MILA works with direct upload of Word or PDF files.'),
    q4: t('¿Cuánto tiempo toma capacitar a mi equipo?', 'How long does it take to train my team?'),
    a4: t('MILA es intuitiva. En promedio, en menos de 2 horas tu equipo puede usarla con autonomía total.', 'MILA is intuitive. On average, in less than 2 hours your team can use it with full autonomy.'),
    q5: t('¿Qué costo tiene?', 'What is the cost?'),
    a5: t('Hay planes adaptados a cada tamaño de municipio. Además, ofrecemos licencias promocionales para primeros adoptantes.', 'There are plans adapted to each municipality size. In addition, we offer promotional licenses for early adopters.'),
    q6: t('¿Puede ayudarme con observaciones del Tribunal de Cuentas?', 'Can it help me with observations from the Court of Auditors?'),
    a6: t('Sí. MILA detecta muchas de las observaciones típicas antes de que lleguen a auditoría, y sugiere mejoras alineadas con prácticas de control interno.', 'Yes. MILA detects many of the typical observations before they reach an audit, and suggests improvements aligned with internal control practices.'),
  },
  cta: {
    title: t('¿Querés MILA en tu municipio?', 'Want MILA in your municipality?'),
    contact: t('Contactar', 'Contact'),
  },
  footer: {
    developedBy: t('MILA es una solución GovTech desarrollada por PLUS BI', 'MILA is a GovTech solution developed by PLUS BI'),
    website: t('pluscompol.com', 'pluscompol.com'),
    location: t('Argentina', 'Argentina'),
  }
};

// Helper function to get translation with fallback
export const useTranslations = (lang: Language) => {
  return (key: string): string => {
    const path = key.split('.');
    let result: any = translations;
    for (const p of path) {
      result = result?.[p];
      if (!result) return key; // Return key if path is invalid
    }
    // Fallback to Spanish if the selected language translation is not available
    return result?.[lang] || result?.['es'] || key;
  };
};
