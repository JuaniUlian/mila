// This file is no longer needed as the application will simulate an already processed document.
// The AI suggestion logic is removed in favor of displaying mock data.
// Keeping the file to avoid breaking existing imports if any, but it should be considered for deletion.
'use server';
/**
 * @fileOverview Placeholder for AI suggestion logic.
 * This functionality has been moved to mock data for the "Planilla Viva" prototype.
 */

import { z } from 'genkit';

// Define types here if they are still referenced elsewhere, otherwise, they can be removed.
export const SuggestNormativeDocumentImprovementsInputSchema = z.object({
  documentText: z.string(),
});
export type SuggestNormativeDocumentImprovementsInput = z.infer<typeof SuggestNormativeDocumentImprovementsInputSchema>;

export const SuggestNormativeDocumentImprovementsOutputSchema = z.object({
  suggestions: z.array(z.string()),
  complianceScore: z.number(),
  completenessIndex: z.number(),
});
export type SuggestNormativeDocumentImprovementsOutput = z.infer<typeof SuggestNormativeDocumentImprovementsOutputSchema>;

export async function suggestNormativeDocumentImprovements(
  input: SuggestNormativeDocumentImprovementsInput
): Promise<SuggestNormativeDocumentImprovementsOutput> {
  // Mock implementation - in the real app, this would call the AI flow.
  // For "Planilla Viva", this function is not actively used.
  console.warn('suggestNormativeDocumentImprovements is a mock function and should not be relied upon for Planilla Viva.');
  return {
    suggestions: [],
    complianceScore: 0,
    completenessIndex: 0,
  };
}
