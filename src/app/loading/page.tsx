
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const loadingTexts = [
  'Analizando documentos...',
  'Contrastando con normativas seleccionadas...',
  'Identificando posibles inconsistencias...',
  'Generando sugerencias de mejora...',
  'Preparando la plantilla viva...',
];

export default function LoadingPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState(loadingTexts[0]);

  useEffect(() => {
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
      router.push('/'); // Redirect to the main "plantilla viva" page
    }, 15000);

    // Cleanup timeouts and intervals on component unmount
    return () => {
      clearInterval(textInterval);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
      <h1 className="text-2xl font-semibold mb-2">Procesando Pliego</h1>
      <p className="text-lg text-muted-foreground">{statusText}</p>
    </div>
  );
}
