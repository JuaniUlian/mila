
"use client";
import type React from 'react';
import type { DocumentBlock, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, Link2Off, ShieldAlert, BookOpen, FileWarning, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SeverityIndicator } from './severity-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

interface RisksPanelProps {
  block: DocumentBlock | null;
}

const getSeverityBadgeVariant = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'grave': return 'destructive';
    case 'media': return 'default'; 
    case 'leve': return 'secondary'; 
    default: return 'outline';
  }
};

const getSeverityBadgeClass = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'grave': return 'bg-custom-severity-high-DEFAULT text-custom-severity-high-foreground';
    case 'media': return 'bg-custom-severity-medium-DEFAULT text-custom-severity-medium-foreground';
    case 'leve': return 'bg-custom-severity-low-DEFAULT text-custom-severity-low-foreground';
    default: return '';
  }
};


export function RisksPanel({ block }: RisksPanelProps) {
  const { toast } = useToast();

  if (!block) {
    return (
      <div className="w-full md:w-96 p-6 bg-card border-l border-border flex-shrink-0">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>Validaciones y Riesgos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Seleccione un bloque para ver los detalles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleExportPDF = () => {
    toast({
      title: "Exportación PDF",
      description: `La exportación del bloque "${block.name}" se iniciará pronto (función simulada).`,
    });
  };

  // Determine default open accordion items. For example, open "Alertas Activas" if there are alerts.
  const defaultAccordionValues: string[] = [];
  if (block.alerts.length > 0) {
    defaultAccordionValues.push("alerts");
  }
  if (block.missingConnections.length > 0) {
    defaultAccordionValues.push("connections");
  }
  if (block.legalRisk) {
    defaultAccordionValues.push("legal-risk");
  }
   if (block.applicableNorms.length > 0) {
    defaultAccordionValues.push("norms");
  }


  return (
    <ScrollArea className="h-full w-full md:w-96 flex-shrink-0">
      <div className="p-4 md:p-6 space-y-3">
        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
          <AccordionItem value="alerts" className="border-b-0 mb-3">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-lg hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <FileWarning size={20} className="text-primary" />
                  <span className="flex-1 text-left">Alertas Activas ({block.alerts.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No hay alertas activas para este bloque.</p>
                ) : (
                  <ul className="space-y-3 pt-2">
                    {block.alerts.map((alert) => (
                      <li key={alert.id} className="p-3 border rounded-md bg-background/50 shadow-sm">
                        <div className="flex items-start gap-2">
                          <SeverityIndicator level={alert.severity} size={5} className="mt-0.5"/>
                          <div>
                            <p className="text-sm font-medium">{alert.description}</p>
                            <Badge variant={getSeverityBadgeVariant(alert.severity)} className={`mt-1 text-xs ${getSeverityBadgeClass(alert.severity)}`}>
                              Severidad: {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="connections" className="border-b-0 mb-3">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-lg hover:no-underline">
                 <div className="flex items-center gap-2 w-full">
                    <Link2Off size={20} className="text-primary" />
                    <span className="flex-1 text-left">Conexiones Normativas Faltantes ({block.missingConnections.length})</span>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.missingConnections.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No se identificaron conexiones faltantes.</p>
                ) : (
                  <ul className="space-y-2 pt-2">
                    {block.missingConnections.map((conn) => (
                      <li key={conn.id} className="text-sm p-2 border-l-2 border-custom-technical-norm-blue-DEFAULT bg-background/30">
                        {conn.description}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="legal-risk" className="border-b-0 mb-3">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-lg hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <ShieldAlert size={20} className="text-primary" />
                  <span className="flex-1 text-left">Riesgo Jurídico</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm pt-2">
                  {block.legalRisk || "No se ha determinado un riesgo jurídico específico para este bloque o es bajo."}
                </p>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="norms" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-lg hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <BookOpen size={20} className="text-primary" />
                  <span className="flex-1 text-left">Normativa Aplicable ({block.applicableNorms.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.applicableNorms.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No hay normativas específicas listadas.</p>
                ) : (
                <ul className="space-y-2 pt-2">
                  {block.applicableNorms.map((norm) => (
                    <li key={norm.id} className="text-sm p-2 border rounded-md bg-background/30">
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
          <Button className="w-full bg-destructive hover:bg-destructive/90" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Bloque Corregido (PDF)
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

