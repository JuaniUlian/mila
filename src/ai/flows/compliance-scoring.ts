/**
 * @fileOverview Sistema centralizado de cálculo de puntaje de cumplimiento
 * Usado tanto por la IA como por el frontend para consistencia total
 *
 * MODELO HÍBRIDO:
 * - Backwards compatible con el esquema actual.
 * - Si la IA aporta metadatos opcionales (ponderación y/o impacto),
 *   se ajusta la penalización dentro de bandas seguras y con topes.
 */

import { z } from 'zod';

/* =========================
   ESQUEMAS
   ========================= */

// Factores de impacto opcionales que puede sugerir la IA.
// Todo es opcional para mantener compatibilidad y evitar romper flujos.
const ImpactFactorsSchema = z.object({
  alcance: z.enum(['Puntual', 'Secciones', 'Documento']).optional()
    .describe('Alcance del problema dentro del documento.'),
  recurrencia: z.enum(['Único', 'Recurrente']).optional()
    .describe('Si el problema aparece una sola vez o se repite.'),
  montoEstimado: z.number().min(0).optional()
    .describe('Exposición económica estimada (en la moneda del organismo).'),
  riesgoNulidad: z.boolean().optional()
    .describe('Si el hallazgo podría derivar en nulidad/impugnación.'),
}).optional();

// Ponderación de severidad sugerida por IA (dentro de bandas por gravedad).
// Si no viene, se usa 1.0 (sin cambio).
const SeverityWeightSchema = z.number().min(0).max(10).optional()
  .describe('Ponderación de severidad sugerida por IA antes de aplicar bandas y topes.');

// Esquema del hallazgo (backwards compatible) + campos opcionales nuevos.
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

  // NUEVO (OPCIONAL): habilita que la IA matice el puntaje
  impacto: ImpactFactorsSchema,
  ponderacion_severidad: SeverityWeightSchema,
});

export type Finding = z.infer<typeof FindingSchema>;

// Estados posibles de un hallazgo en el frontend
export type FindingStatus = 'pending' | 'applied' | 'discarded' | 'modified';

export interface FindingWithStatus extends Finding {
  id: string;
  status: FindingStatus;
  userModifications?: {
    propuesta_procedimiento?: string;
    propuesta_redaccion?: string;
    justificacion_legal?: string;
    justificacion_tecnica?: string;
  };
}

/* =========================
   CONFIGURACIÓN
   ========================= */

export const SCORING_CONFIG = {
  // Penalizaciones base por gravedad (mantener compatibilidad)
  PENALTIES: {
    Alta: 25,
    Media: 15,
    Baja: 8,
    Informativa: 2,
  } as const,

  // Penalizaciones adicionales por tipo
  TYPE_MODIFIERS: {
    Irregularidad: 1.0,           // Caso más serio
    'Mejora de Redacción': 0.7,   // 30% menos
    'Sin hallazgos relevantes': 0.0,
  } as const,

  // Bonificaciones por resolución
  RESOLUTION_BONUSES: {
    applied: 0.0,   // Registrar acción, no cambia puntaje (se reporta como potencial)
    modified: 1.0,  // Recupera 100% de la penalización si se corrige modificando
    discarded: 0.0,
    pending: 0.0,
  } as const,

  // Bandas por gravedad para la ponderación sugerida por IA
  // (Se aplica sobre la base + tipo; si la IA no envía ponderación, se asume 1.0)
  SEVERITY_BANDS: {
    Alta: { min: 0.9, max: 1.3, default: 1.0 },
    Media: { min: 0.85, max: 1.2, default: 1.0 },
    Baja: { min: 0.8, max: 1.15, default: 1.0 },
    Informativa: { min: 0.75, max: 1.1, default: 1.0 },
  } as const,

  // Multiplicadores por factores de impacto (si vienen)
  IMPACT_WEIGHTS: {
    alcance: {
      Puntual: 1.0,
      Secciones: 1.1,
      Documento: 1.2,
    },
    recurrencia: {
      Único: 1.0,
      Recurrente: 1.1,
    },
    // Monto: tramo -> multiplicador incremental suave (capado abajo)
    montoTramos: [
      { hasta: 0, mult: 1.0 },
      { hasta: 10000, mult: 1.03 },
      { hasta: 100000, mult: 1.06 },
      { hasta: 1000000, mult: 1.1 },
      { hasta: Infinity, mult: 1.15 },
    ],
    riesgoNulidadTrue: 1.15,
  } as const,

  // Topes de seguridad
  MAX_PENALTY_PER_FINDING: 40, // ningún hallazgo supera este castigo
  MAX_TOTAL_PENALTY: 100,      // el total no supera el 100 (mantiene rango 0-100)
  MIN_SCORE: 0,
  MAX_SCORE: 100,

  // Categorías de riesgo
  RISK_CATEGORIES: {
    VERY_LOW: { min: 90, max: 100, label: 'Muy Bajo', color: 'green' },
    LOW: { min: 75, max: 89, label: 'Bajo', color: 'lime' },
    MEDIUM: { min: 60, max: 74, label: 'Medio', color: 'yellow' },
    HIGH: { min: 40, max: 59, label: 'Alto', color: 'orange' },
    VERY_HIGH: { min: 0, max: 39, label: 'Muy Alto', color: 'red' },
  } as const,
} as const;

