
'use client';

import React, { useEffect, useState } from 'react';
import { ReportPreview } from '@/components/mila/report-preview';
import type { MilaAppPData } from '@/components/mila/types';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

export default function ReportPage() {
  const [reportData, setReportData] = useState<MilaAppPData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);

  useEffect(() => {
    try {
      const data = localStorage.getItem('milaReportData');
      if (data) {
        setReportData(JSON.parse(data));
        // Optional: Clean up local storage after reading
        // localStorage.removeItem('milaReportData'); 
      } else {
        setError(t('reportPreviewPage.errorNotFound'));
      }
    } catch (e) {
      console.error('Error parsing report data from localStorage', e);
      setError(t('reportPreviewPage.errorLoading'));
    }
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-red-600 p-8">
        <p>{error}</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p>{t('reportPreviewPage.loading')}</p>
      </div>
    );
  }

  return <ReportPreview data={reportData} />;
}
