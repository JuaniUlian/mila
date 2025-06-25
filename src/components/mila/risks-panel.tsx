
"use client";
import React from 'react';
import type { MilaAppPData } from './types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Check, FileText } from 'lucide-react';
import { Separator } from '../ui/separator';

interface RisksPanelProps {
  documentData: MilaAppPData;
  onDownloadReport: () => void;
}

export function RisksPanel({
  documentData,
  onDownloadReport,
}: RisksPanelProps) {
  const { blocks, overallComplianceScore } = documentData;

  const totalSuggestions = blocks.reduce((acc, block) => acc + block.suggestions.length, 0);
  const highSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'high').length, 0);
  const mediumSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'medium').length, 0);
  const lowSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'low').length, 0);
  const appliedCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.status === 'applied').length, 0);

  const uniqueNorms = [...new Set(blocks.flatMap(b => b.suggestions.map(s => s.appliedNorm)))];

  return (
    <Card className="flex flex-col h-full bg-white/60 backdrop-blur-xl border-white/50 shadow-xl">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Resultados Parciales</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Resumen del análisis en tiempo real.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-3 text-sm overflow-y-auto">
            <Separator className="mb-3 bg-foreground/20"/>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cumplimiento General</span>
                <span className="font-semibold text-foreground">{overallComplianceScore.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Incidencias Totales</span>
                <span className="font-semibold text-foreground">{totalSuggestions}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Alta Severidad</span>
                <span className="font-semibold text-red-500">{highSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Media Severidad</span>
                <span className="font-semibold text-amber-500">{mediumSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Baja Severidad</span>
                <span className="font-semibold text-sky-500">{lowSeverityCount}</span>
            </div>

            <Separator className="my-3 bg-foreground/20"/>

             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> Correcciones Aplicadas</span>
                <span className="font-semibold text-green-500">{appliedCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-4 h-4" /> Normativas Involucradas</span>
                <span className="font-semibold text-foreground">{uniqueNorms.length}</span>
            </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch pt-6">
            <Button 
                className="w-full text-base py-6"
                size="lg"
                onClick={onDownloadReport}
            >
                <Download className="mr-2 h-5 w-5" />
                Descargar Informe
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Abre una previsualización del informe para imprimir o guardar como PDF.</p>
        </CardFooter>
    </Card>
  );
}
