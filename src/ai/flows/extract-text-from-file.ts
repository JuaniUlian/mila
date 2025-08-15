'use server';
/**
 * @fileOverview A flow to extract text from various file formats with fallback.
 *
 * - extractTextFromFile - A function that handles file text extraction.
 * - ExtractTextFromFileInput - The input type for the function.
 * - ExtractTextFromFileOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import mammoth from 'mammoth';
import { logError, logSuccess } from './monitoring';

const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  fileType: z.string().describe('The MIME type of the file.'),
  fileName: z.string().describe('The name of the file.'),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const { fileDataUri, fileType, fileName } = input;
  const startTime = Date.now();
  let extractedText = '';

  try {
    // DOCX processing using mammoth for speed and efficiency
    if (
      fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document') ||
      fileName.endsWith('.docx')
    ) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;

      // Plain text processing
    } else if (fileType.startsWith('text/')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      extractedText = buffer.toString('utf-8');

      // PDF and other image-based formats require AI with a 2-level fallback
    } else if (fileType.includes('pdf') || fileType.startsWith('image/')) {
      console.log(`Attempting extraction with Gemini-Flash for ${fileName}`);
      try {
        // Using the correct AI generate format
        const genkitResponse = await ai.generate({
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document. If there are tables, preserve their structure using appropriate spacing.',
                },
                { media: { url: fileDataUri } },
              ],
            },
          ],
          model: 'googleai/gemini-1.5-flash',
          config: {
            timeout: 1000 * 60 * 2, // 2 minutes
          },
        });
        
        extractedText = genkitResponse.text ?? '';
        
        // Fixed logSuccess call - using correct parameter types
        logSuccess(
          'gemini' as const,
          Buffer.from(fileDataUri.split(',')[1], 'base64').length,
          Date.now() - startTime,
          { fileName }
        );
      } catch (geminiError) {
        console.warn(`Gemini-Flash extraction failed for ${fileName}, falling back to Gemini-Pro.`, geminiError);
        
        // Fixed logError call - using correct parameter types
        logError(
          'gemini' as const,
          Buffer.from(fileDataUri.split(',')[1], 'base64').length,
          Date.now() - startTime,
          geminiError instanceof Error ? geminiError.message : String(geminiError),
          { fileName }
        );

        // Fallback 1: Gemini Pro
        try {
          const genkitResponse = await ai.generate({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document. If there are tables, preserve their structure using appropriate spacing.',
                  },
                  { media: { url: fileDataUri } },
                ],
              },
            ],
            model: 'googleai/gemini-1.5-pro',
            config: {
              timeout: 1000 * 60 * 3, // 3 minutes
            },
          });
          
          extractedText = genkitResponse.text ?? '';
          
          logSuccess(
            'gemini_pro_fallback' as const,
            Buffer.from(fileDataUri.split(',')[1], 'base64').length,
            Date.now() - startTime,
            { fileName }
          );
        } catch (geminiProError) {
          // If both Gemini models fail, throw the original error
          throw geminiProError;
        }
      }
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.warn(`No text extracted from ${fileName}`);
      return { extractedText: '' };
    }

    return { extractedText };
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('deadline') || errorMessage.includes('timeout')) {
      throw new Error('The document chunk is too complex to process within the time limit.');
    }
    
    // Fixed logError call with proper error handling
    logError(
      'gemini_pro_fallback' as const,
      Buffer.from(fileDataUri.split(',')[1], 'base64').length,
      Date.now() - startTime,
      errorMessage,
      { fileName }
    );
    
    throw new Error(`Failed to extract text from ${fileName}. Reason: ${errorMessage}`);
  }
}