
'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, FileText, Scale, AlertTriangle, 
  MessageSquare, HelpCircle, Wrench, Eye, Download,
  ChevronRight, X
} from 'lucide-react';

const MILAFunctional = () => {
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const findings = [
    {
      id: 1,
      title: "Omisión de cláusula de actualización",
      category: "Administrativa", 
      regulation: "Ley 80 de 1993, Art. 3",
      severity: "Crítico",
      status: "Pendiente",
      evidence: "Este contrato busca cubrir todas las necesidades de software de la organización.",
      solution: "Incluir cláusula específica sobre actualizaciones gratuitas durante la vigencia del contrato.",
      consequence: "Posibles sobrecostos no presupuestados por actualizaciones.",
      why: "La Ley 80 exige especificar claramente todas las obligaciones del proveedor. Sin esta cláusula, el Estado queda vulnerable a cobros adicionales por actualizaciones que deberían estar incluidas.",
      howToFix: [
        "1. Agregar al objeto contractual: 'El proveedor garantizará actualizaciones sin costo adicional'",
        "2. Especificar en las obligaciones del contratista el suministro de actualizaciones",
        "3. Incluir penalidades por incumplimiento de actualizaciones gratuitas"
      ]
    },
    {
      id: 2,
      title: "Criterios de habilitación subjetivos",
      category: "Legal",
      regulation: "Ley 1150 de 2007, Art. 5", 
      severity: "Medio",
      status: "Pendiente",
      evidence: "Se requiere 'experiencia satisfactoria' sin definir parámetros objetivos.",
      solution: "Definir criterios cuantificables y objetivos de evaluación.",
      consequence: "Riesgo de impugnaciones por falta de objetividad.",
      why: "Los criterios subjetivos violan el principio de transparencia y pueden generar impugnaciones exitosas que retrasen el proceso.",
      howToFix: [
        "1. Reemplazar 'experiencia satisfactoria' por 'X años de experiencia en proyectos similares'",
        "2. Definir qué se considera 'proyecto similar' con parámetros específicos",
        "3. Establecer criterios de evaluación con puntajes numéricos"
      ]
    },
    {
      id: 3,
      title: "Falta certificación presupuestaria completa",
      category: "Financiera",
      regulation: "Estatuto Orgánico de Presupuesto",
      severity: "Crítico",
      status: "Pendiente",
      evidence: "CDP cubre solo el 80% del valor total estimado del contrato.",
      solution: "Obtener CDP por la totalidad del valor contractual incluyendo imprevistos.",
      consequence: "Imposibilidad legal de ejecutar el contrato completo.",
      why: "Sin certificación presupuestaria completa, el contrato puede declararse nulo por falta de respaldo fiscal.",
      howToFix: [
        "1. Solicitar CDP adicional por el 20% restante del valor",
        "2. Incluir partida para imprevistos (mínimo 5% del valor)",
        "3. Verificar disponibilidad presupuestal en la vigencia correspondiente"
      ]
    }
  ];

  const categories = [
    { name: 'Todos', count: findings.length },
    { name: 'Administrativa', count: findings.filter(f => f.category === 'Administrativa').length },
    { name: 'Legal', count: findings.filter(f => f.category === 'Legal').length },
    { name: 'Financiera', count: findings.filter(f => f.category === 'Financiera').length }
  ];

  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.regulation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Crítico': return 'text-red-700 bg-red-100';
      case 'Medio': return 'text-yellow-700 bg-yellow-100';
      case 'Leve': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Modal: ¿Por qué está mal?
  const WhyModal = ({ finding }: { finding: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">¿Por qué es problemático?</h3>
          <button onClick={() => setActiveModal(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Hallazgo:</h4>
            <p className="text-sm text-gray-600 italic">"{finding.evidence}"</p>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Explicación:</h4>
            <p className="text-sm">{finding.why}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Consecuencia:</h4>
            <p className="text-sm text-red-600">{finding.consequence}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal: ¿Cómo lo arreglo?
  const HowToFixModal = ({ finding }: { finding: any }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">¿Cómo lo arreglo?</h3>
          <button onClick={() => setActiveModal(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Solución recomendada:</h4>
            <p className="text-sm mb-4">{finding.solution}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Pasos específicos:</h4>
            <ol className="text-sm space-y-1">
              {finding.howToFix.map((step: string, index: number) => (
                <li key={index} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Aplicar Solución
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal: Quiero cuestionarlo
  const ChallengeModal = ({ finding }: { finding: any }) => {
    const [argumentType, setArgumentType] = useState('');
    const [argument, setArgument] = useState('');

    const argumentTypes = [
      { id: 'evidence', label: 'Tengo evidencia adicional', description: 'Documentos que no fueron considerados' },
      { id: 'interpretation', label: 'Interpretación normativa diferente', description: 'La norma aplica de otra manera' },
      { id: 'context', label: 'Contexto especial', description: 'Circunstancias que justifican la situación' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Cuestionar Hallazgo</h3>
            <button onClick={() => setActiveModal(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">"{finding.evidence}"</p>
            </div>
            
            {!argumentType ? (
              <div>
                <h4 className="font-medium mb-3">¿En qué basas tu objeción?</h4>
                <div className="space-y-2">
                  {argumentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setArgumentType(type.id)}
                      className="w-full p-3 text-left border rounded hover:bg-gray-50"
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-3">
                  {argumentTypes.find(t => t.id === argumentType)?.label}
                </h4>
                <textarea
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  placeholder="Explica tu argumento de manera clara y específica..."
                  className="w-full p-3 border rounded resize-none"
                  rows={4}
                />
                <div className="flex space-x-3 mt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Generar Documento de Objeción
                  </button>
                  <button 
                    onClick={() => setArgumentType('')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Cambiar Enfoque
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Evaluación Pliego XYZ-2025</h1>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-right">
                <div className="text-gray-600">Cumplimiento</div>
                <div className="text-2xl font-bold text-red-600">28%</div>
              </div>
              <div className="text-right">
                <div className="text-gray-600">Hallazgos pendientes</div>
                <div className="text-2xl font-bold text-red-600">{findings.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg border p-4 mb-6">
              <h3 className="font-medium mb-3">Filtros</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-2 text-sm">
                    <span>{category.name}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Búsqueda */}
            <div className="bg-white rounded-lg border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar hallazgos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
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
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{finding.title}</h3>
                      <p className="text-sm text-gray-600">{finding.regulation}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        {finding.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-gray-50 rounded border-l-4 border-red-500">
                    <p className="text-sm text-gray-700 italic">"{finding.evidence}"</p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedFinding(finding);
                        setActiveModal('why');
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center space-x-1"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>¿Por qué está mal?</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSelectedFinding(finding);
                        setActiveModal('fix');
                      }}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 flex items-center space-x-1"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>¿Cómo lo arreglo?</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setSelectedFinding(finding);
                        setActiveModal('challenge');
                      }}
                      className="px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 flex items-center space-x-1"
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
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <h3 className="font-medium mb-4">Resumen del Análisis</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hallazgos críticos</span>
                  <span className="font-medium text-red-600">
                    {findings.filter(f => f.severity === 'Crítico').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Riesgo de impugnación</span>
                  <span className="font-medium text-red-600">Alto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tiempo estimado corrección</span>
                  <span className="font-medium">3-5 días</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Próximos pasos recomendados</h4>
                <ol className="text-xs text-gray-600 space-y-1">
                  <li>1. Corregir hallazgos críticos primero</li>
                  <li>2. Obtener certificación presupuestaria completa</li>
                  <li>3. Revisar criterios de habilitación</li>
                  <li>4. Validar cláusulas contractuales</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'why' && selectedFinding && <WhyModal finding={selectedFinding} />}
      {activeModal === 'fix' && selectedFinding && <HowToFixModal finding={selectedFinding} />}
      {activeModal === 'challenge' && selectedFinding && <ChallengeModal finding={selectedFinding} />}
    </div>
  );
};

export default MILAFunctional;
