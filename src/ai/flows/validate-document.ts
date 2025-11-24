
'use server';
/**
 * @fileOverview Flujo de validación con scoring centralizado y tipado estricto
 * - Usa Claude 4.5 Sonnet como modelo principal (fallback: Gemini 2.5 Pro).
 * - Tipado explícito para entrada y salida.
 * - Normalización defensiva del output (scoringBreakdown y findings).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  calculateBaseComplianceScore,
  getRiskCategory,
  type Finding as FindingTypeFromScoring,
} from './compliance-scoring';

// Model configuration
const MODELS = {
  primary: 'anthropic/claude-sonnet-4-5-20250929',
  fallback: 'googleai/gemini-2.5-pro',
} as const;

/* =========================
   Esquemas de entrada
   ========================= */

const RegulationSchema = z.object({
  name: z.string().describe('The name of the normative document file.'),
  content: z.string().describe('The full text content of the normative document.'),
});

const ValidateDocumentInputSchema = z.object({
  documentName: z.string().describe('The name of the administrative document file being analyzed.'),
  documentContent: z.string().describe('The full text content of the administrative document.'),
  regulations: z.array(RegulationSchema).describe('An array of normative documents to validate against.'),
  customInstructions: z.string().optional().describe('Optional user-provided instructions to guide the analysis.'),
});

export type ValidateDocumentInput = z.infer<typeof ValidateDocumentInputSchema>;

/* =========================
   Esquema de hallazgo
   ========================= */

