
'use server';
/**
 * @fileOverview A flow to extract text from various file formats using OCR.
 *
 * - extractTextFromFile - A function that handles file text extraction.
 * - ExtractTextFromFileInput - The input type for the function.
 * - ExtractTextFromFileOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

// This function is NOT a Server Action anymore. It's a regular async function
// to be called by the API route.
export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  // This is the key integration point. It uses a powerful model capable of handling large inputs.
  const genkitResponse = await ai.generate({
    // The 1.5 models are excellent for large document understanding.
    model: 'googleai/gemini-1.5-flash',
    prompt: [
      { text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document.' },
      { media: { url: input.fileDataUri } }
    ],
    // A generous timeout is crucial for large files that take time to process.
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  // Ensure we always return a string, even if the model fails to extract text.
  const extractedText = genkitResponse.text ?? '';
  return { extractedText };
}
