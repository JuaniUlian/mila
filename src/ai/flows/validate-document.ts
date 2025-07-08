
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
    tipo: z.enum(["Irregularidad", "Fortaleza", "Oportunidad", "Sin hallazgos relevantes"]).describe("El tipo de hallazgo."),
    titulo_incidencia: z.string().describe("Un título breve y claro que describa el problema identificado (ej: 'Falta de claridad en las bases')."),
    articulo_o_seccion: z.string().describe("Artículo o sección específica de la normativa que se aplicó."),
    pagina: z.string().describe("Número de página del documento analizado donde se encuentra la evidencia del hallazgo."),
    gravedad: z.enum(["Alta", "Media", "Baja", "Informativa"]).describe("La severidad del hallazgo."),
    evidencia: z.string().describe("CITA TEXTUAL Y LITERAL del Documento Administrativo a Analizar. Es el texto que contiene el error. NUNCA, BAJO NINGUNA CIRCUNSTANCIA, debe contener texto de los Documentos Normativos."),
    propuesta_procedimiento: z.string().optional().describe("Descripción de las acciones o ajustes de procedimiento necesarios para subsanar la inconsistencia (ej. 'agregar requisitos al pliego', 'convocar nueva licitación'). Omitir este campo si la solución es puramente una corrección de redacción."),
    propuesta_redaccion: z.string().optional().describe("Texto alternativo redactado, listo para reemplazar el texto original. Solo debe incluirse si la corrección puede implementarse directamente en el documento. Omitir si no corresponde un cambio de redacción directo o si la solución es puramente de procedimiento."),
    justificacion_legal: z.string().describe("Explicación jurídica que fundamenta la inconsistencia, mencionando el artículo, la disposición aplicable y el principio jurídico afectado. AQUÍ SÍ SE CITA LA NORMATIVA."),
    justificacion_tecnica: z.string().describe("Elementos objetivos y técnicos que sustentan la identificación de la inconsistencia (referencias al propio documento, prácticas administrativas aceptadas, etc.)."),
    consecuencia_estimada: z.string().describe("Consecuencias potenciales si no se corrige la inconsistencia (ej. 'nulidad del proceso', 'riesgo de impugnaciones').")
});

const ValidateDocumentOutputSchema = z.object({
    findings: z.array(FindingSchema).describe("Una lista de todos los hallazgos encontrados en el documento."),
    complianceScore: z.number().min(0).max(100).describe("El porcentaje de Cumplimiento Normativo general del documento (0-100)."),
    legalRiskScore: z.number().min(0).max(100).describe("El porcentaje de Riesgo Legal general del documento (0-100)."),
});
export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  return validateDocumentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'validateDocumentPrompt',
    input: { schema: ValidateDocumentInputSchema },
    output: { schema: ValidateDocumentOutputSchema },
    prompt: `Eres un asistente legal-administrativo experto. Tu misión es analizar un **Documento Administrativo** usando un conjunto de **Documentos Normativos** como referencia.

**Documentos Proporcionados:**

1.  **El Documento Administrativo a Analizar (LA FUENTE PARA EL CAMPO 'evidencia'):** Este es el documento principal que debes revisar en busca de errores o inconsistencias.
    - Nombre: {{{documentName}}}
    - Contenido:
    \`\`\`
    {{{documentContent}}}
    \`\`\`

2.  **Los Documentos Normativos de Referencia (LA FUENTE PARA EL CAMPO 'justificacion_legal'):** Usa estos documentos para fundamentar tus hallazgos. NO uses su contenido para el campo 'evidencia'.
    {{#each regulations}}
    - Nombre Norma: {{this.name}}
    - Contenido Norma:
    \`\`\`
    {{{this.content}}}
    \`\`\`
    {{/each}}

**Tu Tarea y Regla MÁS IMPORTANTE:**
Tu tarea es encontrar inconsistencias en el **Documento Administrativo** basándote en los **Documentos Normativos**. Para cada inconsistencia, crearás un "hallazgo".

**REGLA DE ORO:** El campo \`evidencia\` de cada hallazgo DEBE ser una **CITA TEXTUAL Y EXACTA** del **"Documento Administrativo a Analizar"**. NUNCA, bajo ninguna circunstancia, copies texto de un "Documento Normativo" en el campo \`evidencia\`. El campo \`evidencia\` es el texto CON el error; el campo \`justificacion_legal\` es el texto que EXPLICA el error citando la norma.

**Instrucciones para cada hallazgo:**
1.  **titulo_incidencia**: Crea un título breve y claro que describa el problema (ej: "Falta de claridad en las bases", "Criterios de evaluación subjetivos").
2.  **evidencia**: **CITA TEXTUAL Y LITERAL del Documento Administrativo ({{{documentName}}}) que contiene la inconsistencia.** Si el error abarca varios párrafos, inclúyelos todos. **NO cites la normativa aquí.**
3.  **propuesta_procedimiento**: Si la solución requiere una acción (ej: 'agregar requisitos', 'emitir un dictamen'), descríbela aquí. Si el problema es solo de redacción, omite este campo.
4.  **propuesta_redaccion**: Si la solución es un cambio de texto directo, provee la nueva redacción aquí. Si la solución es solo de procedimiento, omite este campo. Si se requieren ambas, incluye ambos campos.
5.  **justificacion_legal**: Explica por qué el hallazgo vulnera la normativa, citando el artículo y el principio afectado. **Aquí sí puedes hacer referencia al contenido de los Documentos Normativos.**
6.  **justificacion_tecnica**: Indica los elementos objetivos que sustentan el hallazgo, haciendo referencia al propio Documento Administrativo o a prácticas aceptadas.
7.  **consecuencia_estimada**: Detalla los riesgos si no se corrige el hallazgo.
8.  **Si un texto del Documento Administrativo viola múltiples normativas, crea un hallazgo separado para cada una.**

**Instrucciones generales:**
- Sé crítico.
- Si detectas coherencia positiva, etiquétalo como Fortaleza u Oportunidad.
- Utiliza "Informativa" en 'gravedad' para observaciones sin consecuencias legales.
- No inventes, no generalices y no evalúes aspectos que no puedas vincular directamente con los documentos proporcionados.
- Evalúa el documento en su totalidad para proporcionar un "complianceScore" y un "legalRiskScore".

**Verificación Final Obligatoria:** Antes de generar la respuesta, revisa cada hallazgo. Asegúrate de que el campo \`evidencia\` contiene EXCLUSIVAMENTE texto del **"Documento Administrativo a Analizar"**. Si encuentras un error, corrígelo.

Responde únicamente en formato JSON, con la estructura de salida definida. No incluyas texto, comillas o decoraciones antes o después del JSON.
Si no encuentras ningún hallazgo relevante, responde con un array "findings" vacío y los scores correspondientes.
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

    