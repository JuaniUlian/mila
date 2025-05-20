
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
import { FileText, Layers, ShieldAlert, ArrowLeft, ListChecks, Settings, UserCircle, Bell, Target } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

const BlockSummaryGrid: React.FC<{
  blocks: DocumentBlock[];
  onSelectBlock: (id: string) => void;
}> = ({ blocks, onSelectBlock }) => {
  return (
    <Card className="glass-card rounded-2xl shadow-xl border transition-all duration-200 ease-in-out w-full">
      <CardHeader className="p-4 md:p-5 text-center">
        <div className="flex flex-col items-center gap-2 mb-1">
          <Target size={32} className="text-primary mb-1" />
          <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2 text-foreground">
            Resumen de Bloques del Documento
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Seleccione un bloque para ver su análisis detallado y sugerencias de mejora.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {blocks.map((block) => {
            const blockRiskPercentage = 100 - (block.completenessIndex / block.maxCompleteness) * 100;
            let riskColorClass = 'text-[rgb(var(--custom-severity-low-fg-rgb))]'; // Default to low risk color
            if (blockRiskPercentage > 50) {
              riskColorClass = 'text-[rgb(var(--custom-severity-high-fg-rgb))]';
            } else if (blockRiskPercentage >= 25) {
              riskColorClass = 'text-custom-warning-yellow-foreground';
            }

            return (
              <Card
                key={block.id}
                className="glass-card rounded-2xl hover:shadow-2xl transition-all duration-200 ease-in-out cursor-pointer flex flex-col group"
                onClick={() => onSelectBlock(block.id)}
              >
                <CardHeader className="px-3 pt-3 pb-1 md:px-4 md:pt-4 md:pb-2">
                  <div className="flex items-center gap-2.5 mb-1">
                    <FileText size={18} className="text-technical-text-blue group-hover:text-accent/90 transition-colors" />
                    <CardTitle className="text-base font-semibold text-technical-text-blue group-hover:text-accent transition-colors">
                      {block.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-1 pb-2 px-3 md:px-4 text-xs space-y-1.5 flex-grow">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers size={14} />
                    <span>Categoría: {block.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <ShieldAlert size={14} className={riskColorClass} />
                     <span className={cn("font-medium", riskColorClass)}>
                       Riesgo: {blockRiskPercentage.toFixed(0)}%
                     </span>
                  </div>
                </CardContent>
                <CardContent className="pt-0 pb-3 px-3 md:px-4 md:pb-4 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs py-1.5 h-8 text-technical-text-blue group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-150"
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


export default function HomePage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'violet'>('light');
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const { blocks, overallComplianceScore, overallCompletenessIndex } = documentData;

  const handleSelectBlock = useCallback((id: string | null) => { // Allow null to go home
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
      let updatedBlocks = [...prevData.blocks];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevData;

      const blockToUpdate = { ...updatedBlocks[blockIndex] };
      const suggestionIndex = blockToUpdate.suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return prevData;

      const suggestionToUpdate = { ...blockToUpdate.suggestions[suggestionIndex] };
      if (suggestionToUpdate.status === newStatus) return prevData; 

      let newCompletenessIndexForBlock = blockToUpdate.completenessIndex;
      if (suggestionToUpdate.status === 'pending' && newStatus === 'applied' && suggestionToUpdate.completenessImpact) {
        newCompletenessIndexForBlock = Math.min(blockToUpdate.maxCompleteness, blockToUpdate.completenessIndex + (suggestionToUpdate.completenessImpact || 0));
      } else if (suggestionToUpdate.status === 'applied' && (newStatus === 'pending' || newStatus === 'discarded') && suggestionToUpdate.completenessImpact) {
        newCompletenessIndexForBlock = Math.max(0, blockToUpdate.completenessIndex - (suggestionToUpdate.completenessImpact || 0));
      }
      
      suggestionToUpdate.status = newStatus;
      blockToUpdate.suggestions = [...blockToUpdate.suggestions];
      blockToUpdate.suggestions[suggestionIndex] = suggestionToUpdate;
      blockToUpdate.completenessIndex = newCompletenessIndexForBlock;
      
      updatedBlocks[blockIndex] = blockToUpdate;

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
        
        <header className="glass-card rounded-full flex items-center justify-end h-14 px-4 md:px-6 my-2 mx-4 md:mx-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent/20 rounded-full">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent/20 rounded-full">
              <Settings size={20} />
            </Button>
            <UserCircle size={28} className="text-foreground" /> {/* Placeholder for user avatar */}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-5 bg-transparent">
            {selectedBlock ? (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-3 md:mb-4 px-1">Detalle del Bloque: {selectedBlock.name}</h1>
                <ContentPanel
                  block={selectedBlock}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onUpdateSuggestionText={handleUpdateSuggestionText}
                />
              </>
            ) : (
              <BlockSummaryGrid blocks={blocks} onSelectBlock={handleSelectBlock} />
            )}
          </main>

          <aside className="w-full shrink-0 md:w-[320px] lg:w-[300px] xl:w-[340px] border-l border-[rgba(var(--border-rgb),0.2)] bg-[hsla(var(--card-rgb),var(--card-alpha))] backdrop-blur-lg text-card-foreground overflow-y-auto shadow-lg transition-all duration-200 ease-in-out">
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
