
"use client";
import React from 'react';
import type { MilaAppPData } from './types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Inbox, Check, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface RisksPanelProps {
  documentData: MilaAppPData;
  hasCorrections: boolean;
}

export function RisksPanel({
  documentData,
  hasCorrections,
}: RisksPanelProps) {
  const { toast } = useToast();
  const { blocks, overallComplianceScore } = documentData;

  const handleExport = () => {
    try {
      // Save the current state to localStorage to be read by the new window.
      localStorage.setItem('milaReportData', JSON.stringify(documentData));
      // Open the report preview page in a new tab.
      window.open('/report-preview', '_blank');
    } catch (error) {
      console.error("Failed to save report data to localStorage", error);
      toast({
        title: "Error al generar el informe",
        description: "No se pudo guardar la información para la previsualización. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  const totalSuggestions = blocks.reduce((acc, block) => acc + block.suggestions.length, 0);
  const highSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'high').length, 0);
  const mediumSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'medium').length, 0);
  const lowSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'low').length, 0);
  const appliedCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.status === 'applied').length, 0);


  const uniqueNorms = [...new Set(blocks.flatMap(b => b.suggestions.map(s => s.appliedNorm)))];

  return (
    <aside className="panel-glass flex flex-col h-full p-4 space-y-4">
        <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold text-foreground">Resultados Parciales</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Resumen del análisis en tiempo real.</CardDescription>
        </CardHeader>
        
        <Separator className="bg-border/50" />

        <div className="p-0 space-y-3 text-sm flex-grow overflow-y-auto">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cumplimiento General</span>
                <span className="font-semibold text-foreground">{overallComplianceScore.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Incidencias Totales</span>
                <span className="font-semibold text-foreground">{totalSuggestions}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[hsl(var(--severity-high))]"></div> Alta Severidad</span>
                <span className="font-semibold text-[hsl(var(--severity-high))]">{highSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[hsl(var(--severity-medium))]"></div> Media Severidad</span>
                <span className="font-semibold text-[hsl(var(--severity-medium))]">{mediumSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[hsl(var(--severity-low))]"></div> Baja Severidad</span>
                <span className="font-semibold text-[hsl(var(--severity-low))]">{lowSeverityCount}</span>
            </div>

            <Separator className="bg-border/50" />

             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Correcciones Aplicadas</span>
                <span className="font-semibold text-green-500">{appliedCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-4 h-4" /> Normativas Involucradas</span>
                <span className="font-semibold text-foreground">{uniqueNorms.length}</span>
            </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="mt-auto">
            <Button 
                className="w-full text-base py-6"
                size="lg"
                onClick={handleExport}
            >
                {hasCorrections ? (
                    <>
                        <Inbox className="mr-2 h-5 w-5" />
                        Previsualizar con correcciones
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-5 w-5" />
                        Previsualizar informe
                    </>
                )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Abre una nueva ventana con el informe detallado de las incidencias y correcciones.</p>
        </div>
    </aside>
  );
}
