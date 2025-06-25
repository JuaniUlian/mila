
'use client';

import React, { useEffect, useState } from 'react';
import { ReportPreview } from '@/components/mila/report-preview';
import type { MilaAppPData } from '@/components/mila/types';
import { Loader2 } from 'lucide-react';

export default function ReportPage() {
  const [reportData, setReportData] = useState<MilaAppPData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('milaReportData');
      if (data) {
        setReportData(JSON.parse(data));
        // Optional: Clean up local storage after reading
        // localStorage.removeItem('milaReportData'); 
      } else {
        setError('No se encontraron datos para generar el informe. Por favor, vuelva a la página principal e intente de nuevo.');
      }
    } catch (e) {
      console.error('Error parsing report data from localStorage', e);
      setError('Ocurrió un error al cargar los datos del informe.');
    }
  }, []);

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
        <p>Cargando previsualización del informe...</p>
      </div>
    );
  }

  return <ReportPreview data={reportData} />;
}
