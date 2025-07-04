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

export const ValidateDocumentInputSchema = z.object({
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
    categoria: z.string().describe("Una categoría descriptiva para el hallazgo, como 'Justificación insuficiente', 'Posible trato desigual', etc."),
    articulo_o_seccion: z.string().describe("Artículo o sección específica de la normativa que se aplicó."),
    pagina: z.string().describe("Número de página del documento analizado donde se encuentra la evidencia del hallazgo."),
    gravedad: z.enum(["Alta", "Media", "Baja", "Informativa"]).describe("La severidad del hallazgo."),
    evidencia: z.string().describe("Cita textual exacta o síntesis objetiva del documento analizado que respalda el hallazgo."),
    propuesta_solucion: z.string().describe("Propuesta de redacción o solución para corregir la irregularidad o capitalizar la oportunidad/fortaleza. Debe ser un texto concreto y aplicable."),
    justificacion_legal: z.string().describe("Explicación de por qué el hallazgo es relevante desde una perspectiva legal, citando los principios o reglas vulnerados o cumplidos."),
    consecuencia_estimada: z.string().describe("Cuál es el riesgo o consecuencia potencial si la irregularidad no se corrige, o el beneficio si la oportunidad se aprovecha.")
});

export const ValidateDocumentOutputSchema = z.object({
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
    prompt: `Eres un asistente legal-administrativo experto para validar documentos públicos y administrativos en base a leyes vigentes, decretos, reglamentos, manuales de buenas prácticas y criterios técnicos de organismos de control. El usuario adjunta dos tipos de documentos:

1.  Un documento administrativo para analizar:
    - Nombre: {{{documentName}}}
    - Contenido:
    \`\`\`
    {{{documentContent}}}
    \`\`\`

2.  Una lista de documentos normativos para usar como referencia:
    {{#each regulations}}
    - Nombre Norma: {{this.name}}
    - Contenido Norma:
    \`\`\`
    {{{this.content}}}
    \`\`\`
    {{/each}}

Tu tarea es cruzar el contenido del documento administrativo contra las normas provistas, identificando hallazgos.

Para cada hallazgo, proporciona una propuesta de solución o redacción, una justificación legal y la consecuencia estimada.

Instrucciones adicionales:
- Sé crítico.
- Si detectás coherencia positiva con alguna norma (ej. procedimiento bien detallado, fundamentación clara, uso correcto del marco legal), etiquétalo como Fortaleza u Oportunidad.
- Utilizá "Informativa" en el campo gravedad para observaciones sin consecuencias legales o administrativas, pero que puedan ser útiles.
- No inventes, no generalices y no evalúes aspectos que no puedas vincular directamente con los documentos proporcionados.
- Evalúa el documento en su totalidad para proporcionar un "complianceScore" (Cumplimiento Normativo) y un "legalRiskScore" (Riesgo Legal), ambos como porcentajes de 0 a 100.

Responde únicamente en formato JSON, con la estructura de salida definida. No incluyas texto, comillas o decoraciones antes o después del JSON.
Si no encontrás ningún hallazgo relevante, responde con un array "findings" vacío y los scores correspondientes.
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
