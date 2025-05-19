
"use client";
import type React from 'react';
import type { DocumentBlock, AlertItem, ApplicableNorm, MissingConnection } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link2Off, ShieldAlert, BookOpen, TrendingUp, Info, FileCheck2, ListChecks, BarChart3, AlertTriangle } from 'lucide-react';
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SeverityIndicator } from './severity-indicator';
import { cn } from '@/lib/utils';


interface RisksPanelProps {
  selectedBlockDetail: DocumentBlock | null;
  overallComplianceScore: number;
  overallCompletenessIndex: number; 
}

const getRiskColorClasses = (riskPercentage: number, type: 'text' | 'bg' | 'border' = 'text'): string => {
  if (riskPercentage < 25) {
    if (type === 'text') return 'text-green-600 dark:text-green-400';
    if (type === 'bg') return 'bg-green-500 dark:bg-green-600';
    if (type === 'border') return 'border-green-500 dark:border-green-600';
  }
  if (riskPercentage <= 50) {
    if (type === 'text') return 'text-custom-warning-yellow-DEFAULT dark:text-yellow-400';
    if (type === 'bg') return 'bg-custom-warning-yellow-DEFAULT dark:bg-yellow-500';
    if (type === 'border') return 'border-custom-warning-yellow-DEFAULT dark:border-yellow-500';
  }
  if (type === 'text') return 'text-destructive dark:text-red-400';
  if (type === 'bg') return 'bg-destructive dark:bg-red-600';
  return 'border-destructive dark:border-red-600'; // border
};