const FindingSchema = z.object({
  nombre_archivo_normativa: z.string(),
  nombre_archivo_documento: z.string(),
  tipo: z.enum(['Irregularidad', 'Mejora de Redacción', 'Sin hallazgos relevantes']),
  titulo_incidencia: z.string(),
  articulo_o_seccion: z.string(),
  pagina: z.string(),
  gravedad: z.enum(['Alta', 'Media', 'Baja', 'Informativa']),
  evidencia: z.string(),
  propuesta_procedimiento: z.string().optional(),
  propuesta_redaccion: z.string().optional(),
  justificacion_legal: z.string(),
  justificacion_tecnica: z.string(),
  consecuencia_estimada: z.string(),
  verificacion_interdocumental: z
    .object({
      estado: z.string(),
      archivo_referencia: z.string().optional(),
      ubicacion: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
});

/* =========================
   Salida con scoring
   ========================= */

const ValidateDocumentOutputSchema = z.object({
  isRelevantDocument: z.boolean(),
  relevancyReasoning: z.string(),
  findings: z.array(FindingSchema),
  complianceScore: z.number().min(0).max(100),
  legalRiskScore: z.number().min(0).max(100),
  scoringBreakdown: z.object({
    totalFindings: z.number(),
    criticalFindings: z.number(),
    totalPenalty: z.number(),
    penaltiesByGravity: z.record(z.object({ count: z.number(), penalty: z.number() })),
  }),
  riskCategory: z.object({
    category: z.string(),
    label: z.string(),
    color: z.string(),
    description: z.string(),
  }),
});

export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;
export type Finding = z.infer<typeof FindingSchema>;

/* =========================
   Normalización defensiva
   ========================= */

function normalizeOutput(raw: any, calculatedScores?: any): ValidateDocumentOutput {
  const findings: Finding[] = Array.isArray(raw?.findings) ? (raw.findings as Finding[]) : [];
  const complianceScore = calculatedScores?.complianceScore ?? Number(raw?.complianceScore ?? 100);
  const riskCategory = calculatedScores ? getRiskCategory(complianceScore) : (raw?.riskCategory ?? getRiskCategory(100));

  const scoringBreakdown = {
    totalFindings: calculatedScores?.breakdown?.totalFindings ?? Number(raw?.scoringBreakdown?.totalFindings ?? 0),
    criticalFindings: calculatedScores?.breakdown?.criticalFindings ?? Number(raw?.scoringBreakdown?.criticalFindings ?? 0),
    totalPenalty: calculatedScores?.breakdown?.totalPenalty ?? Number(raw?.scoringBreakdown?.totalPenalty ?? 0),
    penaltiesByGravity: calculatedScores?.breakdown?.penaltiesByGravity ?? (raw?.scoringBreakdown?.penaltiesByGravity ?? {}),
  };
  
  const out: ValidateDocumentOutput = {
    isRelevantDocument: Boolean(raw?.isRelevantDocument),
    relevancyReasoning: String(raw?.relevancyReasoning ?? ''),
    findings,
    complianceScore,
    legalRiskScore: 100 - complianceScore,
    scoringBreakdown,
    riskCategory,
  };

  return ValidateDocumentOutputSchema.parse(out);
}

/* =========================
   Prompt para validación
   ========================= */

const VALIDATION_PROMPT = `Eres un auditor experto en administración pública. Analiza el documento y devuelve hallazgos **sin** calcular puntajes.

Paso 1 (relevancia):
- Si NO es un documento administrativo/gubernamental, responde isRelevantDocument=false, explica en relevancyReasoning y devuelve findings=[].
- Si SÍ es relevante, isRelevantDocument=true, relevancyReasoning="".

Paso 2 (hallazgos):
- Clasifica gravedad: Alta / Media / Baja / Informativa.
- "evidencia" debe ser CITA LITERAL del DOCUMENTO (no de las normas).
- Usa propuesta_redaccion para cambios de texto; propuesta_procedimiento para acciones administrativas.
- Puedes usar "verificacion_interdocumental" si el hallazgo depende de contrastar con otro archivo.

{{#if customInstructions}}
INSTRUCCIONES ADICIONALES DEL USUARIO (aplican con alta prioridad):
{{{customInstructions}}}
{{/if}}

Contexto:
DOCUMENTO: {{{documentName}}}
\`\`\`
{{{documentContent}}}
\`\`\`

NORMAS:
{{#each regulations}}
- {{{this.name}}}
\`\`\`
{{{this.content}}}
\`\`\`
{{/each}}

Devuelve **solo JSON**.`;

const outputSchema = z.object({
  isRelevantDocument: z.boolean(),
  relevancyReasoning: z.string(),
  findings: z.array(FindingSchema),
});

// Primary prompt (Claude)
const validateDocumentPrompt = ai.definePrompt(
  {
    name: 'validateDocumentPrompt',
    model: MODELS.primary,
    input: { schema: ValidateDocumentInputSchema },
    output: { schema: outputSchema },
    prompt: VALIDATION_PROMPT,
  }
);

// Fallback prompt (Gemini)
const validateDocumentFallbackPrompt = ai.definePrompt(
  {
    name: 'validateDocumentFallbackPrompt',
    model: MODELS.fallback,
    input: { schema: ValidateDocumentInputSchema },
    output: { schema: outputSchema },
    prompt: VALIDATION_PROMPT,
  }
);


/* =========================
   Flujo Principal
   ========================= */

const validateDocumentFlow = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();

    // Helper function to process AI output
    const processOutput = (aiOutput: z.infer<typeof outputSchema>) => {
      if (!aiOutput.isRelevantDocument) {
        const irrelevant = normalizeOutput({
          isRelevantDocument: false,
          relevancyReasoning: aiOutput.relevancyReasoning ?? 'Documento no pertinente.',
          findings: [],
        });
        console.log('❌ Documento marcado como no relevante');
        return irrelevant;
      }

      console.log(`📊 IA devolvió ${aiOutput.findings.length} hallazgos`);
      console.log('🧮 Calculando puntajes con sistema centralizado...');

      const scoring = calculateBaseComplianceScore(aiOutput.findings as FindingTypeFromScoring[]);
      const completed = normalizeOutput(aiOutput, scoring);

      console.log(`✅ Análisis completado en ${Date.now() - startTime} ms`);
      console.log(`📈 Puntaje: ${completed.complianceScore}% (${completed.riskCategory.label})`);
      return completed;
    };

    try {
      // Try primary model (Claude)
      console.log('🤖 Ejecutando análisis con Claude...');
      const { output } = await validateDocumentPrompt(input);
      if (!output) throw new Error('La IA no devolvió ningún resultado');
      return processOutput(output);

    } catch (primaryError: any) {
      console.warn('Primary model (Claude) failed, trying fallback (Gemini):', primaryError.message);

      try {
        // Fallback to Gemini
        console.log('🔄 Ejecutando análisis con Gemini (fallback)...');
        const { output } = await validateDocumentFallbackPrompt(input);
        if (!output) throw new Error('El modelo fallback no devolvió ningún resultado');
        return processOutput(output);

      } catch (fallbackError: any) {
        console.error('Both models failed:', fallbackError);
        const errorMessage = `El análisis del documento falló: ${fallbackError.message || String(fallbackError)}`;
        throw new Error(errorMessage);
      }
    }
  }
);

/* =========================
   Punto de entrada principal
   ========================= */

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  console.log('🔍 Iniciando validación...');
  return validateDocumentFlow(input);
}
