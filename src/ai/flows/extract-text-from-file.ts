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
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      logSuccess('gemini', fileSize, Date.now() - startTime); // Still log as 'gemini' for consistency
    } else if (fileType.startsWith('text/')) {
      const buffer = Buffer.from(fileDataUri.split(',')[1], 'base64');
      extractedText = buffer.toString('utf-8');
      logSuccess('gemini', fileSize, Date.now() - startTime);
    } else if (fileType.includes('pdf') || fileType.startsWith('image/')) {
      console.log(`Attempting extraction with Anthropic Claude for ${fileName}`);
      try {
        const base64Data = fileDataUri.split(',')[1];
        
        let content;
        if (fileType.startsWith('image/')) {
            content = [{
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: fileType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                    data: base64Data,
                },
            },
            {
                type: 'text',
                text: 'Extract all text content from this image. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears.',
            }]
        } else if (fileType.includes('pdf')) {
             content = [{
                type: 'text',
                text: `Here is a document. Please extract all text content from it. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document. If there are tables, preserve their structure using appropriate spacing.\n\nDOCUMENT_CONTENT:\n${base64Data}`,
            }]
        } else {
            throw new Error(`Unsupported media type for Anthropic processing: ${fileType}`);
        }

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: content,
            },
          ],
        });

        extractedText = response.content.map(block => block.type === 'text' ? block.text : '').join('\n');
        logSuccess('gemini', fileSize, Date.now() - startTime); // Log as gemini for consistency in monitoring

      } catch (claudeError: any) {
        logError('gemini', fileSize, Date.now() - startTime, claudeError.message || String(claudeError));
        const errorMessage = `Primary extraction with Claude failed: ${claudeError.message}.`;
        throw new Error(errorMessage);
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
