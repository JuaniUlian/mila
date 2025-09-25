
'use server';
/**
 * @fileOverview Flujo para extraer texto de un archivo (PDF, DOCX, TXT) usando Gemini.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import { GenerateRequest } from 'genkit';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z.string().describe("El archivo como un data URI. Formato: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  ok: z.boolean(),
  text: z.string().optional(),
  error: z.string().optional(),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;


const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (input) => {
    const { fileDataUri } = input;

    try {
      // Use AI for all file types for consistency and robustness
      const request: GenerateRequest = {
        model: 'googleai/gemini-1.5-pro',
        prompt: [
          { text: 'Extrae el texto completo y en orden del siguiente documento. Devuelve únicamente el texto plano, sin formato adicional.' },
          { media: { url: fileDataUri } }
        ]
      };

      const { output } = await ai.generate(request);
      
      const text = output?.text;
      
      if (!text || text.trim() === '') {
           return { ok: false, error: 'No se pudo extraer texto del documento con la IA.' };
      }
      
      return { ok: true, text };

    } catch (error: any) {
        console.error("Error en extractTextFromFileFlow:", error);
        return { ok: false, error: error.message || "Error inesperado durante la extracción." };
    }
  }
);

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return await extractTextFlow(input);
}
