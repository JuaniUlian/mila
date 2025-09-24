
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Filter, FileText, Scale, AlertTriangle, 
  MessageSquare, HelpCircle, Wrench, Eye, Download,
  ChevronRight, X, Loader2
} from 'lucide-react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { calculateDynamicComplianceScore, generateScoringReport } from '@/ai/flows/compliance-scoring';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { useLayout } from '@/context/LayoutContext';

// Main Component
export default function AnalysisPage() {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [findings, setFindings] = useState<FindingWithStatus[]>([]);
  const [currentScoring, setCurrentScoring] = useState<any>(null);

  const [selectedFinding, setSelectedFinding] = useState<FindingWithStatus | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { setScore, setIsInitialPageLoad } = useLayout();

  useEffect(() => {
    try {
      const storedResults = localStorage.getItem('validation-results');
      if (storedResults) {
        const results = JSON.parse(storedResults);
        setValidationResult(results);
        setFindings(results.findings || []);
        setIsInitialPageLoad(false); // Data is loaded, initial load is complete
      } else {
        toast({
          title: "Análisis no encontrado",
          description: "No se encontraron resultados de análisis. Redirigiendo a la página de preparación.",
          variant: "destructive",
        });
        router.push('/prepare');
      }
    } catch (error) {
      console.error("Error loading validation results:", error);
      toast({
        title: "Error al cargar",
        description: "No se pudieron cargar los resultados del análisis.",
        variant: "destructive",
      });
      router.push('/prepare');
    }
  }, [router, toast, setIsInitialPageLoad]);
  
  useEffect(() => {
    if (findings.length > 0) {
      const dynamicScores = calculateDynamicComplianceScore(findings);
      setCurrentScoring(dynamicScores);
      setScore(dynamicScores.complianceScore); // Update global score
    } else if (validationResult) {
       const dynamicScores = calculateDynamicComplianceScore([]);
       setCurrentScoring(dynamicScores);
       setScore(dynamicScores.complianceScore); // Update global score
    }
  }, [findings, validationResult, setScore]);

  const handleFindingStatusChange = useCallback((findingId: string, newStatus: FindingStatus) => {
    setFindings(prevFindings => {
        const newFindings = prevFindings.map(f => f.id === findingId ? { ...f, status: newStatus } : f);
        
        const dynamicScores = calculateDynamicComplianceScore(newFindings);
        setCurrentScoring(dynamicScores);
        setScore(dynamicScores.complianceScore);

        // Toast notification
        if (newStatus === 'applied' || newStatus === 'modified') {
            toast({
                title: t('analysisPage.toastSuggestionApplied'),
                description: t('analysisPage.toastComplianceUpdated'),
                variant: 'success'
            });
        } else if (newStatus === 'discarded') {
            toast({
                title: t('analysisPage.toastSuggestionDiscarded'),
                description: t('analysisPage.toastSuggestionHasBeenDiscarded'),
                variant: 'destructive'
            });
        }
        
        return newFindings;
    });
    setActiveModal(null);
  }, [t, toast, setScore]);

  const categories = useMemo(() => {
    if (!validationResult) return [];
    const allFindings = (validationResult.findings || []) as FindingWithStatus[];
    const categoryCounts: Record<string, number> = allFindings.reduce((acc, f) => {
      // @ts-ignore
      const cat = f.macro_categoria || 'Otros';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Todos', count: allFindings.length },
      ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
    ];
  }, [validationResult]);

  const filteredFindings = useMemo(() => {
    return (findings || []).filter(f => {
      const matchesSearch = f.titulo_incidencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            f.nombre_archivo_normativa.toLowerCase().includes(searchTerm.toLowerCase());
      // @ts-ignore
      const matchesCategory = activeCategory === 'Todos' || (f.macro_categoria || 'Otros') === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [findings, searchTerm, activeCategory]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Alta': return 'text-red-700 bg-red-100';
      case 'Media': return 'text-yellow-700 bg-yellow-100';
      case 'Baja': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  if (!validationResult || !currentScoring) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header simple */}
      <div className="glass-card m-4">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{validationResult.documentName}</h1>
            <div className="flex items-center space-x-8 text-sm">
              <div className="text-right w-48">
                <div className="text-gray-600 font-semibold">Cumplimiento</div>
                <div className="text-3xl font-bold text-blue-600">{currentScoring.complianceScore}%</div>
                <Progress value={currentScoring.complianceScore} className="h-2 mt-1" />
              </div>
              <div className="text-right">
                <div className="text-gray-600 font-semibold">Hallazgos pendientes</div>
                <div className="text-3xl font-bold text-amber-600">{currentScoring.progress.pending}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="glass-card p-4 mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Filtros</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button key={category.name} onClick={() => setActiveCategory(category.name)} className={`w-full flex items-center justify-between p-2 text-sm rounded-lg transition-colors ${activeCategory === category.name ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-200/50'}`}>
                    <span>{category.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeCategory === category.name ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar hallazgos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Lista principal */}
          <div className="col-span-6">
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div 
                  key={finding.id} 
                  className="glass-card p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{finding.titulo_incidencia}</h3>
                      <p className="text-sm text-gray-600">{finding.nombre_archivo_normativa}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(finding.gravedad)}`}>
                        {finding.gravedad}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        {finding.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50/80 rounded border-l-4 border-amber-500">
                    <p className="text-sm text-gray-800 italic">"{finding.evidencia}"</p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('why'); }}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm font-semibold hover:bg-blue-200 flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>¿Por qué está mal?</span>
                    </button>
                    
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('fix'); }}
                      className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm font-semibold hover:bg-green-200 flex items-center space-x-1.5"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>¿Cómo lo arreglo?</span>
                    </button>
                    
                    <button 
                      onClick={() => { setSelectedFinding(finding); setActiveModal('challenge'); }}
                      className="px-3 py-2 bg-orange-100 text-orange-800 rounded text-sm font-semibold hover:bg-orange-200 flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Quiero cuestionarlo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Resumen */}
          <div className="col-span-3">
            <div className="glass-card p-4 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Resumen del Análisis</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hallazgos críticos</span>
                  <span className="font-medium text-red-600">
                    {findings.filter(f => f.gravedad === 'Alta').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Riesgo de impugnación</span>
                  <span className="font-medium text-red-600">Alto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tiempo estimado corrección</span>
                  <span className="font-medium text-gray-800">3-5 días</span>
                </div>
              </div>

              <div className="border-t border-gray-200/60 pt-4">
                <h4 className="font-semibold text-sm mb-2 text-gray-800">Próximos pasos recomendados</h4>
                <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>Corregir hallazgos críticos primero</li>
                  <li>Obtener certificación presupuestaria completa</li>
                  <li>Revisar criterios de habilitación</li>
                  <li>Validar cláusulas contractuales</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'why' && selectedFinding && <WhyModal finding={selectedFinding} onClose={() => setActiveModal(null)} />}
      {activeModal === 'fix' && selectedFinding && <HowToFixModal finding={selectedFinding} onClose={() => setActiveModal(null)} onApply={handleFindingStatusChange} />}
      {activeModal === 'challenge' && selectedFinding && <ChallengeModal finding={selectedFinding} onClose={() => setActiveModal(null)} />}
    </div>
  );
};

// Modal: ¿Por qué está mal?
const WhyModal = ({ finding, onClose }: { finding: any, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">¿Por qué es problemático?</h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
        </button>
      </div>
      <div className="p-6 space-y-6 overflow-y-auto">
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Hallazgo:</h4>
          <p className="text-base text-gray-800 italic bg-gray-50 p-3 rounded-lg border">"{finding.evidencia}"</p>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Explicación Legal:</h4>
          <p className="text-base text-gray-800">{finding.justificacion_legal}</p>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Consecuencia Estimada:</h4>
          <p className="text-base text-red-600 font-semibold">{finding.consecuencia_estimada}</p>
        </div>
      </div>
    </div>
  </div>
);

// Modal: ¿Cómo lo arreglo?
const HowToFixModal = ({ finding, onClose, onApply }: { finding: any, onClose: () => void, onApply: (id: string, status: FindingStatus) => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">¿Cómo lo arreglo?</h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
        </button>
      </div>
      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-gray-700">Solución recomendada:</h4>
          <p className="text-base mb-4 text-gray-800">{finding.propuesta_redaccion || finding.propuesta_procedimiento}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
          Cerrar
        </button>
        <button onClick={() => onApply(finding.id, 'applied')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
          Aplicar Solución
        </button>
      </div>
    </div>
  </div>
);

// Modal: Quiero cuestionarlo
const ChallengeModal = ({ finding, onClose }: { finding: any, onClose: () => void }) => {
  const [argumentType, setArgumentType] = useState('');
  const [argument, setArgument] = useState('');

  const argumentTypes = [
    { id: 'evidence', label: 'Tengo evidencia adicional', description: 'Documentos que no fueron considerados' },
    { id: 'interpretation', label: 'Interpretación normativa diferente', description: 'La norma aplica de otra manera' },
    { id: 'context', label: 'Contexto especial', description: 'Circunstancias que justifican la situación' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Cuestionar Hallazgo</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm text-amber-800">"{finding.evidencia}"</p>
          </div>
          
          {!argumentType ? (
            <div>
              <h4 className="font-medium mb-3 text-gray-700">¿En qué basas tu objeción?</h4>
              <div className="space-y-2">
                {argumentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setArgumentType(type.id)}
                    className="w-full p-4 text-left border rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium mb-3 text-gray-700">
                {argumentTypes.find(t => t.id === argumentType)?.label}
              </h4>
              <textarea
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                placeholder="Explica tu argumento de manera clara y específica..."
                className="w-full p-3 border rounded-lg resize-none border-gray-300 focus:ring-2 focus:ring-blue-500"
                rows={5}
              />
              <div className="flex space-x-3 mt-4 justify-end">
                <button 
                  onClick={() => setArgumentType('')}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cambiar Enfoque
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Generar Documento de Objeción
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
