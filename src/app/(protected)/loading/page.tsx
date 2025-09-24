
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { validateDocument, type ValidateDocumentOutput } from '@/ai/flows/validate-document';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  generateScoringReport,
  type FindingWithStatus
} from '@/ai/flows/compliance-scoring';
import { mockData as pliegoMockData } from '@/components/mila/mock-data';
import { upsMockData } from '@/components/mila/mock-data-ups';
import { FileText, Scale, Brain, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';


const MOCK_FILES_TO_RESULTS: Record<string, any> = {
    // Archivo de demo original
    'Pliego de Bases y Condiciones.pdf': pliegoMockData,
    // Archivo de demo para UPS
    '3118772 SERV RECAMBIO UPS 96 FJS (1)': upsMockData,

    // Archivos de Módulo Operativo
    'Solicitud de Evento.pdf': pliegoMockData,
    'Plan de Seguridad.pdf': upsMockData,
    'Póliza de Seguro.pdf': pliegoMockData,
    'Requisición de Compra.docx': upsMockData,
    'Cotización Proveedor A.pdf': pliegoMockData,
    'Cotización Proveedor B.pdf': upsMockData,
    'Solicitud de Permiso.pdf': pliegoMockData,
    'Certificado de Sanidad.pdf': upsMockData,
    'Mapa de Ubicación.pdf': pliegoMockData,

    // Archivos de Módulo Técnico
    'Términos de Referencia.pdf': upsMockData,
    'Estudios Previos.pdf': pliegoMockData,
    'Certificado de Idoneidad.pdf': upsMockData,
    'Pliego de Especificaciones Técnicas.docx': pliegoMockData,
    'Análisis de Mercado.pdf': upsMockData,
    'Matriz de Riesgos.pdf': pliegoMockData,
    'Requerimientos Técnicos.pdf': upsMockData,
    'Certificaciones INVIMA.pdf': pliegoMockData,
    'Cronograma de Entrega.pdf': upsMockData,

    // Archivos de Módulo Estratégico
    'Pliego de Licitación Pública.pdf': pliegoMockData,
    'Estudio de Factibilidad.pdf': upsMockData,
    'Certificación Presupuestaria.pdf': pliegoMockData,
    'Borrador de Contrato de Concesión.docx': upsMockData,
    'Modelo Financiero.xlsx': pliegoMockData,
    'Análisis de Riesgos de Concesión.pdf': upsMockData,
    'Memorando de Solicitud.pdf': pliegoMockData,
    'Plan de Inversiones.pdf': upsMockData,
    'Marco Legal del Proyecto.pdf': pliegoMockData,
};


export default function LoadingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { toast } = useToast();

  // UI state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [errorAlertContent, setErrorAlertContent] = useState({ title: '', description: '' });
  const [validationResults, setValidationResults] =
    useState<(ValidateDocumentOutput & { documentName: string }) | null>(null);

  const loadingSteps = useMemo(() => ([
    {
      title: "Cargando documento",
      description: "Extrayendo texto y estructura del pliego",
      icon: FileText,
      duration: 2000
    },
    {
      title: "Identificando normativa aplicable",
      description: "Verificando Ley 80/1993, Ley 1150/2007 y decretos reglamentarios",
      icon: Scale,
      duration: 3000
    },
    {
      title: "Analizando cumplimiento normativo",
      description: "Evaluando cada sección contra requisitos legales",
      icon: Brain,
      duration: 4000
    },
    {
      title: "Identificando hallazgos críticos",
      description: "Detectando omisiones y inconsistencias de alto riesgo",
      icon: AlertTriangle,
      duration: 3000
    },
    {
      title: "Generando recomendaciones",
      description: "Preparando soluciones específicas y plantillas",
      icon: CheckCircle,
      duration: 2000
    }
  ]), []);

  // Proceso principal
  useEffect(() => {
    document.title = 'MILA | Procesando…';

    const run = async () => {
      try {
        const documentName = localStorage.getItem('selectedDocumentName');
        const documentContent = localStorage.getItem('selectedDocumentContent');
        const regulationsRaw = localStorage.getItem('selectedRegulations');
        const customInstructions = localStorage.getItem('customInstructions');

        if (!documentName || !documentContent || !regulationsRaw) {
          toast({
            title: "Error de Preparación",
            description: "Faltan datos para el análisis. Por favor, vuelva a preparar el documento.",
            variant: "destructive"
          });
          router.push('/prepare');
          return;
        }

        const regulations = JSON.parse(regulationsRaw) as Array<{ name: string; content: string }>;

        const totalSize = (documentContent || '').length + regulations.reduce((acc, r) => acc + (r.content || '').length, 0);
        const estimatedDuration = Math.max(15000, Math.min(120000, totalSize / 100)); // Heurística simple

        let elapsed = 0;
        const interval = setInterval(() => {
            if (validationResults) {
                clearInterval(interval);
                setProgress(100);
                setCurrentStepIndex(loadingSteps.length -1);
                return;
            }
            
            elapsed += 100;
            const currentProgress = Math.min((elapsed / estimatedDuration) * 100, 99);
            setProgress(currentProgress);

            let stepElapsed = 0;
            const totalStepDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
            for (let i = 0; i < loadingSteps.length; i++) {
                const stepShare = (loadingSteps[i].duration / totalStepDuration) * 100;
                if (currentProgress < stepElapsed + stepShare) {
                    setCurrentStepIndex(i);
                    break;
                }
                stepElapsed += stepShare;
            }
        }, 100);

        // MODO DEMO: Usar datos simulados si el nombre del archivo coincide
        if (Object.keys(MOCK_FILES_TO_RESULTS).includes(documentName)) {
            console.log(`Modo simulación activado para: ${documentName}`);
            await new Promise(r => setTimeout(r, 10000));
            const mockResult = MOCK_FILES_TO_RESULTS[documentName];
            setValidationResults({ 
                ...(mockResult as any), 
                documentName: mockResult.documentTitle || documentName,
            });
            return;
        }

        const aiResult = await validateDocument({ documentName, documentContent, regulations, customInstructions: customInstructions ?? undefined });
        
        if (!aiResult.isRelevantDocument) {
            setErrorAlertContent({ title: "Archivo no pertinente", description: aiResult.relevancyReasoning || "El documento no parece ser un archivo válido para el análisis." });
            setIsErrorAlertOpen(true);
            return;
        }

        setValidationResults({ ...aiResult, documentName });

      } catch (error) {
        console.error("Error durante la validación del documento:", error);
        let title = "Error de Análisis";
        let description = "El asistente no pudo procesar el documento. Por favor, intente de nuevo.";
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            title = "Configuración de Servidor Requerida";
            description = "Las credenciales del servidor de Firebase deben estar configuradas para usar la IA. Para una demostración visual, puede usar el 'Modo Invitado'.";
        }
        setErrorAlertContent({ title, description });
        setIsErrorAlertOpen(true);
      }
    };

    run();
  }, []);

  // Post-procesamiento: persistencia + navegación
  useEffect(() => {
    const processValidationResults = async () => {
      if (validationResults) {
        setProgress(100);
        setCurrentStepIndex(loadingSteps.length -1);
        try {
          const findingsWithStatus: FindingWithStatus[] =
            validationResults.findings.map((finding, index) => ({
              ...finding,
              id: `finding-${index}`,
              status: 'pending' as const,
            }));

          const scoringReport = generateScoringReport(findingsWithStatus);

          localStorage.setItem(
            'validation-results',
            JSON.stringify({
              documentName: validationResults.documentName || 'Documento',
              findings: findingsWithStatus,
              initialScoring: {
                complianceScore: validationResults.complianceScore,
                legalRiskScore: validationResults.legalRiskScore,
                breakdown: validationResults.scoringBreakdown,
                riskCategory: validationResults.riskCategory,
              },
              scoringReport,
              timestamp: new Date().toISOString(),
            })
          );
          localStorage.removeItem('customInstructions');

          setTimeout(() => { router.push('/analysis'); }, 1500);

        } catch (error) {
          console.error('❌ Error procesando resultados:', error);
          toast({ title: "Error al procesar resultados", description: "Ocurrió un error al procesar los resultados de la validación.", variant: "destructive" });
        }
      }
    };
    processValidationResults();
  }, [validationResults, router, toast, loadingSteps.length]);
  
  const currentStep = loadingSteps[currentStepIndex];

  return (
    <>
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <Card className="glass-card w-full max-w-2xl">
            <CardContent className="p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-slate-100/80 rounded-xl shadow-inner">
                                <Logo variant='monochrome' className="h-8 w-8"/>
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800">Analizando Documento</h2>
                        </div>
                        <span className="text-sm font-medium text-slate-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-200/70" indicatorClassName="bg-gradient-to-r from-blue-400 to-blue-500" />
                </div>
                
                <div className="mb-8 p-6 bg-slate-100/50 border border-slate-200/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center text-slate-700 bg-white/80 rounded-xl shadow-md">
                            <currentStep.icon className="w-6 h-6"/>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-lg">{currentStep.title}</h3>
                            <p className="text-slate-600 text-sm mt-1">{currentStep.description}</p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[1px_1px_2px_rgba(0,0,0,0.2)]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-medium text-slate-700 text-center mb-4">Proceso de Análisis</h3>
                    <div className="flex items-start justify-between space-x-2 sm:space-x-4">
                        {loadingSteps.map((step, index) => {
                            const isStepComplete = progress === 100 || index < currentStepIndex;
                            const isStepActive = index === currentStepIndex && progress < 100;
                            return(
                                <React.Fragment key={index}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={cn(
                                            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 border",
                                            isStepComplete ? "bg-green-100/80 border-green-200/80 text-green-600" : isStepActive ? "bg-blue-100/80 border-blue-200/80 text-blue-600" : "bg-slate-100/80 border-slate-200/80 text-slate-400"
                                        )}>
                                            {isStepComplete ? <CheckCircle className="w-6 h-6"/> : isStepActive ? <Loader2 className="w-6 h-6 animate-spin"/> : <step.icon className="w-6 h-6"/> }
                                        </div>
                                        <p className={cn(
                                            "text-xs font-semibold h-8 flex items-center transition-colors duration-300",
                                            isStepComplete ? 'text-green-700' : isStepActive ? 'text-blue-700' : 'text-slate-500'
                                        )}>{step.title}</p>
                                    </div>
                                    {index < loadingSteps.length - 1 && (
                                        <div className={cn("flex-1 h-1 mt-6 sm:mt-7 rounded-full transition-all duration-500", isStepComplete ? 'bg-green-400' : 'bg-slate-300' )}/>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={isErrorAlertOpen} onOpenChange={setIsErrorAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorAlertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorAlertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => router.push('/prepare')}>
            Volver a Preparación
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    