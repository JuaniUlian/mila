
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
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0); // sólo para cuenta regresiva en esta pantalla
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [errorAlertContent, setErrorAlertContent] = useState({ title: '', description: '' });
  const [validationResults, setValidationResults] =
    useState<(ValidateDocumentOutput & { documentName: string }) | null>(null);

  // Etapas de carga (más expresivas)
  const loadingTexts = useMemo(() => ({
    step1: "Cargando documento…",
    step2: "Consultando normativas…",
    step3: "Detectando señales y consistencias…",
    step4: "Preparando hallazgos…",
    step5: "Finalizando…",
    
    completed: t('loadingPage.completed'),
    estimatedTimePrefix: t('loadingPage.estimatedTimePrefix'),
    secondsRemaining: t('loadingPage.secondsRemaining'),
    secondRemaining: t('loadingPage.secondRemaining'),
    title: t('loadingPage.title')
  }), [t]);

  // Avance controlado: sube hasta 99% según un ETA heurístico; 100% sólo cuando llega la IA
  useEffect(() => {
    if (estimatedTime > 0 && progress < 100) {
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;

          // Curva de avance: rápido al inicio, lento al final (ease-out)
          const raw = next / Math.max(1, estimatedTime);
          const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2); // easeOutQuad
          const tentativeProgress = Math.floor(eased * 100);

          // Nunca pasar 99% antes de que termine la IA
          const capped = Math.min(99, tentativeProgress);
          setProgress(prevProg => (capped > prevProg ? capped : prevProg));

          if (next >= estimatedTime) {
            // No cortamos el intervalo: lo dejamos “respirar” en 99% si la IA tarda más
            return estimatedTime;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estimatedTime, progress]);

  // Proceso principal
  useEffect(() => {
    document.title = 'MILA | Procesando…';

    const run = async () => {
      try {
        const documentName = localStorage.getItem('selectedDocumentName');
        const documentContent = localStorage.getItem('selectedDocumentContent');
        const regulationsRaw = localStorage.getItem('selectedRegulations');
        const customInstructions = localStorage.getItem('customInstructions'); // Get custom instructions

        if (!documentName || !documentContent || !regulationsRaw) {
          toast({
            title: "Error de Preparación",
            description: "Faltan datos para el análisis. Por favor, vuelva a preparar el documento.",
            variant: "destructive"
          });
          router.push('/prepare');
          return;
        }
        
        // MODO DEMO: Usar datos simulados si el nombre del archivo coincide con cualquiera de los archivos de los módulos
        if (Object.keys(MOCK_FILES_TO_RESULTS).includes(documentName)) {
            const mockResult = MOCK_FILES_TO_RESULTS[documentName];
            console.log(`Modo simulación activado para: ${documentName}`);
            
            // Simular un tiempo de carga para la demo
            setEstimatedTime(3); 
            await new Promise(r => setTimeout(r, 3000));

            setValidationResults({ 
                ...(mockResult as any), 
                documentName: mockResult.documentTitle || documentName,
            });
            setProgress(100);
            return;
        }

        // --- INICIO DE ANÁLISIS REAL CON IA ---
        console.log(`Análisis real iniciado para: ${documentName}`);

        const regulations = JSON.parse(regulationsRaw) as Array<{ name: string; content: string }>;

        // ETA heurístico en función del tamaño total (doc + normas)
        const totalChars =
          (documentContent || '').length +
          regulations.reduce((acc, r) => acc + (r.content || '').length, 0);

        // Heurística más “elástica”
        // base 12s + 6s por cada 100k chars; clamp entre 12s y 120s
        const eta =
          Math.min(
            120,
            Math.max(12, 12 + Math.ceil(totalChars / 100000) * 6)
          );

        setEstimatedTime(eta);

        // Secuencia de estados (UI) antes/durante la llamada
        setStatusText(loadingTexts.step1);
        await new Promise(r => setTimeout(r, 200));
        setStatusText(loadingTexts.step2);
        await new Promise(r => setTimeout(r, 250));
        setStatusText(loadingTexts.step3);
        await new Promise(r => setTimeout(r, 250));
        setStatusText(loadingTexts.step4);

        // Llamada a la IA
        const aiResult = await validateDocument({
          documentName,
          documentContent,
          regulations,
          customInstructions: customInstructions ?? undefined,
        });

        if (!aiResult.isRelevantDocument) {
          setErrorAlertContent({
            title: "Archivo no pertinente",
            description:
              aiResult.relevancyReasoning ||
              "El documento no parece ser un archivo válido para el análisis de la administración pública.",
          });
          setIsErrorAlertOpen(true);
          return;
        }

        // Al llegar los resultados: 100% y cierre
        setStatusText(loadingTexts.step4);
        setValidationResults({ ...aiResult, documentName });

        setProgress(100);
        setStatusText(loadingTexts.step5);
      } catch (error) {
        console.error("Error durante la validación del documento:", error);

        let title = "Error de Análisis";
        let description = "El asistente no pudo procesar el documento. Por favor, intente de nuevo.";

        if (error instanceof Error && error.message.includes('Unauthorized')) {
          title = "Configuración de Servidor Requerida";
          description =
            "Para usar la IA, las credenciales del servidor de Firebase deben estar configuradas en el archivo .env. " +
            "Por favor, consulte la documentación para configurarlo. Para una demostración visual sin IA, puede usar el 'Modo Invitado'.";
        }

        setErrorAlertContent({ title, description });
        setIsErrorAlertOpen(true);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Post-procesamiento: persistencia + navegación
  useEffect(() => {
    const processValidationResults = async () => {
      try {
        if (validationResults) {
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

          // Clean up custom instructions from localStorage after use
          localStorage.removeItem('customInstructions');


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
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">{loadingTexts.title}</h1>
          <p className="text-lg text-gray-600 mb-6 min-h-[28px]">{statusText}</p>

          <div className="w-full max-w-md mx-auto">
            <Progress value={progress} className="w-full h-2 mb-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{Math.round(progress)}% {loadingTexts.completed}</span>
              {progress < 100 && (
                <span>
                  {loadingTexts.estimatedTimePrefix}{' '}
                  {remainingTime > 1
                    ? loadingTexts.secondsRemaining.replace('{count}', remainingTime.toString())
                    : loadingTexts.secondRemaining}
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

    