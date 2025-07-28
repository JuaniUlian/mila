
'use client';

import React, { useState, useMemo } from 'react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, XCircle, FileText, Lightbulb, Scale, ChevronRight, BookCheck, ClipboardList, FilePen, ChevronDown, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface IncidentsListProps {
  findings: FindingWithStatus[];
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
}

const TYPE_TO_CATEGORY: Record<string, { label: string; icon: React.ElementType }> = {
  'Irregularidad': { label: 'Legal', icon: Scale },
  'Mejora de Redacción': { label: 'Redacción', icon: FilePen },
  'Sin hallazgos relevantes': { label: 'Informativo', icon: Lightbulb }
};

const SEVERITY_LINE_COLOR: Record<string, string> = {
  'Alta': 'bg-red-500',
  'Media': 'bg-amber-500', 
  'Baja': 'bg-sky-500',
  'Informativa': 'bg-gray-400'
};

const SEVERITY_TEXT_COLOR: Record<string, string> = {
  'Alta': 'text-red-600',
  'Media': 'text-amber-600',
  'Baja': 'text-sky-600',
  'Informativa': 'text-gray-600',
};


export function IncidentsList({ 
  findings, 
  onFindingStatusChange, 
}: IncidentsListProps) {
  const [editingFinding, setEditingFinding] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    propuesta_redaccion?: string;
    propuesta_procedimiento?: string;
  }>({});
  
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);


  const validFindings = useMemo(() => findings.filter(f => f.tipo !== 'Sin hallazgos relevantes'), [findings]);

  const findingsByCategory = useMemo(() => {
    const grouped: Record<string, FindingWithStatus[]> = {};
    validFindings.forEach(finding => {
      const categoryLabel = TYPE_TO_CATEGORY[finding.tipo]?.label || 'Otros';
      if (!grouped[categoryLabel]) {
        grouped[categoryLabel] = [];
      }
      grouped[categoryLabel].push(finding);
    });
    return grouped;
  }, [validFindings]);

  const toggleDetails = (findingId: string) => {
    setExpandedDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(findingId)) {
        newSet.delete(findingId);
      } else {
        newSet.add(findingId);
      }
      return newSet;
    });
  };

  const startEditing = (finding: FindingWithStatus) => {
    setEditingFinding(finding.id);
    setEditForm({
      propuesta_redaccion: finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion || '',
      propuesta_procedimiento: finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento || '',
    });
  };
  
  const saveEditing = (findingId: string) => {
    onFindingStatusChange(findingId, 'modified', editForm);
    setEditingFinding(null);
    setEditForm({});
    toast({ title: t('analysisPage.toastSuggestionModified'), description: t('analysisPage.toastSuggestionTextUpdated') });
  };
  
  const cancelEditing = () => {
    setEditingFinding(null);
    setEditForm({});
  };


  if (validFindings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-green-50/50 border border-green-200 shadow-sm text-center p-8 rounded-xl">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">{t('analysisPage.excellent')}</h3>
        <p className="text-muted-foreground">{t('analysisPage.noPendingIncidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Incidencias y Sugerencias</h2>
      {Object.entries(findingsByCategory).map(([category, categoryFindings]) => {
        const highestSeverity = ['Alta', 'Media', 'Baja', 'Informativa'].find(s => categoryFindings.some(f => f.gravedad === s)) || 'Informativa';
        const pendingCount = categoryFindings.filter(f => f.status === 'pending').length;
        const categoryIcon = Object.values(TYPE_TO_CATEGORY).find(c => c.label === category)?.icon || AlertTriangle;

        return (
          <Accordion type="single" collapsible key={category} className="w-full bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <AccordionItem value={category} className="border-b-0">
              <AccordionTrigger className="p-4 hover:no-underline hover:bg-slate-100/70 data-[state=open]:bg-slate-100/70 w-full text-left">
                <div className="flex items-center gap-4 w-full">
                  <div className={cn("w-1.5 h-8 rounded-full", SEVERITY_LINE_COLOR[highestSeverity])} />
                  {React.createElement(categoryIcon, { className: "h-6 w-6 text-primary" })}
                  <h3 className="text-lg font-semibold text-foreground flex-1">{category}</h3>
                  {pendingCount > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-slate-200 px-2 py-1 rounded-md">
                      {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 bg-white">
                <div className="space-y-2">
                  {categoryFindings.map((finding) => (
                    <div key={finding.id} className="border rounded-lg overflow-hidden">
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => toggleDetails(finding.id)}>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.titulo_incidencia}</p>
                          <p className="text-xs text-muted-foreground">
                            Normativa: {finding.nombre_archivo_normativa} - Artículo: {finding.articulo_o_seccion}
                          </p>
                        </div>
                        <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedDetails.has(finding.id) && "rotate-90")} />
                      </div>

                      {expandedDetails.has(finding.id) && (
                         <div className="p-4 border-t bg-slate-50/50 space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2"><FileText size={16}/> Evidencia:</h4>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 text-sm">
                                    <em className="text-gray-800">"{finding.evidencia}"</em>
                                </div>
                            </div>

                            {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
                              <div>
                                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2"><Lightbulb size={16}/> Propuesta de Solución:</h4>
                                  {editingFinding === finding.id ? (
                                    <div className="space-y-3 bg-blue-50/50 p-3 rounded-md">
                                        {finding.propuesta_redaccion !== undefined && (
                                            <div>
                                                <Label className="text-xs font-medium mb-1 block">Propuesta de Redacción:</Label>
                                                <Textarea value={editForm.propuesta_redaccion} onChange={e => setEditForm({...editForm, propuesta_redaccion: e.target.value})} rows={3} />
                                            </div>
                                        )}
                                        {finding.propuesta_procedimiento !== undefined && (
                                           <div>
                                                <Label className="text-xs font-medium mb-1 block">Propuesta de Procedimiento:</Label>
                                                <Textarea value={editForm.propuesta_procedimiento} onChange={e => setEditForm({...editForm, propuesta_procedimiento: e.target.value})} rows={2} />
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => saveEditing(finding.id)}><Check className="mr-1 h-4 w-4"/> Guardar</Button>
                                            <Button size="sm" variant="ghost" onClick={cancelEditing}><XCircle className="mr-1 h-4 w-4"/> Cancelar</Button>
                                        </div>
                                    </div>
                                  ) : (
                                    <div className="bg-green-50 p-3 rounded text-sm space-y-2 border-l-4 border-green-400">
                                      {(finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion) && (
                                        <div><strong className="text-gray-800">Redacción sugerida:</strong><p className="mt-1 italic">"{finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion}"</p></div>
                                      )}
                                      {(finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento) && (
                                        <div><strong className="text-gray-800">Procedimiento sugerido:</strong><p className="mt-1">{finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento}</p></div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div><h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2"><Scale size={16}/> Justificación Legal:</h4><p className="text-gray-600 bg-gray-100 p-2 rounded-md">{finding.justificacion_legal}</p></div>
                                <div><h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2"><ClipboardList size={16}/> Justificación Técnica:</h4><p className="text-gray-600 bg-gray-100 p-2 rounded-md">{finding.justificacion_tecnica}</p></div>
                            </div>
                            
                            <div><h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> Consecuencias Estimadas:</h4><p className="text-sm text-red-700 bg-red-50 p-2 rounded-md">{finding.consecuencia_estimada}</p></div>

                            <div className="flex gap-2 pt-4 border-t">
                              {finding.status === 'pending' ? (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onFindingStatusChange(finding.id, 'applied')}><Check className="mr-2 h-4 w-4"/> Aplicar</Button>
                                  {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && <Button size="sm" variant="outline" onClick={() => startEditing(finding)}><Edit3 className="mr-2 h-4 w-4"/> Editar</Button>}
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onFindingStatusChange(finding.id, 'discarded')}><Trash2 className="mr-2 h-4 w-4"/> Descartar</Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => onFindingStatusChange(finding.id, 'pending')}>↩️ Revertir a Pendiente</Button>
                              )}
                            </div>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
