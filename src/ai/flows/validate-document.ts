
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
import { getAuthenticatedUser } from '@/lib/firebase/server';

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
    evidencia: z.string().describe("CITA TEXTUAL Y LITERAL del DOCUMENTO_A_REVISAR que contiene el error. NUNCA, BAJO NINGUNA CIRCUNSTANCIA, debe contener texto de las NORMAS_DE_CONSULTA."),
    propuesta_procedimiento: z.string().optional().describe("Acción de procedimiento administrativo a realizar (ej. 'emitir dictamen técnico', 'convocar nueva licitación'). Usar solo para indicar trámites, no para sugerir texto. Omitir si la solución es solo una corrección de redacción."),
    propuesta_redaccion: z.string().optional().describe("Texto alternativo completo y listo para reemplazar el original. NUNCA debe contener instrucciones. Omitir si la solución es puramente de procedimiento."),
    justificacion_legal: z.string().describe("Explicación jurídica que fundamenta la inconsistencia, mencionando el artículo, la disposición aplicable y el principio jurídico afectado. AQUÍ SÍ SE CITA LA NORMATIVA."),
    justificacion_tecnica: z.string().describe("Elementos objetivos y técnicos que sustentan la identificación de la inconsistencia (referencias al propio documento, prácticas administrativas aceptadas, etc.)."),
    consecuencia_estimada: z.string().describe("Consecuencias potenciales si no se corrige la inconsistencia (ej. 'nulidad del proceso', 'riesgo de impugnaciones').")
});

const ValidateDocumentOutputSchema = z.object({
    findings: z.array(FindingSchema).describe("Una lista de todos los hallazgos encontrados en el documento."),
    complianceScore: z.number().min(0).max(100).describe("El porcentaje de Cumplimiento Normativo (calculado como 100 menos las penalizaciones por la gravedad de cada hallazgo)."),
    legalRiskScore: z.number().min(0).max(100).describe("El porcentaje de Riesgo Legal (calculado como 100 - complianceScore)."),
});
export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  const { user } = await getAuthenticatedUser();

  if (user?.isGuest) {
    // Return a safe, empty response for guests. The UI should prevent this call anyway.
    return { findings: [], complianceScore: 100, legalRiskScore: 0 };
  }

  if (user?.role !== 'user' && user?.role !== 'admin') {
      throw new Error('Unauthorized: User does not have permission to perform this action.');
  }
  return validateDocumentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'validateDocumentPrompt',
    input: { schema: ValidateDocumentInputSchema },
    output: { schema: ValidateDocumentOutputSchema },
    prompt: `Eres un asistente legal-administrativo experto en detectar inconsistencias en documentos públicos. Tu única misión es analizar el **DOCUMENTO_A_REVISAR** y compararlo con las **NORMAS_DE_CONSULTA**.

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
Si en un hallazgo, el campo \`evidencia\` contiene texto de una **NORMA_DE_CONSULTA**, el análisis es incorrecto y debes corregirlo antes de responder.

**Instrucciones para generar los hallazgos:**

1.  **Encuentra la inconsistencia:** Lee el **DOCUMENTO_A_REVISAR** y encuentra una parte que contradiga o no cumpla con alguna de las **NORMAS_DE_CONSULTA**.
2.  **Crea el hallazgo:** Para cada inconsistencia, genera un objeto con todos los campos solicitados, prestando especial atención a las siguientes reglas para las propuestas:

    *   **propuesta_procedimiento (Solución de Procedimiento):**
        *   **QUÉ ES:** Una descripción **EXCLUSIVA** de acciones o trámites administrativos a realizar (ej: "emitir dictamen técnico", "solicitar informe de mercado").
        *   **CUÁNDO USAR:** Úsalo solo si se requiere una acción de procedimiento. Si la solución es únicamente un cambio de texto, **OMITE ESTE CAMPO**.

    *   **propuesta_redaccion (Solución de Redacción):**
        *   **QUÉ ES:** El texto final, corregido y listo para copiar y pegar. **NUNCA** debe contener instrucciones como "[Insertar...]" o ser un resumen. Debe ser la redacción completa.
        *   **CUÁNDO USAR:** Úsalo solo si la corrección es un cambio directo en el texto. Si la solución es únicamente un procedimiento, **OMITE ESTE CAMPO**.

    *   **REGLAS DE COMBINACIÓN:**
        *   Si se necesitan tanto un procedimiento como un cambio de texto, genera ambos campos.
        *   Nunca generes dos propuestas del mismo tipo para una sola incidencia.
        *   Rellena el resto de los campos (\`titulo_incidencia\`, \`evidencia\`, \`justificacion_legal\`, etc.) como corresponde.

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
