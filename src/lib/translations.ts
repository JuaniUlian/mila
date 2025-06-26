
export type Language = 'es' | 'en' | 'fr' | 'pt';

type TextRecord = {
  [lang in Language]?: string;
};

// Helper to define translations, ensuring Spanish and English are provided.
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
  },
  preparePage: {
    step1: t('Paso 1: Seleccionar documento a validar', 'Step 1: Select document to validate'),
    searchPlaceholder: t('Buscar documento por nombre o palabra clave...', 'Search document by name or keyword...'),
    uploadFile: t('Subir nuevo archivo', 'Upload new file'),
    newFolder: t('Nueva Carpeta', 'New Folder'),
    step2: t('Paso 2: Seleccionar normativas para el análisis', 'Step 2: Select regulations for analysis'),
    uploadRegulation: t('Subir nueva normativa', 'Upload new regulation'),
    validateButton: t('Validar Pliego', 'Validate Document'),
    createFolderTitle: t('Crear Nueva Carpeta', 'Create New Folder'),
    folderNameLabel: t('Nombre de la carpeta', 'Folder name'),
    folderNamePlaceholder: t('Ej: Pliegos 2026', 'e.g., Bidding Documents 2026'),
    cancel: t('Cancelar', 'Cancel'),
    create: t('Crear', 'Create'),
    toastFileUploaded: t('Archivo Subido (Simulado)', 'File Uploaded (Simulated)'),
    toastFileAdded: t('El archivo "{fileName}" se ha agregado.', 'The file "{fileName}" has been added.'),
    toastError: t('Error', 'Error'),
    toastEmptyFolderName: t('El nombre de la carpeta no puede estar vacío.', 'Folder name cannot be empty.'),
    toastNoFolders: t('No hay carpetas para agregar el archivo.', 'There are no folders to add the file to.'),
    toastFolderCreated: t('Carpeta Creada', 'Folder Created'),
    toastFolderCreatedDesc: t('La carpeta "{folderName}" ha sido creada exitosamente.', 'The folder "{folderName}" has been created successfully.'),
    noFilesFound: t('No se encontraron archivos que coincidan con su búsqueda.', 'No files were found matching your search.'),
    noFoldersOrFiles: t('No hay carpetas o archivos.', 'No folders or files.'),
    file: t('archivo', 'file'),
    files: t('archivos', 'files'),
    addFileTo: t('Añadir archivo a {folderName}', 'Add file to {folderName}'),
    addFile: t('Añadir archivo', 'Add file'),
    folderEmpty: t('Esta carpeta está vacía.', 'This folder is empty.'),
  },

  loadingPage: {
    title: t('Procesando Pliego', 'Processing Document'),
    status1: t('Analizando documentos...', 'Analyzing documents...'),
    status2: t('Contrastando con normativas seleccionadas...', 'Cross-referencing with selected regulations...'),
    status3: t('Identificando posibles inconsistencias...', 'Identifying potential inconsistencies...'),
    status4: t('Generando sugerencias de mejora...', 'Generating improvement suggestions...'),
    status5: t('Preparando la plantilla viva...', 'Preparing the live template...'),
  },

  analysisPage: {
    documentTitlePrefix: t('Evaluación', 'Evaluation'),
    // PageHeader
    complianceScore: t('Puntaje de Cumplimiento', 'Compliance Score'),
    appliedSuggestions: t('Sugerencias Aplicadas', 'Applied Suggestions'),
    // IncidentsList
    incidentsTitle: t('Incidencias y Sugerencias', 'Incidents and Suggestions'),
    excellent: t('¡Excelente!', 'Excellent!'),
    noPendingIncidents: t('No hay incidencias pendientes de revisión.', 'No pending incidents to review.'),
    documentValidated: t('El documento ha sido completamente validado.', 'The document has been fully validated.'),
    // IncidentItem
    originalTextContext: t('Contexto del Texto Original', 'Original Text Context'),
    improvedProposal: t('Propuesta Mejorada por IA', 'AI-Improved Proposal'),
    draftingProposal: t('Propuesta de Redacción', 'Drafting Proposal'),
    legalJustification: t('Justificación Legal', 'Legal Justification'),
    technicalJustification: t('Justificación Técnica', 'Technical Justification'),
    estimatedConsequence: t('Consecuencia Estimada', 'Estimated Consequence'),
    apply: t('Aplicar', 'Apply'),
    edit: t('Editar', 'Edit'),
    discard: t('Descartar', 'Discard'),
    validating: t('Validando...', 'Validating...'),
    validate: t('Validar', 'Validate'),
    cancel: t('Cancelar', 'Cancel'),
    // RisksPanel
    partialResults: t('Resultados Parciales', 'Partial Results'),
    realTimeSummary: t('Resumen del análisis en tiempo real.', 'Real-time analysis summary.'),
    overallCompliance: t('Cumplimiento General', 'Overall Compliance'),
    totalIncidents: t('Incidencias Totales', 'Total Incidents'),
    highSeverity: t('Alta Severidad', 'High Severity'),
    mediumSeverity: t('Media Severidad', 'Medium Severity'),
    lowSeverity: t('Baja Severidad', 'Low Severity'),
    correctionsApplied: t('Correcciones Aplicadas', 'Corrections Applied'),
    involvedRegulations: t('Normativas Involucradas', 'Involved Regulations'),
    downloadReport: t('Descargar Informe', 'Download Report'),
    downloadReportDesc: t('Abre una previsualización del informe para imprimir o guardar como PDF.', 'Opens a report preview to print or save as PDF.'),
    // Dialog
    reportPreviewTitle: t('Previsualización de Informe', 'Report Preview'),
    // Toasts
    toastSuggestionApplied: t('✅ Sugerencia Aplicada', '✅ Suggestion Applied'),
    toastComplianceUpdated: t('El puntaje de cumplimiento ha sido actualizado.', 'The compliance score has been updated.'),
    toastSuggestionDiscarded: t('🗑️ Sugerencia Descartada', '🗑️ Suggestion Discarded'),
    toastSuggestionHasBeenDiscarded: t('La sugerencia ha sido descartada.', 'The suggestion has been discarded.'),
    toastSuggestionModified: t('Sugerencia Modificada y Aplicada', 'Suggestion Modified and Applied'),
    toastSuggestionTextUpdated: t('El texto de la sugerencia ha sido actualizado.', 'The suggestion text has been updated.'),
    toastNewSuggestionGenerated: t('✅ Nueva Sugerencia Generada', '✅ New Suggestion Generated'),
    toastNewProposalGenerated: t('La IA ha procesado tu edición y ha generado una nueva propuesta.', 'The AI has processed your edit and generated a new proposal.'),
    toastReportError: t('Error al generar el informe', 'Error generating report'),
    toastReportErrorDesc: t('No se pudo guardar la información para la previsualización. Intente de nuevo.', 'Could not save data for preview. Please try again.'),
  },

  reportPreviewPage: {
    loading: t('Cargando previsualización del informe...', 'Loading report preview...'),
    errorNotFound: t('No se encontraron datos para generar el informe. Por favor, vuelva a la página principal e intente de nuevo.', 'No data found to generate the report. Please return to the main page and try again.'),
    errorLoading: t('Ocurrió un error al cargar los datos del informe.', 'An error occurred while loading the report data.'),
    // ReportPreview Component
    reportTitle: t('Informe de Análisis Normativo', 'Regulatory Analysis Report'),
    generatedOn: t('Fecha de Generación', 'Generated on'),
    printButton: t('Imprimir o Guardar como PDF', 'Print or Save as PDF'),
    summaryTitle: t('Resumen General', 'General Summary'),
    complianceScore: t('Puntaje de Cumplimiento', 'Compliance Score'),
    complianceScoreDesc: t('Mide la calidad y conformidad del documento con las normativas aplicadas.', 'Measures the quality and conformity of the document with the applied regulations.'),
    completenessIndex: t('Índice de Completitud', 'Completeness Index'),
    completenessIndexDesc: t('Evalúa qué tan completo y detallado está el contenido del pliego.', 'Evaluates how complete and detailed the document content is.'),
    conclusionTitle: t('Conclusión del Análisis Normativo', 'Conclusion of the Regulatory Analysis'),
    validatedConclusionTitle: t('Documento Validado y Apto para Proceder', 'Document Validated and Fit to Proceed'),
    validatedConclusionText1: t('Se certifica que la totalidad de las <strong>{count}</strong> observaciones emitidas durante el análisis han sido debidamente atendidas, alcanzando un puntaje de cumplimiento final de <strong>{score}/100</strong>.', 'It is certified that all <strong>{count}</strong> observations issued during the analysis have been duly addressed, reaching a final compliance score of <strong>{score}/100</strong>.'),
    validatedConclusionText2: t('En virtud de lo anterior, se considera que el documento cumple con los estándares de calidad y conformidad normativa requeridos, encontrándose apto para continuar con las siguientes etapas del procedimiento administrativo correspondiente.', 'Therefore, the document is considered to meet the required quality and regulatory compliance standards, and is fit to proceed with the next stages of the corresponding administrative procedure.'),
    actionsSummary: t('Resumen de Acciones Realizadas:', 'Summary of Actions Taken:'),
    correctedSuggestions: t('Sugerencias Corregidas:', 'Corrected Suggestions:'),
    discardedSuggestions: t('Sugerencias Descartadas:', 'Discarded Suggestions:'),
    findingsTitle: t('Detalle de Hallazgos y Acciones Realizadas', 'Details of Findings and Actions Taken'),
    block: t('Bloque:', 'Block:'),
    originalTextContext: t('Contexto del Texto Original:', 'Original Text Context:'),
    legalJustification: t('Justificación Legal (Incumplimiento):', 'Legal Justification (Non-compliance):'),
    regulation: t('Normativa:', 'Regulation:'),
    noInconsistencies: t('No se encontraron inconsistencias.', 'No inconsistencies were found.'),
    status: {
      pending: t('Pendiente', 'Pending'),
      applied: t('Aplicado', 'Applied'),
      discarded: t('Descartado', 'Discarded'),
    },
    severity: {
      high: t('Alta', 'High'),
      medium: t('Media', 'Medium'),
      low: t('Baja', 'Low'),
    },
  },
  
  sidebar: {
      prepare: t('Preparar Pliego', 'Prepare Document'),
      plusBI: t('PLUS BI', 'PLUS BI'),
  },

  suggestionCategories: {
    'Legal': t('Legal', 'Legal'),
    'Técnica': t('Técnica', 'Technical'),
    'Administrativa': t('Administrativa', 'Administrative'),
    'Redacción': t('Redacción', 'Wording'),
  },
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
