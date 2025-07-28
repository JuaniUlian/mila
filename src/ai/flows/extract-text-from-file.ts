/**
 * Versión final para producción con monitoreo integrado
 * REEMPLAZA al archivo extract-text-from-file.ts existente
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logSuccess, logError } from './monitoring';

// Feature flags para migración gradual
const FEATURE_FLAGS = {
  ENABLE_CHUNKING: process.env.ENABLE_CHUNKING === 'true',
  ENABLE_CLAUDE_FALLBACK: process.env.ENABLE_CLAUDE_FALLBACK === 'true',
  CHUNKING_THRESHOLD: parseInt(process.env.CHUNKING_THRESHOLD || '10485760'), // 10MB
  EMERGENCY_DISABLE_CHUNKING: process.env.EMERGENCY_DISABLE_CHUNKING === 'true',
  FALLBACK_TO_ORIGINAL_ONLY: process.env.FALLBACK_TO_ORIGINAL_ONLY === 'true',
};

// Esquemas originales (MANTENER COMPATIBILIDAD)
const ExtractTextFromFileInputSchema = z.object({
  fileDataUri: z.string().describe(
    "The file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
});

export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
  extractedText: z.string().describe('The full text content extracted from the file.'),
});

export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;

/**
 * FUNCIÓN PRINCIPAL - Compatible con código existente
 */
export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const startTime = Date.now();
  const fileSize = input.fileDataUri.length;
  
  console.log(`🔄 Iniciando extracción: ${Math.round(fileSize / 1024 / 1024 * 100) / 100}MB`);

  // KILL SWITCHES para emergencias
  if (FEATURE_FLAGS.EMERGENCY_DISABLE_CHUNKING || FEATURE_FLAGS.FALLBACK_TO_ORIGINAL_ONLY) {
    console.log('⚠️ Modo de emergencia: usando solo método original');
    return await executeOriginalMethod(input, startTime);
  }

  // Decidir estrategia basada en tamaño y flags
  const shouldUseChunking = FEATURE_FLAGS.ENABLE_CHUNKING && 
                           fileSize > FEATURE_FLAGS.CHUNKING_THRESHOLD;

  if (!shouldUseChunking) {
    return await executeOriginalMethod(input, startTime);
  }

  // Intentar chunking para archivos grandes
  try {
    console.log('🧩 Usando chunking para archivo grande...');
    const extractedText = await executeChunkingMethod(input.fileDataUri);
    const processingTime = Date.now() - startTime;
    
    logSuccess('chunking', fileSize, processingTime);
    console.log(`✅ Chunking exitoso en ${Math.round(processingTime / 1000)}s`);
    
    return { extractedText };
    
  } catch (chunkingError) {
    const chunkingTime = Date.now() - startTime;
    console.error('❌ Chunking falló:', chunkingError);
    logError('chunking', fileSize, chunkingTime, String(chunkingError));

    // Fallback al método original
    console.log('🔄 Fallback al método original...');
    return await executeOriginalMethod(input, Date.now(), true);
  }
}

/**
 * MÉTODO ORIGINAL (Gemini directo)
 */
async function executeOriginalMethod(
  input: ExtractTextFromFileInput, 
  startTime: number,
  isFallback: boolean = false
): Promise<ExtractTextFromFileOutput> {
  const fileSize = input.fileDataUri.length;
  
  try {
    const genkitResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { 
          text: 'Extract all text content from this document. Do not summarize, interpret, or add any commentary. Return only the raw text exactly as it appears in the document.' 
        },
        { media: { url: input.fileDataUri } }
      ],
      timeout: 1000 * 60 * 5, // 5 minutes
    });

    const extractedText = genkitResponse.text ?? '';
    const processingTime = Date.now() - startTime;
    
    logSuccess('original', fileSize, processingTime);
    console.log(`✅ Método original ${isFallback ? '(fallback) ' : ''}exitoso en ${Math.round(processingTime / 1000)}s`);
    
    return { extractedText };
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logError('original', fileSize, errorTime, String(error));
    
    // Si el método original falla Y Claude está habilitado, intentar Claude
    if (FEATURE_FLAGS.ENABLE_CLAUDE_FALLBACK && !isFallback) {
      console.log('🤖 Último intento con Claude...');
      return await executeClaudeFallback(input, Date.now());
    }
    
    throw error;
  }
}

