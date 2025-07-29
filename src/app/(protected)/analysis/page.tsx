
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLayout } from '@/context/LayoutContext';
import { PageHeader } from '@/components/mila/page-header';
import { IncidentsList } from '@/components/mila/incidents-list';
import { RisksPanel } from '@/components/mila/risks-panel';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { 
  calculateDynamicComplianceScore, 
  getRiskCategory,
  generateScoringReport,
  type FindingWithStatus,
  type FindingStatus 
} from '@/ai/flows/compliance-scoring';

function determineCategory(finding: any): string {
  const titulo = finding.titulo_incidencia.toLowerCase();
  const justificacion = finding.justificacion_legal.toLowerCase();
  const tecnica = finding.justificacion_tecnica.toLowerCase();
  const evidencia = finding.evidencia.toLowerCase();
  
  // Combinar todo el texto para análisis más preciso
  const allText = `${titulo} ${justificacion} ${tecnica} ${evidencia}`.toLowerCase();
  
  // 1. LEGAL - Irregularidades normativas, legales, constitucionales
  if (allText.match(/\b(ley|legal|artículo|decreto|norma|constitucional|jurisprudencia|normativ|reglament|jurídic|ilegal|inconstitucional|violación|incumplimiento normativo)\b/) ||
      finding.tipo === 'Irregularidad' && allText.match(/\b(base legal|fundamentación|marco legal|competencia|atribución)\b/)) {
    return 'Legal';
  }
  
  // 2. PROCEDIMENTAL - Procedimientos, trámites, etapas, plazos
  if (allText.match(/\b(procedimiento|trámite|proceso|etapa|fase|plazo|término|notificación|audiencia|consulta|dictamen|informe técnico|estudio|evaluación previa|secuencia)\b/) ||
      allText.match(/\b(debido proceso|procedimiento administrativo|expediente|actuación|resolución|decisión)\b/)) {
    return 'Procedimental';
  }
  
  // 3. ADMINISTRATIVA - Gestión administrativa, registros, archivos
  if (allText.match(/\b(administrativ|gestión|expediente|archivo|registro|documentación|comunicación|organización|control|supervisión|seguimiento)\b/) ||
      allText.match(/\b(órgano|entidad|funcionario|servidor público|competencia administrativa|acto administrativo)\b/)) {
    return 'Administrativa';
  }
  
  // 4. FORMAL - Formato, estructura, firma, membrete, presentación
  if (allText.match(/\b(forma|formato|estructura|encabezado|membrete|firma|sello|presentación|apariencia|diseño|layout)\b/) ||
      allText.match(/\b(formal|formalidad|requisito formal|aspecto formal|elemento formal)\b/) ||
      titulo.match(/\b(falta|ausencia|carece|sin).*(firma|sello|membrete|encabezado|formato)\b/)) {
    return 'Formal';
  }
  
  // 5. TÉCNICA - Especificaciones técnicas, cálculos, mediciones, presupuestos
  if (allText.match(/\b(técnic|especificación|cálculo|medición|presupuesto|costo|evaluación técnica|criterio técnico|parámetro|estándar técnico)\b/) ||
      allText.match(/\b(ingeniería|arquitectura|construcción|obra|proyecto técnico|diseño técnico|análisis técnico)\b/) ||
      allText.match(/\b(requisito técnico|capacidad técnica|propuesta técnica|evaluación técnica)\b/)) {
    return 'Técnica';
  }
  
  // 6. REDACCIÓN - Mejoras de redacción, claridad, ambigüedad, gramática
  if (finding.tipo === 'Mejora de Redacción' || 
      allText.match(/\b(redacción|redactar|claridad|ambig|confus|imprecis|ortograf|gramática|sintaxis|estilo|lenguaje)\b/) ||
      allText.match(/\b(texto|párrafo|oración|frase|palabra|terminología|vocabulario|expresión)\b/) ||
      titulo.match(/\b(mejora|mejorar|clarificar|precisar|corregir).*(redacción|texto|lenguaje)\b/)) {
    return 'Redacción';
  }
  
  // FALLBACK: Si no encaja en ninguna categoría específica
  switch (finding.tipo) {
    case 'Irregularidad':
      return 'Legal';
    case 'Mejora de Redacción':
      return 'Redacción';
    case 'Sin hallazgos relevantes':
      return 'Informativo';
    default:
      return 'Administrativa';
  }
}


