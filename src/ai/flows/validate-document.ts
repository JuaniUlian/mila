
'use server';
/**
 * @fileOverview Flujo de validación con scoring centralizado y tipado estricto
 * - Tipado explícito del retorno de Claude para evitar incompatibilidades en `return claudeResult`
 * - Normalización defensiva del output (scoringBreakdown y findings)
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  calculateBaseComplianceScore,
  getRiskCategory,
  type Finding as FindingTypeFromScoring,
} from './compliance-scoring';

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
   (alineado a compliance-scoring.ts)
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
  // <- este campo aparecía en tu error como parte del tipo esperado
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
    penaltiesByGravity: z.record(
      z.object({
        count: z.number(),
        penalty: z.number(),
      })
    ),
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

function normalizeOutput(raw: any): ValidateDocumentOutput {
  // Asegurar findings como arreglo tipado
  const findings: Finding[] = Array.isArray(raw?.findings) ? (raw.findings as Finding[]) : [];

  // Asegurar scoringBreakdown con forma de objeto (nunca array)
  const sb = raw?.scoringBreakdown ?? {};
  const scoringBreakdown = {
    totalFindings: Number(sb.totalFindings ?? findings.length),
    criticalFindings: Number(sb.criticalFindings ?? findings.filter(f => f.gravedad === 'Alta').length),
    totalPenalty: Number(sb.totalPenalty ?? 0),
    penaltiesByGravity:
      typeof sb.penaltiesByGravity === 'object' && sb.penaltiesByGravity !== null && !Array.isArray(sb.penaltiesByGravity)
        ? sb.penaltiesByGravity
        : {},
  };

  // Asegurar riskCategory con strings
  const rc = raw?.riskCategory ?? {};
  const riskCategory = {
    category: String(rc.category ?? 'UNKNOWN'),
    label: String(rc.label ?? 'Desconocido'),
    color: String(rc.color ?? '#999999'),
    description: String(rc.description ?? ''),
  };

  const out: ValidateDocumentOutput = {
    isRelevantDocument: Boolean(raw?.isRelevantDocument),
    relevancyReasoning: String(raw?.relevancyReasoning ?? ''),
    findings,

    complianceScore: Number(raw?.complianceScore ?? 100),
    legalRiskScore: Number(raw?.legalRiskScore ?? 0),

    scoringBreakdown,
    riskCategory,
  };

  // Validación final contra Zod (lanza si algo quedó fuera de forma)
  return ValidateDocumentOutputSchema.parse(out);
}

/* =========================
   Fallback Prompt (Gemini)
   ========================= */

const prompt = ai.definePrompt({
  name: 'validateDocumentPromptWithGeminiPro',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: ValidateDocumentInputSchema },
  output: {
    schema: z.object({
      isRelevantDocument: z.boolean(),
      relevancyReasoning: z.string(),
      findings: z.array(FindingSchema),
    }),
  },
  prompt: `Eres un auditor experto en administración pública. Analiza el documento y devuelve hallazgos **sin** calcular puntajes.

{{#if customInstructions}}
INSTRUCCIONES ADICIONALES DEL USUARIO (aplican con alta prioridad):
{{{customInstructions}}}
{{/if}}

Paso 1 (relevancia):
- Si NO es un documento administrativo/gubernamental, responde isRelevantDocument=false, explica en relevancyReasoning y devuelve findings=[].
- Si SÍ es relevante, isRelevantDocument=true, relevancyReasoning="".

Paso 2 (hallazgos):
- Clasifica gravedad: Alta / Media / Baja / Informativa.
- "evidencia" debe ser CITA LITERAL del DOCUMENTO (no de las normas).
- Usa propuesta_redaccion para cambios de texto; propuesta_procedimiento para acciones administrativas.
- Puedes usar "verificacion_interdocumental" si el hallazgo depende de contrastar con otro archivo.

Contexto:
DOCUMENTO: {{{documentName}}}
\`\`\`
{{{documentContent}}}
\`\`\`

NORMAS:
{{#each regulations}}
- {{this.name}}
\`\`\`
{{{this.content}}}
\`\`\`
{{/each}}

Devuelve **solo JSON**.`,
});

/* =========================
   Flow Fallback (Gemini)
   ========================= */

const validateDocumentFlow = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    try {
      console.log('🤖 Ejecutando análisis con Mila (Gemini 1.5 Pro Fallback)...');
      const { output: aiOutput } = await prompt(input);
      if (!aiOutput) throw new Error('La IA no devolvió ningún resultado');

      if (!aiOutput.isRelevantDocument) {
        // Documento irrelevante: devolver estructura completa, sin penalización
        const irrelevant = normalizeOutput({
          isRelevantDocument: false,
          relevancyReasoning: aiOutput.relevancyReasoning ?? 'Documento no pertinente.',
          findings: [],
          complianceScore: 100,
          legalRiskScore: 0,
          scoringBreakdown: {
            totalFindings: 0,
            criticalFindings: 0,
            totalPenalty: 0,
            penaltiesByGravity: {},
          },
          riskCategory: getRiskCategory(100),
        });

        console.log('❌ Documento marcado como no relevante');
        return irrelevant;
      }

      console.log(`📊 Gemini Pro devolvió ${aiOutput.findings.length} hallazgos`);
      console.log('🧮 Calculando puntajes con sistema centralizado...');
      const scoring = calculateBaseComplianceScore(aiOutput.findings as FindingTypeFromScoring[]);
      const rc = getRiskCategory(scoring.complianceScore);

      const completed = normalizeOutput({
        isRelevantDocument: true,
        relevancyReasoning: '',
        findings: aiOutput.findings,
        complianceScore: scoring.complianceScore,
        legalRiskScore: scoring.legalRiskScore,
        scoringBreakdown: {
          totalFindings: scoring.breakdown.totalFindings,
          criticalFindings: scoring.breakdown.criticalFindings,
          totalPenalty: scoring.breakdown.totalPenalty,
          penaltiesByGravity: scoring.breakdown.penaltiesByGravity,
        },
        riskCategory: {
          category: rc.category,
          label: rc.label,
          color: rc.color,
          description: rc.description,
        },
      });

      console.log(`✅ Fallback completado en ${Date.now() - startTime} ms`);
      console.log(`📈 Puntaje: ${completed.complianceScore}% (${completed.riskCategory.label})`);
      return completed;
    } catch (err) {
      console.error('Error en el flujo de validación (Fallback):', err);
      throw new Error(`El análisis del documento falló: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
);

/* =========================
   Punto de entrada principal
   ========================= */

export async function validateDocument(input: ValidateDocumentInput): Promise<ValidateDocumentOutput> {
  console.log('🔍 Iniciando validación con Mila...');
  try {
    // Tipado explícito del import dinámico para que TS conozca el tipo de retorno
    const { validateWithClaude } = (await import('./claude-validation')) as {
      validateWithClaude: (input: ValidateDocumentInput) => Promise<ValidateDocumentOutput>;
    };

    const raw = await validateWithClaude(input);
    console.log('✅ Validación completada con Mila (Claude primario).');

    // Normaliza y valida contra Zod para garantizar la forma
    const claudeResult = normalizeOutput(raw);
    return claudeResult;
  } catch (claudeError) {
    console.warn('⚠️ Fallback: Claude falló, ejecutando Mila con Gemini. Error:', claudeError);
    // validateDocumentFlow ya devuelve ValidateDocumentOutput verificado por Zod
    return validateDocumentFlow(input);
  }
}
