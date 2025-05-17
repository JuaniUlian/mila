
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import { BlockNavigation } from '@/components/mila/block-navigation';
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { SeverityIndicator } from '@/components/mila/severity-indicator';
import { cn } from '@/lib/utils';
import { FileText, Layers, ListChecks, Home, ArrowLeft } from 'lucide-react';


const BlockSummaryGrid: React.FC<{ blocks: DocumentBlock[]; onSelectBlock: (id: string) => void }> = ({ blocks, onSelectBlock }) => {
  return (
    <div className="space-y-6">
       <Card className="shadow-xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-3">
            <Layers className="h-7 w-7 text-primary" />
            Resumen de Bloques del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-8 text-base">
            Seleccione un bloque de la cuadrícula para ver su contenido detallado y las sugerencias de mejora, o navegue usando el panel izquierdo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block) => (
              <Card
                key={block.id}
                className="hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer flex flex-col bg-card/80 hover:bg-card rounded-lg border"
                onClick={() => onSelectBlock(block.id)}
              >
                <CardHeader className="flex-grow pb-3">
                  <CardTitle className="text-xl font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText size={22} className="text-primary" />
                      {block.name}
                    </span>
                    <SeverityIndicator level={block.alertLevel} size={5}/>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-2 pb-4">
                  <p className="text-sm text-muted-foreground mb-3">Categoría: {block.category}</p>
                  <div className="mt-2">
                    <span className="text-sm font-semibold">Completitud: </span>
                    <span className={cn(
                      "font-bold text-lg",
                      block.completenessIndex < 5 ? "text-destructive" :
                      block.completenessIndex < 8 ? "text-custom-warning-yellow-DEFAULT" :
                      "text-green-600"
                    )}>
                      {block.completenessIndex} / {block.maxCompleteness}
                    </span>
                  </div>
                </CardContent>
                <CardContent className="pt-0 pb-5">
                   <Button variant="outline" size="default" className="w-full mt-auto text-base py-2.5">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default function HomePage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  const { documentTitle, blocks, overallComplianceScore, overallCompletenessIndex } = documentData;

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  const recalculateOverallScores = useCallback((updatedBlocks: DocumentBlock[]): { overallCompletenessIndex: number, overallComplianceScore: number } => {
    let totalCompletenessAchieved = 0;
    let totalMaxCompleteness = 0;
    let sumOfBlockCompliancePercentages = 0;

    updatedBlocks.forEach(block => {
      totalCompletenessAchieved += block.completenessIndex;
      totalMaxCompleteness += block.maxCompleteness;
      const blockCompliance = block.maxCompleteness > 0 ? (block.completenessIndex / block.maxCompleteness) * 100 : 0;
      sumOfBlockCompliancePercentages += blockCompliance;
    });

    const newOverallCompletenessIndex = totalMaxCompleteness > 0
      ? parseFloat(((totalCompletenessAchieved / totalMaxCompleteness) * 10).toFixed(1))
      : 0;

    const newOverallComplianceScore = updatedBlocks.length > 0
      ? Math.round(sumOfBlockCompliancePercentages / updatedBlocks.length)
      : 0;

    return {
      overallCompletenessIndex: Math.min(10, Math.max(0, newOverallCompletenessIndex)),
      overallComplianceScore: Math.min(100, Math.max(0, newOverallComplianceScore)),
    };
  }, []);

  const handleUpdateSuggestionStatus = useCallback((blockId: string, suggestionId: string, newStatus: Suggestion['status']) => {
    setDocumentData(prevData => {
      const blockToUpdate = prevData.blocks.find(b => b.id === blockId);
      const suggestionToUpdate = blockToUpdate?.suggestions.find(s => s.id === suggestionId);

      if (!blockToUpdate || !suggestionToUpdate) return prevData;

      const previousStatus = suggestionToUpdate.status;
      let newCompletenessIndexForBlock = blockToUpdate.completenessIndex;

      if (previousStatus === 'pending' && newStatus === 'applied') {
        newCompletenessIndexForBlock = Math.min(blockToUpdate.maxCompleteness, blockToUpdate.completenessIndex + (suggestionToUpdate.completenessImpact || 0));
      }

      const updatedBlocks = prevData.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, status: newStatus } : suggestion
            ),
            completenessIndex: newCompletenessIndexForBlock,
          };
        }
        return block;
      });

      const { overallCompletenessIndex: newOverallCompleteness, overallComplianceScore: newOverallCompliance } = recalculateOverallScores(updatedBlocks);

      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newOverallCompleteness,
        overallComplianceScore: newOverallCompliance,
      };
    });

    toast({
      title: "Sugerencia Actualizada",
      description: `El estado de la sugerencia ha sido cambiado a ${newStatus}.`,
    });
  }, [toast, recalculateOverallScores]);

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setDocumentData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, text: newText, status: 'pending' } : suggestion
            ),
          };
        }
        return block;
      }),
    }));
    toast({
      title: "Sugerencia Modificada",
      description: "El texto de la sugerencia ha sido actualizado y marcado como pendiente.",
    });
  }, [toast]);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId) || null;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-2 border-b border-sidebar-border flex flex-col items-start">
           <div className="flex items-center gap-2 p-2">
             <ListChecks className="h-6 w-6 text-sidebar-primary" />
             <h2 className="text-lg font-semibold text-sidebar-foreground">Navegación</h2>
           </div>
            {selectedBlockId && (
              <Button
                variant="ghost"
                onClick={handleGoHome}
                className="w-[calc(100%-1rem)] mx-2 mb-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground justify-start"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            )}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <BlockNavigation
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
          />
        </SidebarContent>
         <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
            <Button variant="outline" className="w-full border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Home className="mr-2 h-4 w-4" />
                Dashboard Principal
            </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col h-screen md:pl-[var(--sidebar-width)] group-data-[state=collapsed]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding] duration-200 ease-linear">
        <PageHeader title={documentTitle} />
        <div className="flex flex-1 overflow-hidden">

          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {selectedBlock ? (
              <ContentPanel
                block={selectedBlock}
                onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                onUpdateSuggestionText={handleUpdateSuggestionText}
              />
            ) : (
              <BlockSummaryGrid blocks={blocks} onSelectBlock={handleSelectBlock} />
            )}
          </main>

          <aside className="w-1/3 min-w-[380px] max-w-[480px] border-l bg-card text-card-foreground overflow-y-auto shadow-lg">
            <RisksPanel
              selectedBlockDetail={selectedBlock}
              overallComplianceScore={overallComplianceScore}
              overallCompletenessIndex={overallCompletenessIndex}
            />
          </aside>
        </div>
      </div>
    </SidebarProvider>
  );
}
