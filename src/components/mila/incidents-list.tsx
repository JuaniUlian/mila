
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { simulateScoreChange, type FindingWithStatus, type FindingStatus } from '@/ai/flows/compliance-scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Sparkles, XCircle, FileText, Lightbulb, Scale, FlaskConical, AlertTriangle, Loader2, ChevronRight, BookCheck, ClipboardList, FilePen, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { validateSuggestionEdit } from '@/ai/flows/validate-suggestion-edit';

interface IncidentsListProps {
  findings: FindingWithStatus[];
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
  onFindingEdit?: (findingId: string, modifications: any) => void;
  currentScoring?: {
    complianceScore: number;
    legalRiskScore: number;
  } | null;
}

const TYPE_TO_CATEGORY: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'Irregularidad': { 
    label: 'Legal', 
    color: 'red', 
    icon: Scale
  },
  'Mejora de Redacción': { 
    label: 'Redacción', 
    color: 'blue', 
    icon: FilePen
  },
  'Sin hallazgos relevantes': { 
    label: 'Informativo', 
    color: 'gray', 
    icon: Lightbulb
  }
};

const SEVERITY_COLORS: Record<string, {text: string, bg: string, border: string}> = {
  'Alta': {text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-400'},
  'Media': {text: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-400'}, 
  'Baja': {text: 'text-sky-800', bg: 'bg-sky-100', border: 'border-sky-400'},
  'Informativa': {text: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-400'}
};

const STATUS_STYLES: Record<FindingStatus, { bg: string; border: string; label: string; icon: React.ElementType }> = {
  'pending': {
    bg: 'bg-white',
    border: 'border-gray-300',
    label: 'Pendiente',
    icon: Loader2
  },
  'applied': {
    bg: 'bg-green-50',
    border: 'border-green-300',
    label: 'Aplicado',
    icon: Check
  },
  'discarded': {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    label: 'Descartado',
    icon: Trash2
  },
  'modified': {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    label: 'Modificado',
    icon: Edit3
  }
};


export function IncidentsList({ 
  findings, 
  onFindingStatusChange, 
  onFindingEdit,
  currentScoring 
}: IncidentsListProps) {
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [editingFinding, setEditingFinding] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    propuesta_redaccion?: string;
    propuesta_procedimiento?: string;
    justificacion_legal?: string;
    justificacion_tecnica?: string;
  }>({});

  const { t } = useTranslations('es');

  // Filtrar hallazgos válidos (excluir "Sin hallazgos relevantes")
  const validFindings = findings.filter(finding => 
    finding.tipo !== 'Sin hallazgos relevantes'
  );

  // Agrupar por gravedad para mejor organización
  const findingsByGravity = validFindings.reduce((acc, finding) => {
    if (!acc[finding.gravedad]) acc[finding.gravedad] = [];
    acc[finding.gravedad].push(finding);
    return acc;
  }, {} as Record<string, FindingWithStatus[]>);

  const toggleExpanded = (findingId: string) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(findingId)) {
      newExpanded.delete(findingId);
    } else {
      newExpanded.add(findingId);
    }
    setExpandedFindings(newExpanded);
  };

  const startEditing = (finding: FindingWithStatus) => {
    setEditingFinding(finding.id);
    setEditForm({
      propuesta_redaccion: finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion || '',
      propuesta_procedimiento: finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento || '',
      justificacion_legal: finding.userModifications?.justificacion_legal || finding.justificacion_legal,
      justificacion_tecnica: finding.userModifications?.justificacion_tecnica || finding.justificacion_tecnica,
    });
  };

  const saveEditing = (findingId: string) => {
    onFindingStatusChange(findingId, 'modified', editForm);
    setEditingFinding(null);
    setEditForm({});
  };

  const cancelEditing = () => {
    setEditingFinding(null);
    setEditForm({});
  };

  const getScorePreview = (findingId: string, newStatus: FindingStatus) => {
    if (!currentScoring) return null;
    return simulateScoreChange(findings, findingId, newStatus);
  };

  const FindingCard = ({ finding }: { finding: FindingWithStatus }) => {
    const isExpanded = expandedFindings.has(finding.id);
    const isEditing = editingFinding === finding.id;
    const category = TYPE_TO_CATEGORY[finding.tipo];
    const statusStyle = STATUS_STYLES[finding.status];
    const severityStyle = SEVERITY_COLORS[finding.gravedad];

    return (
      <AccordionItem value={finding.id} className={cn("border rounded-xl incident-card-hover overflow-hidden", statusStyle.border, statusStyle.bg)}>
        <AccordionTrigger className="p-4 hover:no-underline" onClick={() => toggleExpanded(finding.id)}>
            <div className="flex items-start justify-between w-full">
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <category.icon className={cn("h-5 w-5", severityStyle.text)} />
                  <h3 className="font-semibold text-gray-900">
                    {finding.titulo_incidencia}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 pl-7">
                    <span>Pág: {finding.pagina}</span>
                    <span>Norma: {finding.nombre_archivo_normativa}</span>
                    {finding.articulo_o_seccion !== 'N/A' && (
                      <span>Art: {finding.articulo_o_seccion}</span>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", severityStyle.bg, severityStyle.text)}>
                  {finding.gravedad}
                </span>
                 <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", statusStyle.bg, statusStyle.border, "border")}>
                   <statusStyle.icon className={cn("inline h-3 w-3 mr-1", statusStyle.label === 'Pendiente' && 'animate-spin')} />
                  {statusStyle.label}
                </span>
                <ChevronDown className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-180")} />
              </div>
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 border-t pt-4">
            {/* Evidencia */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">📋 Evidencia:</h4>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 text-sm">
                <em className="text-gray-800">"{finding.evidencia}"</em>
              </div>
            </div>

            {/* Propuestas */}
            {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">💡 Propuesta de Solución:</h4>
                
                {isEditing ? (
                  <div className="space-y-3 bg-blue-50 p-3 rounded">
                    {finding.propuesta_redaccion && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Propuesta de Redacción:</label>
                        <Textarea
                          value={editForm.propuesta_redaccion || ''}
                          onChange={(e) => setEditForm({...editForm, propuesta_redaccion: e.target.value})}
                          className="w-full p-2 border rounded text-sm"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    {finding.propuesta_procedimiento && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Propuesta de Procedimiento:</label>
                        <Textarea
                          value={editForm.propuesta_procedimiento || ''}
                          onChange={(e) => setEditForm({...editForm, propuesta_procedimiento: e.target.value})}
                          className="w-full p-2 border rounded text-sm"
                          rows={2}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEditing(finding.id)}
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Check className="mr-1 h-4 w-4" /> Guardar
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        size="sm"
                        variant="ghost"
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded text-sm space-y-2 border-l-4 border-green-400">
                    {(finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion) && (
                      <div>
                        <strong className="text-gray-800">Redacción sugerida:</strong>
                        <p className="mt-1 italic">
                          "{finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion}"
                        </p>
                      </div>
                    )}
                    
                    {(finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento) && (
                      <div>
                        <strong className="text-gray-800">Procedimiento sugerido:</strong>
                        <p className="mt-1">{finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Justificaciones */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">⚖️ Justificación Legal:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {finding.userModifications?.justificacion_legal || finding.justificacion_legal}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🔧 Justificación Técnica:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {finding.userModifications?.justificacion_tecnica || finding.justificacion_tecnica}
                </p>
              </div>
            </div>

            {/* Consecuencias estimadas */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">⚠️ Consecuencias Estimadas:</h4>
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {finding.consecuencia_estimada}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4 border-t">
              {finding.status === 'pending' && (
                <>
                  <Button
                    onClick={() => onFindingStatusChange(finding.id, 'applied')}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4"/> Aplicar Solución
                  </Button>
                  
                  {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
                    <Button
                      onClick={() => startEditing(finding)}
                       className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Edit3 className="mr-2 h-4 w-4"/> Editar Propuesta
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => onFindingStatusChange(finding.id, 'discarded')}
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4"/> Descartar
                  </Button>
                </>
              )}

              {finding.status !== 'pending' && (
                <Button
                  onClick={() => onFindingStatusChange(finding.id, 'pending')}
                  variant="outline"
                  className="text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  ↩️ Revertir a Pendiente
                </Button>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (validFindings.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center bg-green-50/50 border-green-200 shadow-sm text-center p-8">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">{t('analysisPage.excellent')}</h3>
        <p className="text-muted-foreground">{t('analysisPage.noPendingIncidents')}</p>
        <p className="text-muted-foreground">{t('analysisPage.documentValidated')}</p>
      </Card>
    );
  }
  
  const gravityOrder = ['Alta', 'Media', 'Baja', 'Informativa'];

  return (
    <Card className="h-full flex flex-col bg-transparent border-none shadow-none overflow-visible">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-xl font-bold text-card-foreground">🔍 Hallazgos Identificados</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
         <Accordion type="multiple" className="space-y-4">
              {gravityOrder.map(gravity => {
                const findingsForGravity = findingsByGravity[gravity];
                if (!findingsForGravity || findingsForGravity.length === 0) return null;

                return findingsForGravity.map(finding => (
                  <FindingCard key={finding.id} finding={finding} />
                ));
              })}
          </Accordion>
      </CardContent>
    </Card>
  );
}
