// src/ai/flows/suggest-improvements.ts
'use server';
/**
 * @fileOverview An AI agent for suggesting improvements to normative documents.
 *
 * - suggestNormativeDocumentImprovements - A function that handles the document improvement suggestion process.
 * - SuggestNormativeDocumentImprovementsInput - The input type for the suggestNormativeDocumentImprovements function.
 * - SuggestNormativeDocumentImprovementsOutput - The return type for the suggestNormativeDocumentImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNormativeDocumentImprovementsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the normative document to be improved.'),
});
export type SuggestNormativeDocumentImprovementsInput = z.infer<typeof SuggestNormativeDocumentImprovementsInputSchema>;

const SuggestNormativeDocumentImprovementsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of AI-powered suggestions for improving the normative document.'),
  complianceScore: z
    .number()
    .describe('A score indicating the compliance level of the improved document.'),
  completenessIndex: z
    .number()
    .describe('An index indicating the overall completeness of the document.'),
});
export type SuggestNormativeDocumentImprovementsOutput = z.infer<typeof SuggestNormativeDocumentImprovementsOutputSchema>;

export async function suggestNormativeDocumentImprovements(
  input: SuggestNormativeDocumentImprovementsInput
): Promise<SuggestNormativeDocumentImprovementsOutput> {
  return suggestNormativeDocumentImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNormativeDocumentImprovementsPrompt',
  input: {schema: SuggestNormativeDocumentImprovementsInputSchema},
  output: {schema: SuggestNormativeDocumentImprovementsOutputSchema},
  prompt: `You are an AI expert in normative documents, legal requirements, and applicable standards.

You will receive the content of a normative document and provide suggestions for improvements, referencing applicable standards and legal requirements.

Consider completeness, compliance, and clarity when generating suggestions.

Document Content: {{{documentText}}}

Suggestions (provide as a numbered list):
1.
2.
3.

Compliance Score (0-100):
Completeness Index (0-100):`,
});

const suggestNormativeDocumentImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestNormativeDocumentImprovementsFlow',
    inputSchema: SuggestNormativeDocumentImprovementsInputSchema,
    outputSchema: SuggestNormativeDocumentImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
