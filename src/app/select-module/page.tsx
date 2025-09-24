
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, FileStack, PieChart, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  {
    icon: ClipboardCheck,
    title: 'OPERATIVO',
    description: '<strong>Trámites del día a día:</strong> solicitudes de reserva de espacio, comprar elementos de oficina, contratar limpieza o arreglar un aire acondicionado. Verifica que se cumplan los <strong>requisitos básicos.</strong>',
    href: '/operative-module',
  },
  {
    icon: FileStack,
    title: 'TÉCNICO',
    description: '<strong>Contratos que necesitan conocimiento especializado:</strong> abogados, arquitectos, sistemas informáticos o equipos médicos. Revisa que las <strong>propuestas técnicas sean correctas</strong> y cumplan las normas.',
    href: '/technical-module',
  },
  {
    icon: PieChart,
    title: 'ESTRATÉGICO',
    description: '<strong>Decisiones importantes:</strong> obras grandes, concesiones de servicios públicos o proyectos de infraestructura. Analiza si hay <strong>dinero suficiente</strong>, si es <strong>viable técnicamente</strong> y si cumple con todas las <strong>leyes y reglamentos.</strong>',
    href: '/strategic-module',
  },
];

export default function SelectModulePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-gray-800">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">Selección de Módulo</h1>
        <p className="text-lg text-slate-600 text-center mb-10 max-w-3xl mx-auto">
          Elige un módulo para ver los trámites preconfigurados o ve al modo manual para un análisis personalizado.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
          {modules.map((module) => (
             <div 
              key={module.title}
              onClick={() => router.push(module.href)}
              className="relative overflow-hidden rounded-lg shadow-sm border border-slate-200/80 cursor-pointer group bg-slate-50/50 text-slate-800 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="items-center text-center mb-4">
                  <div className="p-4 bg-slate-200/70 rounded-full mb-4 shadow-inner inline-block">
                    <module.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{module.title}</h2>
                </div>
                <div className="flex-1 flex flex-col text-center">
                  <p className="text-slate-600 mb-6 flex-1" dangerouslySetInnerHTML={{ __html: module.description }}></p>
                  <Button className="w-full btn-neu mt-auto">
                    Seleccionar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => router.push('/prepare')} className="btn-bg-image">
            Ir a Modo Manual
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
    </div>
  );
}
