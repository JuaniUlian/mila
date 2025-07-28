
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileCheck2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { 
  generateScoringReport, 
  getRiskCategory,
  type FindingWithStatus 
} from '@/ai/flows/compliance-scoring';

interface RisksPanelProps {
  findings: FindingWithStatus[];
  documentName: string;
  currentScoring: {
    complianceScore: number;
    legalRiskScore: number;
    riskCategory: ReturnType<typeof getRiskCategory>;
    progress: {
      total: number;
      resolved: number;
      pending: number;
      percentageResolved: number;
    };
    breakdown: any;
  };
  onDownloadReport: () => void;
  appliedChangesExist: boolean;
  onDownloadCorrectedDocument: () => void;
}

export function RisksPanel({ 
  findings, 
  documentName, 
  currentScoring,
  onDownloadReport,
  appliedChangesExist,
  onDownloadCorrectedDocument
}: RisksPanelProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const report = generateScoringReport(findings);
  
  // Análisis de riesgos específicos
  const criticalFindings = findings.filter(f => f.gravedad === 'Alta' && f.status === 'pending');
  const legalFindings = findings.filter(f => f.tipo === 'Irregularidad');
  const unresolvedFindings = findings.filter(f => f.status === 'pending');

  // Riesgos específicos identificados
  const identifiedRisks = [
    ...criticalFindings.map(f => ({
      type: 'critical',
      title: f.titulo_incidencia,
      description: f.consecuencia_estimada,
      severity: 'Alta' as const,
      article: f.articulo_o_seccion,
      normative: f.nombre_archivo_normativa
    })),
    ...legalFindings.filter(f => f.status === 'pending' && f.gravedad !== 'Alta').map(f => ({
      type: 'legal',
      title: f.titulo_incidencia,
      description: f.consecuencia_estimada,
      severity: f.gravedad as 'Media' | 'Baja',
      article: f.articulo_o_seccion,
      normative: f.nombre_archivo_normativa
    }))
  ];

  const RiskCategoryBadge = () => {
    const { riskCategory } = currentScoring;
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      lime: 'bg-lime-100 text-lime-800 border-lime-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[riskCategory.color as keyof typeof colorClasses] || colorClasses.yellow}`}>
        <span className="mr-2">
          {riskCategory.color === 'green' ? '🟢' :
           riskCategory.color === 'lime' ? '🟡' :
           riskCategory.color === 'yellow' ? '🟡' :
           riskCategory.color === 'orange' ? '🟠' : '🔴'}
        </span>
        Riesgo {riskCategory.label}
      </div>
    );
  };

  const ProgressBar = ({ current, total, label }: { current: number; total: number; label: string }) => {
    const percentage = total > 0 ? (current / total) * 100 : 100;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>{label}</span>
          <span>{current}/{total} ({Math.round(percentage)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border-white/50 shadow-xl rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📊 Panel de Riesgos
        </h2>
        <RiskCategoryBadge />
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {currentScoring.complianceScore}%
          </div>
          <div className="text-sm text-blue-800">Cumplimiento</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {criticalFindings.length}
          </div>
          <div className="text-sm text-red-800">Críticos Pendientes</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {currentScoring.progress.resolved}
          </div>
          <div className="text-sm text-green-800">Resueltos</div>
        </div>
      </div>

      <div className="flex-grow space-y-3 text-sm overflow-y-auto">
        <ProgressBar 
            current={currentScoring.progress.resolved} 
            total={currentScoring.progress.total}
            label="Hallazgos Totales"
          />
        {report.details.recommendations.map((recommendation, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <span className="text-blue-500 mt-1">•</span>
            <span className="text-gray-700">{recommendation}</span>
          </div>
        ))}
        {criticalFindings.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-red-500 mt-1">⚠️</span>
            <span className="text-gray-700">
              Priorizar la resolución de {criticalFindings.length} hallazgo(s) crítico(s) para reducir riesgo legal
            </span>
          </div>
        )}
      </div>

      <div className="flex-col items-stretch pt-6 space-y-3 mt-auto">
          <Button 
              className="w-full text-base py-6 btn-neu-light"
              size="lg"
              onClick={onDownloadReport}
          >
              <Download className="mr-2 h-5 w-5" />
              {t('analysisPage.downloadReport')}
          </Button>
          {appliedChangesExist && (
              <Button 
                  className="w-full text-base py-6 btn-neu-green"
                  size="lg"
                  onClick={onDownloadCorrectedDocument}
              >
                  <FileCheck2 className="mr-2 h-5 w-5" />
                  {t('analysisPage.downloadCorrectedDoc')}
              </Button>
          )}
          <p className="text-xs text-muted-foreground text-center mt-2">{t('analysisPage.downloadReportDesc')}</p>
      </div>
    </div>
  );
}
