
'use client';

import React, { useState, useMemo } from 'react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Check, Edit3, Trash2, XCircle, FileText, Lightbulb, Scale, ChevronRight, BookCheck, ClipboardList, FilePen, AlertTriangle, Briefcase, DraftingCompass } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Label } from '../ui/label';

interface IncidentsListProps {
  findings: FindingWithStatus[];
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
}

const CATEGORY_META: Record<string, { icon: React.ElementType }> = {
  'Legal': { icon: Scale },
  'Redacción': { icon: FilePen },
  'Procedimental': { icon: Briefcase },
  'Administrativa': { icon: ClipboardList },
  'Formal': { icon: DraftingCompass },
  'Técnica': { icon: AlertTriangle },
  'Informativo': { icon: Lightbulb },
};

const SEVERITY_GRADIENT: Record<string, string> = {
  'Alta': 'border-gradient-red',
  'Media': 'border-gradient-amber', 
  'Baja': 'border-gradient-sky',
  'Informativa': 'border-gradient-gray'
};

const SEVERITY_HOVER_HUD: Record<string, string> = {
  'Alta': 'hover-hud-red',
  'Media': 'hover-hud-amber',
  'Baja': 'hover-hud-sky',
  'Informativa': 'hover-hud-gray'
};

const SEVERITY_ORDER: Record<string, number> = {
    'Alta': 1,
    'Media': 2,
    'Baja': 3,
    'Informativa': 4,
};


const IncidentItemContent = ({ finding, onFindingStatusChange }: {
  finding: FindingWithStatus;
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    propuesta_redaccion: finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion || '',
    propuesta_procedimiento: finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento || '',
  });

  const handleSave = () => {
    onFindingStatusChange(finding.id, 'modified', editForm);
    setIsEditing(false);
    toast({ title: "Sugerencia Modificada", description: "La propuesta de solución ha sido actualizada." });
  };
  
  return (
    <div className="space-y-6">
      <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><FileText size={16}/> Evidencia:</h4>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md text-sm">
              <em className="text-gray-800">"{finding.evidencia}"</em>
          </div>
      </div>

      {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
        <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Lightbulb size={16}/> Propuesta de Solución:</h4>
            {isEditing ? (
              <div className="space-y-4 bg-blue-50/50 p-4 rounded-md border border-blue-200">
                  {finding.propuesta_redaccion !== undefined && (
                      <div>
                          <Label htmlFor="edit-redaccion" className="text-sm font-medium mb-1 block text-foreground">Propuesta de Redacción:</Label>
                          <Textarea id="edit-redaccion" value={editForm.propuesta_redaccion} onChange={e => setEditForm({...editForm, propuesta_redaccion: e.target.value})} rows={4} />
                      </div>
                  )}
                  {finding.propuesta_procedimiento !== undefined && (
                     <div>
                          <Label htmlFor="edit-procedimiento" className="text-sm font-medium mb-1 block text-foreground">Propuesta de Procedimiento:</Label>
                          <Textarea id="edit-procedimiento" value={editForm.propuesta_procedimiento} onChange={e => setEditForm({...editForm, propuesta_procedimiento: e.target.value})} rows={2} />
                      </div>
                  )}
                  <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={handleSave} className="btn-neu-light"><Check className="mr-1 h-4 w-4"/> Guardar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><XCircle className="mr-1 h-4 w-4"/> Cancelar</Button>
                  </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded text-sm space-y-3 border-l-4 border-green-400">
                {(finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion) && (
                  <div><strong className="text-foreground">Redacción sugerida:</strong><p className="mt-1 italic text-gray-700">"{finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion}"</p></div>
                )}
                {(finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento) && (
                  <div><strong className="text-foreground">Procedimiento sugerido:</strong><p className="mt-1 text-gray-700">{finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento}</p></div>
                )}
              </div>
            )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Scale size={16}/> Justificación Legal:</h4><p className="text-muted-foreground bg-slate-100 p-3 rounded-md border">{finding.justificacion_legal}</p></div>
          <div><h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ClipboardList size={16}/> Justificación Técnica:</h4><p className="text-muted-foreground bg-slate-100 p-3 rounded-md border">{finding.justificacion_tecnica}</p></div>
      </div>
      
      <div><h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-destructive"/> Consecuencias Estimadas:</h4><p className="text-sm text-destructive-foreground bg-destructive/80 p-3 rounded-md">{finding.consecuencia_estimada}</p></div>

      <div className="flex gap-2 pt-4 border-t items-center justify-end">
          {finding.status === 'pending' ? (
            <>
              {finding.propuesta_procedimiento && !finding.propuesta_redaccion ? (
                  <Button size="sm" className="btn-neu-light" onClick={() => onFindingStatusChange(finding.id, 'applied')}><Check className="mr-2 h-4 w-4"/> Marcar como Atendido</Button>
              ) : (
                  <>
                      <Button size="sm" className="btn-neu-green" onClick={() => onFindingStatusChange(finding.id, 'applied')}><Check className="mr-2 h-4 w-4"/> Aplicar</Button>
                      <Button size="sm" className="btn-neu-light" onClick={() => setIsEditing(true)}><Edit3 className="mr-2 h-4 w-4"/> Editar</Button>
                  </>
              )}
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onFindingStatusChange(finding.id, 'discarded')}><Trash2 className="mr-2 h-4 w-4"/> Descartar</Button>
            </>
          ) : (
              <DialogClose asChild>
                  <Button size="sm" variant="outline" onClick={() => onFindingStatusChange(finding.id, 'pending')}>↩️ Revertir a Pendiente</Button>
              </DialogClose>
          )}
      </div>
    </div>
  )
}


