
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

    function parseDataUri(dataUri: string): { mime: string; base64: string; buffer: Buffer } {
        const match = /^data:(.+);base64,(.*)$/.exec(dataUri);
        if (!match) throw new Error('Data URI inválida');
        const [, mime, base64] = match;
        return { mime, base64, buffer: Buffer.from(base64, 'base64') };
    }

    try {
      const { mime } = parseDataUri(fileDataUri);

      // Handle plain text files directly
      if (mime.startsWith('text/')) {
        const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
        return { ok: true, text: buffer.toString('utf-8') };
      }
      
      // Use AI for PDF, DOCX, and other complex formats
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
