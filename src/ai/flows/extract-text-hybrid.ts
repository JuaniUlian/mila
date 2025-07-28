'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { extractTextFromLargeFileFlow } from './chunk-processor';

// Configuración de estrategias por tamaño y tipo
const PROCESSING_STRATEGY = {
  // Archivos pequeños: procesamiento directo
  SMALL_FILE_THRESHOLD: 2 * 1024 * 1024, // 2MB
  // Archivos medianos: chunking con Gemini
  MEDIUM_FILE_THRESHOLD: 20 * 1024 * 1024, // 20MB
  // Archivos grandes: chunking híbrido
  LARGE_FILE_THRESHOLD: 50 * 1024 * 1024, // 50MB
};

const HybridExtractInputSchema = z.object({
  fileDataUri: z.string(),
  fileName: z.string().optional(),
  fileType: z.enum(['pdf', 'docx', 'txt', 'md', 'image']).optional(),
  preferredModel: z.enum(['gemini', 'claude', 'auto']).default('auto'),
});

const HybridExtractOutputSchema = z.object({
  extractedText: z.string(),
  processingInfo: z.object({
    strategy: z.string(),
    model: z.string(),
    fileSize: z.number(),
    processingTimeMs: z.number(),
    chunksUsed: z.number().optional(),
    qualityScore: z.number().optional(), // 0-100
  }),
  fallbackUsed: z.boolean().default(false),
});

export type HybridExtractInput = z.infer<typeof HybridExtractInputSchema>;
export type HybridExtractOutput = z.infer<typeof HybridExtractOutputSchema>;

/**
 * Detecta el tipo de archivo basado en el dataURI
 */
function detectFileType(dataUri: string): string {
  const mimeType = dataUri.split(';')[0].split(':')[1];
  
  const typeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
    'text/markdown': 'md',
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
  };
  
  return typeMap[mimeType] || 'unknown';
}

/**
 * Determina la mejor estrategia de procesamiento
 */
function determineProcessingStrategy(
  fileSize: number, 
  fileType: string, 
  preferredModel: string
): { strategy: string; model: string; useChunking: boolean } {
  
  // Casos especiales por tipo de archivo
  if (fileType === 'docx' || fileType === 'txt' || fileType === 'md') {
    return {
      strategy: 'client_side',
      model: 'none',
      useChunking: false
    };
  }
  
  // Archivos pequeños
  if (fileSize <= PROCESSING_STRATEGY.SMALL_FILE_THRESHOLD) {
    const model = preferredModel === 'auto' ? 'gemini' : preferredModel;
    return {
      strategy: 'direct',
      model: model === 'claude' ? 'claude-sonnet-4-20250514' : 'googleai/gemini-1.5-flash',
      useChunking: false
    };
  }
  
  // Archivos medianos
  if (fileSize <= PROCESSING_STRATEGY.MEDIUM_FILE_THRESHOLD) {
    return {
      strategy: 'chunked_gemini',
      model: 'googleai/gemini-1.5-flash',
      useChunking: true
    };
  }
  
  // Archivos grandes
  if (fileSize <= PROCESSING_STRATEGY.LARGE_FILE_THRESHOLD) {
    return {
      strategy: 'chunked_hybrid',
      model: 'googleai/gemini-1.5-flash', // Gemini para OCR, Claude para post-procesamiento
      useChunking: true
    };
  }
  
  // Archivos muy grandes
  return {
    strategy: 'progressive_chunked',
    model: 'googleai/gemini-1.5-flash',
    useChunking: true
  };
}

/**
 * Procesa con Claude (para archivos pequeños-medianos)
 */
async function processWithClaude(dataUri: string): Promise<{ text: string; processingTime: number }> {
  const startTime = Date.now();
  
  // Convertir dataURI a formato que Claude entiende
  const [header, base64Data] = dataUri.split(',');
  const mimeType = header.split(';')[0].split(':')[1];
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrae todo el texto de este documento. Mantén la estructura original, no resumas ni interpretes. Devuelve solo el texto tal como aparece en el documento.'
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
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  const processingTime = Date.now() - startTime;
  
  return {
    text: result.content[0]?.text || '',
    processingTime
  };
}

/**
 * Post-procesa texto extraído con Claude para mejor calidad
 */