export default function PlanillaVivaPage() {
  const router = useRouter();
  const [documentName, setDocumentName] = useState('');
  const [findings, setFindings] = useState<FindingWithStatus[]>([]);
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
      
      const findingsWithStatus = (data.findings || []).map((f: any) => ({
          ...f,
          category: determineCategory(f)
      }));

      setFindings(findingsWithStatus);
      
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
    const updatedFindings = findings.map(f => {
      if (f.id === findingId) {
        const updatedFinding: FindingWithStatus = { ...f, status: newStatus };
        if (userModifications) {
          updatedFinding.userModifications = userModifications;
          if (newStatus !== 'discarded') {
            updatedFinding.status = 'modified';
          }
        }
        return updatedFinding;
      }
      return f;
    });

    // Update state first
    setFindings(updatedFindings);
    updateScoring(updatedFindings);
    
    // Then handle side effects like localStorage and toasts
    try {
        const currentData = JSON.parse(localStorage.getItem('validation-results') || '{}');
        localStorage.setItem('validation-results', JSON.stringify({ ...currentData, findings: updatedFindings }));
    } catch (e) {
        console.error("Failed to update localStorage", e);
    }

    let toastTitle = "Sugerencia actualizada";
    if (newStatus === 'applied' || newStatus === 'modified') {
      toastTitle = "Sugerencia aplicada";
    } else if (newStatus === 'discarded') {
      toastTitle = "Sugerencia descartada";
    }

    toast({
      title: toastTitle,
    });
  }, [findings, toast, updateScoring]);

  const handleDownloadReport = (type: 'current' | 'original' | 'audit') => {
    if (!currentScoring) return;

    let reportData: any;
    let toastTitle = "Preparando informe";
    let toastDescription = "La previsualización del informe se abrirá en una nueva pestaña.";

    try {
        switch (type) {
            case 'current':
                reportData = {
                    documentTitle: `${documentName} - Informe de Progreso`,
                    findings: findings,
                    scoringReport: generateScoringReport(findings)
                };
                toastTitle = "Preparando Informe de Progreso";
                break;
            
            case 'original':
                const originalFindings = findings.map(f => ({ ...f, status: 'pending' as const, userModifications: undefined }));
                 reportData = {
                    documentTitle: `${documentName} - Informe Original de IA`,
                    findings: originalFindings,
                    scoringReport: generateScoringReport(originalFindings)
                };
                toastTitle = "Preparando Informe Original";
                break;

            case 'audit':
                const resolvedFindings = findings.filter(f => f.status === 'applied' || f.status === 'modified');
                if (resolvedFindings.length === 0) {
                    toast({ title: "Sin acciones", description: "No hay sugerencias aplicadas para reportar." });
                    return;
                }
                reportData = {
                    documentTitle: `Informe de Auditoría - ${documentName}`,
                    findings: resolvedFindings,
                    scoringReport: generateScoringReport(resolvedFindings)
                };
                toastTitle = "Preparando Informe de Auditoría";
                break;
        }
        
        localStorage.setItem('milaReportData', JSON.stringify(reportData));
        toast({ title: toastTitle, description: toastDescription });
        window.open('/report-preview', '_blank');

    } catch (error) {
        console.error(`Failed to save ${type} report data`, error);
        toast({ title: `Error al generar el informe de ${type}`, variant: "destructive" });
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
    </>
  );
}
