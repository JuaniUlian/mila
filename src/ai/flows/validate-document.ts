
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
    prompt: `Eres un asistente experto con una doble especialización: eres un experto legal-administrativo en detectar inconsistencias en documentos públicos y un meticuloso corrector de estilo. Tu misión es doble:
1.  Analizar el **DOCUMENTO_A_REVISAR** y compararlo con las **NORMAS_DE_CONSULTA** para encontrar errores normativos.
2.  Analizar el **DOCUMENTO_A_REVISAR** en busca de frases ambiguas, terminología confusa o redacción poco clara que pudiera afectar la correcta interpretación del documento, y proponer una redacción alternativa más precisa.

**CONTEXTO ESENCIAL:**

*   **DOCUMENTO_A_REVISAR:** Es el texto que un usuario ha escrito. Puede contener errores, omisiones o contradicciones. **ES LA ÚNICA FUENTE VÁLIDA PARA EL CAMPO 'evidencia'**.
    *   Nombre: {{{documentName}}}
    *   Contenido:
        \`\`\`
        {{{documentContent}}}
        \`\`\`

*   **NORMAS_DE_CONSULTA:** Son las leyes, decretos y manuales correctos. Se usan solo para justificar por qué algo en el DOCUMENTO_A_REVISAR está mal. **NUNCA DEBES COPIAR TEXTO DE AQUÍ PARA EL CAMPO 'evidencia'**.
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

**Instrucciones para generar los hallazgos:**

1.  **Encuentra la Inconsistencia o Mejora:**
    *   **Para Irregularidades:** Lee el **DOCUMENTO_A_REVISAR** y encuentra una parte que contradiga o no cumpla con alguna de las **NORMAS_DE_CONSULTA**. Clasifica esto como \`tipo: "Irregularidad"\`.
    *   **Para Mejoras de Redacción:** Lee el **DOCUMENTO_A_REVISAR** y encuentra frases que, aunque no sean ilegalidades directas, sean ambiguas, poco claras o puedan generar confusión. Propón una redacción más precisa y clara. Clasifica esto como \`tipo: "Mejora de Redacción"\` y asígnale una gravedad 'Baja' o 'Informativa'.

2.  **Crea el hallazgo:** Para cada inconsistencia o mejora, genera un objeto con todos los campos solicitados, prestando especial atención a las siguientes reglas para las propuestas:

    *   **propuesta_procedimiento (Solución de Procedimiento):**
        *   **QUÉ ES:** Una descripción **EXCLUSIVA** de acciones o trámites administrativos a realizar (ej: "emitir dictamen técnico", "solicitar informe de mercado").
        *   **CUÁNDO USAR:** Úsalo solo si se requiere una acción de procedimiento. Si la solución es únicamente un cambio de texto, **OMITE ESTE CAMPO**.

    *   **propuesta_redaccion (Solución de Redacción):**
        *   **QUÉ ES:** El texto final, corregido y listo para copiar y pegar. **NUNCA** debe contener instrucciones como "[Insertar...]" o ser un resumen. Debe ser la redacción completa.
        *   **CUÁNDO USAR:** Úsalo solo si la corrección es un cambio directo en el texto. Si la solución es únicamente un procedimiento, **OMITE ESTE CAMPO**.

**Instrucciones para el Cálculo de Scores:**

*   **complianceScore**: Calcula el puntaje de cumplimiento de la siguiente manera:
    *   Comienza con un puntaje base de 100.
    *   Por cada hallazgo con gravedad 'Alta', resta 25 puntos.
    *   Por cada hallazgo con gravedad 'Media', resta 15 puntos.
    *   Por cada hallazgo con gravedad 'Baja', resta 5 puntos.
    *   El puntaje mínimo no puede ser inferior a 0.
    *   Si no hay hallazgos (el array \`findings\` está vacío), el puntaje debe ser 100.

*   **legalRiskScore**: Este puntaje es el inverso al de cumplimiento. Se calcula como \`100 - complianceScore\`.

**Verificación Final Obligatoria:**
Antes de dar tu respuesta final en JSON, revisa CADA UNO de los hallazgos que has creado. Para cada uno, pregúntate: "¿El texto que puse en \`evidencia\` viene del DOCUMENTO_A_REVISAR?". Si la respuesta es no, tu trabajo está mal y debes arreglarlo. El campo \`evidencia\` NO PUEDE contener texto de las NORMAS_DE_CONSULTA.

Responde únicamente en el formato JSON solicitado. No incluyas texto, comillas o decoraciones antes o después del JSON.
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
