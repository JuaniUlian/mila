/**
 * Sistema de RAG (Retrieval-Augmented Generation) por Cliente
 *
 * Cada cliente tiene su propio namespace en Pinecone con:
 * - Normativas locales indexadas
 * - Jurisprudencia relevante
 * - Instrucciones custom del módulo
 *
 * Flujo:
 * 1. Implementación → indexRegulations()
 * 2. Análisis de documento → searchRelevantRegulations()
 * 3. Usuario gana discusión → addModuleInstruction()
 */

import { z } from 'zod';

// Schema de normativa
const RegulationSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  type: z.enum(['ley', 'decreto', 'resolucion', 'manual', 'jurisprudencia']),
  jurisdiction: z.string(),
  date: z.string().optional(),
  articles: z.array(z.object({
    number: z.string(),
    content: z.string(),
  })).optional(),
});

export type Regulation = z.infer<typeof RegulationSchema>;

// Schema de chunk indexado
interface RegulationChunk {
  id: string;
  regulationName: string;
  regulationType: string;
  chunkIndex: number;
  text: string;
  embedding?: number[];
  metadata: {
    articleNumber?: string;
    pageNumber?: number;
    section?: string;
  };
}

export class ClientRAG {
  private clientId: string;
  private namespace: string;
  private apiKey: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.namespace = `client-${clientId}`;
    this.apiKey = process.env.PINECONE_API_KEY || '';
  }

  /**
   * Indexa todas las normativas del cliente
   * Se ejecuta durante la fase de implementación
   */
  async indexRegulations(regulations: Regulation[]): Promise<{
    success: boolean;
    indexed: number;
    errors: string[];
  }> {
    console.log(`🔄 Indexando ${regulations.length} normativas para cliente ${this.clientId}...`);

    const errors: string[] = [];
    let indexed = 0;

    for (const regulation of regulations) {
      try {
        await this.indexSingleRegulation(regulation);
        indexed++;
        console.log(`  ✅ ${regulation.name} indexada`);
      } catch (error: any) {
        const errorMsg = `Error indexando ${regulation.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }

    console.log(`✅ Indexación completa: ${indexed}/${regulations.length} normativas`);

    return {
      success: errors.length === 0,
      indexed,
      errors,
    };
  }

  /**
   * Indexa una normativa individual
   */
  private async indexSingleRegulation(regulation: Regulation): Promise<void> {
    // 1. Dividir en chunks inteligentes (por artículos si existen)
    const chunks = this.createIntelligentChunks(regulation);

    // 2. Generar embeddings para cada chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => ({
        ...chunk,
        embedding: await this.generateEmbedding(chunk.text),
      }))
    );

    // 3. Guardar en Pinecone (simulado por ahora con localStorage)
    await this.saveChunksToVectorStore(chunksWithEmbeddings);
  }

  /**
   * Crea chunks inteligentes basados en estructura del documento
   */
  private createIntelligentChunks(regulation: Regulation): RegulationChunk[] {
    const chunks: RegulationChunk[] = [];

    // Si tiene artículos definidos, chunk por artículo
    if (regulation.articles && regulation.articles.length > 0) {
      regulation.articles.forEach((article, idx) => {
        chunks.push({
          id: `${regulation.id}-art-${article.number}`,
          regulationName: regulation.name,
          regulationType: regulation.type,
          chunkIndex: idx,
          text: `Artículo ${article.number}: ${article.content}`,
          metadata: {
            articleNumber: article.number,
          },
        });
      });
    } else {
      // Si no tiene artículos, chunk por párrafos (cada ~500 palabras)
      const words = regulation.content.split(/\s+/);
      const chunkSize = 500;
      let chunkIndex = 0;

      for (let i = 0; i < words.length; i += chunkSize) {
        const chunkWords = words.slice(i, i + chunkSize);
        const chunkText = chunkWords.join(' ');

        chunks.push({
          id: `${regulation.id}-chunk-${chunkIndex}`,
          regulationName: regulation.name,
          regulationType: regulation.type,
          chunkIndex,
          text: chunkText,
          metadata: {},
        });

        chunkIndex++;
      }
    }

    console.log(`    📄 ${regulation.name}: ${chunks.length} chunks creados`);
    return chunks;
  }

  /**
   * Genera embedding usando OpenAI (o cualquier otro proveedor)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Opción 1: OpenAI (más caro, mejor calidad)
    if (process.env.OPENAI_API_KEY) {
      return await this.generateOpenAIEmbedding(text);
    }

    // Opción 2: Cohere (más barato, buena calidad)
    if (process.env.COHERE_API_KEY) {
      return await this.generateCohereEmbedding(text);
    }

    // Fallback: embedding simulado (solo para desarrollo)
    console.warn('⚠️ No API key found, using mock embedding');
    return this.generateMockEmbedding(text);
  }

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small', // $0.02 / 1M tokens
          input: text.substring(0, 8000), // Limitar a ~8K tokens
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error: any) {
      console.error('Error generating OpenAI embedding:', error);
      throw error;
    }
  }

  private async generateCohereEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'embed-multilingual-v3.0',
          texts: [text.substring(0, 512)], // Cohere limit
          input_type: 'search_document',
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.embeddings[0];
    } catch (error: any) {
      console.error('Error generating Cohere embedding:', error);
      throw error;
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Embedding simulado de 1536 dimensiones (igual que OpenAI)
    const hash = this.simpleHash(text);
    return Array.from({ length: 1536 }, (_, i) => Math.sin(hash + i) * 0.1);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Guarda chunks en vector store (Pinecone en producción, localStorage en dev)
   */
  private async saveChunksToVectorStore(chunks: (RegulationChunk & { embedding: number[] })[]): Promise<void> {
    if (typeof window === 'undefined') {
      // Server-side: guardar en Pinecone real
      // TODO: implementar cuando tengas Pinecone API key
      console.log(`📦 Guardando ${chunks.length} chunks en Pinecone (namespace: ${this.namespace})`);
    } else {
      // Client-side: guardar en localStorage (solo para demo)
      const storageKey = `rag-${this.namespace}`;
      const existing = localStorage.getItem(storageKey);
      const allChunks = existing ? JSON.parse(existing) : [];

      allChunks.push(...chunks);
      localStorage.setItem(storageKey, JSON.stringify(allChunks));

      console.log(`💾 Guardados ${chunks.length} chunks en localStorage`);
    }
  }

  /**
   * Busca normativas relevantes para un documento
   * Retorna los top K chunks más similares
   */
  async searchRelevantRegulations(
    documentText: string,
    topK: number = 5
  ): Promise<{
    regulation: string;
    type: string;
    text: string;
    score: number;
    metadata: any;
  }[]> {
    console.log(`🔍 Buscando normativas relevantes (top ${topK})...`);

    // 1. Generar embedding del documento
    const queryEmbedding = await this.generateEmbedding(documentText.substring(0, 2000));

    // 2. Buscar en vector store
    const results = await this.queryVectorStore(queryEmbedding, topK);

    console.log(`✅ Encontradas ${results.length} normativas relevantes`);
    return results;
  }

  /**
   * Query al vector store (Pinecone en producción)
   */
  private async queryVectorStore(
    queryEmbedding: number[],
    topK: number
  ): Promise<{
    regulation: string;
    type: string;
    text: string;
    score: number;
    metadata: any;
  }[]> {
    if (typeof window === 'undefined') {
      // Server-side: query a Pinecone real
      // TODO: implementar con Pinecone SDK
      return [];
    } else {
      // Client-side: buscar en localStorage con cosine similarity
      const storageKey = `rag-${this.namespace}`;
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        console.warn('⚠️ No hay normativas indexadas para este cliente');
        return [];
      }

      const allChunks: (RegulationChunk & { embedding: number[] })[] = JSON.parse(stored);

      // Calcular cosine similarity con cada chunk
      const withScores = allChunks.map(chunk => ({
        ...chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
      }));

      // Ordenar por score descendente y tomar top K
      const topResults = withScores
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return topResults.map(result => ({
        regulation: result.regulationName,
        type: result.regulationType,
        text: result.text,
        score: result.score,
        metadata: result.metadata,
      }));
    }
  }

  /**
   * Cosine similarity entre dos vectores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Agrega una instrucción custom al módulo (cuando el usuario gana una discusión)
   */
  async addModuleInstruction(instruction: string, metadata?: {
    findingType?: string;
    regulation?: string;
    createdBy?: string;
  }): Promise<void> {
    const storageKey = `module-instructions-${this.namespace}`;
    const existing = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const instructions = existing ? JSON.parse(existing) : [];

    instructions.push({
      instruction,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
      },
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(instructions));
    }

    console.log(`✅ Instrucción agregada al módulo del cliente ${this.clientId}`);
  }

  /**
   * Obtiene todas las instrucciones custom del módulo
   */
  async getModuleInstructions(): Promise<string[]> {
    const storageKey = `module-instructions-${this.namespace}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (!stored) return [];

    const instructions = JSON.parse(stored);
    return instructions.map((item: any) => item.instruction);
  }

  /**
   * Obtiene estadísticas del RAG del cliente
   */
  async getStats(): Promise<{
    regulationsCount: number;
    chunksCount: number;
    instructionsCount: number;
  }> {
    const ragKey = `rag-${this.namespace}`;
    const instructionsKey = `module-instructions-${this.namespace}`;

    const ragData = typeof window !== 'undefined' ? localStorage.getItem(ragKey) : null;
    const instructionsData = typeof window !== 'undefined' ? localStorage.getItem(instructionsKey) : null;

    const chunks = ragData ? JSON.parse(ragData) : [];
    const instructions = instructionsData ? JSON.parse(instructionsData) : [];

    // Contar normativas únicas
    const uniqueRegulations = new Set(chunks.map((c: any) => c.regulationName));

    return {
      regulationsCount: uniqueRegulations.size,
      chunksCount: chunks.length,
      instructionsCount: instructions.length,
    };
  }
}

/**
 * Hook para usar RAG en componentes React
 */
export function useClientRAG(clientId: string) {
  const rag = new ClientRAG(clientId);

  return {
    indexRegulations: rag.indexRegulations.bind(rag),
    searchRelevantRegulations: rag.searchRelevantRegulations.bind(rag),
    addModuleInstruction: rag.addModuleInstruction.bind(rag),
    getModuleInstructions: rag.getModuleInstructions.bind(rag),
    getStats: rag.getStats.bind(rag),
  };
}
