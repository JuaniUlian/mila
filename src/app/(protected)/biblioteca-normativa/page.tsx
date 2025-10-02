'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Upload, Search, ArrowLeft, FileText, Calendar, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Regulation {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  chunks: number;
}

export default function BibliotecaNormativaPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([
    {
      id: '1',
      name: 'Ley 80 de 1993 - Estatuto General de Contratación',
      type: 'Ley Nacional',
      uploadDate: '2025-01-15',
      chunks: 342,
    },
    {
      id: '2',
      name: 'Ley 1150 de 2007 - Medidas para la eficiencia y transparencia',
      type: 'Ley Nacional',
      uploadDate: '2025-01-15',
      chunks: 178,
    },
    {
      id: '3',
      name: 'Manual de Contratación Interno - Municipio de Rosario',
      type: 'Normativa Local',
      uploadDate: '2025-02-01',
      chunks: 95,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // Simular upload
    setTimeout(() => {
      const newRegulation: Regulation = {
        id: Date.now().toString(),
        name: files[0].name,
        type: 'Documento Cargado',
        uploadDate: new Date().toISOString().split('T')[0],
        chunks: Math.floor(Math.random() * 300) + 50,
      };
      setRegulations([...regulations, newRegulation]);
      setUploading(false);
      alert(`Normativa "${files[0].name}" indexada exitosamente con ${newRegulation.chunks} fragmentos`);
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta normativa?')) {
      setRegulations(regulations.filter((r) => r.id !== id));
    }
  };

  const filteredRegulations = regulations.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-home-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <BookOpen className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Biblioteca Normativa</h1>
                <p className="text-gray-600 mt-2">
                  Gestiona las normativas utilizadas en los análisis
                </p>
              </div>
            </div>
            <div>
              <label htmlFor="file-upload">
                <Button
                  className="btn-bg-image"
                  disabled={uploading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Indexando...' : 'Subir Normativa'}
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de normativas</p>
                  <p className="text-3xl font-bold text-gray-900">{regulations.length}</p>
                </div>
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fragmentos totales</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {regulations.reduce((sum, r) => sum + r.chunks, 0)}
                  </p>
                </div>
                <Tag className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Última actualización</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Date(Math.max(...regulations.map((r) => new Date(r.uploadDate).getTime()))).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar normativas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Regulations List */}
        <Card>
          <CardHeader>
            <CardTitle>Normativas Indexadas ({filteredRegulations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRegulations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron normativas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegulations.map((regulation) => (
                  <div
                    key={regulation.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{regulation.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {regulation.type}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(regulation.uploadDate).toLocaleDateString('es-AR')}
                          </span>
                          <span>{regulation.chunks} fragmentos</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(regulation.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ ¿Cómo funciona el RAG?</h3>
            <p className="text-sm text-blue-800">
              Cada normativa que subes se fragmenta en partes más pequeñas (chunks) y se indexa
              usando embeddings vectoriales. Cuando MILA analiza un documento, busca los fragmentos
              más relevantes de tu biblioteca normativa para detectar hallazgos específicos a tu
              jurisdicción y normativa local.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
