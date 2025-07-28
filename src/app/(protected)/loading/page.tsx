
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


export default function LoadingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { toast } = useToast();
  
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [errorAlertContent, setErrorAlertContent] = useState({ title: '', description: '' });
  const [validationResults, setValidationResults] = useState<(ValidateDocumentOutput & { documentName: string }) | null>(null);

  const loadingTexts = useMemo(() => ({
    status1: t('loadingPage.status1'),
    status2: t('loadingPage.status2'),
    status3: t('loadingPage.status3'),
    status4: t('loadingPage.status4'),
    status5: t('loadingPage.status5'),
  }), [t]);
  
  // Timer effect for progress bar
  useEffect(() => {
    if (estimatedTime > 0 && progress < 100) {
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          // Cap progress at 99% until the promise resolves
          const currentProgress = Math.min(99, (next / estimatedTime) * 100);
          setProgress(currentProgress);

          if (next >= estimatedTime) {
            clearInterval(interval);
            return estimatedTime;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estimatedTime, progress]);


  useEffect(() => {
    document.title = 'MILA | Procesando...';
    
    const processDocument = async () => {
      try {
        const documentName = localStorage.getItem('selectedDocumentName');
        const documentContent = localStorage.getItem('selectedDocumentContent');
        const regulationsRaw = localStorage.getItem('selectedRegulations');

        if (!documentName || !documentContent || !regulationsRaw) {
          toast({
            title: "Error de Preparación",
            description: "Faltan datos para el análisis. Por favor, vuelva a preparar el documento.",
            variant: "destructive"
          });
          router.push('/prepare');
          return;
        }

        const regulations = JSON.parse(regulationsRaw);
        
        // Calculate estimation
        const totalChars = (documentContent || '').length + regulations.reduce((acc: number, reg: { content: string }) => acc + (reg.content || '').length, 0);
        // Base 10s, +5s per 100k chars. At least 10s.
        const time = Math.max(10, 10 + Math.floor(totalChars / 100000) * 5); 
        setEstimatedTime(time);

        setStatusText(loadingTexts.status1);
        await new Promise(res => setTimeout(res, 200)); // Short delay for text to show
        setStatusText(loadingTexts.status2);
        await new Promise(res => setTimeout(res, 200));
        setStatusText(loadingTexts.status3);

        const aiResult = await validateDocument({
          documentName,
          documentContent,
          regulations,
        });

        if (!aiResult.isRelevantDocument) {
            setErrorAlertContent({
                title: "Archivo no pertinente",
                description: aiResult.relevancyReasoning || "El documento no parece ser un archivo válido para el análisis de la administración pública.",
            });
            setIsErrorAlertOpen(true);
            return;
        }
        
        setStatusText(loadingTexts.status4);
        setValidationResults({...aiResult, documentName});
        
        setProgress(100);
        setStatusText(loadingTexts.status5);

      } catch (error) {
        console.error("Error durante la validación del documento:", error);
        
        let title = "Error de Análisis";
        let description = "El asistente no pudo procesar el documento. Por favor, intente de nuevo.";

        if (error instanceof Error && error.message.includes('Unauthorized')) {
          title = "Configuración de Servidor Requerida";
          description = "Para usar la IA, las credenciales del servidor de Firebase deben estar configuradas en el archivo .env. Por favor, consulte la documentación para configurarlo. Para una demostración visual sin IA, puede usar el 'Modo Invitado'.";
        }

        setErrorAlertContent({ title, description });
        setIsErrorAlertOpen(true);
      }
    };
    
    processDocument();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const processValidationResults = async () => {
      try {
        if (validationResults) {
          console.log('📊 Procesando resultados de validación...');
          
          const findingsWithStatus: FindingWithStatus[] = validationResults.findings.map((finding, index) => ({
            ...finding,
            id: `finding-${index}`,
            status: 'pending' as const,
          }));

          const scoringReport = generateScoringReport(findingsWithStatus);
          
          console.log('✅ Resultados procesados:', {
            totalFindings: findingsWithStatus.length,
            complianceScore: validationResults.complianceScore,
            riskCategory: validationResults.riskCategory.label,
          });
  
          localStorage.setItem('validation-results', JSON.stringify({
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
          }));
  
          setTimeout(() => {
              router.push('/analysis');
          }, 800);
        }
      } catch (error) {
        console.error('❌ Error procesando resultados:', error);
        toast({
          title: "Error al procesar resultados",
          description: "Ocurrió un error al procesar los resultados de la validación.",
          variant: "destructive",
        });
      }
    };
  
    processValidationResults();
  }, [validationResults, router, toast]);
  
  const remainingTime = Math.max(0, Math.round(estimatedTime - elapsedTime));

  if (!validationResults) {
    return (
      <>
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-lg text-center bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30">
          <svg width="64" height="64" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 mb-6 inline-block">
            <g fill="currentColor">
              <circle cx="12" cy="3" r="1">
                <animate id="svgSpinners12DotsScale0" attributeName="r" begin="0;svgSpinners12DotsScale1.end-0.5s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="16.5" cy="4.21" r="1">
                <animate id="svgSpinners12DotsScale2" attributeName="r" begin="svgSpinners12DotsScale0.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="19.79" cy="7.5" r="1">
                <animate id="svgSpinners12DotsScale3" attributeName="r" begin="svgSpinners12DotsScale2.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="21" cy="12" r="1">
                <animate id="svgSpinners12DotsScale4" attributeName="r" begin="svgSpinners12DotsScale3.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="19.79" cy="16.5" r="1">
                <animate id="svgSpinners12DotsScale5" attributeName="r" begin="svgSpinners12DotsScale4.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="16.5" cy="19.79" r="1">
                <animate id="svgSpinners12DotsScale6" attributeName="r" begin="svgSpinners12DotsScale5.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="12" cy="21" r="1">
                <animate id="svgSpinners12DotsScale7" attributeName="r" begin="svgSpinners12DotsScale6.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="7.5" cy="19.79" r="1">
                <animate id="svgSpinners12DotsScale8" attributeName="r" begin="svgSpinners12DotsScale7.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="4.21" cy="16.5" r="1">
                <animate id="svgSpinners12DotsScale9" attributeName="r" begin="svgSpinners12DotsScale8.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="3" cy="12" r="1">
                <animate id="svgSpinners12DotsScalea" attributeName="r" begin="svgSpinners12DotsScale9.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="4.21" cy="7.5" r="1">
                <animate id="svgSpinners12DotsScaleb" attributeName="r" begin="svgSpinners12DotsScalea.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <circle cx="7.5" cy="4.21" r="1">
                <animate id="svgSpinners12DotsScale1" attributeName="r" begin="svgSpinners12DotsScaleb.begin+0.1s" dur="0.6s" values="1;2;1" />
              </circle>
              <animateTransform attributeName="transform" type="rotate" dur="6s" values="0 12 12;360 12 12" repeatCount="indefinite" />
            </g>
          </svg>
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">{t('loadingPage.title')}</h1>
          <p className="text-lg text-gray-600 mb-6 min-h-[28px]">{statusText}</p>
  
          <div className="w-full max-w-md mx-auto">
            <Progress value={progress} className="w-full h-2 mb-2" />
            <div className="flex justify-between text-sm text-gray-500">
                <span>{Math.round(progress)}% {t('loadingPage.completed')}</span>
                {progress < 100 && (
                    <span>
                        {t('loadingPage.estimatedTimePrefix')} {remainingTime > 1 ? t('loadingPage.secondsRemaining').replace('{count}', remainingTime.toString()) : t('loadingPage.secondRemaining')}
                    </span>
                )}
            </div>
          </div>
        </div>
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

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Procesando Análisis</h1>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Finalizando...</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Resumen de Análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {validationResults.complianceScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Cumplimiento Normativo
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`text-lg font-semibold text-${validationResults.riskCategory.color}-600`}>
                  {validationResults.riskCategory.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Nivel de Riesgo
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {validationResults.scoringBreakdown.totalFindings}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Hallazgos Encontrados
                </div>
              </div>
            </div>
            {Object.keys(validationResults.scoringBreakdown.penaltiesByGravity).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Desglose por Gravedad:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(validationResults.scoringBreakdown.penaltiesByGravity).map(([gravity, data]) => (
                    <div key={gravity} className="bg-gray-100 dark:bg-gray-600 p-2 rounded">
                      <div className="font-medium">{gravity}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {data.count} hallazgo(s)
                      </div>
                      <div className="text-red-600">
                        -{data.penalty} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📋 {validationResults.riskCategory.description}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Redirigiendo al análisis detallado...
            </p>
            <div className="animate-pulse text-sm text-blue-600">
              Preparando vista interactiva de hallazgos
            </div>
          </div>
      </div>
    </div>
  );
}
