
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
      setFindings(data.findings || []);
      setInitialScoring(data.initialScoring);
      updateScoring(data.findings || []);
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

  const handleUpdateFinding = useCallback((findingId: string, newStatus: FindingStatus, newText?: string) => {
    const impact = simulateScoreChange(findings, findingId, newStatus);
    
    const updatedFindings = findings.map(f => {
      if (f.id === findingId) {
        const updatedFinding = { ...f, status: newStatus };
        if (newText !== undefined) {
          updatedFinding.propuesta_redaccion = newText;
          // Marcar como modificado si el texto cambia
          if (newStatus === 'applied') {
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
    
    // Persist changes
    const currentData = JSON.parse(localStorage.getItem('validation-results') || '{}');
    localStorage.setItem('validation-results', JSON.stringify({ ...currentData, findings: updatedFindings }));

  }, [findings, toast, updateScoring]);

  const handleDownloadReport = () => {
    if (!currentScoring) return;
    try {
      const reportData = {
          documentTitle: documentName,
          blocks: [], // Mantener la estructura, aunque no la usemos igual
          overallComplianceScore: currentScoring.complianceScore,
          overallCompletenessIndex: 0, // Dato obsoleto, pero se mantiene por compatibilidad
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

  const handleDownloadCorrectedDocument = () => {
    // Similar a handleDownloadReport, pero para el documento corregido.
    // Necesitaría una función que genere el texto final.
    toast({ title: "Función no implementada" });
  };
  
  if (!currentScoring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const allSuggestions = findings.map(finding => ({
      ...finding,
      blockId: 'main-block', // Usar un ID de bloque ficticio
      text: finding.propuesta_redaccion,
      proceduralSuggestion: finding.propuesta_procedimiento,
      justification: {
        legal: finding.justificacion_legal,
        technical: finding.justificacion_tecnica,
      },
      appliedNorm: `${finding.nombre_archivo_normativa} - ${finding.articulo_o_seccion}`,
      errorType: finding.titulo_incidencia,
      estimatedConsequence: finding.consecuencia_estimada,
      completenessImpact: 0,
      category: finding.tipo === "Irregularidad" ? 'Legal' : 'Redacción',
      isEditable: !!finding.propuesta_redaccion,
  }));
  
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
                  suggestions={allSuggestions}
                  blocks={[]}
                  selectedRegulations={[]}
                  onUpdateSuggestionStatus={(blockId, suggestionId, newStatus) => handleUpdateFinding(suggestionId, newStatus)}
                  onUpdateSuggestionText={(blockId, suggestionId, newText) => handleUpdateFinding(suggestionId, 'applied', newText)}
                  overallComplianceScore={currentScoring.complianceScore}
              />
          </div>
          <div className="w-full h-full min-h-0">
               <RisksPanel
                  documentData={{
                    documentTitle: documentName,
                    overallComplianceScore: currentScoring.complianceScore,
                    overallCompletenessIndex: 0,
                    blocks: findings.length > 0 ? [{
                        id: 'main', name: 'General', category: 'General', alertLevel: 'none',
                        completenessIndex: 0, maxCompleteness: 10, originalText: '',
                        suggestions: allSuggestions, alerts:[], missingConnections: [], applicableNorms: []
                    }] : []
                  }}
                  onDownloadReport={handleDownloadReport}
                  appliedChangesExist={findings.some(f => f.status === 'applied' || f.status === 'modified')}
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
