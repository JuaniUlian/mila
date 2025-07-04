
import { useCallback } from 'react';

export type Language = 'es' | 'en';

type TextRecord = {
  [lang in Language]?: string;
};

// Helper to define translations, ensuring Spanish and English are provided.
const t = (es: string, en: string): TextRecord => ({ es, en });

export const translations = {
  nav: {
    demo: t('Probar ahora', 'Try now'),
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
    a1: t('No, en absoluto. MILA funciona como un asistente o copiloto para el equipo legal. Automatiza la primera revisión, detectando errores comunes y repetitivos. Esto libera tiempo valioso para que los abogados se enfoquen en tareas estratégicas de alto nivel que requieren su juicio experto.', 'No, not at all. MILA acts as an assistant or co-pilot for the legal team. It automates the initial review, detecting common and repetitive errors. This frees up valuable time for lawyers to focus on high-level strategic tasks that require their expert judgment.'),
    q7: t('¿Mis documentos están seguros?', 'Is my data secure?'),
    a7: t('Absolutamente. MILA opera en un entorno seguro y privado. Los documentos que subís y las normativas que cargás son exclusivos para tu instancia y no se utilizan para entrenar modelos públicos. La confidencialidad es nuestra máxima prioridad.', 'Absolutely. MILA operates in a secure and private environment. The documents you upload and the regulations you load are exclusive to your instance and are not used to train public models. Confidentiality is our highest priority.'),
    q2: t('¿Se pueden subir nuestras normativas internas?', 'Can we upload our internal regulations?'),
    a2: t('Sí. De hecho, es una de sus funciones clave. Podés cargar manuales de procedimiento, decretos, ordenanzas y cualquier normativa propia. MILA los incorpora a su base de conocimiento privada y los usa como referencia exclusiva para tus análisis, garantizando que las sugerencias sean 100% relevantes para tu gobierno.', 'Yes. In fact, it is one of its key features. You can upload procedure manuals, decrees, ordinances, and any of your own regulations. MILA incorporates them into its private knowledge base and uses them as an exclusive reference for your analyses, ensuring that suggestions are 100% relevant to your government.'),
    q3: t('¿Qué pasa si mi municipio no tiene sistema de gestión documental?', 'What if my municipality does not have a document management system?'),
    a3: t('No hay ningún problema. MILA está diseñada para ser flexible. Funciona con la carga directa de archivos (como Word o PDF) sin necesidad de integraciones complejas. No depende de que tengas un sistema de expedientes electrónicos previo.', 'No problem at all. MILA is designed to be flexible. It works with direct file uploads (like Word or PDF) without needing complex integrations. It does not depend on you having a prior electronic records system.'),
    q8: t('¿Necesito instalar algo o tener computadoras especiales?', 'Do I need to install anything or have special computers?'),
    a8: t('No. MILA es una plataforma web, lo que significa que solo necesitás un navegador de internet (como Chrome, Firefox o Edge) en cualquier computadora. No requiere instalación ni equipos potentes, facilitando el acceso a todo el personal.', 'No. MILA is a web platform, which means you only need an internet browser (like Chrome, Firefox, or Edge) on any computer. It does not require installation or powerful equipment, facilitating access for all staff.'),
    q4: t('¿Cuánto tiempo toma capacitar a mi equipo?', 'How long does it take to train my team?'),
    a4: t('La plataforma es muy intuitiva, diseñada con una lógica similar a las herramientas de oficina que tu equipo ya usa. La capacitación inicial suele tomar menos de dos horas y se enfoca más en cómo interpretar las sugerencias y optimizar los flujos de trabajo que en el uso del software en sí. La adopción es muy rápida.', 'The platform is very intuitive, designed with a logic similar to the office tools your team already uses. Initial training usually takes less than two hours and focuses more on how to interpret suggestions and optimize workflows than on using the software itself. Adoption is very fast.'),
    q5: t('¿Qué costo tiene?', 'What is the cost?'),
    a5: t('Entendemos las realidades presupuestarias de los gobiernos. Por eso, ofrecemos planes flexibles adaptados al tamaño y las necesidades de cada municipio. Además, tenemos licencias promocionales para los primeros adoptantes en cada región.', 'We understand the budgetary realities of governments. That\'s why we offer flexible plans adapted to the size and needs of each municipality. Additionally, we have promotional licenses for early adopters in each region.'),
    q6: t('¿Puede ayudarme con observaciones del Tribunal de Cuentas?', 'Can it help me with observations from the Court of Auditors?'),
    a6: t('Definitivamente. Ayuda a detectar de forma preventiva muchos de los errores típicos (falta de firmas, errores en plazos, justificaciones débiles) antes de que el expediente sea enviado, reduciendo significativamente la probabilidad de recibir observaciones formales.', 'Definitely. It helps to preemptively detect many of the typical errors (missing signatures, errors in deadlines, weak justifications) before the file is sent, significantly reducing the probability of receiving formal observations.'),
    q9: t('¿Y si la IA se equivoca? ¿Quién es el responsable?', 'What if the AI makes a mistake? Who is responsible?'),
    a9: t('Es una pregunta clave. MILA es una herramienta de asistencia y sus sugerencias no son vinculantes. El equipo legal y técnico siempre tiene la última palabra. La plataforma está diseñada para ser un "copiloto" que detecta y sugiere, pero la decisión final siempre es potestad del criterio experto del funcionario, quien utiliza las sugerencias como un valioso insumo para enriquecer y validar el documento.', 'This is a key question. MILA is an assistance tool, and its suggestions are not binding. The legal and technical team always has the final say. The platform is designed to be a "co-pilot" that detects and suggests, but the final decision is always at the discretion of the official\'s expert judgment, who uses the suggestions as a valuable input to enrich and validate the document.'),
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
    addFile: t('Añadir archivo', 'Add file'),
    addFileTo: t('Añadir archivo a {folderName}', 'Add file to {folderName}'),
    cancel: t('Cancelar', 'Cancel'),
    create: t('Crear', 'Create'),
    createFolderTitle: t('Crear Nueva Carpeta', 'Create New Folder'),
    file: t('archivo', 'file'),
    files: t('archivos', 'files'),
    folderEmpty: t('Esta carpeta está vacía.', 'This folder is empty.'),
    folderNameLabel: t('Nombre de la carpeta', 'Folder name'),
    folderNamePlaceholder: t('Ej: Pliegos 2026', 'e.g., Bidding Documents 2026'),
    newFolder: t('Nueva Carpeta', 'New Folder'),
    nextButton: t('Siguiente', 'Next'),
    backButton: t('Volver', 'Back'),
    selectedFilePrompt: t('Seleccionado:', 'Selected:'),
    noFilesFound: t('No se encontraron archivos que coincidan con su búsqueda.', 'No files were found matching your search.'),
    noFoldersOrFiles: t('No hay carpetas o archivos.', 'No folders or files.'),
    searchPlaceholder: t('Buscar documento por nombre o palabra clave...', 'Search document by name or keyword...'),
    step1: t('Paso 1: Seleccionar documento a validar', 'Step 1: Select document to validate'),
    step2: t('Paso 2: Seleccionar normativas para el análisis', 'Step 2: Select regulations for analysis'),
    toastError: t('Error', 'Error'),
    toastEmptyFolderName: t('El nombre de la carpeta no puede estar vacío.', 'Folder name cannot be empty.'),
    toastFileAdded: t('El archivo "{fileName}" se ha agregado.', 'The file "{fileName}" has been added.'),
    toastFileUploaded: t('Archivo Subido (Simulado)', 'File Uploaded (Simulated)'),
    toastFolderCreated: t('Carpeta Creada', 'Folder Created'),
    toastFolderCreatedDesc: t('La carpeta "{folderName}" ha sido creada exitosamente.', 'The folder "{folderName}" has been created successfully.'),
    toastNoFolders: t('No hay carpetas para agregar el archivo.', 'There are no folders to add the file to.'),
    uploadFile: t('Subir nuevo archivo', 'Upload new file'),
    uploadRegulation: t('Subir nueva normativa', 'Upload new regulation'),
    validateButton: t('Validar Pliego', 'Validate Document'),
    readyToValidate: t('Listo para Validar', 'Ready to Validate'),
    regulationSelected: t('normativa seleccionada', 'regulation selected'),
    regulationsSelected: t('normativas seleccionadas', 'regulations selected'),
    selectRegulationsPrompt: t('Seleccione una o más normativas', 'Select one or more regulations'),
    // File actions
    rename: t('Renombrar', 'Rename'),
    move: t('Mover', 'Move'),
    delete: t('Eliminar', 'Delete'),
    renameFile: t('Renombrar Archivo', 'Rename File'),
    moveFile: t('Mover Archivo', 'Move File'),
    deleteFile: t('Archivo Eliminado', 'File Deleted'),
    fileOptions: t('Opciones de archivo', 'File options'),
    newFileNameLabel: t('Nuevo nombre para "{fileName}"', 'New name for "{fileName}"'),
    moveFileToLabel: t('Mover "{fileName}" a la carpeta:', 'Move "{fileName}" to folder:'),
    confirmDeleteTitle: t('Confirmar Eliminación', 'Confirm Deletion'),
    confirmDeleteDesc: t('¿Está seguro de que desea eliminar el archivo {fileName}? Esta acción no se puede deshacer.', 'Are you sure you want to delete the file {fileName}? This action cannot be undone.'),
    renamedTo: t('ha sido renombrado a', 'has been renamed to'),
    movedTo: t('ha sido movido a', 'has been moved to'),
    selectDestinationFolder: t('Debe seleccionar una carpeta de destino.', 'You must select a destination folder.'),
    deletedSuccess: t('ha sido eliminado.', 'has been deleted.'),
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
    documentValidated: t('El documento ha sido completamente validado.', 'The document has been completely validated.'),
    pendingSingular: t('pendiente', 'pending'),
    pendingPlural: t('pendientes', 'pending'),
    // IncidentItem
    improvedProposal: t('Propuesta Mejorada por IA', 'AI-Improved Proposal'),
    draftingProposal: t('Propuesta de Redacción', 'Drafting Proposal'),
    solutionProposal: t('Propuesta de Solución', 'Solution Proposal'),
    legalJustification: t('Justificación Legal', 'Legal Justification'),
    technicalJustification: t('Justificación Técnica', 'Technical Justification'),
    estimatedConsequence: t('Consecuencia Estimada', 'Estimated Consequence'),
    apply: t('Aplicar', 'Apply'),
    edit: t('Editar', 'Edit'),
    discard: t('Descartar', 'Discard'),
    validating: t('Validando...', 'Validating...'),
    validate: t('Validar', 'Validate'),
    cancel: t('Cancelar', 'Cancel'),
    citedRegulation: t('Normativa Citada', 'Cited Regulation'),
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
    originalText: t('Texto Original', 'Original Text'),
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
      settings: t('Configuración', 'Settings'),
  },

  settingsDialog: {
    title: t('Configuración', 'Settings'),
    languageLabel: t('Idioma', 'Language'),
    languagePlaceholder: t('Seleccionar idioma', 'Select language'),
    close: t('Cerrar', 'Close'),
  },

  suggestionCategories: {
    'Legal': t('Legal', 'Legal'),
    'Administrativa': t('Administrativa', 'Administrative'),
    'Redacción': t('Redacción', 'Wording'),
    'normativa': t('Normativa', 'Regulation'),
  },
};

// Helper function to get translation with fallback
export const useTranslations = (lang: Language) => {
  return useCallback((key: string): string => {
    const path = key.split('.');
    let result: any = translations;
    for (const p of path) {
      result = result?.[p];
      if (!result) return key; // Return key if path is invalid
    }
    // Fallback to Spanish if the selected language translation is not available
    return result?.[lang] || result?.['es'] || key;
  }, [lang]);
};

    
