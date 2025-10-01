/**
 * Sistema de Pricing y Tiers para MILA
 * Define los planes disponibles y sus límites
 */

export type TierType = 'free' | 'professional' | 'government' | 'enterprise';

export interface TierFeatures {
  name: string;
  displayName: string;
  price: number; // USD/mes
  currency: string;
  analysisLimit: number; // -1 = ilimitado
  maxPageLimit: number; // -1 = ilimitado
  maxRegulations: number; // -1 = ilimitado
  features: string[];
  limitations: string[];
  seats: number; // -1 = ilimitado
  support: string;
  sla?: string;
  apiAccess: boolean;
  branded: boolean;
  historyMonths: number;
  priority: number; // orden de visualización
  popular?: boolean;
  cta: string;
}

export const PRICING_TIERS: Record<TierType, TierFeatures> = {
  free: {
    name: 'free',
    displayName: 'Gratuito',
    price: 0,
    currency: 'USD',
    analysisLimit: 3,
    maxPageLimit: 50,
    maxRegulations: 2,
    seats: 1,
    support: 'Comunidad',
    apiAccess: false,
    branded: false,
    historyMonths: 1,
    priority: 1,
    cta: 'Empezar Gratis',
    features: [
      '3 análisis por mes',
      'Hasta 50 páginas por documento',
      'Máximo 2 normativas simultáneas',
      'Reporte PDF básico',
      'Historial de 1 mes',
      'Soporte por comunidad',
    ],
    limitations: [
      'Marca de agua en reportes',
      'Sin acceso API',
      'Sin multi-usuario',
    ],
  },
  professional: {
    name: 'professional',
    displayName: 'Profesional',
    price: 299,
    currency: 'USD',
    analysisLimit: 50,
    maxPageLimit: -1,
    maxRegulations: 10,
    seats: 1,
    support: 'Email 48h',
    apiAccess: false,
    branded: true,
    historyMonths: 6,
    priority: 2,
    popular: true,
    cta: 'Empezar Prueba',
    features: [
      '50 análisis por mes ($5.98/análisis)',
      'Documentos ilimitados en tamaño',
      'Hasta 10 normativas simultáneas',
      'Reportes PDF branded',
      'Historial de 6 meses',
      'Soporte email prioritario (48h)',
      'Dashboard de métricas avanzado',
      'Exportación de datos',
    ],
    limitations: [
      'Usuario único',
      'Sin API access',
    ],
  },
  government: {
    name: 'government',
    displayName: 'Gobierno',
    price: 899,
    currency: 'USD',
    analysisLimit: -1,
    maxPageLimit: -1,
    maxRegulations: -1,
    seats: 5,
    support: 'Prioritario 4h',
    sla: '99.5%',
    apiAccess: true,
    branded: true,
    historyMonths: 24,
    priority: 3,
    cta: 'Agendar Demo',
    features: [
      'Análisis ilimitados',
      'Documentos y normativas ilimitadas',
      'Multi-usuario (5 asientos incluidos)',
      'API REST completa',
      'Reportes branded avanzados',
      'Historial completo (2 años)',
      'Soporte prioritario 4h',
      'SLA 99.5%',
      'Auditoría trimestral de compliance',
      'Hosting on-premise opcional',
      'Capacitación del equipo',
    ],
    limitations: [],
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: -1, // Custom
    currency: 'USD',
    analysisLimit: -1,
    maxPageLimit: -1,
    maxRegulations: -1,
    seats: -1,
    support: '24/7',
    sla: '99.9%',
    apiAccess: true,
    branded: true,
    historyMonths: -1,
    priority: 4,
    cta: 'Contactar Ventas',
    features: [
      'Todo lo de Gobierno, más:',
      'White-label completo',
      'Fine-tuning con normativa interna',
      'Integración con sistemas existentes',
      'Infraestructura dedicada',
      'Soporte 24/7',
      'SLA 99.9%',
      'CSM dedicado',
      'Usuarios ilimitados',
      'Historial perpetuo',
    ],
    limitations: [],
  },
};

/**
 * Calcula el ahorro mensual estimado vs auditoría manual
 */
export function calculateROI(documentsPerMonth: number, tierType: TierType): {
  manualCost: number;
  milaCost: number;
  savings: number;
  savingsPercent: number;
  timesSaved: number;
} {
  const MANUAL_COST_PER_DOC = 120; // USD promedio auditoría manual en LATAM
  const tier = PRICING_TIERS[tierType];

  const manualCost = documentsPerMonth * MANUAL_COST_PER_DOC;
  const milaCost = tier.price === -1 ? 0 : tier.price;
  const savings = manualCost - milaCost;
  const savingsPercent = manualCost > 0 ? Math.round((savings / manualCost) * 100) : 0;
  const timesSaved = Math.round((15 * documentsPerMonth) / 60); // 15min vs 1h manual

  return {
    manualCost,
    milaCost,
    savings,
    savingsPercent,
    timesSaved,
  };
}

/**
 * Determina si un usuario puede realizar una acción según su tier
 */
export function canPerformAction(
  tierType: TierType,
  action: 'analyze' | 'api' | 'multiuser',
  currentUsage?: {
    analysisCount?: number;
    pageCount?: number;
    regulationCount?: number;
  }
): { allowed: boolean; reason?: string; upgradeToTier?: TierType } {
  const tier = PRICING_TIERS[tierType];

  switch (action) {
    case 'analyze':
      if (tier.analysisLimit === -1) return { allowed: true };
      if ((currentUsage?.analysisCount ?? 0) >= tier.analysisLimit) {
        return {
          allowed: false,
          reason: `Has alcanzado tu límite de ${tier.analysisLimit} análisis este mes`,
          upgradeToTier: tierType === 'free' ? 'professional' : 'government',
        };
      }
      return { allowed: true };

    case 'api':
      if (!tier.apiAccess) {
        return {
          allowed: false,
          reason: 'El acceso API no está disponible en tu plan',
          upgradeToTier: 'government',
        };
      }
      return { allowed: true };

    case 'multiuser':
      if (tier.seats === 1) {
        return {
          allowed: false,
          reason: 'Tu plan no incluye multi-usuario',
          upgradeToTier: 'government',
        };
      }
      return { allowed: true };

    default:
      return { allowed: false };
  }
}

/**
 * Obtiene el siguiente tier recomendado para upgrade
 */
export function getRecommendedUpgrade(currentTier: TierType): TierFeatures | null {
  const tierOrder: TierType[] = ['free', 'professional', 'government', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }

  return PRICING_TIERS[tierOrder[currentIndex + 1]];
}
