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
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const { fileDataUri } = input;
  const startTime = Date.now();
  let extractedText = '';

  const fileTypeMatch = fileDataUri.match(/^data:(.*?);/);
  const fileType = fileTypeMatch ? fileTypeMatch[1] : 'application/octet-stream';
  const fileName = `file_${Date.now()}`;
  const fileSize = Buffer.from(fileDataUri.split(',')[1], 'base64').length;

  try {
    if (fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileType.startsWith('text/')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      extractedText = buffer.toString('utf-8');
    } else if (fileType.includes('pdf') || fileType.startsWith('image/')) {
      console.log(`Attempting extraction with Gemini-Flash for ${fileName}`);
      try {
        const genkitResponse = await ai.generate({
          prompt: [
            {
              text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document. If there are tables, preserve their structure using appropriate spacing.',
            },
            { media: { url: fileDataUri } },
          ],
          model: 'googleai/gemini-1.5-flash',
          config: {
            timeout: 1000 * 60 * 2, // 2 minutes
          },
        });
        
        extractedText = genkitResponse.text ?? '';
        logSuccess('gemini', fileSize, Date.now() - startTime);

      } catch (geminiError: any) {
        logError('gemini', fileSize, Date.now() - startTime, geminiError.message || String(geminiError));
        console.warn(`Gemini-Flash extraction failed for ${fileName}, falling back to Gemini-Pro. Error: ${geminiError.message}`);

        try {
          console.log(`Retrying extraction with Gemini-Pro for ${fileName}`);
          const genkitResponsePro = await ai.generate({
            prompt: [
              {
                text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document. If there are tables, preserve their structure using appropriate spacing.',
              },
              { media: { url: fileDataUri } },
            ],
            model: 'googleai/gemini-1.5-pro',
            config: {
              timeout: 1000 * 60 * 4, // 4 minutes for the more powerful model
            },
          });
          
          extractedText = genkitResponsePro.text ?? '';
          logSuccess('gemini_pro_fallback', fileSize, Date.now() - startTime);

        } catch (geminiProError: any) {
          logError('gemini_pro_fallback', fileSize, Date.now() - startTime, geminiProError.message || String(geminiProError));
          // If both models fail, construct a more informative error message
          const errorMessage = `Primary extraction failed: ${geminiError.message}. Fallback extraction also failed: ${geminiProError.message}`;
          throw new Error(errorMessage);
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
  } catch (error: any) {
    console.error(`Error processing file ${fileName}:`, error);
    
    let errorMessage = error.message || String(error);
    if (errorMessage.includes('deadline') || errorMessage.includes('timeout')) {
      errorMessage = 'The document chunk is too complex to process within the time limit, even with fallback.';
    }
    
    throw new Error(`Failed to extract text from ${fileName}. Reason: ${errorMessage}`);
  }
}