/* =========================
   HELPERS
   ========================= */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function severityWeight(gravedad: Finding['gravedad'], raw?: number) {
  const band = SCORING_CONFIG.SEVERITY_BANDS[gravedad];
  if (raw == null) return band.default;
  return clamp(raw, band.min, band.max);
}

function impactMultiplier(impacto: NonNullable<Finding['impacto']> | undefined) {
  if (!impacto) return 1.0;

  let mult = 1.0;

  if (impacto.alcance) {
    mult *= SCORING_CONFIG.IMPACT_WEIGHTS.alcance[impacto.alcance];
  }
  if (impacto.recurrencia) {
    mult *= SCORING_CONFIG.IMPACT_WEIGHTS.recurrencia[impacto.recurrencia];
  }
  if (typeof impacto.montoEstimado === 'number') {
    const tramo = SCORING_CONFIG.IMPACT_WEIGHTS.montoTramos.find(
      t => impacto.montoEstimado !== undefined && impacto.montoEstimado <= t.hasta
    );
    if (tramo) mult *= tramo.mult;
  }
  if (impacto.riesgoNulidad === true) {
    mult *= SCORING_CONFIG.IMPACT_WEIGHTS.riesgoNulidadTrue;
  }

  // Tope suave para que el impacto no dispare en exceso
  return clamp(mult, 0.85, 1.35);
}

/* =========================
   CÁLCULO BASE
   ========================= */

export function calculateBaseComplianceScore(findings: Finding[]): {
  complianceScore: number;
  legalRiskScore: number;
  breakdown: {
    totalFindings: number;
    criticalFindings: number;
    totalPenalty: number;
    penaltiesByGravity: Record<string, { count: number; penalty: number }>;
  };
} {
  let totalPenalty = 0;
  const penaltiesByGravity: Record<string, { count: number; penalty: number }> = {};
  let criticalFindings = 0;

  // Filtrar hallazgos válidos
  const validFindings = findings.filter(f => f.tipo !== 'Sin hallazgos relevantes');

  validFindings.forEach(finding => {
    const base = SCORING_CONFIG.PENALTIES[finding.gravedad];
    const byType = SCORING_CONFIG.TYPE_MODIFIERS[finding.tipo];

    // Ajustes “inteligentes” pero acotados
    const sev = severityWeight(finding.gravedad, finding.ponderacion_severidad);
    const imp = impactMultiplier(finding.impacto);

    let penalty = Math.round(base * byType * sev * imp);

    // Topes de seguridad por hallazgo
    penalty = clamp(penalty, 0, SCORING_CONFIG.MAX_PENALTY_PER_FINDING);

    totalPenalty += penalty;

    if (finding.gravedad === 'Alta') criticalFindings++;

    const key = finding.gravedad;
    if (!penaltiesByGravity[key]) {
      penaltiesByGravity[key] = { count: 0, penalty: 0 };
    }
    penaltiesByGravity[key].count++;
    penaltiesByGravity[key].penalty += penalty;
  });

  // Tope total
  totalPenalty = clamp(totalPenalty, 0, SCORING_CONFIG.MAX_TOTAL_PENALTY);

  const complianceScore = clamp(
    SCORING_CONFIG.MAX_SCORE - totalPenalty,
    SCORING_CONFIG.MIN_SCORE,
    SCORING_CONFIG.MAX_SCORE
  );
  const legalRiskScore = SCORING_CONFIG.MAX_SCORE - complianceScore;

  return {
    complianceScore,
    legalRiskScore,
    breakdown: {
      totalFindings: validFindings.length,
      criticalFindings,
      totalPenalty,
      penaltiesByGravity,
    },
  };
}

