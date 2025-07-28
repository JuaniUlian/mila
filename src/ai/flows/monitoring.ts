/**
 * Sistema de monitoreo para la migración en producción
 * Integrable con tu sistema de logs existente
 */

interface ProcessingMetrics {
  timestamp: Date;
  fileName?: string;
  fileSize: number;
  method: 'original' | 'chunking' | 'claude_fallback';
  success: boolean;
  processingTimeMs: number;
  chunksUsed?: number;
  errorMessage?: string;
  userAgent?: string;
}

class ProductionMonitor {
  private static instance: ProductionMonitor;
  private metrics: ProcessingMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Límite en memoria

  static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }

  /**
   * Registra una operación de procesamiento
   */
  logProcessing(metrics: ProcessingMetrics) {
    this.metrics.push(metrics);
    
    // Mantener solo las métricas más recientes
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log inmediato para errores críticos
    if (!metrics.success) {
      console.error('🚨 PROCESSING_ERROR', {
        method: metrics.method,
        fileSize: Math.round(metrics.fileSize / 1024 / 1024 * 100) / 100,
        error: metrics.errorMessage,
        timestamp: metrics.timestamp.toISOString()
      });

      // Alertar si es necesario
      if (process.env.ALERT_ON_FAILURES === 'true') {
        this.sendAlert(metrics);
      }
    }

    // Log de éxito para análisis
    if (process.env.LOG_PROCESSING_STATS === 'true') {
      console.log('📊 PROCESSING_SUCCESS', {
        method: metrics.method,
        fileSize: Math.round(metrics.fileSize / 1024 / 1024 * 100) / 100,
        timeMs: metrics.processingTimeMs,
        chunksUsed: metrics.chunksUsed,
      });
    }
  }

  /**
   * Obtiene estadísticas de rendimiento
   */
  getStats(lastHours: number = 24) {
    const cutoff = new Date(Date.now() - lastHours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return null;
    }

    const successful = recentMetrics.filter(m => m.success);
    const failed = recentMetrics.filter(m => !m.success);

    const methodStats = recentMetrics.reduce((acc, m) => {
      acc[m.method] = (acc[m.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgProcessingTime = successful.length > 0 
      ? successful.reduce((sum, m) => sum + m.processingTimeMs, 0) / successful.length 
      : 0;

    return {
      total: recentMetrics.length,
      successful: successful.length,
      failed: failed.length,
      successRate: recentMetrics.length > 0 ? successful.length / recentMetrics.length : 0,
      avgProcessingTimeMs: Math.round(avgProcessingTime),
      methodBreakdown: methodStats,
      lastHours,
    };
  }

  /**
   * Verifica si el sistema está funcionando correctamente
   */
  healthCheck(): { healthy: boolean; issues: string[] } {
    const stats = this.getStats(1); // Última hora
    const issues: string[] = [];

    if (!stats) {
      return { healthy: true, issues: [] }; // Sin datos = sin problemas aún
    }

    // Verificar tasa de éxito
    if (stats.successRate < 0.8) {
      issues.push(`Tasa de éxito baja: ${Math.round(stats.successRate * 100)}%`);
    }

    // Verificar tiempo de procesamiento
    if (stats.avgProcessingTimeMs > 300000) { // 5 minutos
      issues.push(`Tiempo de procesamiento alto: ${Math.round(stats.avgProcessingTimeMs / 1000)}s`);
    }

    // Verificar si hay muchos fallos recientes
    if (stats.failed > 10) {
      issues.push(`Muchos fallos recientes: ${stats.failed}`);
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Envía alertas críticas (integrar con tu sistema de alertas)
   */
  private async sendAlert(metrics: ProcessingMetrics) {
    // TODO: Integrar con tu sistema de alertas (Slack, email, etc.)
    console.error('🚨 ALERT_REQUIRED', {
      message: 'Document processing failed',
      method: metrics.method,
      fileSize: metrics.fileSize,
      error: metrics.errorMessage,
      timestamp: metrics.timestamp.toISOString(),
    });

    // Ejemplo de integración con webhook
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Document processing failed: ${metrics.errorMessage}`,
            details: {
              method: metrics.method,
              fileSize: `${Math.round(metrics.fileSize / 1024 / 1024)}MB`,
              timestamp: metrics.timestamp.toISOString(),
            }
          })
        });
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    }
  }
}

// Funciones de conveniencia para usar en el código principal
export const monitor = ProductionMonitor.getInstance();

export function logSuccess(
  method: 'original' | 'chunking' | 'claude_fallback',
  fileSize: number,
  processingTimeMs: number,
  options: { fileName?: string; chunksUsed?: number } = {}
) {
  monitor.logProcessing({
    timestamp: new Date(),
    fileName: options.fileName,
    fileSize,
    method,
    success: true,
    processingTimeMs,
    chunksUsed: options.chunksUsed,
  });
}

export function logError(
  method: 'original' | 'chunking' | 'claude_fallback',
  fileSize: number,
  processingTimeMs: number,
  error: string,
  options: { fileName?: string } = {}
) {
  monitor.logProcessing({
    timestamp: new Date(),
    fileName: options.fileName,
    fileSize,
    method,
    success: false,
    processingTimeMs,
    errorMessage: error,
  });
}

// API endpoint para dashboard de monitoreo
export async function getMonitoringData() {
  const stats24h = monitor.getStats(24);
  const stats1h = monitor.getStats(1);
  const health = monitor.healthCheck();

  return {
    health,
    stats: {
      last24Hours: stats24h,
      lastHour: stats1