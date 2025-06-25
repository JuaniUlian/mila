
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
  
  const allSuggestions = blocks.flatMap(block => 
    block.suggestions.map(s => ({ ...s, blockId: block.id }))
  );

  const recalculateOverallScores = useCallback((updatedBlocks: DocumentBlock[]): { overallCompletenessIndex: number, overallComplianceScore: number } => {
    let totalCompletenessAchieved = 0;
    let totalMaxCompleteness = 0;
    let sumOfBlockCompliancePercentages = 0;

    updatedBlocks.forEach(block => {
      totalCompletenessAchieved += block.completenessIndex;
      totalMaxCompleteness += block.maxCompleteness;
      const blockCompliance = block.maxCompleteness > 0 ? (block.completenessIndex / block.maxCompleteness) * 100 : 100; // Assume 100 if no suggestions
      sumOfBlockCompliancePercentages += blockCompliance;
    });

    const newOverallCompletenessIndex = totalMaxCompleteness > 0
      ? parseFloat(((totalCompletenessAchieved / totalMaxCompleteness) * 10).toFixed(1))
      : 10;

    const newOverallComplianceScore = updatedBlocks.length > 0
      ? parseFloat((sumOfBlockCompliancePercentages / updatedBlocks.length).toFixed(0))
      : 100;

    return {
      overallCompletenessIndex: Math.min(10, Math.max(0, newOverallCompletenessIndex)),
      overallComplianceScore: Math.min(100, Math.max(0, newOverallComplianceScore)),
    };
  }, []);

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

      const { overallCompletenessIndex: newOverallCompleteness, overallComplianceScore: newOverallCompliance } = recalculateOverallScores(updatedBlocks);
      
      setHasCorrections(true);

      toast({
        title: `✅ Irregularidad ${newStatus === 'applied' ? 'Corregida' : 'Descartada'}`,
        description: "El puntaje de cumplimiento ha sido actualizado.",
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

      const { overallCompletenessIndex: newOverallCompleteness, overallComplianceScore: newOverallCompliance } = recalculateOverallScores(updatedBlocks);
       
      setHasCorrections(true);

      toast({
        title: "Sugerencia Modificada y Aplicada",
        description: "El texto de la sugerencia ha sido actualizado y el puntaje recalculado.",
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
    document.body.classList.add('plantilla-viva-background');
    const root = document.documentElement;
    const score = overallComplianceScore; // 0-100

    // As score improves (increases), background transitions from Red -> Yellow -> Green -> Blue/White
    // Hue: 0 (Red) -> 60 (Yellow) -> 120 (Green) -> 200 (Light Blue)
    const hue = Math.min(120, score * 1.2); 
    const alpha = Math.max(0.02, 0.15 - (score / 1000));
    
    root.style.setProperty('--stain-1-hue', `${hue}`);
    root.style.setProperty('--stain-1-alpha', `${alpha}`);
    root.style.setProperty('--stain-2-hue', `${hue + 20}`);
    root.style.setProperty('--stain-2-alpha', `${alpha * 0.8}`);
    root.style.setProperty('--stain-3-hue', `${hue + 40}`);
    root.style.setProperty('--stain-3-alpha', `${alpha * 0.6}`);
    
    return () => {
        document.body.classList.remove('plantilla-viva-background');
    }
  }, [overallComplianceScore]);

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
      <PageHeader 
        documentTitle={documentTitle}
        overallComplianceScore={overallComplianceScore}
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