/* =========================
   CÁLCULO DINÁMICO
   ========================= */

export function calculateDynamicComplianceScore(findingsWithStatus: FindingWithStatus[]): {
  complianceScore: number;
  legalRiskScore: number;
  progress: {
    total: number;
    resolved: number;
    pending: number;
    percentageResolved: number;
  };
  breakdown: {
    totalFindings: number;
    criticalFindings: number;
    totalPenalty: number;
    recoveredPoints: number;
    potentialPoints: number;
    penaltiesByGravity: Record<string, { count: number; penalty: number; recovered: number; potential: number }>;
  };
} {
  let totalPenalty = 0;
  let recoveredPoints = 0;
  let potentialPoints = 0;
  const penaltiesByGravity: Record<string, { count: number; penalty: number; recovered: number; potential: number }> = {};

  let criticalFindings = 0;
  let resolvedFindings = 0;

  const validFindings = findingsWithStatus.filter(f => f.tipo !== 'Sin hallazgos relevantes');

  validFindings.forEach(finding => {
    const base = SCORING_CONFIG.PENALTIES[finding.gravedad];
    const byType = SCORING_CONFIG.TYPE_MODIFIERS[finding.tipo];
    const sev = severityWeight(finding.gravedad, finding.ponderacion_severidad);
    const imp = impactMultiplier(finding.impacto);

    let penalty = Math.round(base * byType * sev * imp);
    penalty = clamp(penalty, 0, SCORING_CONFIG.MAX_PENALTY_PER_FINDING);

    totalPenalty += penalty;

    const resolutionBonus = SCORING_CONFIG.RESOLUTION_BONUSES[finding.status];
    const recoveredForThisFinding = Math.round(penalty * resolutionBonus);
    recoveredPoints += recoveredForThisFinding;

    if (finding.status === 'applied') {
      potentialPoints += penalty;
    }

    if (finding.gravedad === 'Alta') criticalFindings++;
    if (finding.status === 'applied' || finding.status === 'modified') resolvedFindings++;

    const key = finding.gravedad;
    if (!penaltiesByGravity[key]) {
      penaltiesByGravity[key] = { count: 0, penalty: 0, recovered: 0, potential: 0 };
    }
    penaltiesByGravity[key].count++;
    penaltiesByGravity[key].penalty += penalty;
    penaltiesByGravity[key].recovered += recoveredForThisFinding;
    if (finding.status === 'applied') {
      penaltiesByGravity[key].potential += penalty;
    }
  });

  totalPenalty = clamp(totalPenalty, 0, SCORING_CONFIG.MAX_TOTAL_PENALTY);

  const netPenalty = totalPenalty - recoveredPoints;
  const complianceScore = clamp(
    SCORING_CONFIG.MAX_SCORE - netPenalty,
    SCORING_CONFIG.MIN_SCORE,
    SCORING_CONFIG.MAX_SCORE
  );
  const legalRiskScore = SCORING_CONFIG.MAX_SCORE - complianceScore;

  const percentageResolved = validFindings.length > 0
    ? Math.round((resolvedFindings / validFindings.length) * 100)
    : 100;

  return {
    complianceScore,
    legalRiskScore,
    progress: {
      total: validFindings.length,
      resolved: resolvedFindings,
      pending: validFindings.length - resolvedFindings,
      percentageResolved,
    },
    breakdown: {
      totalFindings: validFindings.length,
      criticalFindings,
      totalPenalty,
      recoveredPoints,
      potentialPoints,
      penaltiesByGravity,
    },
  };
}

