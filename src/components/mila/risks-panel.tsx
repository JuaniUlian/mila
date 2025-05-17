
"use client";
import type React from 'react';
import type { DocumentBlock } from './types'; // AlertItem removed as it's no longer directly used here
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link2Off, ShieldAlert, BookOpen, FileWarning } from 'lucide-react';
// Badge related imports and functions (getSeverityBadgeVariant, getSeverityBadgeClass) are removed
// ScrollArea might not be needed if content is less
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// SeverityIndicator is removed as alerts are no longer displayed here

interface RisksPanelProps {
  block: DocumentBlock | null;
}

export function RisksPanel({ block }: RisksPanelProps) {
  const { toast } = useToast();

  if (!block) {
    return (
      <Card className="shadow-md border mt-6"> {/* Added mt-6 for spacing */}
        <CardHeader className="text-center">
           <CardTitle>Información Adicional</CardTitle>
          <CardDescription className="text-base">
            Seleccione un bloque para ver detalles de conexiones, riesgos y normativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Info size={48} className="text-muted-foreground mx-auto" />
        </CardContent>
      </Card>
    );
  }
  
  const handleExportPDF = () => {
    toast({
      title: "Exportación PDF",
      description: `La exportación del bloque "${block.name}" se iniciará pronto (función simulada).`,
    });
  };

  // Default open for accordion items can be Connections, Legal Risk, Norms
  // Alerts section is removed.
  const defaultAccordionValues: string[] = [];
  if (block.missingConnections.length > 0) defaultAccordionValues.push("connections");
  if (block.legalRisk) defaultAccordionValues.push("legal-risk");
  if (block.applicableNorms.length > 0) defaultAccordionValues.push("norms");


  return (
    <Card className="shadow-lg mt-6"> {/* Added mt-6 for spacing */}
      <CardHeader>
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-foreground leading-tight">
            Información Adicional del Bloque
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Contexto normativo y riesgos para: <span className="font-medium text-primary">{block.name}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-3">
          {/* Alertas Activas AccordionItem is removed */}

          <AccordionItem value="connections" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-base hover:no-underline">
                 <div className="flex items-center gap-2 w-full">
                    <Link2Off size={18} className="text-accent" />
                    <span className="flex-1 text-left font-medium">Conexiones Normativas Faltantes ({block.missingConnections.length})</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.missingConnections.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No se identificaron conexiones faltantes.</p>
                ) : (
                  <ul className="space-y-2 pt-2">
                    {block.missingConnections.map((conn) => (
                      <li key={conn.id} className="text-sm p-3 border-l-2 border-custom-technical-norm-blue bg-background/30 rounded-r-md">
                        {conn.description}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="legal-risk" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-base hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <ShieldAlert size={18} className="text-accent" />
                  <span className="flex-1 text-left font-medium">Riesgo Jurídico</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm pt-2 text-foreground/90">
                  {block.legalRisk || "No se ha determinado un riesgo jurídico específico para este bloque o es bajo."}
                </p>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="norms" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-base hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <BookOpen size={18} className="text-accent" />
                  <span className="flex-1 text-left font-medium">Normativa Aplicable Directa ({block.applicableNorms.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.applicableNorms.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No hay normativas específicas listadas para este bloque.</p>
                ) : (
                <ul className="space-y-2 pt-2">
                  {block.applicableNorms.map((norm) => (
                    <li key={norm.id} className="text-sm p-3 border rounded-md bg-background/30">
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

        <div className="pt-4">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Bloque Corregido (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
