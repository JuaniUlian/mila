
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, FileText, Scale, AlertTriangle, 
  MessageSquare, HelpCircle, Wrench, Eye, Download,
  ChevronRight, X, Loader2, AlertOctagon, ShieldCheck, Send, Paperclip, ArrowLeft,
  FilePlus2, Shuffle, Briefcase
} from 'lucide-react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { calculateDynamicComplianceScore, generateScoringReport } from '@/ai/flows/compliance-scoring';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { useLayout } from '@/context/LayoutContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { type DiscussionMessage } from '@/ai/flows/discuss-finding';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/layout/logo';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

// Main Component
export default function AnalysisPage() {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [findings, setFindings] = useState<FindingWithStatus[]>([]);
  const [currentScoring, setCurrentScoring] = useState<any>(null);

  const [selectedFinding, setSelectedFinding] = useState<FindingWithStatus | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSeverity, setActiveSeverity] = useState('Todos');

  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { setScore, setIsInitialPageLoad } = useLayout();

  useEffect(() => {
    try {
      const storedResults = localStorage.getItem('validation-results');
      if (storedResults) {
        const results = JSON.parse(storedResults);
        setValidationResult(results);
        setFindings(results.findings || []);
        setIsInitialPageLoad(false); // Data is loaded, initial load is complete
      } else {
        toast({
          title: "Análisis no encontrado",
          description: "No se encontraron resultados de análisis. Redirigiendo a la página de preparación.",
          variant: "destructive",
        });
        router.push('/prepare');
      }
    } catch (error) {
      console.error("Error loading validation results:", error);
      toast({
        title: "Error al cargar",
        description: "No se pudieron cargar los resultados del análisis.",
        variant: "destructive",
      });
      router.push('/prepare');
    }
  }, [router, toast, setIsInitialPageLoad]);
  
  useEffect(() => {
    if (findings.length > 0) {
      const dynamicScores = calculateDynamicComplianceScore(findings);
      setCurrentScoring(dynamicScores);
      setScore(dynamicScores.complianceScore); // Update global score
    } else if (validationResult) {
       const dynamicScores = calculateDynamicComplianceScore([]);
       setCurrentScoring(dynamicScores);
       setScore(dynamicScores.complianceScore); // Update global score
    }
  }, [findings, validationResult, setScore]);

  const handleFindingStatusChange = useCallback((findingId: string, newStatus: FindingStatus) => {
    setFindings(prevFindings => {
        const newFindings = prevFindings.map(f => f.id === findingId ? { ...f, status: newStatus } : f);
        
        const dynamicScores = calculateDynamicComplianceScore(newFindings);
        setCurrentScoring(dynamicScores);
        setScore(dynamicScores.complianceScore);

        // Toast notification
        if (newStatus === 'applied' || newStatus === 'modified') {
            toast({
                title: t('analysisPage.toastSuggestionApplied'),
                description: t('analysisPage.toastComplianceUpdated'),
                variant: 'success'
            });
        } else if (newStatus === 'discarded') {
            toast({
                title: t('analysisPage.toastSuggestionDiscarded'),
                description: t('analysisPage.toastSuggestionHasBeenDiscarded'),
                variant: 'destructive'
            });
        }
        
        return newFindings;
    });
    setActiveModal(null);
  }, [t, toast, setScore]);

