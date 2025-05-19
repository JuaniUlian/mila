
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { BlockNavigation } from '@/components/mila/block-navigation';
import { Home, ListChecks, ArrowLeft, Zap } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';

const HeroBanner: React.FC = () => {
  return (
    <div className="rounded-xl hero-gradient p-8 md:p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[300px] md:min-h-[360px]">
      <Zap size={48} className="text-white/90 mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Bienvenido a Mila - Planilla Viva</h1>
      <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl">
        Optimiza tus documentos normativos con inteligencia artificial. Analiza, corrige y perfecciona tus pliegos de manera eficiente.
      </p>
      <p className="text-md text-white/70">
        Selecciona una opción del panel izquierdo para comenzar.
      </p>
    </div>
  );
};


export default function HomePage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const { blocks, overallComplianceScore, overallCompletenessIndex } = documentData;

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
        <SidebarHeader className="p-3 border-b border-sidebar-border/30 flex flex-col items-start glass-sidebar-header-footer">
           <div className="flex items-center gap-2.5 p-1 mb-2 w-full">
            <Logo /> 
            <span className="text-lg font-semibold text-sidebar-foreground ml-1">Mila</span>
             <SidebarTrigger className="md:hidden ml-auto" /> 
           </div>
           {selectedBlockId && (
             <Button 
                variant="ghost" 
                onClick={handleGoHome} 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-medium mt-1 transition-colors duration-150 ease-in-out rounded-md h-9 px-3"
              >
                <ArrowLeft size={16} className="mr-2" />
                Volver al Inicio
             </Button>
            )}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <BlockNavigation
            onGoHome={handleGoHome}
            isHomeActive={selectedBlockId === null}
          />
        </SidebarContent>
         <SidebarFooter className="p-3 mt-auto border-t border-sidebar-border/30 glass-sidebar-header-footer">
            <Button variant="outline" className="w-full border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 rounded-lg h-9 px-3">
                <ListChecks className="mr-2 h-4 w-4" />
                Opciones
            </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col h-screen md:pl-[var(--sidebar-width)] group-data-[state=collapsed]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding] duration-200 ease-linear">
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 space-y-6 bg-transparent">
            {selectedBlock ? (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-3">Detalle del Bloque: {selectedBlock.name}</h1>
                <ContentPanel
                  block={selectedBlock}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onUpdateSuggestionText={handleUpdateSuggestionText}
                />
              </>
            ) : (
              <HeroBanner />
            )}
          </main>

          <aside className="w-full shrink-0 md:w-[320px] lg:w-[300px] xl:w-[340px] border-l border-[hsla(var(--border),0.2)] bg-card/60 backdrop-blur-lg text-card-foreground overflow-y-auto shadow-lg transition-all duration-200 ease-in-out">
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