async function postProcessWithClaude(extractedText: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Limpia y mejora este texto extraído por OCR, manteniendo TODO el contenido original:

INSTRUCCIONES:
1. Corrige errores obvios de OCR (caracteres mal reconocidos)
2. Mejora el formato y estructura (párrafos, listas, etc.)
3. NO elimines ningún contenido, solo mejora la legibilidad
4. Mantén todos los números, fechas, y datos exactos
5. Preserva la estructura original del documento

IMPORTANTE: No resumas, no interpretes, solo limpia y estructura mejor.

TEXTO A LIMPIAR:
${extractedText}`
        }
      ]
    })
  });
  
  if (!response.ok) {
    console.warn('Error en post-procesamiento con Claude, devolviendo texto original');
    return extractedText;
  }
  
  const result = await response.json();
  return result.content[0]?.text || extractedText;
}

/**
 * Función principal del flujo híbrido
 */
export async function extractTextFromFileHybrid(input: HybridExtractInput): Promise<HybridExtractOutput> {
  const startTime = Date.now();
  const fileSize = input.fileDataUri.length;
  const fileType = input.fileType || detectFileType(input.fileDataUri);
  
  console.log(`Procesando archivo: ${input.fileName || 'unnamed'} (${(fileSize / 1024 / 1024).toFixed(2)}MB, tipo: ${fileType})`);
  
  const strategy = determineProcessingStrategy(fileSize, fileType, input.preferredModel);
  console.log(`Estrategia seleccionada: ${strategy.strategy} con ${strategy.model}`);
  
  let extractedText = '';
  let fallbackUsed = false;
  let chunksUsed = 0;
  
  try {
    switch (strategy.strategy) {
      case 'client_side':
        throw new Error('Client-side processing should be handled in the frontend');
        
      case 'direct':
        if (strategy.model.includes('claude')) {
          const result = await processWithClaude(input.fileDataUri);
          extractedText = result.text;
        } else {
          // Usar el flujo original de Gemini para archivos pequeños
          const response = await ai.generate({
            model: strategy.model,
            prompt: [
              { text: 'Extrae todo el texto de este documento. No resumas ni interpretes, devuelve solo el texto tal como aparece.' },
              { media: { url: input.fileDataUri } }
            ],
            timeout: 2 * 60 * 1000, // 2 minutos
          });
          extractedText = response.text || '';
        }
        break;
        
      case 'chunked_gemini':
        const geminirResult = await extractTextFromLargeFileFlow({
          fileDataUri: input.fileDataUri,
          fileName: input.fileName,
          forceChunking: true
        });
        extractedText = geminirResult.extractedText;
        chunksUsed = geminirResult.processingStats.totalChunks;
        break;
        
      case 'chunked_hybrid':
        // OCR con Gemini, post-procesamiento con Claude
        const geminiResult = await extractTextFromLargeFileFlow({
          fileDataUri: input.fileDataUri,
          fileName: input.fileName,
          forceChunking: true
        });
        
        console.log('Post-procesando con Claude para mejor calidad...');
        extractedText = await postProcessWithClaude(geminiResult.extractedText);
        chunksUsed = geminiResult.processingStats.totalChunks;
        break;
        
      case 'progressive_chunked':
        // Para archivos muy grandes, usar estrategia más conservadora
        const progressiveResult = await extractTextFromLargeFileFlow({
          fileDataUri: input.fileDataUri,
          fileName: input.fileName,
          forceChunking: true
        });
        extractedText = progressiveResult.extractedText;
        chunksUsed = progressiveResult.processingStats.totalChunks;
        break;
        
      default:
        throw new Error(`Estrategia no soportada: ${strategy.strategy}`);
    }
    
  } catch (error) {
    console.error(`Error con estrategia ${strategy.strategy}:`, error);
    
    // Fallback: intentar con chunking básico de Gemini
    if (strategy.strategy !== 'chunked_gemini') {
      console.log('Intentando fallback con chunking de Gemini...');
      try {
        const fallbackResult = await extractTextFromLargeFileFlow({
          fileDataUri: input.fileDataUri,
          fileName: input.fileName,
          forceChunking: fileSize > PROCESSING_STRATEGY.SMALL_FILE_THRESHOLD
        });
        extractedText = fallbackResult.extractedText;
        chunksUsed = fallbackResult.processingStats.totalChunks;
        fallbackUsed = true;
      } catch (fallbackError) {
        throw new Error(`Error en procesamiento principal y fallback: ${error}; Fallback: ${fallbackError}`);
      }
    } else {
      throw error;
    }
  }
  
  const processingTime = Date.now() - startTime;
  
  // Calcular score de calidad básico
  const qualityScore = calculateQualityScore(extractedText, fileSize);
  
  console.log(`Procesamiento completado en ${processingTime}ms. Calidad: ${qualityScore}%`);
  
  return {
    extractedText,
    processingInfo: {
      strategy: strategy.strategy,
      model: strategy.model,
      fileSize,
      processingTimeMs: processingTime,
      chunksUsed: chunksUsed > 0 ? chunksUsed : undefined,
      qualityScore,
    },
    fallbackUsed,
  };
}

/**
 * Calcula un score básico de calidad del texto extraído
 */
function calculateQualityScore(text: string, fileSize: number): number {
  if (!text || text.length === 0) return 0;
  
  let score = 100;
  
  // Penalizar por texto muy corto comparado con el archivo
  const expectedRatio = 0.01; // 1% del tamaño del archivo en bytes
  const actualRatio = text.length / fileSize;
  if (actualRatio < expectedRatio * 0.5) {
    score -= 30; // Posible problema de extracción
  }
  
  // Penalizar por muchos caracteres raros (probable OCR malo)
  const strangeChars = (text.match(/[^\w\s\n\r\t\-.,;:!?()[\]{}'"@#$%&*+=<>\/\\|`~]/g) || []).length;
  const strangeRatio = strangeChars / text.length;
  if (strangeRatio > 0.05) { // Más del 5% de caracteres raros
    score -= Math.min(40, strangeRatio * 100);
  }
  
  // Bonus por estructura aparente (párrafos, puntuación)
  const hasStructure = /\n\s*\n/.test(text) && /[.!?]/.test(text);
  if (hasStructure) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Exportar el flujo de Genkit
export const hybridExtractTextFlow = ai.defineFlow(
  {
    name: 'hybridExtractTextFlow',
    inputSchema: HybridExtractInputSchema,
    outputSchema: HybridExtractOutputSchema,
  },
  extractTextFromFileHybrid
);
