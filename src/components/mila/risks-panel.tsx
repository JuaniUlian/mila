
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, BookCheck, FileOutput, Check, FileClock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { 
  type FindingWithStatus
} from '@/ai/flows/compliance-scoring';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RisksPanelProps {
  findings: FindingWithStatus[];
  documentName: string;
  currentScoring: {
    complianceScore: number;
    legalRiskScore: number;
    riskCategory: {
        category: string;
        label: string;
        color: string;
        description:string;
    };
    progress: {
      total: number;
      resolved: number;
      pending: number;
      percentageResolved: number;
    };
    breakdown: any;
  };
  onDownloadReport: (type: 'current' | 'original' | 'audit') => void;
}

const SEVERITY_TEXT_COLOR: Record<string, string> = {
  'Alta': 'text-red-600',
  'Media': 'text-amber-600',
  'Baja': 'text-sky-600',
  'Informativa': 'text-gray-600',
};

const SEVERITY_DOT_COLOR: Record<string, string> = {
  'Alta': 'bg-red-500',
  'Media': 'bg-amber-500',
  'Baja': 'bg-sky-500',
  'Informativa': 'bg-gray-400',
};

export function RisksPanel({ 
  findings, 
  documentName,
  currentScoring,
  onDownloadReport
}: RisksPanelProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const hasResolvedFindings = findings.some(f => f.status === 'applied' || f.status === 'modified');
  
  return (
    <div className="bg-white/60 backdrop-blur-xl border-white/50 shadow-xl rounded-2xl p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Resultados Parciales
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Resumen del análisis en tiempo real.</p>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Cumplimiento General</span>
          <span className="font-bold text-lg text-primary">{currentScoring.complianceScore}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">Incidencias Pendientes</span>
          <span className="font-bold text-lg text-primary">{currentScoring.progress.pending}</span>
        </div>

        {Object.entries(currentScoring.breakdown.penaltiesByGravity).filter(([gravity, data]: [string, any]) => data.count > 0).map(([gravity, data]: [string, any]) => (
           <div key={gravity} className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <span className={cn("h-2.5 w-2.5 rounded-full", SEVERITY_DOT_COLOR[gravity])}></span>
               <span className="text-foreground">Gravedad {gravity}</span>
             </div>
             <span className={cn("font-semibold", SEVERITY_TEXT_COLOR[gravity])}>{data.count}</span>
           </div>
        ))}

        <div className="border-t pt-4 mt-4 !space-y-4">
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600"/>
                <span className="font-medium text-foreground">Acciones Realizadas</span>
              </div>
              <span className="font-bold text-lg text-green-600">{currentScoring.progress.resolved}</span>
          </div>
          <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookCheck className="h-4 w-4 text-muted-foreground"/>
                <span className="font-medium text-foreground">Normativas Involucradas</span>
              </div>
              <span className="font-bold text-lg text-muted-foreground">
                {new Set(findings.map(f => f.nombre_archivo_normativa)).size}
              </span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 space-y-3">
          <Button 
              className="w-full text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={() => onDownloadReport('current')}
          >
              <Download className="mr-2 h-5 w-5" />
              Descargar Informe de Progreso
          </Button>
          
           {hasResolvedFindings && (
            <Button 
                className="w-full text-base py-6 btn-neu-light"
                size="lg"
                onClick={() => onDownloadReport('audit')}
            >
                <FileOutput className="mr-2 h-5 w-5" />
                Descargar Informe de Auditoría
            </Button>
          )}

           <Button 
              variant="outline"
              className="w-full text-base py-6 btn-neu-light"
              size="lg"
              onClick={() => onDownloadReport('original')}
          >
              <FileClock className="mr-2 h-5 w-5" />
              Descargar Informe Original (IA)
          </Button>


          <p className="text-xs text-muted-foreground text-center mt-2 px-4">{t('analysisPage.downloadReportDesc')}</p>
      </div>
    </div>
  );
}