/* =========================
   RIESGO / SIMULACIÓN / REPORTE
   ========================= */

export function getRiskCategory(complianceScore: number): {
  category: keyof typeof SCORING_CONFIG.RISK_CATEGORIES;
  label: string;
  color: string;
  description: string;
} {
  for (const [key, cfg] of Object.entries(SCORING_CONFIG.RISK_CATEGORIES)) {
    if (complianceScore >= cfg.min && complianceScore <= cfg.max) {
      const descriptions = {
        VERY_LOW: 'El documento cumple excelentemente con la normativa',
        LOW: 'El documento tiene un buen nivel de cumplimiento',
        MEDIUM: 'El documento requiere algunas mejoras',
        HIGH: 'El documento tiene problemas significativos que requieren atención',
        VERY_HIGH: 'El documento tiene problemas críticos que requieren corrección inmediata',
      };
      return {
        category: key as keyof typeof SCORING_CONFIG.RISK_CATEGORIES,
        label: cfg.label,
        color: cfg.color,
        description: descriptions[key as keyof typeof descriptions],
      };
    }
  }
  return { category: 'MEDIUM', label: 'Medio', color: 'yellow', description: 'Evaluación en progreso' };
}

export function simulateScoreChange(
  currentFindings: FindingWithStatus[],
  findingId: string,
  newStatus: FindingStatus
): {
  currentScore: number;
  newScore: number;
  difference: number;
  impactDescription: string;
} {
  const currentResult = calculateDynamicComplianceScore(currentFindings);
  const simulatedFindings = currentFindings.map(f =>
    f.id === findingId ? { ...f, status: newStatus } : f
  );
  const newResult = calculateDynamicComplianceScore(simulatedFindings);

  const difference = newResult.complianceScore - currentResult.complianceScore;
  const impactDescriptions = {
    applied: 'Se registra la acción. El puntaje no cambia, pero se reflejará como potencial mejora en el informe.',
    modified: difference > 0 ? `+${difference} puntos al aplicar la corrección modificada` : 'Sin cambio en el puntaje',
    discarded: difference !== 0 ? `${difference} puntos al descartar (penalización permanece)` : 'Sin cambio en el puntaje',
    pending: difference !== 0 ? `${difference} puntos al marcar como pendiente` : 'Sin cambio en el puntaje',
  };

  return {
    currentScore: currentResult.complianceScore,
    newScore: newResult.complianceScore,
    difference,
    impactDescription: impactDescriptions[newStatus],
  };
}

export function generateScoringReport(findingsWithStatus: FindingWithStatus[]): {
  summary: {
    complianceScore: number;
    legalRiskScore: number;
    riskCategory: ReturnType<typeof getRiskCategory>;
    progress: ReturnType<typeof calculateDynamicComplianceScore>['progress'];
  };
  details: {
    breakdown: ReturnType<typeof calculateDynamicComplianceScore>['breakdown'];
    findingsByGravity: Record<string, FindingWithStatus[]>;
    recommendations: string[];
  };
} {
  const result = calculateDynamicComplianceScore(findingsWithStatus);
  const riskCategory = getRiskCategory(result.complianceScore);

  const findingsByGravity = findingsWithStatus.reduce((acc, f) => {
    if (!acc[f.gravedad]) acc[f.gravedad] = [];
    acc[f.gravedad].push(f);
    return acc;
  }, {} as Record<string, FindingWithStatus[]>);

  const recommendations: string[] = [];
  if (result.breakdown.criticalFindings > 0) {
    recommendations.push(`Atender urgentemente ${result.breakdown.criticalFindings} hallazgo(s) crítico(s).`);
  }
  if (result.progress.percentageResolved < 50) {
    recommendations.push('Priorizar la resolución de más hallazgos para mejorar el puntaje.');
  }
  if (result.complianceScore < 60) {
    recommendations.push('Considerar revisión legal especializada debido al alto riesgo.');
  }

  return {
    summary: {
      complianceScore: result.complianceScore,
      legalRiskScore: result.legalRiskScore,
      riskCategory,
      progress: result.progress,
    },
    details: {
      breakdown: result.breakdown,
      findingsByGravity,
      recommendations,
    },
  };
}
