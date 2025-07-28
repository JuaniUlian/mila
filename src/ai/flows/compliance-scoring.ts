/**
 * @fileOverview Sistema centralizado de cálculo de puntaje de cumplimiento
 * Usado tanto por la IA como por el frontend para consistencia total
 */

import { z } from 'zod';

// Esquema del hallazgo (debe coincidir con el de validate-document.ts)
const FindingSchema = z.object({
  nombre_archivo_normativa: z.string(),
  nombre_archivo_documento: z.string(),
  tipo: z.enum(["Irregularidad", "Mejora de Redacción", "Sin hallazgos relevantes"]),
  titulo_incidencia: z.string(),
  articulo_o_seccion: z.string(),
  pagina: z.string(),
  gravedad: z.enum(["Alta", "Media", "Baja", "Informativa"]),
  evidencia: z.string(),
  propuesta_procedimiento: z.string().optional(),
  propuesta_redaccion: z.string().optional(),
  justificacion_legal: z.string(),
  justificacion_tecnica: z.string(),
  consecuencia_estimada: z.string(),
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

// CONFIGURACIÓN DEL SISTEMA DE SCORING
export const SCORING_CONFIG = {
  // Penalizaciones base por gravedad
  PENALTIES: {
    'Alta': 25,      // Penalización fuerte para problemas críticos
    'Media': 15,     // Penalización moderada
    'Baja': 8,       // Penalización leve (ajustada de 5)
    'Informativa': 2, // Penalización mínima (ajustada de 0)
  } as const,
  
  // Penalizaciones adicionales por tipo
  TYPE_MODIFIERS: {
    'Irregularidad': 1.0,           // Sin modificador (es lo más serio)
    'Mejora de Redacción': 0.7,     // 30% menos penalización
    'Sin hallazgos relevantes': 0.0, // Sin penalización
  } as const,
  
  // Bonificaciones por resolución
  RESOLUTION_BONUSES: {
    'applied': 1.0,    // Recupera el 100% de la penalización
    'modified': 0.8,   // Recupera el 80% si fue modificado por el usuario
    'discarded': 0.0,  // No recupera nada si se descarta
    'pending': 0.0,    // No recupera nada si está pendiente
  } as const,
  
  // Puntaje mínimo y máximo
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

/**
 * Calcula el puntaje de cumplimiento base (solo con hallazgos)
 */
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
  const validFindings = findings.filter(finding => 
    finding.tipo !== 'Sin hallazgos relevantes'
  );

  // Calcular penalizaciones
  validFindings.forEach(finding => {
    const basePenalty = SCORING_CONFIG.PENALTIES[finding.gravedad];
    const typeModifier = SCORING_CONFIG.TYPE_MODIFIERS[finding.tipo];
    const finalPenalty = Math.round(basePenalty * typeModifier);
    
    totalPenalty += finalPenalty;
    
    // Contar críticos
    if (finding.gravedad === 'Alta') {
      criticalFindings++;
    }
    
    // Breakdown por gravedad
    const key = finding.gravedad;
    if (!penaltiesByGravity[key]) {
      penaltiesByGravity[key] = { count: 0, penalty: 0 };
    }
    penaltiesByGravity[key].count++;
    penaltiesByGravity[key].penalty += finalPenalty;
  });

  // Calcular puntaje final
  const complianceScore = Math.max(
    SCORING_CONFIG.MIN_SCORE, 
    Math.min(SCORING_CONFIG.MAX_SCORE, SCORING_CONFIG.MAX_SCORE - totalPenalty)
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
    }
  };
}

/**
 * Calcula el puntaje considerando el estado de resolución de hallazgos
 */
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
    penaltiesByGravity: Record<string, { count: number; penalty: number; recovered: number }>;
  };
} {
  let totalPenalty = 0;
  let recoveredPoints = 0;
  const penaltiesByGravity: Record<string, { count: number; penalty: number; recovered: number }> = {};
  
  let criticalFindings = 0;
  let resolvedFindings = 0;
  
  // Filtrar hallazgos válidos
  const validFindings = findingsWithStatus.filter(finding => 
    finding.tipo !== 'Sin hallazgos relevantes'
  );

  validFindings.forEach(finding => {
    const basePenalty = SCORING_CONFIG.PENALTIES[finding.gravedad];
    const typeModifier = SCORING_CONFIG.TYPE_MODIFIERS[finding.tipo];
    const finalPenalty = Math.round(basePenalty * typeModifier);
    
    totalPenalty += finalPenalty;
    
    // Calcular puntos recuperados según el estado
    const resolutionBonus = SCORING_CONFIG.RESOLUTION_BONUSES[finding.status];
    const recoveredForThisFinding = Math.round(finalPenalty * resolutionBonus);
    recoveredPoints += recoveredForThisFinding;
    
    // Contar críticos y resueltos
    if (finding.gravedad === 'Alta') {
      criticalFindings++;
    }
    
    if (finding.status === 'applied' || finding.status === 'modified') {
      resolvedFindings++;
    }
    
    // Breakdown por gravedad
    const key = finding.gravedad;
    if (!penaltiesByGravity[key]) {
      penaltiesByGravity[key] = { count: 0, penalty: 0, recovered: 0 };
    }
    penaltiesByGravity[key].count++;
    penaltiesByGravity[key].penalty += finalPenalty;
    penaltiesByGravity[key].recovered += recoveredForThisFinding;
  });

  // Calcular puntaje final con puntos recuperados
  const netPenalty = totalPenalty - recoveredPoints;
  const complianceScore = Math.max(
    SCORING_CONFIG.MIN_SCORE, 
    Math.min(SCORING_CONFIG.MAX_SCORE, SCORING_CONFIG.MAX_SCORE - netPenalty)
  );
  
  const legalRiskScore = SCORING_CONFIG.MAX_SCORE - complianceScore;

  const percentageResolved = validFindings.length > 0 
    ? (resolvedFindings / validFindings.length) * 100 
    : 100;

  return {
    complianceScore,
    legalRiskScore,
    progress: {
      total: validFindings.length,
      resolved: resolvedFindings,
      pending: validFindings.length - resolvedFindings,
      percentageResolved: Math.round(percentageResolved),
    },
    breakdown: {
      totalFindings: validFindings.length,
      criticalFindings,
      totalPenalty,
      recoveredPoints,
      penaltiesByGravity,
    }
  };
}

