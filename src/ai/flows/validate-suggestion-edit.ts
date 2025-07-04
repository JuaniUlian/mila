'use server';
/**
 * @fileOverview An AI flow to validate a user's edit to a legal suggestion.
 *
 * - validateSuggestionEdit - A function that validates the edit.
 * - ValidateSuggestionEditInput - The input type for the function.
 * - ValidateSuggestionEditOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schemas
const ValidateSuggestionEditInputSchema = z.object({
  originalText: z.string().describe("The original text snippet from the document that had an issue."),
  originalSuggestion: z.string().describe("The original AI-generated suggestion to fix the issue."),
  userEditedSuggestion: z.string().describe("The user's edited version of the suggestion."),
  legalJustification: z.string().describe("The original legal justification for why the text needed correction."),
  regulationContent: z.string().describe("The content of the law or regulation that applies."),
});
export type ValidateSuggestionEditInput = z.infer<typeof ValidateSuggestionEditInputSchema>;

const ValidateSuggestionEditOutputSchema = z.object({
  isValid: z.boolean().describe("Whether the user's edit is legally sound and resolves the original issue."),
  improvedProposal: z.string().describe("An improved, ready-to-use version of the user's suggestion, polished by the AI."),
  feedback: z.string().describe("Brief, constructive feedback for the user about their edit."),
});
export type ValidateSuggestionEditOutput = z.infer<typeof ValidateSuggestionEditOutputSchema>;

// Exported function
export async function validateSuggestionEdit(input: ValidateSuggestionEditInput): Promise<ValidateSuggestionEditOutput> {
  return validateSuggestionEditFlow(input);
}

// Prompt
const prompt = ai.definePrompt({
  name: 'validateSuggestionEditPrompt',
  input: { schema: ValidateSuggestionEditInputSchema },
  output: { schema: ValidateSuggestionEditOutputSchema },
  prompt: `Eres un experto legal y supervisor de calidad. Un asistente de IA ha hecho una sugerencia para corregir un texto, y un usuario humano ha editado esa sugerencia. Tu tarea es evaluar la edición del usuario y mejorarla.

  **Contexto:**
  1.  **Texto Original con Problema:**
      \`\`\`
      {{{originalText}}}
      \`\`\`
  2.  **Justificación Legal del Problema:** {{{legalJustification}}}
  3.  **Normativa Aplicable:**
      \`\`\`
      {{{regulationContent}}}
      \`\`\`
  4.  **Sugerencia Original de la IA:**
      \`\`\`
      {{{originalSuggestion}}}
      \`\`\`

  **Tarea:**
  Analiza la siguiente **propuesta editada por el usuario**:
  \`\`\`
  {{{userEditedSuggestion}}}
  \`\`\`

  Realiza las siguientes acciones:
  1.  **Evalúa la validez (isValid):** Determina si la edición del usuario resuelve el problema original de acuerdo con la justificación legal y la normativa. Responde 'true' si es una solución válida, aunque no sea perfecta. Responde 'false' si introduce nuevos errores o no soluciona el problema.
  2.  **Proporciona feedback:** Escribe un comentario breve y constructivo sobre la edición del usuario.
  3.  **Genera una propuesta mejorada (improvedProposal):** Independientemente de si la edición del usuario es válida, toma su idea y refínala para crear una versión final, pulida y lista para usar que sea legalmente impecable.

  Responde únicamente en el formato JSON especificado.
  `,
});


// Flow
const validateSuggestionEditFlow = ai.defineFlow(
  {
    name: 'validateSuggestionEditFlow',
    inputSchema: ValidateSuggestionEditInputSchema,
    outputSchema: ValidateSuggestionEditOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
