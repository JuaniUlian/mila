
'use server';
/**
 * @fileOverview Flujo para extraer texto de un archivo (PDF, DOCX, TXT) usando Gemini.
 * - Usa Gemini 2.5 Flash como modelo principal (fallback: Gemini 2.5 Pro).
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import {type GenerateRequest} from 'genkit';

// Model configuration
const MODELS = {
  primary: 'googleai/gemini-2.5-flash',
  fallback: 'googleai/gemini-2.5-pro',
} as const;

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
  const baseRequest: Omit<GenerateRequest, 'model'> = {
    prompt: [
      {text: 'Extrae el texto completo y en orden del siguiente documento. Devuelve únicamente el texto plano, sin formato adicional.'},
      {media: {url: input.fileDataUri, contentType: input.contentType}},
    ],
  };

  try {
    // Try primary model (Gemini Flash)
    console.log('🔍 Extrayendo texto con Gemini Flash...');
    const response = await ai.generate({ ...baseRequest, model: MODELS.primary });
    const text = response.text;

    if (!text || text.trim() === '') {
      throw new Error('No se pudo extraer texto del documento.');
    }

    return { ok: true, text };
  } catch (primaryError: any) {
    console.warn('Primary model (Gemini Flash) failed, trying fallback (Gemini Pro):', primaryError.message);

    try {
      // Fallback to Gemini Pro
      console.log('🔄 Extrayendo texto con Gemini Pro (fallback)...');
      const response = await ai.generate({ ...baseRequest, model: MODELS.fallback });
      const text = response.text;

      if (!text || text.trim() === '') {
        return { ok: false, error: 'No se pudo extraer texto del documento con la IA.' };
      }

      return { ok: true, text };
    } catch (fallbackError: any) {
      console.error("Error en extractTextFromFile (ambos modelos fallaron):", fallbackError);
      return { ok: false, error: fallbackError.message || "Error inesperado durante la extracción." };
    }
  }
}
