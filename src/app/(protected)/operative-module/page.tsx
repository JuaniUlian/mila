
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Calendar, Truck, Store, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const regulations = [
    { id: 'reg1', name: 'Ley 80 de 1993 - Estatuto General de Contratación', content: 'Contenido detallado de la Ley 80...', status: 'success' },
    { id: 'reg2', name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia', content: 'Contenido detallado de la Ley 1150...', status: 'success' },
    { id: 'reg3', name: 'Decreto 1082 de 2015 - Decreto Único Reglamentario del Sector Administrativo de Planeación Nacional', content: 'Contenido detallado del Decreto 1082...', status: 'success' },
    { id: 'reg4', name: 'Manual de Contratación Interno v3.1', content: 'Contenido del manual interno...', status: 'success' },
    { id: 'reg5', name: 'Decreto 795/96', content: 'Contenido del Decreto 795/96...', status: 'success' },
    { id: 'reg-9353', name: 'Ley 9353', content: 'Contenido detallado de la Ley 9353...', status: 'success' },
];

const procedures = [
  {
    title: 'Autorizar evento en espacio público',
    icon: Calendar,
    documents: [
      { name: 'Solicitud de Evento.pdf', content: 'Contenido de la solicitud del evento...' },
      { name: 'Plan de Seguridad.pdf', content: 'Contenido del plan de seguridad...' },
      { name: 'Póliza de Seguro.pdf', content: 'Contenido de la póliza...' },
    ],
    regulations: [regulations[0], regulations[3], regulations[4]],
  },
  {
    title: 'Comprar combustible para los vehículos oficiales',
    icon: Truck,
    documents: [
      { name: 'Requisición de Compra.docx', content: 'Contenido de la requisición...' },
      { name: 'Cotización Proveedor A.pdf', content: 'Contenido de la cotización A...' },
      { name: 'Cotización Proveedor B.pdf', content: 'Contenido de la cotización B...' },
    ],
    regulations: [regulations[1], regulations[2], regulations[3]],
  },
  {
    title: 'Dar permiso para poner un puesto en la vía pública',
    icon: Store,
    documents: [
      { name: 'Solicitud de Permiso.pdf', content: 'Contenido de la solicitud de permiso...' },
      { name: 'Certificado de Sanidad.pdf', content: 'Contenido del certificado de sanidad...' },
      { name: 'Mapa de Ubicación.pdf', content: 'Contenido del mapa de ubicación...' },
    ],
    regulations: [regulations[0], regulations[4], regulations[5]],
  },
];

export default function OperativeModulePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleValidate = (procedure: (typeof procedures)[0]) => {
    const mainDocument = procedure.documents[0];
    const combinedContent = procedure.documents.map(d => d.content).join('\n\n---\n\n');

    localStorage.setItem('selectedDocumentName', mainDocument.name);
    localStorage.setItem('selectedDocumentContent', combinedContent);
    localStorage.setItem('selectedRegulations', JSON.stringify(procedure.regulations));
    
    toast({
      title: `Iniciando análisis para: ${procedure.title}`,
      description: 'Serás redirigido a la página de carga.',
    });

    router.push('/loading');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Módulo Operativo</h1>
        <p className="text-lg text-muted-foreground text-center mb-10">
          Selecciona un trámite para analizarlo con las normativas preconfiguradas.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {procedures.map((procedure) => (
            <Card key={procedure.title} className="bg-background/60 backdrop-blur-md border-white/20 shadow-lg hover:shadow-2xl transition-shadow rounded-2xl flex flex-col">
              <CardHeader>
                <div className="p-4 bg-primary/10 rounded-full mb-4 self-center">
                  <procedure.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-center">{procedure.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <CardDescription className="mb-4">Documentos de prueba:</CardDescription>
                  <ul className="space-y-2 mb-4">
                    {procedure.documents.map(doc => (
                      <li key={doc.name} className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                  <CardDescription className="mb-2">Normativa Preconfigurada:</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {procedure.regulations.map(reg => (
                        <Badge key={reg.id} variant="secondary">{reg.name}</Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={() => handleValidate(procedure)} className="w-full mt-6">
                  Validar Trámite
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <Button variant="outline" onClick={() => router.back()}>
                Volver a Selección de Módulo
            </Button>
        </div>
      </div>
    </div>
  );
}

    