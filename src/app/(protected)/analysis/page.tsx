
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLayout } from '@/context/LayoutContext';
import { PageHeader } from '@/components/mila/page-header';
import { IncidentsList } from '@/components/mila/incidents-list';
import { RisksPanel } from '@/components/mila/risks-panel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { 
  calculateDynamicComplianceScore, 
  simulateScoreChange,
  getRiskCategory,
  generateScoringReport,
  type FindingWithStatus,
  type FindingStatus 
} from '@/ai/flows/compliance-scoring';

export default function PlanillaVivaPage() {
  const router = useRouter();
  const [documentName, setDocumentName] = useState('');
  const [findings, setFindings] = useState<FindingWithStatus[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCorrectedDocModalOpen, setIsCorrectedDocModalOpen] = useState(false);
  const { toast } = useToast();
  const { setScore, setIsInitialPageLoad } = useLayout();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const [currentScoring, setCurrentScoring] = useState<{
    complianceScore: number;
    legalRiskScore: number;
    riskCategory: ReturnType<typeof getRiskCategory>;
    progress: ReturnType<typeof calculateDynamicComplianceScore>['progress'];
    breakdown: any;
  } | null>(null);
  
  const [initialScoring, setInitialScoring] = useState<any>(null);

  useEffect(() => {
    setIsInitialPageLoad(true);
    
    try {
      const storedData = localStorage.getItem('validation-results');
      if (!storedData) {
        toast({ title: "Error", description: "No se encontraron datos de análisis.", variant: "destructive" });
        router.push('/prepare');
        return;
      }
      const data = JSON.parse(storedData);
      setDocumentName(data.documentName || 'Documento sin título');
      
      const findingsWithStatus = data.findings || [];
      setFindings(findingsWithStatus);
      
      const initialScoringData = data.initialScoring || calculateDynamicComplianceScore(findingsWithStatus.filter((f:FindingWithStatus) => f.status === 'pending'));
      setInitialScoring(initialScoringData);
      
      updateScoring(findingsWithStatus);
    } catch (e) {
      console.error("Failed to parse analysis data from localStorage", e);
      toast({ title: "Error", description: "Los datos de análisis están corruptos.", variant: "destructive" });
      router.push('/prepare');
    }

    const timer = setTimeout(() => setIsInitialPageLoad(false), 500);
    return () => clearTimeout(timer);
  }, [router, setIsInitialPageLoad, toast]);

  const updateScoring = useCallback((currentFindings: FindingWithStatus[]) => {
    const result = calculateDynamicComplianceScore(currentFindings);
    const riskCategory = getRiskCategory(result.complianceScore);
    
    const newScoring = {
      complianceScore: result.complianceScore,
      legalRiskScore: result.legalRiskScore,
      riskCategory,
      progress: result.progress,
      breakdown: result.breakdown,
    };
    
    setCurrentScoring(newScoring);
    setScore(newScoring.complianceScore);
  }, [setScore]);

  const handleUpdateFinding = useCallback((findingId: string, newStatus: FindingStatus, userModifications?: any) => {
    const impact = simulateScoreChange(findings, findingId, newStatus);
    
    const updatedFindings = findings.map(f => {
      if (f.id === findingId) {
        const updatedFinding: FindingWithStatus = { ...f, status: newStatus };
        if(userModifications) {
            updatedFinding.userModifications = userModifications;
             if (newStatus === 'pending') {
              updatedFinding.status = 'modified';
            }
        }
        return updatedFinding;
      }
      return f;
    });

    setFindings(updatedFindings);
    updateScoring(updatedFindings);
    
    toast({
      title: "Puntaje actualizado",
      description: impact.impactDescription,
    });
    
    const currentData = JSON.parse(localStorage.getItem('validation-results') || '{}');
    localStorage.setItem('validation-results', JSON.stringify({ ...currentData, findings: updatedFindings }));

  }, [findings, toast, updateScoring]);

  const handleDownloadReport = () => {
    if (!currentScoring) return;
    try {
      const reportData = {
          documentTitle: documentName,
          findings: findings,
          scoringReport: generateScoringReport(findings)
      };

      localStorage.setItem('milaReportData', JSON.stringify(reportData));
      setIsReportModalOpen(true);
    } catch (error) {
      console.error("Failed to save report data", error);
      toast({ title: "Error al generar el informe", variant: "destructive" });
    }
  };
  
  if (!currentScoring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <div className="w-full flex flex-col p-4 md:p-6 lg:p-8 gap-6">
        <PageHeader 
          documentTitle={documentName}
          overallComplianceScore={currentScoring.complianceScore}
          appliedSuggestionsCount={currentScoring.progress.resolved}
          totalSuggestions={currentScoring.progress.total}
          isInitialPageLoad={false}
        />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 w-full h-full min-h-0">
              <IncidentsList 
                  findings={findings}
                  onFindingStatusChange={handleUpdateFinding}
              />
          </div>
          <div className="w-full h-full min-h-0">
               <RisksPanel
                  findings={findings}
                  documentName={documentName}
                  currentScoring={currentScoring}
                  onDownloadReport={handleDownloadReport}
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
    </>
  );
}
