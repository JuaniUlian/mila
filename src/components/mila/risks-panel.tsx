
"use client";
import type React from 'react';
import type { DocumentBlock, AlertItem, MissingConnection, ApplicableNorm } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, Link2Off, ShieldAlert, BookOpen, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SeverityIndicator, SeverityDotIndicator } from './severity-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface RisksPanelProps {
  block: DocumentBlock | null;
}

const getSeverityBadgeVariant = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'grave': return 'destructive';
    case 'media': return 'default'; // Use default for orange/yellow, then style with custom class
    case 'leve': return 'secondary'; // Use secondary for light blue/cyan, then style
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

  return (
    <ScrollArea className="h-full w-full md:w-96 p-4 md:p-6 bg-card border-l border-border flex-shrink-0">
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileWarning size={20} className="text-primary" />
              Alertas Activas ({block.alerts.length})
            </CardTitle>
            <CardDescription>Problemas detectados en este bloque.</CardDescription>
          </CardHeader>
          <CardContent>
            {block.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay alertas activas para este bloque.</p>
            ) : (
              <ul className="space-y-3">
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
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2Off size={20} className="text-primary" />
              Conexiones Normativas Faltantes ({block.missingConnections.length})
            </CardTitle>
            <CardDescription>Referencias a otras normativas que podrían ser necesarias.</CardDescription>
          </CardHeader>
          <CardContent>
            {block.missingConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No se identificaron conexiones faltantes.</p>
            ) : (
              <ul className="space-y-2">
                {block.missingConnections.map((conn) => (
                  <li key={conn.id} className="text-sm p-2 border-l-2 border-custom-technical-norm-blue-DEFAULT bg-background/30">
                    {conn.description}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert size={20} className="text-primary" />
              Riesgo Jurídico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {block.legalRisk || "No se ha determinado un riesgo jurídico específico para este bloque o es bajo."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen size={20} className="text-primary" />
              Normativa Aplicable ({block.applicableNorms.length})
            </CardTitle>
            <CardDescription>Principales normas referenciadas o que aplican a este bloque.</CardDescription>
          </CardHeader>
          <CardContent>
            {block.applicableNorms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay normativas específicas listadas.</p>
            ) : (
            <ul className="space-y-2">
              {block.applicableNorms.map((norm) => (
                <li key={norm.id} className="text-sm p-2 border rounded-md bg-background/30">
                  <strong className="text-technical-norm-blue">{norm.name}</strong> - {norm.article}
                  {norm.details && <p className="text-xs text-muted-foreground mt-0.5">{norm.details}</p>}
                </li>
              ))}
            </ul>
            )}
          </CardContent>
        </Card>

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
