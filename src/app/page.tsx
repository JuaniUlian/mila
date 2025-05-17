
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import { BlockNavigation } from '@/components/mila/block-navigation'; 
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'; // Added Sidebar components
import { SeverityIndicator } from '@/components/mila/severity-indicator';
import { cn } from '@/lib/utils';
import { FileText, Layers, ListChecks } from 'lucide-react';


// New component for the grid of block summaries
const BlockSummaryGrid: React.FC<{ blocks: DocumentBlock[]; onSelectBlock: (id: string) => void }> = ({ blocks, onSelectBlock }) => {
  return (
    <div className="space-y-6">
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Resumen de Bloques del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Seleccione un bloque de la cuadrícula para ver su contenido detallado y las sugerencias de mejora.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block) => (
              <Card 
                key={block.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectBlock(block.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText size={20} className="text-primary" /> 
                      {block.name}
                    </span>
                    <SeverityIndicator level={block.alertLevel} size={5}/>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Categoría: {block.category}</p>
                  <div className="mt-2">
                    <span className="text-xs font-semibold">Completitud: </span>
                    <span className={cn(
                      "font-bold text-sm",
                      block.completenessIndex < 5 ? "text-destructive" :
                      block.completenessIndex < 8 ? "text-custom-warning-yellow-DEFAULT" :
                      "text-green-600"
                    )}>
                      {block.completenessIndex} / {block.maxCompleteness}
                    </span>
                  </div>
                   <Button variant="outline" size="sm" className="w-full mt-4">
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

  // Auto-select first block if needed, or implement logic for initial grid view.
  // For now, let's keep it so user has to select from grid or nav.
  // useEffect(() => {
  //   if (blocks.length > 0 && !selectedBlockId) {
  //     setSelectedBlockId(blocks[0].id); 
  //   }
  // }, [blocks, selectedBlockId]);

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
        // This logic might need adjustment if un-applying is implemented
        // newCompletenessIndexForBlock = Math.max(0, blockToUpdate.completenessIndex - (suggestionToUpdate.completenessImpact || 0));
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
        <SidebarHeader className="p-2 border-b border-sidebar-border">
           <div className="flex items-center gap-2 p-2">
             <ListChecks className="h-6 w-6 text-sidebar-primary" />
             <h2 className="text-lg font-semibold text-sidebar-foreground">Navegación</h2>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <BlockNavigation
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
          />
        </SidebarContent>
      </Sidebar>
      
      {/* Main content area (Center + Right) */}
      <div className="flex flex-col h-screen md:pl-[var(--sidebar-width)] group-data-[state=collapsed]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding] duration-200 ease-linear">
        <PageHeader title={documentTitle} />
        <div className="flex flex-1 overflow-hidden">
          
          {/* Center Panel: Content or Block Summary Grid */}
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

          {/* Right Panel: Risks and Overall Scores */}
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
