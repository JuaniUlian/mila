
"use client";
import type React from 'react';
import type { DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link2Off, ShieldAlert, BookOpen, TrendingUp, Gauge, Info, FileCheck2, ListChecks, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RisksPanelProps {
  selectedBlockDetail: DocumentBlock | null;
  overallComplianceScore: number;
  overallCompletenessIndex: number;
}

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

  const defaultAccordionValues: string[] = []; // Start collapsed

  return (
    <div className="p-4 md:p-5 space-y-6 h-full"> {/* Adjusted padding */}
      <Card className="shadow-lg border rounded-xl">
        <CardHeader className="p-5">
          <div className="flex items-center gap-2.5 mb-0.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">Resumen General del Documento</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground mt-0.5">Puntajes globales de cumplimiento y completitud.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 pt-2 pb-5 px-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp size={15} /> Cumplimiento Normativo Global
              </span>
              <span className="text-sm font-semibold text-primary">{overallComplianceScore}%</span>
            </div>
            <Progress value={overallComplianceScore} className="h-2 rounded-full bg-muted" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                 <Gauge size={15} /> Índice de Completitud Global
              </span>
              <span className="text-sm font-semibold text-primary">{overallCompletenessIndex}/10</span>
            </div>
            <Progress value={overallCompletenessIndex * 10} className="h-2 rounded-full bg-muted" />
          </div>
           <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2" size="sm" onClick={() => handleExportPDF()}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte Completo (PDF)
          </Button>
        </CardContent>
      </Card>

      {selectedBlockDetail ? (
        <Card className="shadow-lg mt-6 border rounded-xl">
          <CardHeader className="p-5">
            <div className="flex items-center gap-2.5 mb-0.5">
              <Info className="h-6 w-6 text-accent" />
              <CardTitle className="text-lg font-semibold text-foreground">
                Detalles Adicionales del Bloque
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Contexto y riesgos para: <span className="font-medium text-primary">{selectedBlockDetail.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-5 px-5 space-y-1.5">
            <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-2">
              {selectedBlockDetail.missingConnections.length > 0 && (
                <AccordionItem value="connections" className="border-0">
                  <Card className="shadow-sm bg-muted/40 rounded-lg border">
                    <AccordionTrigger className="p-3 text-sm hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/70 data-[state=open]:border-b text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group">
                      <div className="flex items-center gap-2 w-full">
                          <Link2Off size={16} className="text-accent group-hover:text-accent/80 transition-colors" />
                          <span className="flex-1">Conexiones Normativas Faltantes ({selectedBlockDetail.missingConnections.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3.5 pb-3.5 pt-2.5 text-sm rounded-b-md data-[state=open]:bg-muted/40">
                      <ul className="space-y-2">
                          {selectedBlockDetail.missingConnections.map((conn) => (
                            <li key={conn.id} className="text-xs p-2.5 border-l-2 border-accent bg-background/70 rounded-r-md text-foreground/90">
                              {conn.description}
                            </li>
                          ))}
                        </ul>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

              {selectedBlockDetail.legalRisk && (
                <AccordionItem value="legal-risk" className="border-0">
                  <Card className="shadow-sm bg-muted/40 rounded-lg border">
                    <AccordionTrigger className="p-3 text-sm hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/70 data-[state=open]:border-b text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group">
                      <div className="flex items-center gap-2 w-full">
                        <ShieldAlert size={16} className="text-accent group-hover:text-accent/80 transition-colors" />
                        <span className="flex-1">Riesgo Jurídico Identificado</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3.5 pb-3.5 pt-2.5 text-sm rounded-b-md data-[state=open]:bg-muted/40">
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {selectedBlockDetail.legalRisk}
                      </p>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

              {selectedBlockDetail.applicableNorms.length > 0 && (
                <AccordionItem value="norms" className="border-0">
                  <Card className="shadow-sm bg-muted/40 rounded-lg border">
                    <AccordionTrigger className="p-3 text-sm hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/70 data-[state=open]:border-b text-left font-medium text-foreground/90 transition-colors duration-150 ease-in-out group">
                      <div className="flex items-center gap-2 w-full">
                        <BookOpen size={16} className="text-accent group-hover:text-accent/80 transition-colors" />
                        <span className="flex-1">Normativa Aplicable Directa ({selectedBlockDetail.applicableNorms.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3.5 pb-3.5 pt-2.5 text-sm rounded-b-md data-[state=open]:bg-muted/40">
                      <ul className="space-y-2">
                        {selectedBlockDetail.applicableNorms.map((norm) => (
                          <li key={norm.id} className="text-xs p-2.5 border rounded-md bg-background/70">
                            <strong className="text-technical-norm-blue">{norm.name}</strong> - {norm.article}
                            {norm.details && <p className="text-xs text-muted-foreground mt-0.5">{norm.details}</p>}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}
            </Accordion>

            {(selectedBlockDetail.missingConnections.length === 0 && !selectedBlockDetail.legalRisk && selectedBlockDetail.applicableNorms.length === 0) && (
                 <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30 mt-2">
                    No hay información adicional (conexiones, riesgos o normativas directas) para este bloque.
                </p>
            )}

            <div className="pt-4">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2" size="sm" onClick={() => handleExportPDF(selectedBlockDetail.name)}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Bloque Corregido (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border rounded-xl mt-6 flex flex-col items-center justify-center p-8 min-h-[250px] bg-muted/20">
          <ListChecks size={38} className="text-muted-foreground/70 mb-3.5" />
          <CardTitle className="text-lg text-center font-semibold text-foreground mb-1.5">Información Detallada del Bloque</CardTitle>
          <CardDescription className="text-sm text-center text-muted-foreground max-w-xs">
            Seleccione un bloque de la navegación izquierda para ver sus detalles, alertas, y sugerencias específicas aquí.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}

