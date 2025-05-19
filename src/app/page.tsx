
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { BlockNavigation } from '@/components/mila/block-navigation';
import { SeverityIndicator } from '@/components/mila/severity-indicator';
import { cn } from '@/lib/utils';
import { FileText, Layers, ListChecks, Home, ArrowLeft, Target, CheckSquare, Info, ShieldAlert } from 'lucide-react';

const getBlockRiskColorClasses = (riskPercentage: number): string => {
  if (riskPercentage < 25) return 'text-green-600 dark:text-green-400';
  if (riskPercentage <= 50) return 'text-custom-warning-yellow-DEFAULT dark:text-yellow-400';
  return 'text-destructive dark:text-red-400';
};

const BlockSummaryGrid: React.FC<{ blocks: DocumentBlock[]; onSelectBlock: (id: string) => void }> = ({ blocks, onSelectBlock }) => {
  return (
    <div className="space-y-4">
       <Card className="glass-card rounded-xl transition-all duration-200 ease-in-out hover:shadow-2xl border">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Target className="h-6 w-6 text-accent" />
            Resumen de Bloques del Documento
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1 mb-4">
            Seleccione un bloque para ver su contenido detallado y las sugerencias de mejora, o navegue usando el panel izquierdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block) => {
              const compliancePercentage = block.maxCompleteness > 0 ? (block.completenessIndex / block.maxCompleteness) * 100 : 0;
              const blockRiskPercentage = parseFloat((100 - compliancePercentage).toFixed(0));
              const riskColorClass = getBlockRiskColorClasses(blockRiskPercentage);

              return (
                <Card
                  key={block.id}
                  className="glass-card hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer flex flex-col rounded-lg group bg-card/80 border"
                  onClick={() => onSelectBlock(block.id)}
                >
                  <CardHeader className="flex-grow pb-1 px-3 pt-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between text-foreground group-hover:text-accent transition-colors">
                      <span className="flex items-center gap-1.5 text-technical-text-blue group-hover:text-accent">
                        <FileText size={18} className="group-hover:text-accent/90 transition-colors" />
                        {block.name}
                      </span>
                      <SeverityIndicator level={block.alertLevel} size={4}/>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-1 pb-2 px-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Categoría: {block.category}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <ShieldAlert size={14} className={cn("transition-colors", riskColorClass)}/>
                      <span className="text-xs font-medium text-muted-foreground">Riesgo: </span>
                      <span className={cn("font-bold text-sm transition-colors", riskColorClass)}>
                        {blockRiskPercentage}%
                      </span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 pb-3 px-3">
                     <Button variant="outline" size="sm" className="w-full mt-auto text-technical-text-blue text-xs py-1.5 h-8 group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-150">
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
      ? parseFloat((sumOfBlockCompliancePercentages / updatedBlocks.length).toFixed(0))
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

      if (previousStatus === 'pending' && newStatus === 'applied' && suggestionToUpdate.completenessImpact) {
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
      variant: newStatus === 'applied' ? 'default' : newStatus === 'discarded' ? 'destructive' : 'default',
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
      <Sidebar className="glass-sidebar">
        <SidebarHeader className="p-3 border-b border-sidebar-border flex flex-col items-start glass-sidebar-header-footer">
           <div className="flex items-center gap-2.5 p-1 mb-1">
             <SidebarTrigger className="md:hidden" /> 
             <ListChecks className="h-6 w-6 text-sidebar-primary" />
             <h2 className="text-lg font-semibold text-sidebar-foreground">Navegación de Bloques</h2>
           </div>
            {selectedBlockId && (
              <Button
                variant="ghost"
                onClick={handleGoHome}
                className="w-[calc(100%-1rem)] mx-2 mb-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground justify-start font-medium transition-colors duration-150"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Resumen
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
         <SidebarFooter className="p-3 mt-auto border-t border-sidebar-border glass-sidebar-header-footer">
            <Button variant="outline" className="w-full border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150">
                <Home className="mr-2 h-4 w-4" />
                Dashboard Principal
            </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col h-screen md:pl-[var(--sidebar-width)] group-data-[state=collapsed]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding] duration-200 ease-linear">
        <PageHeader title={documentTitle} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-4 space-y-4 bg-transparent">
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

          <aside className="w-full shrink-0 md:w-[320px] lg:w-[300px] xl:w-[340px] border-l border-white/20 dark:border-slate-700/50 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md text-card-foreground overflow-y-auto shadow-lg transition-all duration-200 ease-in-out">
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

    