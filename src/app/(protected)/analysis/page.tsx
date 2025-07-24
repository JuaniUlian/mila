
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockData as defaultMockData } from '@/components/mila/mock-data';
import { upsMockData } from '@/components/mila/mock-data-ups';
import type { MilaAppPData, DocumentBlock, Suggestion } from '@/components/mila/types';
import { useLayout } from '@/context/LayoutContext';

import { PageHeader } from '@/components/mila/page-header';
import { IncidentsList } from '@/components/mila/incidents-list';
import { RisksPanel } from '@/components/mila/risks-panel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';

// Define severity weights for score calculation
const severityWeights: { [key in Suggestion['severity']]: number } = {
  high: 3,
  medium: 2,
  low: 1,
};

export default function PlanillaVivaPage() {
  const [initialData, setInitialData] = useState<MilaAppPData | null>(null);
  const [documentData, setDocumentData] = useState<MilaAppPData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCorrectedDocModalOpen, setIsCorrectedDocModalOpen] = useState(false);
  const [appliedChangesExist, setAppliedChangesExist] = useState(false);
  const { toast } = useToast();
  const { score, setScore, isInitialPageLoad, setIsInitialPageLoad } = useLayout();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [selectedRegulations, setSelectedRegulations] = useState<{name: string, content: string}[]>([]);

  useEffect(() => {
    // Set initial state to true when component mounts
    setIsInitialPageLoad(true);
    const timer = setTimeout(() => {
      setIsInitialPageLoad(false);
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      // Reset to true when leaving the page to ensure transition runs again
      setIsInitialPageLoad(true); 
    };
  }, [setIsInitialPageLoad]);

  useEffect(() => {
    document.title = 'MILA | Más Inteligencia Legal y Administrativa';
    
    let dataToLoad: MilaAppPData | null = null;
    
    // PRIMARY: Try to load fully processed data from the loading page
    const analysisDataRaw = localStorage.getItem('milaAnalysisData');
    if (analysisDataRaw) {
        try {
            dataToLoad = JSON.parse(analysisDataRaw);
            // Optional: clean up the data from localStorage after loading
            // localStorage.removeItem('milaAnalysisData');
        } catch (e) {
            console.error("Failed to parse analysis data from localStorage", e);
            dataToLoad = null;
        }
    }

    // FALLBACK: If no processed data, use the old mock data logic
    if (!dataToLoad) {
        console.warn("No processed analysis data found, falling back to mock data.");
        const savedFileName = localStorage.getItem('selectedDocumentName');
        const savedDocumentContent = localStorage.getItem('selectedDocumentContent');
        const savedRegulationsRaw = localStorage.getItem('selectedRegulations');
        const regs: {name: string, content: string}[] = savedRegulationsRaw ? JSON.parse(savedRegulationsRaw) : [];
        setSelectedRegulations(regs);

        let mockDataToUse: MilaAppPData;

        if (savedFileName === '3118772 SERV RECAMBIO UPS 96 FJS (1)') {
          mockDataToUse = JSON.parse(JSON.stringify(upsMockData));
        } else {
          mockDataToUse = JSON.parse(JSON.stringify(defaultMockData));
        }
        
        if (savedDocumentContent && mockDataToUse.blocks.length > 0) {
            mockDataToUse.blocks.forEach(block => {
                block.originalText = savedDocumentContent;
            });
        }

        if (regs.length > 0) {
          let regulationIndex = 0;
          mockDataToUse.blocks.forEach(block => {
            block.suggestions.forEach(suggestion => {
              const selectedReg = regs[regulationIndex % regs.length];
              suggestion.appliedNorm = selectedReg.name;
              regulationIndex++;
            });
          });
        }

        if (savedFileName) {
            mockDataToUse.documentTitle = `${t('analysisPage.documentTitlePrefix')} ${savedFileName}`;
        }
        
        dataToLoad = mockDataToUse;
    }

    if (dataToLoad) {
      setInitialData(dataToLoad);
      setDocumentData(dataToLoad);
      // Determine if text changes exist on initial load
      const hasAppliedTextChanges = dataToLoad.blocks.some(block =>
        block.suggestions.some(suggestion => suggestion.status === 'applied' && suggestion.isEditable)
      );
      setAppliedChangesExist(hasAppliedTextChanges);
    }
  }, [t]);

  const totalSeverityWeight = useMemo(() => {
    if (!initialData) return 0;
    return initialData.blocks.reduce((total, block) => {
      return total + block.suggestions.reduce((blockTotal, suggestion) => {
        // Only count editable text suggestions towards the total potential score improvement
        if(suggestion.isEditable) {
            return blockTotal + (severityWeights[suggestion.severity] || 0);
        }
        return blockTotal;
      }, 0);
    }, 0);
  }, [initialData]);

  const recalculateScores = useCallback((updatedBlocks: DocumentBlock[]): { newComplianceScore: number, newCompletenessIndex: number } => {
    if (!initialData) return { newComplianceScore: 0, newCompletenessIndex: 0 };

    const baseScore = initialData.overallComplianceScore;
    const maxScore = 100;
    const pointsToGain = maxScore - baseScore;

    // Calculate compliance score based on severity of resolved TEXT-BASED suggestions
    let resolvedSeverityWeight = 0;
    updatedBlocks.forEach(block => {
      block.suggestions.forEach(suggestion => {
        if (suggestion.status === 'applied' && suggestion.isEditable) { // Only count applied text-based suggestions
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
  }, [totalSeverityWeight, initialData]);


  useEffect(() => {
    if (documentData) {
        setScore(documentData.overallComplianceScore);
    }
    // Cleanup function to reset the score when the page is left
    return () => {
      setScore(null);
    };
  }, [documentData, setScore]);

  const handleUpdateSuggestionStatus = useCallback((blockId: string, suggestionId: string, newStatus: Suggestion['status']) => {
    setDocumentData(prevData => {
      if (!prevData) return null;
      
      const updatedBlocks = [...prevData.blocks];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevData;

      const blockToUpdate = { ...updatedBlocks[blockIndex] };
      const suggestionIndex = blockToUpdate.suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return prevData;

      const suggestionToUpdate = { ...blockToUpdate.suggestions[suggestionIndex] };
      if (suggestionToUpdate.status === newStatus) return prevData; 

      suggestionToUpdate.status = newStatus;
      blockToUpdate.suggestions = [...blockToUpdate.suggestions];
      blockToUpdate.suggestions[suggestionIndex] = suggestionToUpdate;
      
      updatedBlocks[blockIndex] = blockToUpdate;

      // DO NOT recalculate score here. This action is for reporting status, not for changing compliance.
      return {
        ...prevData,
        blocks: updatedBlocks,
      };
    });
    
    if (newStatus === 'applied') {
      toast({
        title: t('analysisPage.toastSuggestionApplied'),
        description: "El estado de la sugerencia ha sido actualizado para el informe.",
      });
    } else if (newStatus === 'discarded') {
      toast({
        title: t('analysisPage.toastSuggestionDiscarded'),
        description: t('analysisPage.toastSuggestionHasBeenDiscarded'),
      });
    }

  }, [t, toast]);

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setDocumentData(prevData => {
      if (!prevData) return null;
      const updatedBlocks = [...prevData.blocks];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevData;

      const blockToUpdate = { ...updatedBlocks[blockIndex] };
      const suggestionIndex = blockToUpdate.suggestions.findIndex(s => s.id === suggestionId);
      if (suggestionIndex === -1) return prevData;

      const suggestionToUpdate = { ...blockToUpdate.suggestions[suggestionIndex] };

      // Only add to completeness if it's the first time being applied
      if (suggestionToUpdate.status === 'pending' && suggestionToUpdate.completenessImpact) {
        blockToUpdate.completenessIndex = Math.min(
          blockToUpdate.maxCompleteness, 
          blockToUpdate.completenessIndex + suggestionToUpdate.completenessImpact
        );
      }

      suggestionToUpdate.text = newText;
      suggestionToUpdate.status = 'applied';
      suggestionToUpdate.isEditable = true; // Ensure this is true after editing

      blockToUpdate.suggestions = [...blockToUpdate.suggestions];
      blockToUpdate.suggestions[suggestionIndex] = suggestionToUpdate;
      updatedBlocks[blockIndex] = blockToUpdate;

      const { newComplianceScore, newCompletenessIndex } = recalculateScores(updatedBlocks);

      return {
        ...prevData,
        blocks: updatedBlocks,
        overallCompletenessIndex: newCompletenessIndex,
        overallComplianceScore: newComplianceScore
      };
    });

    setAppliedChangesExist(true);
    toast({
      title: t('analysisPage.toastSuggestionModified'),
      description: t('analysisPage.toastSuggestionTextUpdated'),
    });
  }, [recalculateScores, t, toast]);


  const handleDownloadReport = () => {
    if (!documentData) return;
    try {
      localStorage.setItem('milaReportData', JSON.stringify(documentData));
      setIsReportModalOpen(true);
    } catch (error) {
      console.error("Failed to save report data to localStorage", error);
      toast({
        title: t('analysisPage.toastReportError'),
        description: t('analysisPage.toastReportErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const handleDownloadCorrectedDocument = () => {
    if (!documentData) return;
    try {
      localStorage.setItem('milaCorrectedDocData', JSON.stringify(documentData));
      setIsCorrectedDocModalOpen(true);
    } catch (error) {
      console.error("Failed to save corrected doc data to localStorage", error);
      toast({
        title: t('analysisPage.toastReportError'),
        description: t('analysisPage.toastReportErrorDesc'),
        variant: "destructive",
      });
    }
  };

  if (!documentData || !initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const { documentTitle, blocks, overallComplianceScore } = documentData;
  
  const allSuggestions = blocks.flatMap(block => 
    block.suggestions.map(s => ({ ...s, blockId: block.id }))
  );
  const totalSuggestions = allSuggestions.length;
  const appliedSuggestionsCount = allSuggestions.filter(s => s.status === 'applied').length;

  return (
    <>
      <div className="w-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
        <PageHeader 
          documentTitle={documentTitle}
          overallComplianceScore={overallComplianceScore}
          appliedSuggestionsCount={appliedSuggestionsCount}
          totalSuggestions={totalSuggestions}
          isInitialPageLoad={isInitialPageLoad}
        />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 w-full h-full min-h-0">
              <IncidentsList 
                  suggestions={allSuggestions}
                  blocks={blocks}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onUpdateSuggestionText={handleUpdateSuggestionText}
                  overallComplianceScore={overallComplianceScore}
                  selectedRegulations={selectedRegulations}
              />
          </div>
          <div className="w-full h-full min-h-0">
               <RisksPanel
                  documentData={documentData}
                  onDownloadReport={handleDownloadReport}
                  appliedChangesExist={appliedChangesExist}
                  onDownloadCorrectedDocument={handleDownloadCorrectedDocument}
              />
          </div>
        </main>
      </div>
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-lg">
          <DialogHeader className="p-4 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 backdrop-blur-sm border-b border-white/20 shadow-md">
            <DialogTitle>{t('analysisPage.reportPreviewTitle')}</DialogTitle>
          </DialogHeader>
          <iframe src="/report-preview" className="w-full h-full border-0" title={t('analysisPage.reportPreviewTitle')} />
        </DialogContent>
      </Dialog>

      <Dialog open={isCorrectedDocModalOpen} onOpenChange={setIsCorrectedDocModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-lg">
          <DialogHeader className="p-4 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 backdrop-blur-sm border-b border-white/20 shadow-md">
            <DialogTitle>{t('analysisPage.correctedDocPreviewTitle')}</DialogTitle>
          </DialogHeader>
          <iframe src="/corrected-doc-preview" className="w-full h-full border-0" title={t('analysisPage.correctedDocPreviewTitle')} />
        </DialogContent>
      </Dialog>
    </>
  );
}
