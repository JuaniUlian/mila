
'use server';
/**
 * @fileOverview Flujo de validación con scoring centralizado y tipado estricto
 * - Usa Claude 3.5 Sonnet como modelo principal.
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
import {claude} from 'genkitx-anthropic';

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
   Prompt para Claude
   ========================= */

const validateDocumentWithClaude = ai.defineFlow(
  {
    name: 'validateDocumentWithClaude',
    inputSchema: ValidateDocumentInputSchema,
    outputSchema: z.object({
        isRelevantDocument: z.boolean(),
        relevancyReasoning: z.string(),
        findings: z.array(FindingSchema),
    }),
  },
  async (input) => {
    
    const model = claude(process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620');
    
    let systemPrompt = `Eres un auditor experto en administración pública. Analiza el documento y devuelve hallazgos **sin** calcular puntajes.

Paso 1 (relevancia):
- Si NO es un documento administrativo/gubernamental, responde isRelevantDocument=false, explica en relevancyReasoning y devuelve findings=[].
- Si SÍ es relevante, isRelevantDocument=true, relevancyReasoning="".

Paso 2 (hallazgos):
- Clasifica gravedad: Alta / Media / Baja / Informativa.
- "evidencia" debe ser CITA LITERAL del DOCUMENTO (no de las normas).
- Usa propuesta_redaccion para cambios de texto; propuesta_procedimiento para acciones administrativas.
- Puedes usar "verificacion_interdocumental" si el hallazgo depende de contrastar con otro archivo.

Devuelve **solo JSON**.`;

    if (input.customInstructions) {
        systemPrompt += `\n\nINSTRUCCIONES ADICIONALES DEL USUARIO (aplican con alta prioridad):\n${input.customInstructions}`;
    }

    const regulationsText = input.regulations.map(r => `- ${r.name}\n\`\`\`\n${r.content}\n\`\`\``).join('\n\n');
    
    const userPrompt = `Contexto:
DOCUMENTO: ${input.documentName}
\`\`\`
${input.documentContent}
\`\`\`

NORMAS:
${regulationsText}
`;

    const { output } = await ai.generate({
      model: model,
      prompt: userPrompt,
      config: {
        system: systemPrompt,
        temperature: 0.1,
      },
      output: {
          schema: z.object({
            isRelevantDocument: z.boolean(),
            relevancyReasoning: z.string(),
            findings: z.array(FindingSchema),
          })
      }
    });
    
    return output()!;
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
    try {
      console.log('🤖 Ejecutando análisis con Claude...');
      const aiOutput = await validateDocumentWithClaude(input);
      if (!aiOutput) throw new Error('La IA no devolvió ningún resultado');

      if (!aiOutput.isRelevantDocument) {
        const irrelevant = normalizeOutput({
          isRelevantDocument: false,
          relevancyReasoning: aiOutput.relevancyReasoning ?? 'Documento no pertinente.',
          findings: [],
        });
        console.log('❌ Documento marcado como no relevante');
        return irrelevant;
      }

      console.log(`📊 Claude devolvió ${aiOutput.findings.length} hallazgos`);
      console.log('🧮 Calculando puntajes con sistema centralizado...');
      
      const scoring = calculateBaseComplianceScore(aiOutput.findings as FindingTypeFromScoring[]);
      
      const completed = normalizeOutput(aiOutput, scoring);

      console.log(`✅ Análisis completado en ${Date.now() - startTime} ms`);
      console.log(`📈 Puntaje: ${completed.complianceScore}% (${completed.riskCategory.label})`);
      return completed;

    } catch (err: any) {
      console.error('Error en el flujo de validación:', err);
      const errorMessage = `El análisis del documento falló: ${err.message || String(err)}`;
      throw new Error(errorMessage);
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