/**
 * MÉTODO DE CHUNKING
 */
async function executeChunkingMethod(dataUri: string): Promise<string> {
  const chunks = createSafeChunks(dataUri);
  console.log(`🧩 Procesando ${chunks.length} chunks...`);
  
  const results: string[] = [];
  let failedChunks = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    try {
      console.log(`📄 Chunk ${i + 1}/${chunks.length}...`);
      const result = await processChunkSafely(chunks[i], i + 1, chunks.length);
      results.push(result);
      
      // Pausa entre chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Chunk ${i + 1} falló:`, error);
      failedChunks++;
      results.push(''); // Placeholder
      
      // Abortar si fallan demasiados chunks
      if (failedChunks / chunks.length > 0.3) {
        throw new Error(`Demasiados chunks fallidos: ${failedChunks}/${chunks.length}`);
      }
    }
  }
  
  const combinedText = results.filter(r => r.trim()).join('\n\n');
  
  if (!combinedText.trim()) {
    throw new Error('No se pudo extraer texto de ningún chunk');
  }
  
  console.log(`✅ Chunking: ${results.length - failedChunks}/${chunks.length} chunks exitosos`);
  return combinedText;
}

/**
 * FALLBACK CON CLAUDE
 */
async function executeClaudeFallback(
  input: ExtractTextFromFileInput, 
  startTime: number
): Promise<ExtractTextFromFileOutput> {
  const fileSize = input.fileDataUri.length;

  if (!FEATURE_FLAGS.ENABLE_CLAUDE_FALLBACK) {
    throw new Error('Claude fallback no está habilitado');
  }
  
  console.log('🤖 Intentando extracción con Claude...');
  
  try {
    const [header, base64Data] = input.fileDataUri.split(',');
    const mimeType = header.split(';')[0].split(':')[1];
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae todo el texto de este documento. Mantén la estructura original, no resumas ni interpretes. Devuelve solo el texto tal como aparece.'
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const result = await response.json();
    const extractedText = result.content[0]?.text || '';
    const processingTime = Date.now() - startTime;

    logSuccess('claude_fallback', fileSize, processingTime);
    console.log(`✅ Claude fallback exitoso en ${Math.round(processingTime/1000)}s`);
    
    return { extractedText };

  } catch(error) {
    const errorTime = Date.now() - startTime;
    logError('claude_fallback', fileSize, errorTime, String(error));
    throw error;
  }
}


function createSafeChunks(dataUri: string): string[] {
  const [header, base64Data] = dataUri.split(',');
  const chunkSize = 3 * 1024 * 1024; // 3MB por chunk (conservador)
  
  if (base64Data.length <= chunkSize) {
    return [dataUri]; // No dividir si es pequeño
  }
  
  const chunks: string[] = [];
  let position = 0;
  
  while (position < base64Data.length) {
    const end = Math.min(position + chunkSize, base64Data.length);
    const chunkData = base64Data.slice(position, end);
    chunks.push(`${header},${chunkData}`);
    position = end;
  }
  
  return chunks;
}

async function processChunkSafely(chunkDataUri: string, chunkIndex: number, totalChunks: number): Promise<string> {
  const maxRetries = 2;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { 
            text: `Extrae TODO el texto de este fragmento de documento (parte ${chunkIndex} de ${totalChunks}).
            
            IMPORTANTE:
            - Devuelve solo el texto extraído, sin comentarios
            - No resumas ni interpretes el contenido
            - Mantén la estructura original (párrafos, listas, etc.)
            - Si hay texto cortado al inicio o final, inclúyelo tal como aparece`
          },
          { media: { url: chunkDataUri } }
        ],
        timeout: 2 * 60 * 1000, // 2 minutos por chunk
      });
      
      return response.text || '';
      
    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex}, intento ${attempt} falló:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return '';
}

// FLUJO ORIGINAL DE GENKIT (con la corrección de sintaxis)
const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async (flowInput) => {
    return extractTextFromFile(flowInput);
  }
);
