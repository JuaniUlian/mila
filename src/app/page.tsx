
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import type { MilaAppPData, DocumentBlock, Suggestion } from '@/components/mila/types';

import { PageHeader } from '@/components/mila/page-header';
import { IncidentsList } from '@/components/mila/incidents-list';
import { RisksPanel } from '@/components/mila/risks-panel';

export default function PlanillaVivaPage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [hasCorrections, setHasCorrections] = useState<boolean>(false);
  const { toast } = useToast();

  const { documentTitle, blocks, overallComplianceScore, overallCompletenessIndex } = documentData;
  const allSuggestions = blocks.flatMap(block => block.suggestions.map(s => ({ ...s, blockId: block.id })));

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
      
      if (newStatus === 'applied' || newStatus === 'discarded') {
        setHasCorrections(true);
      }

      toast({
        title: `✅ Irregularidad ${newStatus === 'applied' ? 'Corregida' : 'Descartada'}`,
        description: "Riesgo actualizado.",
      });
      
      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newOverallCompleteness,
        overallComplianceScore: newOverallCompliance,
      };
    });
  }, [toast, recalculateOverallScores]);

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setDocumentData(prevData => {
       const updatedBlocks = prevData.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, text: newText, status: 'applied' } : suggestion 
            ),
          };
        }
        return block;
      });

       const blockToRecalculate = updatedBlocks.find(b => b.id === blockId);
       let newCompletenessIndexForBlock = blockToRecalculate?.completenessIndex ?? 0;
       if (blockToRecalculate) {
           const suggestion = blockToRecalculate.suggestions.find(s => s.id === suggestionId);
           if(suggestion?.completenessImpact) {
              newCompletenessIndexForBlock = Math.min(blockToRecalculate.maxCompleteness, newCompletenessIndexForBlock + suggestion.completenessImpact);
              blockToRecalculate.completenessIndex = newCompletenessIndexForBlock;
           }
       }

       const { overallCompletenessIndex: newOverallCompleteness, overallComplianceScore: newOverallCompliance } = recalculateOverallScores(updatedBlocks);
       
       setHasCorrections(true);

       toast({
        title: "Sugerencia Modificada y Aplicada",
        description: "El texto de la sugerencia ha sido actualizado y marcado como corregido.",
      });

      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newOverallCompleteness,
        overallComplianceScore: newOverallCompliance
      }
    });
  }, [toast, recalculateOverallScores]);


  // Adaptive Background Effect
  useEffect(() => {
    const root = document.documentElement;
    const score = overallComplianceScore; // 0-100

    // As score improves (increases), background becomes less red and more neutral/blue
    const stain1Hue = 0 + (score * 0.4); // From red (0) towards greenish (40)
    const stain1Alpha = Math.max(0.01, 0.1 - (score / 1500));
    
    const stain2Hue = 20 + (score * 0.5); // From orange-red (20) towards yellow-green (70)
    const stain2Alpha = Math.max(0.01, 0.08 - (score / 1800));

    // The neutral blue stain becomes slightly more prominent and shifts hue
    const stain3Hue = 220 + (score * 0.2); // from 220 to 240
    const stain3Alpha = Math.min(0.1, 0.05 + (score / 1500));

    root.style.setProperty('--stain-1-hue', `${stain1Hue}`);
    root.style.setProperty('--stain-1-alpha', `${stain1Alpha}`);
    root.style.setProperty('--stain-2-hue', `${stain2Hue}`);
    root.style.setProperty('--stain-2-alpha', `${stain2Alpha}`);
    root.style.setProperty('--stain-3-hue', `${stain3Hue}`);
    root.style.setProperty('--stain-3-alpha', `${stain3Alpha}`);

  }, [overallComplianceScore]);

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
      <PageHeader 
        documentTitle={documentTitle}
        overallCompletenessIndex={overallCompletenessIndex}
      />
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 w-full h-full min-h-0">
            <IncidentsList 
                suggestions={allSuggestions}
                blocks={blocks}
                onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                onUpdateSuggestionText={handleUpdateSuggestionText}
            />
        </div>
        <div className="w-full h-full min-h-0">
             <RisksPanel
                blocks={blocks}
                overallComplianceScore={overallComplianceScore}
                hasCorrections={hasCorrections}
            />
        </div>
      </main>
    </div>
  );
}
