
'use client';

import React, { useEffect, useState } from 'react';
import { CorrectedDocPreview } from '@/components/mila/corrected-doc-preview';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface CorrectedDocData {
    documentTitle: string;
    correctedText: string;
}

export default function CorrectedDocPage() {
  const [docData, setDocData] = useState<CorrectedDocData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);

  useEffect(() => {
    try {
      const data = localStorage.getItem('milaCorrectedDocData');
      if (data) {
        setDocData(JSON.parse(data));
      } else {
        setError(t('correctedDocPreviewPage.errorNotFound'));
      }
    } catch (e) {
      console.error('Error parsing corrected doc data from localStorage', e);
      setError(t('correctedDocPreviewPage.errorLoading'));
    }
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-red-600 p-8">
        <p>{error}</p>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p>{t('correctedDocPreviewPage.loading')}</p>
      </div>
    );
  }

  return <CorrectedDocPreview data={docData} />;
}
