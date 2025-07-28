
'use server';
/**
 * @fileOverview Flujo de validación actualizado con scoring centralizado y preciso
 * REEMPLAZA el cálculo hardcodeado por el sistema centralizado
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { calculateBaseComplianceScore, getRiskCategory, type Finding } from './compliance-scoring';

// ESQUEMAS ORIGINALES (mantener compatibilidad)
const RegulationSchema = z.object({
  name: z.string().describe("The name of the normative document file."),
  content: z.string().describe("The full text content of the normative document."),
});

const ValidateDocumentInputSchema = z.object({
  documentName: z.string().describe("The name of the administrative document file being analyzed."),
  documentContent: z.string().describe("The full text content of the administrative document."),
  regulations: z.array(RegulationSchema).describe("An array of normative documents to validate against."),
});

export type ValidateDocumentInput = z.infer<typeof ValidateDocumentInputSchema>;

// ESQUEMA DE HALLAZGO (debe coincidir exactamente con compliance-scoring.ts)
const FindingSchema = z.object({
  nombre_archivo_normativa: z.string().describe("Nombre del archivo de norma o manual usado como referencia para este hallazgo."),
  nombre_archivo_documento: z.string().describe("Nombre del archivo del documento que se está analizando."),
  tipo: z.enum(["Irregularidad", "Mejora de Redacción", "Sin hallazgos relevantes"]).describe("El tipo de hallazgo."),
  titulo_incidencia: z.string().describe("Un título breve y claro que describa el problema identificado."),
  articulo_o_seccion: z.string().describe("Artículo o sección específica de la normativa que se aplicó."),
  pagina: z.string().describe("Número de página del documento analizado donde se encuentra la evidencia del hallazgo."),
  gravedad: z.enum(["Alta", "Media", "Baja", "Informativa"]).describe("La severidad del hallazgo."),
  evidencia: z.string().describe("CITA TEXTUAL Y LITERAL del DOCUMENTO_A_REVISAR que contiene el error o la frase a mejorar."),
  propuesta_procedimiento: z.string().optional().describe("Acción de procedimiento administrativo a realizar."),
  propuesta_redaccion: z.string().optional().describe("Texto alternativo completo y listo para reemplazar el original."),
  justificacion_legal: z.string().describe("Explicación jurídica que fundamenta la inconsistencia o la mejora."),
  justificacion_tecnica: z.string().describe("Elementos objetivos y técnicos que sustentan la identificación de la inconsistencia."),
  consecuencia_estimada: z.string().describe("Consecuencias potenciales si no se corrige la inconsistencia."),
});

// ESQUEMA DE SALIDA ACTUALIZADO con información de scoring detallada
const ValidateDocumentOutputSchema = z.object({
  isRelevantDocument: z.boolean().describe("Indica si el documento analizado parece ser un documento genuino y pertinente de la administración pública."),
  relevancyReasoning: z.string().describe("Si isRelevantDocument es false, explica brevemente por qué el documento se considera irrelevante."),
  findings: z.array(FindingSchema).describe("Una lista de todos los hallazgos encontrados en el documento."),
  
  // SCORES CALCULADOS CON EL SISTEMA CENTRALIZADO
  complianceScore: z.number().min(0).max(100).describe("El porcentaje de Cumplimiento Normativo calculado con el sistema centralizado."),
  legalRiskScore: z.number().min(0).max(100).describe("El porcentaje de Riesgo Legal (100 - complianceScore)."),
  
  // INFORMACIÓN ADICIONAL DE SCORING
  scoringBreakdown: z.object({
    totalFindings: z.number().describe("Número total de hallazgos válidos"),
    criticalFindings: z.number().describe("Número de hallazgos críticos (Alta gravedad)"),
    totalPenalty: z.number().describe("Penalización total aplicada"),
    penaltiesByGravity: z.record(z.object({
      count: z.number(),
      penalty: z.number()
    })).describe("Desglose de penalizaciones por gravedad"),
  }).describe("Desglose detallado del cálculo de puntaje"),
  
  riskCategory: z.object({
    category: z.string().describe("Categoría de riesgo (VERY_LOW, LOW, MEDIUM, HIGH, VERY_HIGH)"),
    label: z.string().describe("Etiqueta legible de la categoría"),
    color: z.string().describe("Color asociado a la categoría"),
    description: z.string().describe("Descripción de la categoría de riesgo"),
  }).describe("Categorización del riesgo basada en el puntaje"),
});

export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  console.log('🔍 Iniciando validación de documento...');
  console.log(`📄 Documento: ${input.documentName}`);
  console.log(`📚 Normativas: ${input.regulations.length}`);
  
  return validateDocumentFlow(input);
}

// PROMPT ACTUALIZADO que ya no incluye cálculo de scores
const prompt = ai.definePrompt({
  name: 'validateDocumentPrompt',
  input: { schema: ValidateDocumentInputSchema },
  output: { 
    schema: z.object({
      isRelevantDocument: z.boolean(),
      relevancyReasoning: z.string(),
      findings: z.array(FindingSchema),
    })
  },
  prompt: `Eres un auditor experto en control de la administración pública. Tu tarea es analizar el documento y identificar hallazgos, pero NO calcular puntajes (eso se hace automáticamente después).

**Paso 1: Verificación de Relevancia (OBLIGATORIO)**
Analiza el \`documentContent\` para determinar si es un documento administrativo, legal o técnico pertinente para una entidad gubernamental.

*   **SI ES RELEVANTE:** Procede con el análisis completo. Establece \`isRelevantDocument\` en \`true\` y deja \`relevancyReasoning\` vacío.
*   **SI NO ES RELEVANTE:** Detén el análisis. Establece \`isRelevantDocument\` en \`false\`, rellena \`relevancyReasoning\` con una explicación clara, y devuelve \`findings\` como array vacío.

**Paso 2: Análisis de Hallazgos (Solo si el documento es relevante)**
Identifica sistemáticamente irregularidades de cualquier tipo: redacción, forma, materia, procedimentales, legales, contables, administrativas, vínculos societarios, direccionamientos, etc.

**IMPORTANTE SOBRE GRAVEDAD:**
- **Alta**: Problemas que pueden causar nulidad, impugnaciones legales, o violaciones normativas graves
- **Media**: Inconsistencias importantes que afectan la validez o claridad del documento
- **Baja**: Problemas menores de redacción o formato que conviene corregir
- **Informativa**: Observaciones técnicas o sugerencias de mejora

**CONTEXTO PARA LA EJECUCIÓN:**
*   **DOCUMENTO_A_REVISAR:**
    *   Nombre: {{{documentName}}}
    *   Contenido: \`\`\`{{{documentContent}}}\`\`\`

*   **NORMAS_DE_CONSULTA:**
    {{#each regulations}}
    *   Nombre Norma: {{this.name}}
    *   Contenido Norma: \`\`\`{{{this.content}}}\`\`\`
    {{/each}}

**REGLAS CRÍTICAS:**
1. El campo \`evidencia\` debe ser una **CITA LITERAL** del **DOCUMENTO_A_REVISAR**, nunca de las normas.
2. Si la solución es cambio de texto: usar \`propuesta_redaccion\`, NO \`propuesta_procedimiento\`.
3. Si la solución es acción administrativa: usar \`propuesta_procedimiento\`, NO \`propuesta_redaccion\`.
4. Ser preciso con la gravedad: no sobre-penalizar problemas menores ni sub-valorar problemas graves.

Responde únicamente en formato JSON sin decoraciones adicionales.`,
});

const validateDocumentFlow = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    
    try {
      // EJECUTAR EL PROMPT (solo obtiene hallazgos, no calcula scores)
      console.log('🤖 Ejecutando análisis con IA...');
      const { output: aiOutput } = await prompt(input);
      
      if (!aiOutput) {
        throw new Error('La IA no devolvió ningún resultado');
      }
      
      console.log(`📊 IA encontró ${aiOutput.findings.length} hallazgos`);
      
      // Si el documento no es relevante, devolver resultado básico
      if (!aiOutput.isRelevantDocument) {
        console.log('❌ Documento marcado como no relevante');
        return {
          isRelevantDocument: false,
          relevancyReasoning: aiOutput.relevancyReasoning,
          findings: [],
          complianceScore: 100, // Documento irrelevante = sin penalización
          legalRiskScore: 0,
          scoringBreakdown: {
            totalFindings: 0,
            criticalFindings: 0,
            totalPenalty: 0,
            penaltiesByGravity: {},
          },
          riskCategory: getRiskCategory(100),
        };
      }
      
      // CALCULAR SCORES CON EL SISTEMA CENTRALIZADO
      console.log('🧮 Calculando puntajes con sistema centralizado...');
      const scoringResult = calculateBaseComplianceScore(aiOutput.findings as Finding[]);
      const riskCategory = getRiskCategory(scoringResult.complianceScore);
      
      console.log(`✅ Análisis completado en ${Date.now() - startTime}ms`);
      console.log(`📈 Puntaje: ${scoringResult.complianceScore}% (${riskCategory.label})`);
      console.log(`🔍 Hallazgos críticos: ${scoringResult.breakdown.criticalFindings}`);
      
      // DEVOLVER RESULTADO COMPLETO CON SCORING PRECISO
      return {
        isRelevantDocument: true,
        relevancyReasoning: '',
        findings: aiOutput.findings,
        complianceScore: scoringResult.complianceScore,
        legalRiskScore: scoringResult.legalRiskScore,
        scoringBreakdown: {
          totalFindings: scoringResult.breakdown.totalFindings,
          criticalFindings: scoringResult.breakdown.criticalFindings,
          totalPenalty: scoringResult.breakdown.totalPenalty,
          penaltiesByGravity: scoringResult.breakdown.penaltiesByGravity,
        },
        riskCategory: {
          category: riskCategory.category,
          label: riskCategory.label,
          color: riskCategory.color,
          description: riskCategory.description,
        },
      };
      
    } catch (error) {
      console.error('❌ Error en validateDocumentFlow:', error);
      throw error;
    }
  }
);
