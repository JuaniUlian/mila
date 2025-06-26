
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

export default function LoadingPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const loadingTexts = useMemo(() => [
    t('loadingPage.status1'),
    t('loadingPage.status2'),
    t('loadingPage.status3'),
    t('loadingPage.status4'),
    t('loadingPage.status5'),
  ], [t]);
  
  const [statusText, setStatusText] = useState(loadingTexts[0]);

  useEffect(() => {
    document.title = 'MILA | Más Inteligencia Legal y Administrativa';

    // Simulate loading process and text change
    const textInterval = setInterval(() => {
      setStatusText(prevText => {
        const currentIndex = loadingTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 3000); // Change text every 3 seconds

    // Redirect after 15 seconds
    const redirectTimeout = setTimeout(() => {
      router.push('/analysis'); // Redirect to the main "plantilla viva" page
    }, 15000);

    // Cleanup timeouts and intervals on component unmount
    return () => {
      clearInterval(textInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router, loadingTexts]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-slate-200 to-blue-100 bg-200% animate-gradient-bg">
      <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
      <h1 className="text-2xl font-semibold mb-2 text-gray-800">{t('loadingPage.title')}</h1>
      <p className="text-lg text-gray-600">{statusText}</p>
    </div>
  );
}
