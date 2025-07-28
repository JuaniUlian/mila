import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Configuración de chunking
const CHUNK_CONFIG = {
  // Tamaño máximo por chunk en caracteres (aprox 4MB en base64)
  MAX_CHUNK_SIZE: 3 * 1024 * 1024, // 3MB para dar margen
  // Overlap entre chunks para no perder contexto
  OVERLAP_SIZE: 1000,
  // Timeout por chunk
  CHUNK_TIMEOUT: 2 * 60 * 1000, // 2 minutos por chunk
};

export interface DocumentChunk {
  index: number;
  content: string;
  startPage?: number;
  endPage?: number;
  totalChunks: number;
}

export interface ChunkProcessingResult {
  success: boolean;
  extractedText?: string;
  error?: string;
  processingTime: number;
  chunksProcessed: number;
}

/**
 * Divide un documento grande en chunks manejables
 */
export function splitDocumentIntoChunks(dataUri: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const base64Data = dataUri.split(',')[1];
  const chunkSize = CHUNK_CONFIG.MAX_CHUNK_SIZE;
  
  // Si el archivo es pequeño, no lo dividimos
  if (base64Data.length <= chunkSize) {
    return [{
      index: 0,
      content: dataUri,
      totalChunks: 1
    }];
  }

  // Dividir en chunks con overlap
  let currentPosition = 0;
  let chunkIndex = 0;
  
  while (currentPosition < base64Data.length) {
    const endPosition = Math.min(
      currentPosition + chunkSize, 
      base64Data.length
    );
    
    const chunkData = base64Data.slice(currentPosition, endPosition);
    const mimeType = dataUri.split(';')[0].split(':')[1];
    const chunkDataUri = `data:${mimeType};base64,${chunkData}`;
    
    chunks.push({
      index: chunkIndex,
      content: chunkDataUri,
      startPage: Math.floor((currentPosition / base64Data.length) * 100), // Estimación
      endPage: Math.floor((endPosition / base64Data.length) * 100),
      totalChunks: 0 // Se actualizará después
    });
    
    currentPosition = endPosition - CHUNK_CONFIG.OVERLAP_SIZE;
    chunkIndex++;
  }
  
  // Actualizar el total de chunks en todos los elementos
  chunks.forEach(chunk => chunk.totalChunks = chunks.length);
  
  return chunks;
}

/**
 * Procesa un chunk individual con timeout y retry
 */
