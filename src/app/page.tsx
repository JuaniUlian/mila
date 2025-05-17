
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import { BlockNavigation } from '@/components/mila/block-navigation';
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar'; // Keep SidebarProvider for PageHeader's trigger if needed

export default function HomePage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  const { documentTitle, blocks, overallComplianceScore, overallCompletenessIndex } = documentData;

  useEffect(() => {
    if (blocks.length > 0 && !selectedBlockId) {
      // setSelectedBlockId(blocks[0].id); // Optionally auto-select first block
    }
  }, [blocks, selectedBlockId]);

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
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
      } else if (previousStatus === 'applied' && (newStatus === 'pending' || newStatus === 'discarded')) {
        // Optional: Logic to decrease score if an applied suggestion is reverted.
        // For now, we assume applying is a one-way impact for score increase from pending.
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
    // Wrap with SidebarProvider if PageHeader's SidebarTrigger is active and needs context
    <SidebarProvider>
      {/* This Sidebar is for the potential mobile menu triggered by PageHeader */}
      <Sidebar>
        {/* Placeholder for mobile navigation items if any */}
      </Sidebar>
      <div className="flex flex-col h-screen">
        <PageHeader title={documentTitle} />
        <div className="flex flex-1 overflow-hidden"> {/* Main content area with two columns */}
          
          {/* Left Column (Main Content): Navigation and Content Panel */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <BlockNavigation
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
            />
            {selectedBlock ? (
              <ContentPanel
                block={selectedBlock}
                onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                onUpdateSuggestionText={handleUpdateSuggestionText}
              />
            ) : (
              <div className="flex flex-col items-center justify-start pt-10">
                <Card className="p-6 border rounded-lg shadow-md bg-card text-center max-w-md">
                  <h2 className="text-xl font-semibold mb-2">Bienvenido a Mila - Plantilla Viva</h2>
                  <p className="text-muted-foreground">
                    Seleccione un bloque de la lista de arriba para ver su contenido, validaciones y sugerencias.
                  </p>
                </Card>
              </div>
            )}
          </main>

          {/* Right Column (Aside): Risks Panel */}
          <aside className="w-1/3 min-w-[350px] max-w-[450px] border-l bg-card text-card-foreground overflow-y-auto shadow-lg">
            <RisksPanel
              selectedBlock={selectedBlock}
              overallComplianceScore={overallComplianceScore}
              overallCompletenessIndex={overallCompletenessIndex}
            />
          </aside>
        </div>
      </div>
    </SidebarProvider>
  );
}