const handleDownloadReport = async () => {
    if (!validationResult || !currentScoring) return;

    const reportData = {
        documentTitle: validationResult.documentName,
        findings: findings,
        scoringReport: generateScoringReport(findings),
    };

    try {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Cargar el logo de MILA
        const logoUrl = '/logo/Logo MILA (sin fondo).png';
        const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.05); // Escalar el logo al 5%

        let y = height - 50;

        const drawText = (text: string, x: number, yPos: number, options: { font?: any, size?: number, color?: any } = {}) => {
            page.drawText(text, {
                x,
                y: yPos,
                font: options.font || font,
                size: options.size || 10,
                color: options.color || rgb(0, 0, 0),
            });
            return (options.size || 10) + 2; // Return line height
        };
        
        const drawWrappedText = (text: string, x: number, yPos: number, maxWidth: number, options: { font?: any, size?: number, color?: any } = {}) => {
            const size = options.size || 10;
            const currentFont = options.font || font;
            const words = text.replace(/\\n/g, ' \\n ').split(' ');
            let line = '';
            let totalHeight = 0;

            for (const word of words) {
                if (word === '\\n') {
                    drawText(line, x, yPos - totalHeight, options);
                    totalHeight += size + 2;
                    line = '';
                    continue;
                }
                const testLine = line + word + ' ';
                const testWidth = currentFont.widthOfTextAtSize(testLine, size);
                if (testWidth > maxWidth) {
                    drawText(line, x, yPos - totalHeight, options);
                    totalHeight += size + 2;
                    line = word + ' ';
                } else {
                    line = testLine;
                }
            }
            drawText(line, x, yPos - totalHeight, options);
            totalHeight += size + 2;
            return totalHeight;
        }
        
        // Dibujar el logo
        page.drawImage(logoImage, {
            x: width - 50 - logoDims.width,
            y: height - 30 - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
        });

        // Dibujar información del revisor
        const generationDate = new Date().toLocaleDateString();
        y -= drawText('Revisor: Juan Ignacio Ulian', 50, y, { font: font, size: 8 });
        y -= drawText('Dirección de Procurement - Gobierno de México', 50, y, { font: font, size: 8 });
        y -= drawText(`Fecha de Informe: ${generationDate}`, 50, y, { font: font, size: 8 });
        
        y -= 30; // Espacio adicional después del encabezado

        // Header
        y -= drawText('Informe de Análisis Normativo - MILA', 50, y, { font: boldFont, size: 18 });
        y -= 5;
        y -= drawText(reportData.documentTitle, 50, y, { font: boldFont, size: 14 });
        y -= 20;

        // Summary
        page.drawLine({ start: { x: 50, y: y }, end: { x: width - 50, y: y }, thickness: 1 });
        y -= 15;
        y -= drawText('Resumen General', 50, y, { font: boldFont, size: 14 });
        y -= 10;
        y -= drawText(`Puntaje de Cumplimiento: ${reportData.scoringReport.summary.complianceScore.toFixed(0)}/100`, 70, y, { size: 12 });
        y -= 15;
        y -= drawText(`Nivel de Riesgo: ${reportData.scoringReport.summary.riskCategory.label}`, 70, y, { size: 12 });
        y -= 15;
        y -= drawText(`Hallazgos: ${reportData.findings.length} totales (${reportData.scoringReport.summary.progress.pending} pendientes, ${reportData.scoringReport.summary.progress.resolved} resueltos)`, 70, y, { size: 12 });
        y -= 20;

        // Findings
        page.drawLine({ start: { x: 50, y: y }, end: { x: width - 50, y: y }, thickness: 1 });
        y -= 15;
        y -= drawText('Detalle de Hallazgos', 50, y, { font: boldFont, size: 14 });
        y -= 10;
        
        for (const finding of reportData.findings) {
            if (y < 250) { // Aumentar el umbral para asegurar más espacio
                page = pdfDoc.addPage();
                y = page.getSize().height - 50;
            }
            
            y -= 15;
            y -= drawText(`${finding.titulo_incidencia}`, 60, y, { font: boldFont, size: 12 });
            y -= 5;

            const severityColor = finding.gravedad === 'Alta' ? rgb(0.7, 0, 0) : finding.gravedad === 'Media' ? rgb(0.7, 0.4, 0) : rgb(0.1, 0.4, 0.7);
            const statusText = `Gravedad: ${finding.gravedad} | Estado: ${getTranslatedStatus(finding.status)}`;
            y -= drawText(statusText, 70, y, { font: font, size: 10, color: severityColor });
            y -= 10;
            
            y -= drawText('Evidencia:', 70, y, { font: boldFont, size: 10 });
            y -= drawWrappedText(`"${finding.evidencia}"`, 80, y, width - 140, { size: 9 });
            y -= 10;

            if (finding.propuesta_redaccion || finding.propuesta_procedimiento) {
                y -= drawText('Propuesta de Solución:', 70, y, { font: boldFont, size: 10 });
                if (finding.propuesta_redaccion) {
                    y -= drawWrappedText(`Redacción: ${finding.propuesta_redaccion}`, 80, y, width - 140, { size: 9 });
                }
                if (finding.propuesta_procedimiento) {
                    y -= drawWrappedText(`Procedimiento: ${finding.propuesta_procedimiento}`, 80, y, width - 140, { size: 9 });
                }
                y -= 10;
            }
            
            y -= drawText('Justificación Legal:', 70, y, { font: boldFont, size: 10 });
            y -= drawWrappedText(finding.justificacion_legal, 80, y, width - 140, { size: 9 });
            y -= 15;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `Informe-MILA-${reportData.documentTitle.replace(/ /g, '_')}.pdf`);

        toast({
            title: "Informe Generado",
            description: "El PDF del informe se está descargando.",
            variant: "success",
        });

    } catch (error) {
        console.error("Error generating PDF report:", error);
        toast({
            title: t('analysisPage.toastReportError'),
            description: "No se pudo generar el PDF. Por favor, intente de nuevo.",
            variant: "destructive",
        });
    }
};

  const severityFilters = useMemo(() => {
    if (!validationResult) return [];
    const allFindings = (validationResult.findings || []) as FindingWithStatus[];
    
    const counts = {
      'Alta': allFindings.filter(f => f.gravedad === 'Alta').length,
      'Media': allFindings.filter(f => f.gravedad === 'Media').length,
      'Baja': allFindings.filter(f => f.gravedad === 'Baja').length,
    };

    return [
      { name: 'Todos', count: allFindings.length, icon: Filter, color: 'text-gray-500' },
      { name: 'Alta', count: counts['Alta'], icon: AlertOctagon, color: 'text-red-500' },
      { name: 'Media', count: counts['Media'], icon: AlertTriangle, color: 'text-yellow-500' },
      { name: 'Baja', count: counts['Baja'], icon: ShieldCheck, color: 'text-blue-500' },
    ];
  }, [validationResult]);

  const filteredFindings = useMemo(() => {
    return (findings || []).filter(f => {
      const matchesSearch = f.titulo_incidencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            f.nombre_archivo_normativa.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = activeSeverity === 'Todos' || f.gravedad === activeSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [findings, searchTerm, activeSeverity]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Alta': return 'text-red-700 bg-red-100';
      case 'Media': return 'text-yellow-700 bg-yellow-100';
      case 'Baja': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-600";
    if (score < 80) return "text-amber-600";
    return "text-blue-600";
  };

  const getTranslatedStatus = (status: FindingStatus) => {
    const key = `reportPreviewPage.status.${status}`;
    // @ts-ignore
    const translated = t(key);
    // @ts-ignore
    return translated === key ? status : translated;
  };
  
  if (!validationResult || !currentScoring) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header simple */}
      <div className="glass-card m-4">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{validationResult.documentName}</h1>
            <div className="flex items-center space-x-8 text-sm">
              <div className="text-right w-48">
                <div className="text-gray-600 font-semibold">Cumplimiento</div>
                <div className={cn("text-3xl font-bold", getScoreColor(currentScoring.complianceScore))}>{currentScoring.complianceScore}%</div>
                <Progress value={currentScoring.complianceScore} className="h-2 mt-1" indicatorClassName={cn(
                  currentScoring.complianceScore < 50 && "bg-red-500",
                  currentScoring.complianceScore >= 50 && currentScoring.complianceScore < 80 && "bg-amber-500",
                  currentScoring.complianceScore >= 80 && "bg-blue-500"
                )} />
              </div>
              <div className="text-right">
                <div className="text-gray-600 font-semibold">Hallazgos pendientes</div>
                <div className="text-3xl font-bold text-amber-600">{currentScoring.progress.pending}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="glass-card p-4 mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Filtros por Gravedad</h3>
              <div className="space-y-1">
                {severityFilters.map((filter) => (
                  <button 
                    key={filter.name} 
                    onClick={() => setActiveSeverity(filter.name)} 
                    className={cn(
                      'w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors', 
                      activeSeverity === filter.name ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-200/50'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <filter.icon className={cn("w-4 h-4", filter.color)} />
                      <span>{filter.name}</span>
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs',
                      activeSeverity === filter.name ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    )}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar hallazgos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Lista principal */}
          <div className="col-span-6">
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div 
                  key={finding.id} 
                  className="glass-card p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{finding.titulo_incidencia}</h3>
                      <p className="text-sm text-gray-600">{finding.nombre_archivo_normativa}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        `px-2 py-1 text-xs font-semibold rounded`, 
                        getSeverityColor(finding.gravedad)
                      )}>
                        {finding.gravedad}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        {getTranslatedStatus(finding.status)}
                      </span>
                    </div>
                  </div>

                  <div className={cn(
                    "mb-4 p-3 bg-gray-50/80 rounded border-l-4",
                    finding.gravedad === 'Alta' && 'border-red-500',
                    finding.gravedad === 'Media' && 'border-amber-500',
                    finding.gravedad === 'Baja' && 'border-blue-500',
                  )}>
                    <p className="text-sm text-gray-800 italic">"{finding.evidencia}"</p>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('why'); }}
                      className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 btn-neu-blue"
                    >
                      <Search className="w-4 h-4" />
                      <span>Detalles</span>
                    </button>
                    
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('fix'); }}
                      className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 btn-neu-green"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Soluciones</span>
                    </button>
                    
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('challenge'); }}
                      className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 btn-neu-orange"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Quiero cuestionarlo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Resumen */}
          <div className="col-span-3">
            <div className="glass-card p-4 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Resumen del Análisis</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hallazgos críticos</span>
                  <span className="font-medium text-red-600">
                    {findings.filter(f => f.gravedad === 'Alta').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Riesgo de impugnación</span>
                  <span className="font-medium text-red-600">Alto</span>
                </div>
                <Button onClick={handleDownloadReport} className="w-full mt-4 btn-bg-image">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Informe
                </Button>
              </div>

              <div className="border-t border-gray-200/60 pt-4">
                <h4 className="font-semibold text-sm mb-2 text-gray-800">Próximos pasos recomendados</h4>
                <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>Corregir hallazgos críticos primero</li>
                  <li>Obtener certificación presupuestaria completa</li>
                  <li>Revisar criterios de habilitación</li>
                  <li>Validar cláusulas contractuales</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'why' && selectedFinding && <WhyModal finding={selectedFinding} onClose={() => setActiveModal(null)} />}
      {activeModal === 'fix' && selectedFinding && <HowToFixModal finding={selectedFinding} onClose={() => setActiveModal(null)} onApply={handleFindingStatusChange} />}
      {activeModal === 'challenge' && selectedFinding && <ChallengeModal finding={selectedFinding} onClose={() => setActiveModal(null)} />}
    </div>
  );
};

