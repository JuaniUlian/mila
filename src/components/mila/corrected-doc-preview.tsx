
'use client';

import React, { useEffect, useState } from 'react';
import type { MilaAppPData } from '@/components/mila/types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface CorrectedDocPreviewProps {
  data: MilaAppPData;
}

export function CorrectedDocPreview({ data }: CorrectedDocPreviewProps) {
  const { documentTitle } = data;
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client-side to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, []);
  
  const appliedSuggestions = data.blocks.flatMap(block => 
    block.suggestions
      .filter(suggestion => suggestion.status === 'applied')
      .map(suggestion => ({
        ...suggestion,
        blockName: block.name,
      }))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          @page { size: A4; margin: 2cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .change-block { page-break-inside: avoid; }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg rounded-lg print:shadow-none print:rounded-none">
        <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{documentTitle}</h1>
            <p className="text-lg text-gray-600">{t('correctedDocPreviewPage.title')}</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-500">{t('correctedDocPreviewPage.generatedOn')}</p>
             <p className="font-semibold text-gray-700">{currentDate}</p>
          </div>
        </header>
        
        <div className="fixed top-4 right-4 no-print">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> {t('correctedDocPreviewPage.printButton')}</Button>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">{t('correctedDocPreviewPage.summaryTitle')}</h2>
          <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700">{t('correctedDocPreviewPage.changesApplied')}</h3>
              <p className="text-4xl font-bold text-blue-600">{appliedSuggestions.length}</p>
              <p className="text-sm text-gray-500 mt-1">{t('correctedDocPreviewPage.changesAppliedDesc')}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">{t('correctedDocPreviewPage.changeDetailTitle')}</h2>
          <div className="space-y-8">
            {appliedSuggestions.length > 0 ? appliedSuggestions.map(suggestion => (
              <div key={suggestion.id} className="change-block border border-gray-200 p-6 rounded-lg shadow-sm">
                <div className="flex flex-wrap justify-between items-baseline mb-4 text-sm text-gray-500 gap-2">
                    <div><span className="font-semibold text-gray-700">{t('correctedDocPreviewPage.block')}:</span> {suggestion.blockName}</div>
                    <div><span className="font-semibold text-gray-700">{t('correctedDocPreviewPage.finding')}:</span> {suggestion.errorType}</div>
                </div>
                 <div className="flex flex-wrap justify-between items-baseline mb-6 text-sm text-gray-500 border-t border-b py-2 gap-2">
                    <div><span className="font-semibold text-gray-700">{t('correctedDocPreviewPage.appliedBy')}:</span> {t('correctedDocPreviewPage.guest')}</div>
                    <div><span className="font-semibold text-gray-700">{t('correctedDocPreviewPage.date')}:</span> {currentDate}</div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                      <h4 className="font-semibold text-red-700 mb-2">{t('correctedDocPreviewPage.originalText')}</h4>
                      <p className="text-sm text-gray-800 p-3 bg-red-50 border-l-4 border-red-200 rounded font-mono">{suggestion.evidence}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-green-700 mb-2">{t('correctedDocPreviewPage.correctedText')}</h4>
                      <p className="text-sm text-gray-800 p-3 bg-green-50 border-l-4 border-green-300 rounded">{suggestion.text}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">{t('correctedDocPreviewPage.noChanges')}</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
