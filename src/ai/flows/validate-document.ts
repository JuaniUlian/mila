
'use server';
/**
 * @fileOverview An AI flow to validate an administrative document against a set of normative documents.
 *
 * - validateDocument - A function that handles the document validation process.
 * - ValidateDocumentInput - The input type for the validateDocument function.
 * - ValidateDocumentOutput - The return type for the validateDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Input Schema
const RegulationSchema = z.object({
  name: z.string().describe("The name of the normative document file."),
  content: z.string().describe("The full text content of the normative document."),
});

const ValidateDocumentInputSchema = z.object({
  documentName: z.string().describe("The name of the administrative document file being analyzed."),
  documentContent: z.string().describe("The full text content of the administrative document."),
  regulations: z.array(RegulationSchema).describe("An array of normative documents to validate against."),
});
export type ValidateDocumentInput = z.infer<typeof ValidateDocumentInputSchema>;

// Output Schema
const FindingSchema = z.object({
    nombre_archivo_normativa: z.string().describe("Nombre del archivo de norma o manual usado como referencia para este hallazgo."),
    nombre_archivo_documento: z.string().describe("Nombre del archivo del documento que se está analizando."),
    tipo: z.enum(["Irregularidad", "Mejora de Redacción", "Sin hallazgos relevantes"]).describe("El tipo de hallazgo. 'Irregularidad' para errores legales/normativos. 'Mejora de Redacción' para problemas de claridad, estilo o ambigüedad."),
    titulo_incidencia: z.string().describe("Un título breve y claro que describa el problema identificado (ej: 'Falta de claridad en las bases', 'Ambigüedad en el objeto')."),
    articulo_o_seccion: z.string().describe("Artículo o sección específica de la normativa que se aplicó. Para mejoras de redacción, puede ser 'N/A' si no aplica a una norma específica."),
    pagina: z.string().describe("Número de página del documento analizado donde se encuentra la evidencia del hallazgo."),
    gravedad: z.enum(["Alta", "Media", "Baja", "Informativa"]).describe("La severidad del hallazgo."),
    evidencia: z.string().describe("CITA TEXTUAL Y LITERAL del DOCUMENTO_A_REVISAR que contiene el error o la frase a mejorar. NUNCA, BAJO NINGUNA CIRCUNSTANCIA, debe contener texto de las NORMAS_DE_CONSULTA."),
    propuesta_procedimiento: z.string().optional().describe("Acción de procedimiento administrativo a realizar (ej. 'emitir dictamen técnico', 'convocar nueva licitación'). Usar solo para indicar trámites, no para sugerir texto. Omitir si la solución es solo una corrección de redacción."),
    propuesta_redaccion: z.string().optional().describe("Texto alternativo completo y listo para reemplazar el original. NUNCA debe contener instrucciones. Omitir si la solución es puramente de procedimiento."),
    justificacion_legal: z.string().describe("Explicación jurídica que fundamenta la inconsistencia o la mejora. Para mejoras de redacción, la justificación debe basarse en principios de claridad y precisión contractual/administrativa."),
    justificacion_tecnica: z.string().describe("Elementos objetivos y técnicos que sustentan la identificación de la inconsistencia (referencias al propio documento, prácticas administrativas aceptadas, etc.)."),
    consecuencia_estimada: z.string().describe("Consecuencias potenciales si no se corrige la inconsistencia (ej. 'nulidad del proceso', 'riesgo de impugnaciones', 'confusión en los oferentes').")
});

const ValidateDocumentOutputSchema = z.object({
    findings: z.array(FindingSchema).describe("Una lista de todos los hallazgos encontrados en el documento."),
    complianceScore: z.number().min(0).max(100).describe("El porcentaje de Cumplimiento Normativo (calculado como 100 menos las penalizaciones por la gravedad de cada hallazgo)."),
    legalRiskScore: z.number().min(0).max(100).describe("El porcentaje de Riesgo Legal (calculado como 100 - complianceScore)."),
});
export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  // Authorization check removed for simpler demo environment.
  return validateDocumentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'validateDocumentPrompt',
    input: { schema: ValidateDocumentInputSchema },
    output: { schema: ValidateDocumentOutputSchema },
    prompt: `Eres un asistente especializado en auditoría legal-administrativa que detecta incidencias y irregularidades en documentos públicos mediante el análisis cruzado con su marco normativo correspondiente.
Contexto del Proceso
El usuario ha completado un proceso de dos pasos donde participan:
Partes Involucradas:

Organismo público emisor: Entidad que emite el documento administrativo
Ciudadanos/Administrados: Destinatarios o beneficiarios del acto administrativo
Proveedores/Contratistas: En caso de licitaciones, compras o contrataciones
Organismos de control: Entidades fiscalizadoras competentes
Otros organismos públicos: Que puedan tener competencias concurrentes

Documentos Cargados:

Documento administrativo a auditar (contratos, licitaciones, decretos, resoluciones, trámites, etc.)
Marco normativo aplicable (leyes, reglamentos, manuales, criterios técnicos)

Limitaciones Técnicas del Sistema:

El texto ha sido extraído mediante OCR (Reconocimiento Óptico de Caracteres)
Pueden existir errores de lectura en números, fechas o caracteres especiales
La calidad del texto depende de la legibilidad del documento original
Algunos elementos gráficos, tablas o firmas pueden no ser interpretados correctamente

Objetivo
Identificar únicamente incidencias que requieran atención, corrección o aclaración. El usuario podrá:

Aceptar la incidencia detectada
Editar la propuesta de solución
Re-validar contra la normativa
Descartar la incidencia

Tipos de Incidencias a Detectar
1. Incidencias de Redacción

Errores gramaticales u ortográficos
Redacción confusa o ambigua
Terminología inadecuada o imprecisa
Contradicciones internas en el texto
Uso incorrecto de términos técnicos o jurídicos
Falta de claridad en instrucciones o procedimientos

2. Incidencias de Forma

Formato incorrecto del documento
Ausencia de encabezados, fechas o numeración
Firmas faltantes o incorrectas
Sellos o membretes ausentes
Estructura documental inadecuada
Falta de anexos o documentos complementarios requeridos

3. Incidencias de Materia

Contenido que excede la competencia del órgano emisor
Regulación de aspectos no autorizados por la norma habilitante
Contradicción con normativa de jerarquía superior
Invasión de competencias de otros organismos
Regulación de materias reservadas a otros poderes

4. Incidencias Procedimentales

Omisión de etapas obligatorias del procedimiento
Incumplimiento de plazos establecidos
Falta de consultas o audiencias públicas requeridas
Ausencia de estudios técnicos obligatorios
Falta de dictámenes preceptivos
Notificaciones insuficientes o incorrectas

5. Incidencias Legales

Falta de fundamentación jurídica
Violación de principios constitucionales
Incumplimiento de normativa específica aplicable
Ausencia de base legal para la actuación
Vulneración de derechos fundamentales
Contradicción con jurisprudencia establecida

6. Incidencias Contables

Errores en cálculos o montos
Falta de respaldo documental de gastos
Inconsistencias en presupuestos o costos
Ausencia de códigos presupuestarios correctos
Partidas no autorizadas o mal imputadas
Falta de controles financieros requeridos

7. Incidencias Administrativas

Ausencia de registros o archivos necesarios
Falta de comunicaciones internas requeridas
Incumplimiento de circuitos administrativos
Ausencia de controles de gestión
Falta de seguimiento de expedientes
Deficiencias en sistemas de información

8. Coincidencias de Datos Sospechosas

Datos personales, empresariales o financieros que se repiten
Direcciones, teléfonos o contactos coincidentes entre distintas partes
Fechas de constitución empresarial cercanas a licitaciones
Representantes legales compartidos entre empresas competidoras
Vínculos societarios no declarados
Similitudes en propuestas técnicas o económicas

9. Posibles Direccionamientos

Requisitos técnicos excesivamente específicos que favorecen a un proveedor
Plazos de presentación muy cortos que limitan la competencia
Criterios de evaluación sesgados hacia características particulares
Modificaciones de pliegos que benefician a oferentes específicos
Información privilegiada que puede haber sido compartida
Condiciones contractuales que favorecen intereses particulares

10. Otras Irregularidades

Aspectos éticos comprometidos
Conflictos de interés no declarados
Falta de transparencia en procesos
Irregularidades en publicaciones oficiales
Deficiencias en mecanismos de control
Incumplimientos de buenas prácticas administrativas

Instrucciones Finales

Analiza sistemáticamente cada sección del documento contra la normativa aplicable
Detecta solo irregularidades reales que requieran corrección
Proporciona evidencia textual para cada incidencia
Ofrece soluciones específicas y viables
Justifica técnica y legalmente cada detección
No detectes aspectos positivos - solo irregularidades que necesiten atención

Si no detectas irregularidades relevantes, responde con un array "findings" vacío.

**CONTEXTO PARA LA EJECUCIÓN:**
*   **DOCUMENTO_A_REVISAR:**
    *   Nombre: {{{documentName}}}
    *   Contenido:
        \`\`\`
        {{{documentContent}}}
        \`\`\`

*   **NORMAS_DE_CONSULTA:**
    {{#each regulations}}
    *   Nombre Norma: {{this.name}}
    *   Contenido Norma:
        \`\`\`
        {{{this.content}}}
        \`\`\`
    {{/each}}

**REGLA FUNDAMENTAL E INQUEBRANTABLE:**
El campo \`evidencia\` de cada hallazgo debe ser una **CITA LITERAL y EXACTA** de un fragmento del **DOCUMENTO_A_REVISAR**.
**JAMÁS, BAJO NINGUNA CIRCUNSTANCIA**, utilices texto de las **NORMAS_DE_CONSULTA** para rellenar el campo \`evidencia\`.

**Instrucciones para el Cálculo de Scores:**
*   **complianceScore**: Calcula el puntaje de la siguiente manera:
    *   Comienza con 100.
    *   Resta 25 por cada hallazgo 'Alta'.
    *   Resta 15 por cada hallazgo 'Media'.
    *   Resta 5 por cada hallazgo 'Baja'.
    *   Mínimo 0.
    *   Si no hay hallazgos, el score es 100.
*   **legalRiskScore**: Calcula como \`100 - complianceScore\`.

Responde únicamente en el formato JSON solicitado. No incluyas texto, comillas o decoraciones antes o después del JSON.
`,
});

const validateDocumentFlow = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
