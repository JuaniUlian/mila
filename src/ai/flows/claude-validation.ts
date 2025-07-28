/**
 * Validación simple con Claude (sin Genkit)
 */

'use server';

import Anthropic from '@anthropic-ai/sdk';
import { calculateBaseComplianceScore, getRiskCategory } from './compliance-scoring';

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Función que puedes usar desde tu código existente
export async function validateWithClaude(input: {
  documentName: string;
  documentContent: string;
  regulations: Array<{ name: string; content: string }>;
}) {
  
  console.log('🤖 Validando con Claude...');
  
  try {
    // Construir prompt simple
    const regulationContent = input.regulations.map(r => `Normativa: ${r.name}\nContenido: ${r.content}`).join('\n\n');
    const systemPrompt = `Eres un auditor experto en control de la administración pública. Tu tarea es analizar un documento y, si es relevante, identificar todos los hallazgos posibles.

Reglas Críticas:
1.  **Verificación de Relevancia (Obligatorio):** Primero, determina si el documento es pertinente para la administración pública. Si no lo es, responde con \`isRelevantDocument: false\` y una razón clara en \`relevancyReasoning\`. En ese caso, devuelve un array de \`findings\` vacío.
2.  **Respuesta JSON Estricta:** Tu respuesta DEBE ser únicamente un objeto JSON válido, sin ningún texto o explicación adicional fuera del JSON. La estructura del JSON debe ser exactamente la siguiente:
    \`\`\`json
    {
      "isRelevantDocument": boolean,
      "relevancyReasoning": "string",
      "findings": [
        {
          "nombre_archivo_normativa": "string",
          "nombre_archivo_documento": "string",
          "tipo": "Irregularidad" | "Mejora de Redacción" | "Sin hallazgos relevantes",
          "titulo_incidencia": "string",
          "articulo_o_seccion": "string",
          "pagina": "string",
          "gravedad": "Alta" | "Media" | "Baja" | "Informativa",
          "evidencia": "string",
          "propuesta_procedimiento": "string (optional)",
          "propuesta_redaccion": "string (optional)",
          "justificacion_legal": "string",
          "justificacion_tecnica": "string",
          "consecuencia_estimada": "string"
        }
      ]
    }
    \`\`\`
3.  **Evidencia Literal:** El campo \`evidencia\` debe ser una CITA TEXTUAL Y LITERAL del documento analizado, no de las normativas.
4.  **Propuestas Claras:** Usa \`propuesta_redaccion\` para cambios de texto y \`propuesta_procedimiento\` para acciones administrativas.
5.  **Gravedad Precisa:** Asigna la gravedad de forma precisa sin exagerar ni subestimar.
6.  **No Calcular Scores:** NO incluyas los campos \`complianceScore\` o \`legalRiskScore\` en tu respuesta JSON. Estos se calcularán automáticamente después.`;

    const userPrompt = `Analiza el siguiente documento:

DOCUMENTO: ${input.documentName}
CONTENIDO:
${input.documentContent}

NORMAS DE CONSULTA:
${regulationContent}`;

    // Llamar a Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    // Extraer respuesta
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Claude no devolvió texto');
    }

    // Parsear JSON
    const result = JSON.parse(content.text);

    // Calcular scores usando el sistema centralizado
    const scoringResult = calculateBaseComplianceScore(result.findings);
    const riskCategory = getRiskCategory(scoringResult.complianceScore);
    
    console.log('✅ Claude completado');
    return {
      ...result,
      complianceScore: scoringResult.complianceScore,
      legalRiskScore: scoringResult.legalRiskScore,
      scoringBreakdown: scoringResult.breakdown,
      riskCategory: {
          category: riskCategory.category,
          label: riskCategory.label,
          color: riskCategory.color,
          description: riskCategory.description,
      },
    };

  } catch (error) {
    console.error('❌ Error Claude:', error);
    throw error;
  }
}
