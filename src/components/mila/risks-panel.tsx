
"use client";
import type React from 'react';
import type { DocumentBlock, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Link2Off, ShieldAlert, BookOpen, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SeverityIndicator } from './severity-indicator';

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
    case 'grave': return 'bg-custom-severity-high text-custom-severity-high-foreground';
    case 'media': return 'bg-custom-severity-medium text-custom-severity-medium-foreground';
    case 'leve': return 'bg-custom-severity-low text-custom-severity-low-foreground';
    default: return '';
  }
};


export function RisksPanel({ block }: RisksPanelProps) {
  const { toast } = useToast();

  if (!block) {
    // This state should ideally be handled by the parent component (page.tsx)
    // by not rendering RisksPanel if block is null.
    // Adding a minimal fallback here for safety.
    return (
      <Card className="shadow-md border">
        <CardHeader className="text-center">
          <CardDescription className="text-base">
            Seleccione un bloque para ver detalles de validación y riesgos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <FileWarning size={48} className="text-muted-foreground mx-auto" />
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

  const defaultAccordionValues: string[] = [];
  if (block.alerts.length > 0) defaultAccordionValues.push("alerts");
  if (block.missingConnections.length > 0) defaultAccordionValues.push("connections");
  if (block.legalRisk) defaultAccordionValues.push("legal-risk");
  if (block.applicableNorms.length > 0) defaultAccordionValues.push("norms");


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="mb-2"> {/* Adjusted margin */}
          <h2 className="text-xl font-semibold text-foreground leading-tight">
            Validaciones y Riesgos Adicionales
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detalles para el bloque: <span className="font-medium text-primary">{block.name}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full space-y-3">
          <AccordionItem value="alerts" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-base hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <FileWarning size={18} className="text-accent" />
                  <span className="flex-1 text-left font-medium">Alertas Activas ({block.alerts.length})</span>
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

          <AccordionItem value="connections" className="border-b-0">
            <Card className="shadow-md">
              <AccordionTrigger className="p-4 text-base hover:no-underline">
                 <div className="flex items-center gap-2 w-full">
                    <Link2Off size={18} className="text-accent" />
                    <span className="flex-1 text-left font-medium">Conexiones Faltantes ({block.missingConnections.length})</span>
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
                  <span className="flex-1 text-left font-medium">Normativa Aplicable ({block.applicableNorms.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {block.applicableNorms.length === 0 ? (
                  <p className="text-sm text-muted-foreground pt-2">No hay normativas específicas listadas.</p>
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