// Modal: ¿Por qué está mal?
const WhyModal = ({ finding, onClose }: { finding: any, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl glass-card flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Detalles de la Incidencia</h3>
              <button onClick={onClose}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
              </button>
          </div>
          
          <Separator className="bg-gray-200/60" />

          <div>
              <h4 className="font-semibold text-gray-800 mb-2">Hallazgo:</h4>
              <p className="text-base text-gray-800 italic bg-gray-50/50 p-3 rounded-lg border border-gray-200/80">"{finding.evidencia}"</p>
          </div>
          <div>
              <h4 className="font-semibold text-gray-800 mb-2">Explicación Legal:</h4>
              <p className="text-base text-gray-700">{finding.justificacion_legal}</p>
          </div>
          <div>
              <h4 className="font-semibold text-gray-800 mb-2">Consecuencia Estimada:</h4>
              <p className="text-base text-white font-semibold bg-red-600 p-3 rounded-lg border border-red-700">{finding.consecuencia_estimada}</p>
          </div>
      </div>
  </div>
);

// Modal: ¿Cómo lo arreglo?
const HowToFixModal = ({ finding, onClose, onApply }: { finding: any, onClose: () => void, onApply: (id: string, status: FindingStatus) => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl glass-card flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Soluciones</h3>
                <button onClick={onClose}>
                    <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                </button>
            </div>

            <Separator className="bg-gray-200/60" />

            <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">Solución recomendada:</h4>
                <p className="text-base mb-4 text-gray-800">{finding.propuesta_redaccion || finding.propuesta_procedimiento}</p>
            </div>
            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                    Cerrar
                </button>
                <button onClick={() => onApply(finding.id, 'applied')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                    Aplicar Solución
                </button>
            </div>
        </div>
    </div>
);

// Modal: Quiero cuestionarlo
const ChallengeModal = ({ finding, onClose }: { finding: FindingWithStatus, onClose: () => void }) => {
    const [history, setHistory] = useState<DiscussionMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [discussionStarted, setDiscussionStarted] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const startDiscussion = async (initialMessage: string) => {
        setDiscussionStarted(true);
        const newHistory: DiscussionMessage[] = [{ role: 'user', content: initialMessage }];
        setHistory(newHistory);
        setIsLoading(true);

        try {
            console.log('Calling /api/discuss-finding with:', { historyLength: newHistory.length, findingId: finding.id });
            const res = await fetch('/api/discuss-finding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory, finding })
            });
            const response = await res.json();
            console.log('/api/discuss-finding response:', response);

            if (!res.ok) {
                throw new Error(response.error || 'Error del servidor');
            }

            const replyText = response?.reply || '[Sin respuesta del servidor]';
            const assistantResponse: DiscussionMessage = { role: 'assistant', content: replyText };
            setHistory(prev => [...prev, assistantResponse]);
        } catch (error) {
            console.error("Error starting discussion:", error);
            setHistory(prev => [...prev, { role: 'assistant', content: "Lo siento, ocurrió un error al iniciar la discusión." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !attachedFile) return;

        let messageContent = input.trim();
        if (attachedFile) {
            messageContent += `\n\n(Se adjuntó el archivo: ${attachedFile.name})`;
        }

        const newHistory: DiscussionMessage[] = [...history, { role: 'user', content: messageContent }];
        setHistory(newHistory);
        setInput('');
        setAttachedFile(null);
        setIsLoading(true);

        try {
            console.log('Calling /api/discuss-finding with:', { historyLength: newHistory.length, findingId: finding.id });
            const res = await fetch('/api/discuss-finding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory, finding })
            });
            const response = await res.json();
            console.log('/api/discuss-finding response:', response);

            if (!res.ok) {
                throw new Error(response.error || 'Error del servidor');
            }

            const replyText = response?.reply || '[Sin respuesta del servidor]';
            const assistantResponse: DiscussionMessage = { role: 'assistant', content: replyText };
            setHistory(prev => [...prev, assistantResponse]);
        } catch (error) {
            console.error("Error discussing finding:", error);
            setHistory(prev => [...prev, { role: 'assistant', content: "Lo siento, ocurrió un error al procesar tu mensaje." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl glass-card flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {discussionStarted && (
                            <button onClick={() => setDiscussionStarted(false)} className="p-1 rounded-full hover:bg-gray-200">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">Discutir Hallazgo</h3>
                    </div>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
                    </button>
                </div>
                
                <Separator className="bg-gray-200/60" />

                <div className="bg-gray-100/50 p-3 rounded-lg border border-gray-200/80 text-sm">
                  <p className="font-semibold text-gray-800 mb-1">{finding.titulo_incidencia}</p>
                  <blockquote className="text-gray-600 border-l-2 border-gray-400 pl-2 italic">
                      "{finding.evidencia}"
                  </blockquote>
                   <p className="text-xs text-gray-500 mt-2">
                        <span className="font-semibold">Normativa:</span> {finding.nombre_archivo_normativa} (Art. {finding.articulo_o_seccion})
                    </p>
                </div>

                {!discussionStarted ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">Selecciona un enfoque para iniciar la discusión:</p>
                        <button onClick={() => startDiscussion("Quiero cuestionar este hallazgo porque tengo evidencia adicional para presentar.")} className="w-full text-left p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between gap-3">
                            <span>Tengo evidencia adicional</span>
                            <ChevronRight className="w-5 h-5 text-blue-700" />
                        </button>
                        <button onClick={() => startDiscussion("Quiero proponer una interpretación normativa diferente para solucionar este hallazgo.")} className="w-full text-left p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between gap-3">
                            <span>Interpretación normativa diferente</span>
                            <ChevronRight className="w-5 h-5 text-blue-700" />
                        </button>
                        <button onClick={() => startDiscussion("Quiero argumentar que este hallazgo no aplica debido a un contexto operacional especial.")} className="w-full text-left p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between gap-3">
                            <span>Contexto operacional especial</span>
                            <ChevronRight className="w-5 h-5 text-blue-700" />
                        </button>
                    </div>
                ) : (
                <>
                    <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50/50 rounded-lg min-h-[200px]">
                        {history.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-lg max-w-md ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Adjuntar archivo"
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu argumento..."
                            className="w-full p-2 border rounded-lg resize-none border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white/50"
                            rows={1}
                            disabled={isLoading}
                            onKeyDown={handleKeyDown}
                        />
                        <Button onClick={handleSend} disabled={isLoading || (!input.trim() && !attachedFile)} size="icon" className="rounded-full">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                    {attachedFile && (
                        <div className="text-sm text-gray-600">
                            Archivo adjunto: {attachedFile.name}
                            <Button variant="ghost" size="sm" onClick={() => setAttachedFile(null)} className="ml-2 text-red-500">
                                <X className="w-3 h-3 mr-1" /> Quitar
                            </Button>
                        </div>
                    )}
                </>
                )}
            </div>
        </div>
    );
};
