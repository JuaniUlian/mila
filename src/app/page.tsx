
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import type { MilaAppPData, DocumentBlock, Suggestion } from '@/components/mila/types';
import { useLayout } from '@/context/LayoutContext';

import { PageHeader } from '@/components/mila/page-header';
import { IncidentsList } from '@/components/mila/incidents-list';
import { RisksPanel } from '@/components/mila/risks-panel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Define severity weights for score calculation
const severityWeights: { [key in Suggestion['severity']]: number } = {
  high: 3,
  medium: 2,
  low: 1,
};

export default function PlanillaVivaPage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { toast } = useToast();
  const { setScore } = useLayout();

  const { documentTitle, blocks, overallComplianceScore } = documentData;

  useEffect(() => {
    setScore(overallComplianceScore);
    // Cleanup function to reset the score when the page is left
    return () => {
      setScore(null);
    };
  }, [overallComplianceScore, setScore]);
  
  // Calculate total possible severity weight from all suggestions in the initial data
  const totalSeverityWeight = useMemo(() => {
    return initialMockData.blocks.reduce((total, block) => {
      return total + block.suggestions.reduce((blockTotal, suggestion) => {
        return blockTotal + (severityWeights[suggestion.severity] || 0);
      }, 0);
    }, 0);
  }, []);

  const allSuggestions = useMemo(() => blocks.flatMap(block => 
    block.suggestions.map(s => ({ ...s, blockId: block.id }))
  ), [blocks]);

  const totalSuggestions = useMemo(() => allSuggestions.length, [allSuggestions]);
  const appliedSuggestionsCount = useMemo(() => allSuggestions.filter(s => s.status === 'applied').length, [allSuggestions]);

  const getDynamicBackgroundClass = useCallback((score: number): string => {
    if (score < 40) return 'from-rose-900/50 via-rose-100/50 to-white'; // Dark Red for very low scores
    if (score < 60) return 'from-orange-600/50 via-orange-100/50 to-white'; // Orange for low scores
    if (score < 75) return 'from-amber-500/50 via-amber-100/50 to-white'; // Yellow for medium scores
    if (score < 85) return 'from-lime-600/50 via-lime-100/50 to-white'; // Green for good scores
    if (score < 95) return 'from-sky-600/50 via-sky-100/50 to-white'; // Light Blue for very good scores
    return 'from-slate-200/50 via-slate-100/50 to-white'; // Almost white for excellent scores
  }, []);

  const backgroundClass = useMemo(() => getDynamicBackgroundClass(overallComplianceScore), [overallComplianceScore, getDynamicBackgroundClass]);

  const recalculateScores = useCallback((updatedBlocks: DocumentBlock[]): { newComplianceScore: number, newCompletenessIndex: number } => {
    const baseScore = initialMockData.overallComplianceScore; // Start from the initial score
    const maxScore = 100;
    const pointsToGain = maxScore - baseScore;

    // Calculate compliance score based on severity
    let resolvedSeverityWeight = 0;
    updatedBlocks.forEach(block => {
      block.suggestions.forEach(suggestion => {
        // "resolved" means applied or discarded
        if (suggestion.status !== 'pending') {
          resolvedSeverityWeight += severityWeights[suggestion.severity] || 0;
        }
      });
    });
    
    const complianceScore = totalSeverityWeight > 0
      ? baseScore + (resolvedSeverityWeight / totalSeverityWeight) * pointsToGain
      : maxScore;
      
    const newComplianceScore = Math.min(maxScore, Math.round(complianceScore));

    // Keep the original completeness index calculation
    let totalCompletenessAchieved = 0;
    let totalMaxCompleteness = 0;
    updatedBlocks.forEach(block => {
      totalCompletenessAchieved += block.completenessIndex;
      totalMaxCompleteness += block.maxCompleteness;
    });

    const newCompletenessIndex = totalMaxCompleteness > 0
      ? parseFloat(((totalCompletenessAchieved / totalMaxCompleteness) * 10).toFixed(1))
      : 10;

    return {
      newComplianceScore,
      newCompletenessIndex: Math.min(10, Math.max(0, newCompletenessIndex)),
    };

  }, [totalSeverityWeight]);

  const handleUpdateSuggestionStatus = useCallback((blockId: string, suggestionId: string, newStatus: Suggestion['status']) => {
    setDocumentData(prevData => {
      const updatedBlocks = [...prevData.blocks];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevData;

      const blockToUpdate = { ...updatedBlocks[blockIndex] };
      const suggestionIndex = blockToUpdate.suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return prevData;

      const suggestionToUpdate = { ...blockToUpdate.suggestions[suggestionIndex] };
      if (suggestionToUpdate.status === newStatus) return prevData; 

      // Only update completeness if a pending suggestion is applied
      if (suggestionToUpdate.status === 'pending' && newStatus === 'applied' && suggestionToUpdate.completenessImpact) {
        blockToUpdate.completenessIndex = Math.min(
          blockToUpdate.maxCompleteness, 
          blockToUpdate.completenessIndex + suggestionToUpdate.completenessImpact
        );
      }
      
      suggestionToUpdate.status = newStatus;
      blockToUpdate.suggestions = [...blockToUpdate.suggestions];
      blockToUpdate.suggestions[suggestionIndex] = suggestionToUpdate;
      
      updatedBlocks[blockIndex] = blockToUpdate;

      const { newComplianceScore, newCompletenessIndex } = recalculateScores(updatedBlocks);
      
      toast({
        title: `✅ Irregularidad ${newStatus === 'applied' ? 'Corregida' : 'Descartada'}`,
        description: "El puntaje de cumplimiento ha sido actualizado.",
      });
      
      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newCompletenessIndex,
        overallComplianceScore: newComplianceScore,
      };
    });
  }, [toast, recalculateScores]);

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setDocumentData(prevData => {
      const updatedBlocks = [...prevData.blocks];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevData;

      const blockToUpdate = { ...updatedBlocks[blockIndex] };
      const suggestionIndex = blockToUpdate.suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return prevData;

      const suggestionToUpdate = { ...blockToUpdate.suggestions[suggestionIndex] };

      // Apply completeness impact only if it was pending before this edit
      if (suggestionToUpdate.status === 'pending' && suggestionToUpdate.completenessImpact) {
        blockToUpdate.completenessIndex = Math.min(
          blockToUpdate.maxCompleteness, 
          blockToUpdate.completenessIndex + suggestionToUpdate.completenessImpact
        );
      }

      suggestionToUpdate.text = newText;
      suggestionToUpdate.status = 'applied'; // Editing and saving applies the change

      blockToUpdate.suggestions = [...blockToUpdate.suggestions];
      blockToUpdate.suggestions[suggestionIndex] = suggestionToUpdate;
      updatedBlocks[blockIndex] = blockToUpdate;

      const { newComplianceScore, newCompletenessIndex } = recalculateScores(updatedBlocks);
       
      toast({
        title: "Sugerencia Modificada y Aplicada",
        description: "El texto de la sugerencia ha sido actualizado y el puntaje recalculado.",
      });

      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newCompletenessIndex,
        overallComplianceScore: newComplianceScore
      }
    });
  }, [toast, recalculateScores]);

  const handleDownloadReport = () => {
    try {
      localStorage.setItem('milaReportData', JSON.stringify(documentData));
      setIsReportModalOpen(true);
    } catch (error) {
      console.error("Failed to save report data to localStorage", error);
      toast({
        title: "Error al generar el informe",
        description: "No se pudo guardar la información para la previsualización. Intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("bg-gradient-to-b transition-all duration-1000", backgroundClass)}>
      <div className="min-h-screen w-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
        <PageHeader 
          documentTitle={documentTitle}
          overallComplianceScore={overallComplianceScore}
          appliedSuggestionsCount={appliedSuggestionsCount}
          totalSuggestions={totalSuggestions}
        />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 w-full h-full min-h-0">
              <IncidentsList 
                  suggestions={allSuggestions}
                  blocks={blocks}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onUpdateSuggestionText={handleUpdateSuggestionText}
                  overallComplianceScore={overallComplianceScore}
              />
          </div>
          <div className="w-full h-full min-h-0">
               <RisksPanel
                  documentData={documentData}
                  onDownloadReport={handleDownloadReport}
              />
          </div>
        </main>
      </div>
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 border-0">
            <iframe src="/report-preview" className="w-full h-full border-0" title="Previsualización de Informe" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
