
"use client";
import type React from 'react';
import type { DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link2Off, ShieldAlert, BookOpen, TrendingUp, Gauge, Info, FileCheck2, ListChecks } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// BlockNavigation is no longer imported or used here

interface RisksPanelProps {
  // Removed props related to hosting BlockNavigation:
  // blocks: DocumentBlock[]; 
  // selectedBlockId: string | null;
  // onSelectBlock: (id: string) => void; 
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

  const defaultAccordionValues: string[] = [];
  if (selectedBlockDetail?.missingConnections?.length > 0) defaultAccordionValues.push("connections");
  if (selectedBlockDetail?.legalRisk) defaultAccordionValues.push("legal-risk");
  if (selectedBlockDetail?.applicableNorms?.length > 0) defaultAccordionValues.push("norms");

  return (
    <div className="p-4 md:p-6 space-y-6 h-full">
      {/* BlockNavigation is no longer rendered here */}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Resumen General del Documento</CardTitle>
          </div>
          <CardDescription>Puntajes globales de cumplimiento y completitud.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp size={16} /> Cumplimiento Normativo General
              </span>
              <span className="text-sm font-semibold text-primary">{overallComplianceScore}%</span>
            </div>
            <Progress value={overallComplianceScore} className="h-2.5" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                 <Gauge size={16} /> Índice de Completitud General
              </span>
              <span className="text-sm font-semibold text-primary">{overallCompletenessIndex}/10</span>
            </div>
            <Progress value={overallCompletenessIndex * 10} className="h-2.5" />
          </div>
           <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleExportPDF()}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte Completo (PDF)
          </Button>
        </CardContent>
      </Card>

      {selectedBlockDetail ? (
        <Card className="shadow-lg mt-6"> {/* Ensure some margin if it follows another card */}
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-6 w-6 text-accent" />
              <CardTitle className="text-xl">
                Información Adicional del Bloque
              </CardTitle>
            </div>
            <CardDescription>
              Contexto y riesgos para: <span className="font-medium text-primary">{selectedBlockDetail.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-2">
              <AccordionItem value="connections" className="border-0">
                <Card className="shadow-sm">
                  <AccordionTrigger className="p-3 text-base hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/50">
                    <div className="flex items-center gap-2 w-full">
                        <Link2Off size={18} className="text-accent" />
                        <span className="flex-1 text-left font-medium text-sm">Conexiones Normativas Faltantes ({selectedBlockDetail.missingConnections.length})</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 text-sm rounded-b-md data-[state=open]:bg-muted/50">
                    {selectedBlockDetail.missingConnections.length === 0 ? (
                      <p className="text-xs text-muted-foreground pt-2">No se identificaron conexiones faltantes.</p>
                    ) : (
                      <ul className="space-y-1.5 pt-2">
                        {selectedBlockDetail.missingConnections.map((conn) => (
                          <li key={conn.id} className="text-xs p-2 border-l-2 border-custom-technical-norm-blue bg-background/30 rounded-r-sm">
                            {conn.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="legal-risk" className="border-0">
                <Card className="shadow-sm">
                  <AccordionTrigger className="p-3 text-base hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/50">
                    <div className="flex items-center gap-2 w-full">
                      <ShieldAlert size={18} className="text-accent" />
                      <span className="flex-1 text-left font-medium text-sm">Riesgo Jurídico</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 text-sm rounded-b-md data-[state=open]:bg-muted/50">
                    <p className="text-xs pt-2 text-foreground/90">
                      {selectedBlockDetail.legalRisk || "No se ha determinado un riesgo jurídico específico para este bloque o es bajo."}
                    </p>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="norms" className="border-0">
                <Card className="shadow-sm">
                  <AccordionTrigger className="p-3 text-base hover:no-underline rounded-t-md data-[state=open]:rounded-b-none data-[state=open]:bg-muted/50">
                    <div className="flex items-center gap-2 w-full">
                      <BookOpen size={18} className="text-accent" />
                      <span className="flex-1 text-left font-medium text-sm">Normativa Aplicable Directa ({selectedBlockDetail.applicableNorms.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 text-sm rounded-b-md data-[state=open]:bg-muted/50">
                    {selectedBlockDetail.applicableNorms.length === 0 ? (
                      <p className="text-xs text-muted-foreground pt-2">No hay normativas específicas listadas para este bloque.</p>
                    ) : (
                    <ul className="space-y-1.5 pt-2">
                      {selectedBlockDetail.applicableNorms.map((norm) => (
                        <li key={norm.id} className="text-xs p-2 border rounded-sm bg-background/30">
                          <strong className="text-technical-norm-blue">{norm.name}</strong> - {norm.article}
                          {norm.details && <p className="text-xs text-muted-foreground mt-0.5">{norm.details}</p>}
                        </li>
                      ))}
                    </ul>
                    )}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>

            <div className="pt-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleExportPDF(selectedBlockDetail.name)}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Bloque Corregido (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border mt-6 flex flex-col items-center justify-center p-6 min-h-[200px]">
          <ListChecks size={36} className="text-muted-foreground mb-3" />
          <CardTitle className="text-lg text-center mb-1">Información Detallada del Bloque</CardTitle>
          <CardDescription className="text-sm text-center">
            Seleccione un bloque de la lista de la izquierda para ver sus detalles específicos aquí.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}
