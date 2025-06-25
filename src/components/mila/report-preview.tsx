
'use client';

import React from 'react';
import type { MilaAppPData, Suggestion } from '@/components/mila/types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ReportPreviewProps {
  data: MilaAppPData;
}

const getSeverityStyles = (severity: Suggestion['severity']) => {
  switch (severity) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-amber-500 bg-amber-50';
    case 'low':
      return 'border-l-sky-500 bg-sky-50';
    default:
      return 'border-l-gray-300 bg-gray-50';
  }
};

const getStatusStyles = (status: Suggestion['status']) => {
    switch(status) {
        case 'applied':
            return 'bg-green-100 text-green-800';
        case 'discarded':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
    }
}


export function ReportPreview({ data }: ReportPreviewProps) {
  const { documentTitle, blocks, overallComplianceScore, overallCompletenessIndex } = data;
  
  const allSuggestionsWithContext = blocks.flatMap(block => 
    block.suggestions.map(suggestion => ({
      ...suggestion,
      blockName: block.name,
      originalText: block.originalText,
    }))
  );
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-lg print:shadow-none print:rounded-none">
        
        {/* --- Header --- */}
        <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{documentTitle}</h1>
            <p className="text-lg text-gray-600">Informe de Análisis Normativo</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-500">Fecha de Generación</p>
             <p className="font-semibold text-gray-700">{new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </header>
        
        {/* --- Floating Print Button --- */}
        <div className="fixed top-4 right-4 no-print">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Imprimir o Guardar como PDF</Button>
        </div>

        {/* --- Summary Scores --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Resumen General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700">Puntaje de Cumplimiento</h3>
                <p className="text-4xl font-bold text-blue-600">{overallComplianceScore.toFixed(0)}<span className="text-2xl text-gray-500">/100</span></p>
                <p className="text-sm text-gray-500 mt-1">Mide la calidad y conformidad del documento con las normativas aplicadas.</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700">Índice de Completitud</h3>
                <p className="text-4xl font-bold text-teal-600">{overallCompletenessIndex.toFixed(1)}<span className="text-2xl text-gray-500">/10.0</span></p>
                <p className="text-sm text-gray-500 mt-1">Evalúa qué tan completo y detallado está el contenido del pliego.</p>
            </div>
          </div>
        </section>

        {/* --- Inconsistencies Detected --- */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Detalle de Hallazgos</h2>
          
          <div className="space-y-8">
            {allSuggestionsWithContext.length > 0 ? allSuggestionsWithContext.map(suggestion => (
              <div key={suggestion.id} className={`p-4 rounded-md border-l-4 ${getSeverityStyles(suggestion.severity)}`}>
                 {/* Suggestion Header */}
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{suggestion.errorType}</h3>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyles(suggestion.status)}`}>
                            {suggestion.status}
                        </span>
                        <span className="text-sm font-semibold capitalize text-gray-700">{suggestion.severity}</span>
                    </div>
                 </div>
                 <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Bloque:</span> {suggestion.blockName}
                 </p>
                 
                 {/* Suggestion Details */}
                 <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Contexto del Texto Original:</h4>
                        <p className="text-sm text-gray-600 p-3 bg-gray-100 border rounded-md font-mono">{suggestion.originalText}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Justificación Legal (Incumplimiento):</h4>
                        <p className="text-sm text-gray-600">{suggestion.justification.legal}</p>
                         <p className="text-sm text-gray-500 mt-1">
                            <span className="font-semibold">Normativa:</span> {suggestion.appliedNorm}
                        </p>
                    </div>
                 </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">No se encontraron inconsistencias o todas fueron resueltas.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