async function processChunkWithRetry(
  chunk: DocumentChunk,
  maxRetries: number = 2
): Promise<{ text: string; error?: string }> {
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Procesando chunk ${chunk.index + 1}/${chunk.totalChunks} (intento ${attempt + 1})`);
      
      const startTime = Date.now();
      
      // Usar Gemini para OCR del chunk
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { 
            text: `Extrae TODO el texto de este fragmento de documento (parte ${chunk.index + 1} de ${chunk.totalChunks}). 
            
            IMPORTANTE:
            - No resumas ni interpretes el contenido
            - Mantén la estructura original (párrafos, listas, etc.)
            - Si hay tablas, mantenlas en formato de texto plano
            - Si es el primer fragmento, puede incluir encabezados
            - Si es el último fragmento, puede incluir pies de página
            - Devuelve solo el texto extraído, sin comentarios adicionales
            
            Si encuentras texto cortado al inicio o final debido a la división, inclúyelo tal como aparece.`
          },
          { media: { url: chunk.content } }
        ],
        timeout: CHUNK_CONFIG.CHUNK_TIMEOUT,
      });

      const processingTime = Date.now() - startTime;
      console.log(`Chunk ${chunk.index + 1} procesado en ${processingTime}ms`);
      
      return { text: response.text || '' };
      
    } catch (error) {
      console.error(`Error procesando chunk ${chunk.index + 1}, intento ${attempt + 1}:`, error);
      
      if (attempt === maxRetries) {
        return { 
          text: '', 
          error: `Error después de ${maxRetries + 1} intentos: ${error}` 
        };
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  return { text: '', error: 'Error inesperado' };
}

/**
 * Procesa todos los chunks de un documento y combina los resultados
 */
export async function processDocumentChunks(
  chunks: DocumentChunk[]
): Promise<ChunkProcessingResult> {
  const startTime = Date.now();
  let combinedText = '';
  let successfulChunks = 0;
  const errors: string[] = [];

  console.log(`Iniciando procesamiento de ${chunks.length} chunks...`);

  // Procesar chunks secuencialmente para evitar sobrecarga
  for (const chunk of chunks) {
    const result = await processChunkWithRetry(chunk);
    
    if (result.error) {
      errors.push(`Chunk ${chunk.index + 1}: ${result.error}`);
      console.error(`Error en chunk ${chunk.index + 1}:`, result.error);
    } else {
      combinedText += result.text + '\n\n---CHUNK_SEPARATOR---\n\n';
      successfulChunks++;
    }
  }

  // Limpiar separadores y texto redundante
  const cleanedText = cleanCombinedText(combinedText);
  
  const processingTime = Date.now() - startTime;
  
  const success = successfulChunks > 0 && successfulChunks >= chunks.length * 0.8; // 80% éxito mínimo
  
  console.log(`Procesamiento completado: ${successfulChunks}/${chunks.length} chunks exitosos en ${processingTime}ms`);

  return {
    success,
    extractedText: success ? cleanedText : undefined,
    error: success ? undefined : `Falló el procesamiento: ${errors.join('; ')}`,
    processingTime,
    chunksProcessed: successfulChunks
  };
}

/**
 * Limpia y combina el texto de múltiples chunks
 */
function cleanCombinedText(combinedText: string): string {
  // Remover separadores de chunks
  let cleaned = combinedText.replace(/\n\n---CHUNK_SEPARATOR---\n\n/g, '\n\n');
  
  // Remover líneas duplicadas que aparezcan en overlaps
  const lines = cleaned.split('\n');
  const uniqueLines: string[] = [];
  const seen = new Set<string>();
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!seen.has(trimmedLine) || trimmedLine.length < 20) { // Líneas cortas pueden repetirse legítimamente
      uniqueLines.push(line);
      seen.add(trimmedLine);
    }
  }
  
  return uniqueLines.join('\n').trim();
}

// Esquemas para el nuevo flujo
const ChunkedExtractInputSchema = z.object({
  fileDataUri: z.string(),
  fileName: z.string().optional(),
  forceChunking: z.boolean().default(false)
});

const ChunkedExtractOutputSchema = z.object({
  extractedText: z.string(),
  processingStats: z.object({
    totalChunks: z.number(),
    successfulChunks: z.number(),
    processingTimeMs: z.number(),
    fileSize: z.number()
  })
});

/**
 * Flujo principal que maneja documentos grandes automáticamente
 */
export const extractTextFromLargeFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromLargeFileFlow',
    inputSchema: ChunkedExtractInputSchema,
    outputSchema: ChunkedExtractOutputSchema,
  },
  async (input) => {
    const fileSize = input.fileDataUri.length;
    console.log(`Procesando archivo de ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Decidir si usar chunking basado en tamaño
    const needsChunking = fileSize > CHUNK_CONFIG.MAX_CHUNK_SIZE || input.forceChunking;
    
    if (!needsChunking) {
      console.log('Archivo pequeño, procesamiento directo...');
      // Procesamiento directo para archivos pequeños
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { text: 'Extrae todo el texto de este documento. No resumas ni interpretes, devuelve solo el texto tal como aparece.' },
          { media: { url: input.fileDataUri } }
        ],
        timeout: CHUNK_CONFIG.CHUNK_TIMEOUT,
      });
      
      return {
        extractedText: response.text || '',
        processingStats: {
          totalChunks: 1,
          successfulChunks: 1,
          processingTimeMs: 0,
          fileSize
        }
      };
    }
    
    console.log('Archivo grande detectado, usando chunking...');
    
    // Dividir en chunks
    const chunks = splitDocumentIntoChunks(input.fileDataUri);
    
    // Procesar chunks
    const result = await processDocumentChunks(chunks);
    
    if (!result.success) {
      throw new Error(result.error || 'Error en procesamiento por chunks');
    }
    
    return {
      extractedText: result.extractedText || '',
      processingStats: {
        totalChunks: chunks.length,
        successfulChunks: result.chunksProcessed,
        processingTimeMs: result.processingTime,
        fileSize
      }
    };
  }
);