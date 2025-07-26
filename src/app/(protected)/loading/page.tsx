
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { validateDocument, type ValidateDocumentOutput, type ValidateDocumentInput } from '@/ai/flows/validate-document';
import type { MilaAppPData, DocumentBlock, Suggestion, SuggestionSeverity, SuggestionCategory } from '@/components/mila/types';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// New function to calculate scores based on findings
function calculateScoresFromFindings(findings: ValidateDocumentOutput['findings']): { complianceScore: number, legalRiskScore: number } {
    let score = 100;
    const penalties = {
        'Alta': 25,
        'Media': 15,
        'Baja': 5,
        'Informativa': 0,
    };

    findings.forEach(finding => {
        score -= penalties[finding.gravedad] || 0;
    });

    const complianceScore = Math.max(0, score);
    const legalRiskScore = 100 - complianceScore;

    return { complianceScore, legalRiskScore };
}


// Helper function to map AI output to the data structure needed by the analysis page
function mapAiOutputToAppData(aiOutput: ValidateDocumentOutput, docName: string, docContent: string): MilaAppPData {
    const { findings } = aiOutput;
    // Calculate scores based on the new function, ignoring scores from the AI
    const { complianceScore, legalRiskScore } = calculateScoresFromFindings(findings);

    const severityMap: { [key: string]: SuggestionSeverity } = {
        'Alta': 'high',
        'Media': 'medium',
        'Baja': 'low',
        'Informativa': 'low',
    };

    const categoryMap: { [key: string]: SuggestionCategory } = {
        'Irregularidad': 'Legal',
        'Mejora de Redacción': 'Redacción',
        'Sin hallazgos relevantes': 'Redacción',
    };
    
    // For now, create a single block for the whole document
    const suggestions: Suggestion[] = findings.map((finding, index): Suggestion => ({
        id: `sug-ai-${index}`,
        text: finding.propuesta_redaccion,
        proceduralSuggestion: finding.propuesta_procedimiento,
        evidence: finding.evidencia,
        justification: {
            legal: finding.justificacion_legal,
            technical: finding.justificacion_tecnica,
        },
        appliedNorm: `${finding.nombre_archivo_normativa} - ${finding.articulo_o_seccion}`,
        errorType: finding.titulo_incidencia,
        estimatedConsequence: finding.consecuencia_estimada,
        status: 'pending',
        completenessImpact: severityMap[finding.gravedad] === 'high' ? 2 : (severityMap[finding.gravedad] === 'medium' ? 1 : 0.5),
        severity: severityMap[finding.gravedad] || 'low',
        category: categoryMap[finding.tipo] || 'Redacción',
        isEditable: !!finding.propuesta_redaccion,
    }));

    const mainBlock: DocumentBlock = {
        id: 'main-document-block',
        name: 'Análisis General del Documento',
        category: 'Documento Completo',
        alertLevel: legalRiskScore > 75 ? 'grave' : (legalRiskScore > 40 ? 'media' : 'leve'),
        completenessIndex: 5, // This is a baseline, could be improved with more AI metrics
        maxCompleteness: 10,
        originalText: docContent,
        suggestions: suggestions,
        alerts: [],
        missingConnections: [],
        applicableNorms: [],
        legalRisk: `El riesgo legal estimado es de ${legalRiskScore}%.`,
    };

    return {
        documentTitle: `Evaluación de ${docName}`,
        overallComplianceScore: complianceScore,
        overallCompletenessIndex: 5.0, // This is a baseline
        blocks: [mainBlock],
    };
}


export default function LoadingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { toast } = useToast();
  
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

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
        
        setStatusText(loadingTexts.status4);
        const generatedData = mapAiOutputToAppData(aiResult, documentName, documentContent);
        localStorage.setItem('milaAnalysisData', JSON.stringify(generatedData));

        setProgress(100);
        setStatusText(loadingTexts.status5);
        setTimeout(() => {
            router.push('/analysis');
        }, 800);

      } catch (error) {
        console.error("Error durante la validación del documento:", error);
        
        let title = "Error de Análisis";
        let description = "El asistente no pudo procesar el documento. Por favor, intente de nuevo.";

        if (error instanceof Error && error.message.includes('Unauthorized')) {
          title = "Configuración de Servidor Requerida";
          description = "Para usar la IA, las credenciales del servidor de Firebase deben estar configuradas en el archivo .env. Por favor, consulte la documentación para configurarlo. Para una demostración visual sin IA, puede usar el 'Modo Invitado'.";
        }
        
        toast({
          title: title,
          description: description,
          variant: "destructive"
        });
        router.push('/prepare');
      }
    };
    
    processDocument();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, t, toast, loadingTexts]);
  
  const remainingTime = Math.max(0, Math.round(estimatedTime - elapsedTime));

  return (
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
  );
}

    