export function IncidentsList({ 
  findings, 
  onFindingStatusChange, 
}: IncidentsListProps) {
  const [selectedFinding, setSelectedFinding] = useState<FindingWithStatus | null>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);

  const validFindings = useMemo(() => findings.filter(f => f.tipo !== 'Sin hallazgos relevantes'), [findings]);

  const findingsByCategory = useMemo(() => {
    const grouped: Record<string, FindingWithStatus[]> = {};
    validFindings.forEach(finding => {
      // @ts-ignore
      const categoryLabel = finding.category || 'Otros';
      if (!grouped[categoryLabel]) {
        grouped[categoryLabel] = [];
      }
      grouped[categoryLabel].push(finding);
    });
    // Sort findings within each category by severity
    for (const category in grouped) {
        grouped[category].sort((a, b) => SEVERITY_ORDER[a.gravedad] - SEVERITY_ORDER[b.gravedad]);
    }
    return grouped;
  }, [validFindings]);

  if (validFindings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-green-50/50 border border-green-200 shadow-sm text-center p-8 rounded-xl">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">{t('analysisPage.excellent')}</h3>
        <p className="text-muted-foreground">{t('analysisPage.noPendingIncidents')}</p>
      </div>
    );
  }

  const getTranslatedStatus = (status: FindingStatus) => {
    const statusKey = `reportPreviewPage.status.${status}`;
    const translated = t(statusKey);
    return translated === statusKey ? status : translated;
  };

  return (
    <div className="space-y-6">
      {Object.entries(findingsByCategory).map(([category, categoryFindings]) => {
        const highestSeverity = ['Alta', 'Media', 'Baja', 'Informativa'].find(s => categoryFindings.some(f => f.gravedad === s)) || 'Informativa';
        const pendingCount = categoryFindings.filter(f => f.status === 'pending').length;
        const categoryIcon = CATEGORY_META[category]?.icon || AlertTriangle;

        return (
          <Accordion type="single" collapsible key={category} defaultValue="item-1" className={cn("w-full bg-slate-50 rounded-xl overflow-hidden card-neumorphism border-l-4", SEVERITY_GRADIENT[highestSeverity])}>
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className={cn("p-4 hover:no-underline w-full text-left group transition-colors duration-300", SEVERITY_HOVER_HUD[highestSeverity])}>
                <div className="flex items-center gap-4 w-full">
                  {React.createElement(categoryIcon, { className: "h-6 w-6 text-primary" })}
                  <h3 className="text-lg font-semibold text-foreground flex-1">{category}</h3>
                  {pendingCount > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-slate-200 px-2 py-1 rounded-md">
                      {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]:rotate-90" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 bg-white">
                <div className="space-y-3">
                  {categoryFindings.map((finding) => (
                    <div 
                      key={finding.id} 
                      className={cn(
                        "group relative rounded-lg cursor-pointer bg-white card-neumorphism transition-all duration-300 hover:scale-[1.02] border-l-4",
                        SEVERITY_GRADIENT[finding.gravedad],
                        SEVERITY_HOVER_HUD[finding.gravedad]
                      )}
                      onClick={() => setSelectedFinding(finding)}
                    >
                      <div className="flex items-center justify-between py-3 px-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.titulo_incidencia}</p>
                          <p className="text-xs text-muted-foreground">
                            Normativa: {finding.nombre_archivo_normativa} - Art: {finding.articulo_o_seccion}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", 
                            finding.status === 'pending' && 'bg-amber-100 text-amber-800',
                            finding.status === 'applied' && 'bg-green-100 text-green-800',
                            finding.status === 'discarded' && 'bg-slate-200 text-slate-600',
                            finding.status === 'modified' && 'bg-blue-100 text-blue-800'
                          )}>
                            {getTranslatedStatus(finding.status)}
                          </span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}

      <Dialog open={!!selectedFinding} onOpenChange={(isOpen) => !isOpen && setSelectedFinding(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-lg bg-white/80 backdrop-blur-xl border-white/30">
          {selectedFinding && (
            <>
              <DialogHeader className="p-6 bg-slate-50 border-b">
                <DialogTitle className="text-xl">{selectedFinding.titulo_incidencia}</DialogTitle>
              </DialogHeader>
              <div className="p-6 overflow-y-auto">
                <IncidentItemContent finding={selectedFinding} onFindingStatusChange={onFindingStatusChange} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
