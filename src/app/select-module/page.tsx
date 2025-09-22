
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, FileStack, PieChart, ChevronRight } from 'lucide-react';

const modules = [
  {
    icon: ClipboardCheck,
    title: 'OPERATIVO',
    description: 'Trámites del día a día: solicitudes de reserva de espacio, comprar elementos de oficina, contratar limpieza o arreglar un aire acondicionado. Verifica que se cumplan los requisitos básicos.',
    href: '/operative-module',
  },
  {
    icon: FileStack,
    title: 'TÉCNICO',
    description: 'Contratos que necesitan conocimiento especializado: abogados, arquitectos, sistemas informáticos o equipos médicos. Revisa que las propuestas técnicas sean correctas y cumplan las normas.',
    href: '/technical-module',
  },
  {
    icon: PieChart,
    title: 'ESTRATÉGICO',
    description: 'Decisiones importantes: obras grandes, concesiones de servicios públicos o proyectos de infraestructura. Analiza si hay dinero suficiente, si es viable técnicamente y si cumple con todas las leyes y reglamentos.',
    href: '/strategic-module',
  },
];

export default function SelectModulePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Selección de Módulo</h1>
        <p className="text-lg text-muted-foreground text-center mb-10">
          Elige un módulo para ver los trámites preconfigurados o ve al modo manual para un análisis personalizado.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {modules.map((module) => (
            <Card key={module.title} className="bg-background/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-2xl transition-shadow rounded-2xl flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <module.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col text-center">
                <p className="text-muted-foreground mb-6 flex-1">{module.description}</p>
                <Button onClick={() => router.push(module.href)} className="w-full">
                  Seleccionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => router.push('/prepare')} className="btn-neu-light">
            Ir a Modo Manual
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