export function RisksPanel({
  selectedBlockDetail,
  overallComplianceScore,
  overallCompletenessIndex,
}: RisksPanelProps) {
  const { toast } = useToast();

  const handleExportPDF = (blockName?: string) => {
    toast({
      title: "Exportación PDF (Simulada)",
      description: blockName
        ? `La exportación del bloque "${blockName}" se iniciaría pronto.`
        : "La exportación del reporte completo se iniciaría pronto.",
    });
  };

  const defaultAccordionValues: string[] = [];
  
  const overallRiskPercentage = Math.max(0, Math.min(100, (10 - overallCompletenessIndex) * 10));
  const overallRiskTextColor = getRiskColorClasses(overallRiskPercentage);
  const overallRiskBgColor = getRiskColorClasses(overallRiskPercentage, 'bg');

  return (
    <div className="p-1 md:p-2 h-full">
      <Card className="glass-card rounded-xl mt-0 transition-all duration-200 ease-in-out hover:shadow-2xl border">
        <CardHeader className="p-4">
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart3 className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg font-semibold text-foreground">Resumen General del Documento</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">Puntajes globales de cumplimiento y riesgo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 pb-4 px-4 glass-card-content">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp size={14} /> Cumplimiento Normativo
              </span>
              <span className="text-sm font-semibold text-accent">{overallComplianceScore.toFixed(0)}%</span>
            </div>
             <ProgressPrimitive.Root 
                value={overallComplianceScore}
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/70 transition-all duration-300"
              >
                <ProgressPrimitive.Indicator
                  className={cn("h-full w-full flex-1 bg-accent transition-all")}
                  style={{ transform: `translateX(-${100 - (overallComplianceScore || 0)}%)` }}
                />
              </ProgressPrimitive.Root>
          </div>
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                 <ShieldAlert size={14} className={overallRiskTextColor} /> Indice de Riesgo
              </span>
              <span className={cn("text-sm font-semibold", overallRiskTextColor)}>{overallRiskPercentage.toFixed(0)}%</span>
            </div>
            <ProgressPrimitive.Root
              value={overallRiskPercentage}
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/70 transition-all duration-300"
            >
              <ProgressPrimitive.Indicator
                className={cn("h-full w-full flex-1 transition-all", overallRiskBgColor)}
                style={{ transform: `translateX(-${100 - (overallRiskPercentage || 0)}%)` }}
              />
            </ProgressPrimitive.Root>
          </div>
           <Button className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground text-xs py-1.5 h-8 transition-colors duration-150" size="sm" onClick={() => handleExportPDF()}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar Informe (PDF)
          </Button>
        </CardContent>
      </Card>

      {selectedBlockDetail ? (
        <Card className="glass-card mt-4 rounded-xl transition-all duration-200 ease-in-out hover:shadow-2xl border">
          <CardHeader className="p-4">
            <div className="flex items-center gap-2 mb-0.5">
              <Info className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-semibold text-foreground">
                Información Adicional del Bloque
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Contexto y riesgos para: <span className="font-medium text-accent">{selectedBlockDetail.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 pb-4 px-4 space-y-1.5 glass-card-content">
            <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-1.5">
              {selectedBlockDetail.alerts && selectedBlockDetail.alerts.length > 0 && (
                <AccordionItem value="block-alerts" className="glass-accordion-item">
                  <AccordionTrigger className="p-2.5 text-xs hover:no-underline data-[state=open]:bg-white/20 dark:data-[state=open]:bg-slate-700/30 data-[state=open]:border-b data-[state=open]:border-white/20 dark:data-[state=open]:border-slate-700/40 text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group glass-accordion-trigger">
                      <div className="flex items-center gap-1.5 w-full">
                          <ShieldAlert size={15} className="text-accent group-hover:text-accent/80 transition-colors" />
                          <span className="flex-1">Alertas Generales del Bloque ({selectedBlockDetail.alerts.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-3 text-xs data-[state=open]:bg-transparent glass-accordion-content">
                       <ul className="space-y-2.5">
                          {selectedBlockDetail.alerts.map((alert: AlertItem) => (
                            <li
                              key={alert.id}
                              className={cn(
                                "p-2.5 border-l-4 rounded-r-md flex items-start gap-2 text-sm shadow-sm bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm transition-all duration-150 ease-in-out",
                                alert.severity === 'grave' && getRiskColorClasses(100, 'border'),
                                alert.severity === 'media' && getRiskColorClasses(50, 'border'),
                                alert.severity === 'leve' && getRiskColorClasses(10, 'border'),
                              )}
                            >
                              <SeverityIndicator level={alert.severity} size={5} className={cn(
                                  "mt-0.5 flex-shrink-0",
                                  alert.severity === 'grave' && getRiskColorClasses(100, 'text'),
                                  alert.severity === 'media' && getRiskColorClasses(50, 'text'),
                                  alert.severity === 'leve' && getRiskColorClasses(10, 'text'),
                              )}/>
                              <span className={cn(
                                'text-foreground/90'
                              )}>{alert.description}</span>
                            </li>
                          ))}
                        </ul>
                    </AccordionContent>
                  </AccordionItem>
              )}

              {selectedBlockDetail.missingConnections && selectedBlockDetail.missingConnections.length > 0 && (
                <AccordionItem value="connections" className="glass-accordion-item">
                  <AccordionTrigger className="p-2.5 text-xs hover:no-underline data-[state=open]:bg-white/20 dark:data-[state=open]:bg-slate-700/30 data-[state=open]:border-b data-[state=open]:border-white/20 dark:data-[state=open]:border-slate-700/40 text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group glass-accordion-trigger">
                      <div className="flex items-center gap-1.5 w-full">
                          <Link2Off size={15} className="text-accent group-hover:text-accent/80 transition-colors" />
                          <span className="flex-1">Conexiones Normativas Faltantes ({selectedBlockDetail.missingConnections.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-3 text-xs data-[state=open]:bg-transparent glass-accordion-content">
                      <ul className="space-y-1.5">
                          {selectedBlockDetail.missingConnections.map((conn: MissingConnection) => (
                            <li key={conn.id} className="text-[0.7rem] p-2 border-l-2 border-accent bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm rounded-r-md text-foreground/90 transition-shadow duration-150 hover:shadow-sm">
                              {conn.description}
                            </li>
                          ))}
                        </ul>
                    </AccordionContent>
                  </AccordionItem>
              )}

              {selectedBlockDetail.legalRisk && (
                <AccordionItem value="legal-risk" className="glass-accordion-item">
                  <AccordionTrigger className="p-2.5 text-xs hover:no-underline data-[state=open]:bg-white/20 dark:data-[state=open]:bg-slate-700/30 data-[state=open]:border-b data-[state=open]:border-white/20 dark:data-[state=open]:border-slate-700/40 text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group glass-accordion-trigger">
                      <div className="flex items-center gap-1.5 w-full">
                        <AlertTriangle size={15} className="text-accent group-hover:text-accent/80 transition-colors" />
                        <span className="flex-1">Riesgo Jurídico Identificado</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-3 text-xs data-[state=open]:bg-transparent glass-accordion-content">
                      <p className="text-[0.7rem] text-foreground/90 leading-relaxed">
                        {selectedBlockDetail.legalRisk}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
              )}

              {selectedBlockDetail.applicableNorms && selectedBlockDetail.applicableNorms.length > 0 && (
                <AccordionItem value="norms" className="glass-accordion-item">
                  <AccordionTrigger className="p-2.5 text-xs hover:no-underline data-[state=open]:bg-white/20 dark:data-[state=open]:bg-slate-700/30 data-[state=open]:border-b data-[state=open]:border-white/20 dark:data-[state=open]:border-slate-700/40 text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group glass-accordion-trigger">
                      <div className="flex items-center gap-1.5 w-full">
                        <BookOpen size={15} className="text-accent group-hover:text-accent/80 transition-colors" />
                        <span className="flex-1">Normativa Aplicable Directa ({selectedBlockDetail.applicableNorms.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-3 text-xs data-[state=open]:bg-transparent glass-accordion-content">
                      <ul className="space-y-1.5">
                        {selectedBlockDetail.applicableNorms.map((norm: ApplicableNorm) => (
                          <li key={norm.id} className="text-[0.7rem] p-2 border rounded-md bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm transition-shadow duration-150 hover:shadow-sm">
                            <strong className="text-technical-norm-blue">{norm.name}</strong> - <span className="text-muted-foreground">{norm.article}</span>
                            {norm.details && <p className="text-xs text-muted-foreground mt-0.5">{norm.details}</p>}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
              )}
            </Accordion>

            {(selectedBlockDetail.alerts?.length === 0 && selectedBlockDetail.missingConnections?.length === 0 && !selectedBlockDetail.legalRisk && selectedBlockDetail.applicableNorms?.length === 0) && (
                 <p className="text-xs text-muted-foreground p-3 border border-white/20 dark:border-slate-700/40 rounded-lg bg-white/10 dark:bg-slate-700/20 backdrop-blur-sm mt-2">
                    No hay información adicional (alertas, conexiones, riesgos o normativas directas) para este bloque.
                </p>
            )}

            <div className="pt-3">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs py-1.5 h-8 transition-colors duration-150" size="sm" onClick={() => handleExportPDF(selectedBlockDetail.name)}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Exportar Bloque Corregido (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card rounded-xl mt-4 flex flex-col items-center justify-center p-6 min-h-[200px] transition-all duration-200 ease-in-out border">
          <ListChecks size={32} className="text-muted-foreground/70 mb-3" />
          <CardTitle className="text-base text-center font-semibold text-foreground mb-1">Información Detallada del Bloque</CardTitle>
          <CardDescription className="text-xs text-center text-muted-foreground max-w-xs">
            Seleccione un bloque de la navegación izquierda para ver sus detalles, alertas, y sugerencias específicas aquí.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}

    