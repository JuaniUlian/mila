'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  FileText,
  Settings
} from 'lucide-react';
import { ClientRAG, type Regulation } from '@/lib/rag/client-rag';
import { useToast } from '@/hooks/use-toast';

/**
 * Panel de Administración de Clientes
 * Herramienta interna para el equipo de MILA
 */
export default function ClientsAdminPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [clientStats, setClientStats] = useState<any>(null);

  // Mock de clientes (luego vendrá de BD)
  const clients = [
    { id: 'municipio-rosario', name: 'Municipalidad de Rosario', country: 'AR', status: 'active' },
    { id: 'gobierno-jalisco', name: 'Gobierno de Jalisco', country: 'MX', status: 'poc' },
    { id: 'empresa-epm', name: 'EPM Medellín', country: 'CO', status: 'implementation' },
  ];

  const handleClientSelect = async (clientId: string) => {
    setSelectedClient(clientId);
    const rag = new ClientRAG(clientId);
    const stats = await rag.getStats();
    setClientStats(stats);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedClient) return;

    setIsIndexing(true);
    setIndexingProgress(0);

    const rag = new ClientRAG(selectedClient);
    const regulations: Regulation[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();

      regulations.push({
        id: `reg-${Date.now()}-${i}`,
        name: file.name.replace(/\.(pdf|docx|txt)$/, ''),
        content,
        type: 'ley', // TODO: inferir del nombre o pedir al usuario
        jurisdiction: 'local',
      });

      setIndexingProgress(((i + 1) / files.length) * 100);
    }

    try {
      const result = await rag.indexRegulations(regulations);

      if (result.success) {
        toast({
          title: '✅ Normativas indexadas',
          description: `Se indexaron ${result.indexed} normativas correctamente.`,
        });

        // Actualizar stats
        const stats = await rag.getStats();
        setClientStats(stats);
      } else {
        toast({
          title: '⚠️ Indexación parcial',
          description: `${result.indexed} indexadas, ${result.errors.length} con errores.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error en indexación',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsIndexing(false);
      setIndexingProgress(0);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administración de Clientes
          </h1>
          <p className="text-gray-600">
            Gestiona RAG, normativas y configuración por cliente
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Lista de Clientes */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleClientSelect(client.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedClient === client.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {client.name}
                        </span>
                        <StatusBadge status={client.status} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {client.country === 'AR' && '🇦🇷 Argentina'}
                        {client.country === 'MX' && '🇲🇽 México'}
                        {client.country === 'CO' && '🇨🇴 Colombia'}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle del Cliente */}
          <div className="col-span-8">
            {!selectedClient ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Selecciona un cliente para ver detalles
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Estadísticas del RAG */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Estado del RAG
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clientStats ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            {clientStats.regulationsCount}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Normativas</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {clientStats.chunksCount}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Chunks</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="text-3xl font-bold text-indigo-600">
                            {clientStats.instructionsCount}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Instrucciones</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Cargando estadísticas...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cargar Normativas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Cargar Normativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Sube las normativas que debe cumplir este cliente. Formatos soportados: PDF, DOCX, TXT.
                      </p>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileUpload}
                          disabled={isIndexing}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className={`cursor-pointer ${isIndexing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isIndexing ? (
                            <div>
                              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                              <p className="text-sm font-semibold text-gray-900">
                                Indexando normativas... {indexingProgress.toFixed(0)}%
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                Esto puede tomar varios minutos
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm font-semibold text-gray-900">
                                Haz clic para seleccionar archivos
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                o arrastra y suelta aquí
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      {isIndexing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-1">Proceso de indexación</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Dividiendo normativas en chunks (~500 palabras)</li>
                                <li>Generando embeddings con OpenAI/Cohere</li>
                                <li>Guardando en vector store (Pinecone)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Instrucciones Custom del Módulo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Instrucciones del Módulo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Instrucciones custom agregadas cuando usuarios ganan discusiones o cuando el equipo de MILA ajusta manualmente.
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {clientStats?.instructionsCount > 0 ? (
                        <InstructionsList clientId={selectedClient} />
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            No hay instrucciones custom todavía
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    poc: { label: 'POC', color: 'bg-blue-100 text-blue-800' },
    implementation: { label: 'Implementación', color: 'bg-yellow-100 text-yellow-800' },
    active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
    paused: { label: 'Pausado', color: 'bg-gray-100 text-gray-800' },
  };

  const { label, color } = config[status as keyof typeof config] || config.poc;

  return (
    <Badge className={`${color} text-xs`}>
      {label}
    </Badge>
  );
}

function InstructionsList({ clientId }: { clientId: string }) {
  const [instructions, setInstructions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const rag = new ClientRAG(clientId);
    rag.getModuleInstructions().then(instr => {
      setInstructions(instr.map((text, idx) => ({ id: idx, text })));
    });
  }, [clientId]);

  return (
    <div className="space-y-2">
      {instructions.map((instruction) => (
        <div key={instruction.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-800">{instruction.text}</p>
        </div>
      ))}
    </div>
  );
}
