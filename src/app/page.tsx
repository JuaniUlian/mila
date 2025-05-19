
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { FileText, Target, ShieldAlert, Layers, Home, ListChecks, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

const getBlockRiskColorClasses = (riskPercentage: number): string => {
  if (riskPercentage < 25) return 'text-green-400'; 
  if (riskPercentage <= 50) return 'text-yellow-400'; 
  return 'text-red-400';
};

const BlockSummaryGrid: React.FC<{ blocks: DocumentBlock[]; onSelectBlock: (id: string) => void }> = ({ blocks, onSelectBlock }) => {
  return (
    <div className="space-y-4">
       <Card className="glass-card rounded-2xl transition-all duration-200 ease-in-out hover:shadow-2xl">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2 text-foreground"> {/* Adjusted title size */}
            <Target className="h-7 w-7 text-accent" /> {/* Adjusted icon size */}
            Resumen de Bloques del Documento
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2 mb-6 text-center"> {/* Adjusted text and margin */}
            Seleccione un bloque para ver su contenido detallado y las sugerencias de mejora, o navegue usando el panel izquierdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"> {/* Adjusted gap */}
            {blocks.map((block) => {
              const compliancePercentage = block.maxCompleteness > 0 ? (block.completenessIndex / block.maxCompleteness) * 100 : 0;
              const blockRiskPercentage = parseFloat((100 - compliancePercentage).toFixed(0));
              const riskColorClass = getBlockRiskColorClasses(blockRiskPercentage);

              return (
                <Card
                  key={block.id}
                  className="glass-card rounded-xl hover:shadow-2xl transition-all duration-200 ease-in-out cursor-pointer flex flex-col group" // Changed to rounded-xl
                  onClick={() => onSelectBlock(block.id)}
                >
                  <CardHeader className="flex-grow pb-1 px-4 pt-4"> {/* Adjusted padding */}
                    <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground group-hover:text-accent transition-colors"> {/* Adjusted title size */}
                      <span className="flex items-center gap-2 text-foreground group-hover:text-accent"> {/* Text to foreground, icon size adjusted */}
                        <FileText size={20} className="transition-colors" />
                        {block.name}
                      </span>
                      <SeverityIndicator level={block.alertLevel} size={5}/> {/* Adjusted size */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-2 pb-3 px-4"> {/* Adjusted padding */}
                    <p className="text-sm text-muted-foreground mb-2">Categoría: {block.category}</p> {/* Adjusted text size and margin */}
                    <div className="flex items-baseline gap-1.5 mt-1"> {/* Adjusted gap */}
                      <ShieldAlert size={16} className={cn("transition-colors", riskColorClass)}/> {/* Adjusted icon size */}
                      <span className="text-sm font-medium text-muted-foreground">Riesgo: </span> 
                      <span className={cn("font-semibold text-base transition-colors", riskColorClass)}> {/* Adjusted text size */}
                        {blockRiskPercentage}%
                      </span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 pb-4 px-4"> {/* Adjusted padding */}
                     <Button variant="outline" size="default" className="w-full mt-auto text-accent hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors duration-150 text-sm py-2 group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10 rounded-lg"> {/* Adjusted button text size and padding, added rounded-lg */}
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

  // Apply dark theme by default
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.add('dark');
    }
  }, []);

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
        <SidebarHeader className="p-3 border-b border-sidebar-border/30 flex flex-col items-start glass-sidebar-header-footer"> {/* Reduced border opacity */}
           <div className="flex items-center gap-2.5 p-1 mb-2 w-full"> {/* mb adjusted, w-full */}
            <Logo /> 
            <span className="text-lg font-semibold text-sidebar-foreground ml-1">Mila</span> {/* App name */}
             <SidebarTrigger className="md:hidden ml-auto" /> 
           </div>
           {selectedBlockId && (
             <Button 
                variant="ghost" 
                onClick={handleGoHome} 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-medium mt-1 transition-colors duration-150 ease-in-out rounded-md h-9 px-3" // Adjusted size
              >
                <ArrowLeft size={16} className="mr-2" />
                Volver al Resumen
             </Button>
            )}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <BlockNavigation
            onGoHome={handleGoHome}
            isHomeActive={selectedBlockId === null}
          />
        </SidebarContent>
         <SidebarFooter className="p-3 mt-auto border-t border-sidebar-border/30 glass-sidebar-header-footer"> {/* Reduced border opacity */}
            <Button variant="outline" className="w-full border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 rounded-lg h-9 px-3"> {/* Adjusted size */}
                <ListChecks className="mr-2 h-4 w-4" />
                Opciones
            </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col h-screen md:pl-[var(--sidebar-width)] group-data-[state=collapsed]/sidebar-wrapper:md:pl-[var(--sidebar-width-icon)] transition-[padding] duration-200 ease-linear">
        {/* Optional: Add a Top Bar here if needed for global actions / user profile, matching the image */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-4 space-y-6 bg-transparent"> {/* Increased space-y */}
            {selectedBlock ? (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-2">Detalle del Bloque: {selectedBlock.name}</h1>
                <ContentPanel
                  block={selectedBlock}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onUpdateSuggestionText={handleUpdateSuggestionText}
                />
              </>
            ) : (
              <>
                {/* <h1 className="text-2xl font-bold text-foreground mb-0">Dashboard</h1> */}
                <BlockSummaryGrid blocks={blocks} onSelectBlock={handleSelectBlock} />
              </>
            )}
          </main>

          <aside className="w-full shrink-0 md:w-[320px] lg:w-[300px] xl:w-[340px] border-l border-[hsla(var(--border),0.2)] bg-[hsla(var(--card),0.55)] backdrop-blur-xl text-card-foreground overflow-y-auto shadow-2xl transition-all duration-200 ease-in-out"> {/* Increased blur and shadow */}
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

