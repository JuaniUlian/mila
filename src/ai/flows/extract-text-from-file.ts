
'use server';
/**
 * @fileOverview Flujo para extraer texto de un archivo (PDF, DOCX, TXT) usando Gemini.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import {GenerateRequest} from 'genkit/generate';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z.string().describe("El archivo como un data URI. Formato: 'data:<mimetype>;base64,<encoded_data>'."),
  contentType: z.string().describe("El tipo MIME del archivo."),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  ok: z.boolean(),
  text: z.string().optional(),
  error: z.string().optional(),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  try {
    const request: GenerateRequest = {
      model: 'googleai/gemini-1.5-pro',
      prompt: [
        {text: 'Extrae el texto completo y en orden del siguiente documento. Devuelve únicamente el texto plano, sin formato adicional.'},
        {media: {url: input.fileDataUri, contentType: input.contentType}},
      ],
    };

    const response = await ai.generate(request);
    const text = response.text;

    if (!text || text.trim() === '') {
      return { ok: false, error: 'No se pudo extraer texto del documento con la IA.' };
    }

    return { ok: true, text };
  } catch (error: any) {
    console.error("Error en extractTextFromFile:", error);
    return { ok: false, error: error.message || "Error inesperado durante la extracción." };
  }
}
