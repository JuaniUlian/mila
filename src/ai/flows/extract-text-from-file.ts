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
import { getAuthenticatedUser } from '@/lib/firebase/server';

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

// The exported function that will be called by the client.
export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const { user } = await getAuthenticatedUser();

  if (user?.role !== 'user' && user?.role !== 'admin') {
    throw new Error('Unauthorized: User does not have permission to perform this action.');
  }
  return extractTextFromFileFlow(input);
}

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (flowInput) => {
    const genkitResponse = await ai.generate({
      // Using a model capable of handling multimodal input (PDFs, images).
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document.' },
        { media: { url: flowInput.fileDataUri } }
      ],
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
    });

    // Ensure we always return a string, even if the model provides no text.
    const extractedText = genkitResponse.text ?? '';
    return { extractedText };
  }
);
