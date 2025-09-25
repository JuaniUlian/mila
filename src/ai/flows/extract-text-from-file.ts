
'use server';
/**
 * @fileOverview Flujo para extraer texto de un archivo (PDF, DOCX, TXT) usando Gemini.
 */

import {z} from 'genkit';
import {ai} from '@/ai/genkit';
import mammoth from 'mammoth';

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


const extractTextPrompt = ai.definePrompt({
    name: 'extractTextPrompt',
    model: 'googleai/gemini-1.5-pro',
    input: {
        schema: z.object({
            fileDataUri: z.string(),
        }),
    },
    prompt: `Extrae el texto completo y en orden del siguiente documento. Devuelve únicamente el texto plano, sin formato adicional.

Documento:
{{media url=fileDataUri}}
`,
});

const extractTextFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (input) => {
    const { fileDataUri } = input;

    try {
      const {mime, buffer} = parseDataUri(fileDataUri);

      if (mime.startsWith('text/')) {
        return { ok: true, text: buffer.toString('utf-8') };
      }
      
      if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const mammothResult = await mammoth.extractRawText({ buffer });
          return { ok: true, text: mammothResult.value };
      }
      
      if (mime === 'application/pdf') {
        const { output } = await extractTextPrompt({ fileDataUri });
        const text = output;
        if (!text) {
             return { ok: false, error: 'No se pudo extraer texto del PDF con la IA.' };
        }
        return { ok: true, text };
      }

      return { ok: false, error: `Tipo de archivo no soportado: ${mime}` };

    } catch (error: any) {
        console.error("Error en extractTextFromFileFlow:", error);
        return { ok: false, error: error.message || "Error inesperado durante la extracción." };
    }
  }
);


function parseDataUri(dataUri: string): { mime: string; base64: string; buffer: Buffer } {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUri);
  if (!match) throw new Error('Data URI inválida');
  const [, mime, base64] = match;
  return { mime, base64, buffer: Buffer.from(base64, 'base64') };
}

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return await extractTextFlow(input);
}
