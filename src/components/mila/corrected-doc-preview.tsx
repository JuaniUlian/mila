
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
  const [correctedText, setCorrectedText] = useState('');

  useEffect(() => {
    // Set date on client-side to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));

    // Generate the corrected document text
    let fullText = data.blocks[0]?.originalText || '';

    const appliedSuggestions = data.blocks.flatMap(block =>
      block.suggestions.filter(s => s.status === 'applied' && s.text && s.evidence)
    );

    for (const suggestion of appliedSuggestions) {
      // Use a simple string replacement.
      // Note: This assumes the evidence text is unique enough not to cause accidental replacements.
      // For a more robust solution, a diff-patch library or more complex logic would be needed.
      fullText = fullText.replace(suggestion.evidence, suggestion.text!);
    }
    
    setCorrectedText(fullText);

  }, [data]);
  
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
          .document-content { page-break-inside: auto; }
        }
      `}</style>
      
      <div className="fixed top-4 right-4 no-print">
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> {t('correctedDocPreviewPage.printButton')}</Button>
      </div>

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

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">{t('correctedDocPreviewPage.correctedText')}</h2>
          <div className="prose prose-sm max-w-none document-content bg-slate-50 p-6 rounded-lg border">
            <pre className="whitespace-pre-wrap font-sans text-sm">{correctedText}</pre>
          </div>
        </section>

      </div>
    </div>
  );
}