/**
 * Obtiene la categoría de riesgo basada en el puntaje
 */
export function getRiskCategory(complianceScore: number): {
  category: keyof typeof SCORING_CONFIG.RISK_CATEGORIES;
  label: string;
  color: string;
  description: string;
} {
  for (const [key, config] of Object.entries(SCORING_CONFIG.RISK_CATEGORIES)) {
    if (complianceScore >= config.min && complianceScore <= config.max) {
      const descriptions = {
        VERY_LOW: 'El documento cumple excelentemente con la normativa',
        LOW: 'El documento tiene un buen nivel de cumplimiento',
        MEDIUM: 'El documento requiere algunas mejoras',
        HIGH: 'El documento tiene problemas significativos que requieren atención',
        VERY_HIGH: 'El documento tiene problemas críticos que requieren corrección inmediata',
      };
      
      return {
        category: key as keyof typeof SCORING_CONFIG.RISK_CATEGORIES,
        label: config.label,
        color: config.color,
        description: descriptions[key as keyof typeof descriptions],
      };
    }
  }
  
  // Fallback (no debería ocurrir)
  return {
    category: 'MEDIUM',
    label: 'Medio',
    color: 'yellow',
    description: 'Evaluación en progreso',
  };
}

/**
 * Simula el impacto de aplicar/descartar un hallazgo específico
 */
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
  
  const simulatedFindings = currentFindings.map(finding => 
    finding.id === findingId 
      ? { ...finding, status: newStatus }
      : finding
  );
  
  const newResult = calculateDynamicComplianceScore(simulatedFindings);
  
  const difference = newResult.complianceScore - currentResult.complianceScore;
  
  const impactDescriptions = {
    'applied': difference > 0 ? `+${difference} puntos al aplicar la corrección` : 'Sin cambio en el puntaje',
    'modified': difference > 0 ? `+${difference} puntos al aplicar la corrección modificada` : 'Sin cambio en el puntaje',
    'discarded': difference !== 0 ? `${difference} puntos al descartar (penalización permanece)` : 'Sin cambio en el puntaje',
    'pending': difference !== 0 ? `${difference} puntos al marcar como pendiente` : 'Sin cambio en el puntaje',
  };
  
  return {
    currentScore: currentResult.complianceScore,
    newScore: newResult.complianceScore,
    difference,
    impactDescription: impactDescriptions[newStatus],
  };
}

/**
 * Genera un reporte detallado del scoring
 */
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
  
  // Agrupar hallazgos por gravedad
  const findingsByGravity = findingsWithStatus.reduce((acc, finding) => {
    if (!acc[finding.gravedad]) acc[finding.gravedad] = [];
    acc[finding.gravedad].push(finding);
    return acc;
  }, {} as Record<string, FindingWithStatus[]>);
  
  // Generar recomendaciones
  const recommendations: string[] = [];
  
  if (result.breakdown.criticalFindings > 0) {
    recommendations.push(`Atender urgentemente ${result.breakdown.criticalFindings} hallazgo(s) crítico(s)`);
  }
  
  if (result.progress.percentageResolved < 50) {
    recommendations.push('Priorizar la resolución de más hallazgos para mejorar el puntaje');
  }
  
  if (result.complianceScore < 60) {
    recommendations.push('Considerar revisión legal especializada debido al alto riesgo');
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
    }
  };
}