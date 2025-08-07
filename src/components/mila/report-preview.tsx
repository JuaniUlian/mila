
'use client';

import React, { useEffect, useState } from 'react';
import type { FindingStatus, FindingWithStatus } from '@/ai/flows/compliance-scoring';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface ReportData {
    documentTitle: string;
    findings: FindingWithStatus[];
    scoringReport: any; // You might want to type this more strictly
}

interface ReportPreviewProps {
  data: ReportData;
}

const getSeverityStyles = (severity: FindingWithStatus['gravedad']) => {
  switch (severity) {
    case 'Alta':
      return 'border-l-red-500 bg-red-50';
    case 'Media':
      return 'border-l-amber-500 bg-amber-50';
    case 'Baja':
      return 'border-l-sky-500 bg-sky-50';
    default:
      return 'border-l-gray-300 bg-gray-50';
  }
};

const getStatusStyles = (status: FindingStatus) => {
    switch(status) {
        case 'applied':
        case 'modified':
            return 'bg-green-100 text-green-800';
        case 'discarded':
            return 'bg-red-100 text-red-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
    }
}


export function ReportPreview({ data }: ReportPreviewProps) {
  const { documentTitle, findings, scoringReport } = data;
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client-side to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('es-ES'));
  }, []);
  
  const appliedCount = findings.filter(f => f.status === 'applied' || f.status === 'modified').length;
  const discardedCount = findings.filter(f => f.status === 'discarded').length;
  const pendingCount = findings.length - appliedCount - discardedCount;


  const handlePrint = () => {
    window.print();
  };

  const getTranslatedStatus = (status: FindingStatus) => {
    // @ts-ignore
    const key = `reportPreviewPage.status.${status}`;
    // @ts-ignore
    const translated = t(key);
    // @ts-ignore
    return translated === key ? status : translated;
  }

  const getTranslatedSeverity = (severity: FindingWithStatus['gravedad']) => {
    // @ts-ignore
    const key = `reportPreviewPage.severity.${severity}`;
    // @ts-ignore
    const translated = t(key);
    // @ts-ignore
    return translated === key ? severity : translated;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-lg print:shadow-none print:rounded-none">
        
        <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{documentTitle}</h1>
            <p className="text-lg text-gray-600">{t('reportPreviewPage.reportTitle')}</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-500">{t('reportPreviewPage.generatedOn')}</p>
             <p className="font-semibold text-gray-700">{currentDate}</p>
          </div>
        </header>
        
        <div className="fixed top-4 right-4 no-print">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> {t('reportPreviewPage.printButton')}</Button>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">{t('reportPreviewPage.summaryTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700">{t('reportPreviewPage.complianceScore')}</h3>
                <p className="text-4xl font-bold text-blue-600">{scoringReport.summary.complianceScore.toFixed(0)}<span className="text-2xl text-gray-500">/100</span></p>
                <p className="text-sm text-gray-500 mt-1">{scoringReport.summary.riskCategory.description}</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-700">{t('reportPreviewPage.riskLevel')}</h3>
                <p className="text-4xl font-bold text-teal-600">{scoringReport.summary.riskCategory.label}</p>
                 <p className="text-sm text-gray-500 mt-1">{t('reportPreviewPage.completenessIndexDesc')}</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg border md:col-span-2">
                <h3 className="font-semibold text-gray-700">{t('reportPreviewPage.actionsSummary')}</h3>
                <div className="flex justify-around items-center pt-2">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{appliedCount}</p>
                        <p className="text-sm text-gray-500">{t('reportPreviewPage.correctedSuggestions')}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{discardedCount}</p>
                        <p className="text-sm text-gray-500">{t('reportPreviewPage.discardedSuggestions')}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        <p className="text-sm text-gray-500">{getTranslatedStatus('pending')}</p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">{t('reportPreviewPage.findingsTitle')}</h2>
          <div className="space-y-8">
            {findings.length > 0 ? findings.map(finding => (
              <div key={finding.id} className={`p-4 rounded-md border-l-4 ${getSeverityStyles(finding.gravedad)}`}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{finding.titulo_incidencia}</h3>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyles(finding.status)}`}>
                            {getTranslatedStatus(finding.status)}
                        </span>
                        <span className="text-sm font-semibold capitalize text-gray-700">{getTranslatedSeverity(finding.gravedad)}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">{t('reportPreviewPage.norma')}</span> {finding.nombre_archivo_normativa} ({finding.articulo_o_seccion})
                </p>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1">{t('reportPreviewPage.originalTextContext')}</h4>
                        <p className="text-sm text-gray-600 p-3 bg-gray-100 border rounded-md font-mono">{finding.evidencia}</p>
                    </div>
                     {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">{t('reportPreviewPage.solutionProposal')}</h4>
                          <div className="text-sm text-green-800 p-3 bg-green-100 border-l-4 border-green-400 rounded-md">
                            {finding.propuesta_redaccion && <p><strong>{t('reportPreviewPage.wording')}: </strong>{finding.propuesta_redaccion}</p>}
                            {finding.propuesta_procedimiento && <p><strong>{t('reportPreviewPage.procedure')}: </strong>{finding.propuesta_procedimiento}</p>}
                          </div>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1">{t('reportPreviewPage.legalJustification')}</h4>
                        <p className="text-sm text-gray-600">{finding.justificacion_legal}</p>
                    </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">{t('reportPreviewPage.noInconsistencies')}</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
