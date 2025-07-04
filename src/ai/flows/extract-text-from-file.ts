'use server';
/**
 * @fileOverview A flow to extract text from various file formats using OCR.
 *
 * - extractTextFromFile - A function that handles file text extraction.
 * - ExtractTextFromFileInputSchema - The input type for the function.
 * - ExtractTextFromFileOutputSchema - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

export const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

// The exported function that will be called by the client.
export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (flowInput) => {
    const { text } = await ai.generate({
      // Using a model capable of handling multimodal input (PDFs, images).
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document.' },
        { media: { url: flowInput.fileDataUri } }
      ],
    });

    return { extractedText: text };
  }
);
