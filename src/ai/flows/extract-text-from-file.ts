
'use server';
/**
 * @fileOverview A flow to extract text from various file formats.
 *
 * - extractTextFromFile - A function that handles file text extraction.
 * - ExtractTextFromFileInput - The input type for the function.
 * - ExtractTextFromFileOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import mammoth from 'mammoth';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  fileType: z.string().describe("The MIME type of the file."),
  fileName: z.string().describe("The name of the file."),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;


export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const { fileDataUri, fileType, fileName } = input;

  let extractedText = '';

  try {
    if (fileType.includes('pdf')) {
      const genkitResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document.' },
          { media: { url: fileDataUri } }
        ],
        timeout: 1000 * 60 * 5, // 5 minutes
      });
      extractedText = genkitResponse.text ?? '';
    } else if (fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document') || fileName.endsWith('.docx')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileType.startsWith('text/')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      extractedText = buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    return { extractedText };

  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    throw new Error(`Failed to extract text from ${fileName}.`);
  }
}

    