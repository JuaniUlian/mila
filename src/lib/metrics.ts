/**
 * Sistema de métricas para tracking de uso de MILA
 * Por ahora usa localStorage, migrar a BD cuando escale
 */

export interface UserMetrics {
  userId: string;
  analysisCount: number;
  findingsDetected: number;
  findingsApplied: number;
  findingsDiscarded: number;
  findingsModified: number;
  discussionsStarted: number;
  discussionsWon: number;
  discussionsLost: number;
  pdfDownloads: number;
  sessionTime: number; // minutos totales
  activeSessionTime: number; // minutos activos
  apiCost: number; // USD gastados en APIs
  userUpvotes: number; // hallazgos confirmados por usuario
  userDownvotes: number; // hallazgos marcados como incorrectos
  lastAnalysisDate: string;
  createdAt: string;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  isActive: boolean;
}

const METRICS_STORAGE_KEY = 'mila-user-metrics';
const SESSION_STORAGE_KEY = 'mila-current-session';
const INACTIVITY_THRESHOLD = 3 * 60 * 1000; // 3 minutos sin actividad

/**
 * Inicializa o recupera métricas del usuario
 */
export function getUserMetrics(): UserMetrics {
  if (typeof window === 'undefined') return getDefaultMetrics();

  const stored = localStorage.getItem(METRICS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing metrics:', error);
      return getDefaultMetrics();
    }
  }
  return getDefaultMetrics();
}

/**
 * Métricas por defecto para nuevo usuario
 */
function getDefaultMetrics(): UserMetrics {
  return {
    userId: `user-${Date.now()}`,
    analysisCount: 0,
    findingsDetected: 0,
    findingsApplied: 0,
    findingsDiscarded: 0,
    findingsModified: 0,
    discussionsStarted: 0,
    discussionsWon: 0,
    discussionsLost: 0,
    pdfDownloads: 0,
    sessionTime: 0,
    activeSessionTime: 0,
    apiCost: 0,
    userUpvotes: 0,
    userDownvotes: 0,
    lastAnalysisDate: '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Guarda métricas actualizadas
 */
export function saveUserMetrics(metrics: Partial<UserMetrics>): void {
  if (typeof window === 'undefined') return;

  const current = getUserMetrics();
  const updated = { ...current, ...metrics };
  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Incrementa un contador específico
 */
export function incrementMetric(
  metric: keyof Pick<
    UserMetrics,
    | 'analysisCount'
    | 'findingsDetected'
    | 'findingsApplied'
    | 'findingsDiscarded'
    | 'findingsModified'
    | 'discussionsStarted'
    | 'discussionsWon'
    | 'discussionsLost'
    | 'pdfDownloads'
    | 'userUpvotes'
    | 'userDownvotes'
  >,
  amount: number = 1
): void {
  const metrics = getUserMetrics();
  metrics[metric] += amount;
  saveUserMetrics(metrics);
}

/**
 * Registra el costo de una llamada API
 */
export function trackApiCost(cost: number): void {
  const metrics = getUserMetrics();
  metrics.apiCost += cost;
  saveUserMetrics(metrics);
}

/**
 * Calcula la tasa de precisión basada en feedback del usuario
 */
export function getAccuracyRate(): number {
  const metrics = getUserMetrics();
  const total = metrics.userUpvotes + metrics.userDownvotes;
  if (total === 0) return 0;
  return Math.round((metrics.userUpvotes / total) * 100);
}

/**
 * Calcula tiempo ahorrado vs auditoría manual
 * Asumimos 1h auditoría manual vs 5min con MILA
 */
export function getTimeSaved(): number {
  const metrics = getUserMetrics();
  const manualTimePerDoc = 60; // minutos
  const milaTimePerDoc = 5; // minutos
  const timeSaved = metrics.analysisCount * (manualTimePerDoc - milaTimePerDoc);
  return Math.round(timeSaved / 60); // devolver en horas
}

/**
 * Inicia o reanuda una sesión
 */
export function startSession(): SessionMetrics {
  if (typeof window === 'undefined') {
    return {
      sessionId: '',
      startTime: 0,
      lastActivity: 0,
      isActive: false,
    };
  }

  const sessionId = `session-${Date.now()}`;
  const now = Date.now();

  const session: SessionMetrics = {
    sessionId,
    startTime: now,
    lastActivity: now,
    isActive: true,
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Actualiza actividad de sesión
 */
export function updateSessionActivity(): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) {
    startSession();
    return;
  }

  try {
    const session: SessionMetrics = JSON.parse(stored);
    session.lastActivity = Date.now();
    session.isActive = true;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

/**
 * Finaliza sesión y guarda tiempo total
 */
export function endSession(): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return;

  try {
    const session: SessionMetrics = JSON.parse(stored);
    const totalTime = Math.round((Date.now() - session.startTime) / 60000); // minutos

    const metrics = getUserMetrics();
    metrics.sessionTime += totalTime;
    saveUserMetrics(metrics);

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

/**
 * Hook de React para tracking automático
 */
export function useMetricsTracking() {
  if (typeof window === 'undefined') return;

  // Iniciar sesión al montar
  React.useEffect(() => {
    startSession();

    // Actualizar actividad en interacciones
    const handleActivity = () => updateSessionActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    // Finalizar sesión al desmontar
    return () => {
      endSession();
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);
}

// React import para el hook
import React from 'react';
