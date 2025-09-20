
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Check, Edit3, Trash2, XCircle, FileText, Lightbulb, Scale, ChevronRight, BookCheck, ClipboardList, FilePen, AlertTriangle, Briefcase, DraftingCompass, Loader2, MessageSquareWarning, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Label } from '../ui/label';
import { discussFinding, type DiscussionMessage } from '@/ai/flows/discuss-finding';
import { Avatar, AvatarFallback } from '../ui/avatar';


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

const DiscussionPanel = ({ finding }: { finding: FindingWithStatus }) => {
    const [history, setHistory] = useState<DiscussionMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const discussionEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedHistory = localStorage.getItem(`discussion_${finding.id}`);
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, [finding.id]);

    useEffect(() => {
        discussionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: DiscussionMessage = { role: 'user', content: userInput };
        const newHistory = [...history, newUserMessage];
        setHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await discussFinding({ finding, history: newHistory });
            const newAssistantMessage: DiscussionMessage = { role: 'assistant', content: response.reply };
            const finalHistory = [...newHistory, newAssistantMessage];
            setHistory(finalHistory);
            localStorage.setItem(`discussion_${finding.id}`, JSON.stringify(finalHistory));
        } catch (error) {
            console.error("Error in discussion:", error);
            const errorMessage: DiscussionMessage = { role: 'assistant', content: "Lo siento, ha ocurrido un error al procesar tu argumento. Por favor, intenta de nuevo." };
            setHistory([...newHistory, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-100">
            <DialogHeader className="p-4 bg-slate-200 border-b">
                <DialogTitle className="text-lg flex items-center gap-2">
                    <MessageSquareWarning size={20} />
                    Discutir Incidencia: {finding.titulo_incidencia}
                </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        {msg.role === 'assistant' && <Avatar className="h-8 w-8"><AvatarFallback>IA</AvatarFallback></Avatar>}
                        <div className={cn("max-w-md p-3 rounded-lg", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white')}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                         {msg.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>TÚ</AvatarFallback></Avatar>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3 justify-start">
                         <Avatar className="h-8 w-8"><AvatarFallback>IA</AvatarFallback></Avatar>
                         <div className="max-w-md p-3 rounded-lg bg-white">
                             <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                         </div>
                     </div>
                )}
                <div ref={discussionEndRef} />
            </div>
            <div className="p-4 border-t bg-slate-200">
                <div className="flex items-center gap-2">
                    <Textarea 
                        placeholder="Escribe tu argumento aquí..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        rows={1}
                        className="flex-1 resize-none"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};


const IncidentItemContent = ({ finding, onFindingStatusChange, onDialogClose }: {
  finding: FindingWithStatus;
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
  onDialogClose: () => void;
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
    onDialogClose();
    toast({ title: "Sugerencia Modificada", description: "La propuesta de solución ha sido actualizada." });
  };

  const handleApply = () => {
    onFindingStatusChange(finding.id, 'applied');
    onDialogClose();
  }
  
  const handleMarkAsHandled = () => {
    onFindingStatusChange(finding.id, 'applied');
    onDialogClose();
  }

  const handleDiscard = () => {
    onFindingStatusChange(finding.id, 'discarded');
    onDialogClose();
  }

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
                  <Button size="sm" className="btn-neu-green" onClick={handleMarkAsHandled}><Check className="mr-2 h-4 w-4"/> Marcar como Atendido</Button>
              ) : (
                  <>
                      <Button size="sm" className="btn-neu-green" onClick={handleApply}><Check className="mr-2 h-4 w-4"/> Aplicar</Button>
                      <Button size="sm" className="btn-neu-light" onClick={() => setIsEditing(true)}><Edit3 className="mr-2 h-4 w-4"/> Editar</Button>
                  </>
              )}
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDiscard}><Trash2 className="mr-2 h-4 w-4"/> Descartar</Button>
            </>
          ) : (
             <Button size="sm" variant="outline" onClick={() => onFindingStatusChange(finding.id, 'pending')}>↩️ Revertir a Pendiente</Button>
          )}
      </div>
    </div>
  )
}


export function IncidentsList({ 
  findings, 
  onFindingStatusChange, 
}: {
  findings: FindingWithStatus[];
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
}) {
  const [selectedFinding, setSelectedFinding] = useState<FindingWithStatus | null>(null);
  const [discussionFinding, setDiscussionFinding] = useState<FindingWithStatus | null>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);

  const handleOpenDetails = (finding: FindingWithStatus) => {
    setSelectedFinding(finding);
  };
  
  const handleOpenDiscussion = (e: React.MouseEvent, finding: FindingWithStatus) => {
    e.stopPropagation();
    setDiscussionFinding(finding);
  };

  const pendingFindings = useMemo(() => findings.filter(f => f.status === 'pending' && f.tipo !== 'Sin hallazgos relevantes'), [findings]);

  const sortedCategories = useMemo(() => {
    const grouped: Record<string, { findings: FindingWithStatus[], highestSeverity: string }> = {};
    
    pendingFindings.forEach(finding => {
      // @ts-ignore
      const categoryLabel = finding.category || 'Otros';
      if (!grouped[categoryLabel]) {
        grouped[categoryLabel] = { findings: [], highestSeverity: 'Informativa' };
      }
      grouped[categoryLabel].findings.push(finding);
      
      const currentHighest = SEVERITY_ORDER[grouped[categoryLabel].highestSeverity];
      const findingSeverity = SEVERITY_ORDER[finding.gravedad];
      if (findingSeverity < currentHighest) {
        grouped[categoryLabel].highestSeverity = finding.gravedad;
      }
    });

    return Object.entries(grouped).sort(([, a], [, b]) => {
      return SEVERITY_ORDER[a.highestSeverity] - SEVERITY_ORDER[b.highestSeverity];
    });
    
  }, [pendingFindings]);

  if (pendingFindings.length === 0) {
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
    // @ts-ignore
    const translated = t(statusKey);
    return translated === statusKey ? status : translated;
  };

  return (
    <div className="space-y-6">
      {sortedCategories.map(([category, { findings: categoryFindings, highestSeverity }]) => {
        if(categoryFindings.length === 0) return null;

        const pendingCount = categoryFindings.filter(f => f.status === 'pending').length;
        const categoryIcon = CATEGORY_META[category]?.icon || AlertTriangle;

        return (
          <Accordion type="single" collapsible key={category} defaultValue="item-1" className={cn("w-full glass-accordion-item border-l-4", SEVERITY_GRADIENT[highestSeverity])}>
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className={cn("p-4 hover:no-underline w-full text-left group transition-colors duration-300", SEVERITY_HOVER_HUD[highestSeverity])}>
                <div className="flex items-center gap-4 w-full">
                  {React.createElement(categoryIcon, { className: "h-6 w-6 text-primary" })}
                  <h3 className="text-lg font-semibold text-foreground flex-1">{category}</h3>
                  {pendingCount > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-slate-200/60 px-2 py-1 rounded-md">
                      {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]:rotate-90" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-2 bg-white/30">
                <div className="space-y-3">
                  {categoryFindings.map((finding) => (
                    <div 
                      key={finding.id} 
                      className={cn(
                        "group relative rounded-lg cursor-pointer bg-white/40 card-neumorphism transition-all duration-300 hover:scale-[1.02] border-l-4",
                        SEVERITY_GRADIENT[finding.gravedad],
                        SEVERITY_HOVER_HUD[finding.gravedad]
                      )}
                      onClick={() => handleOpenDetails(finding)}
                    >
                      <div className="flex items-center justify-between py-3 px-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{finding.titulo_incidencia}</p>
                          <p className="text-xs text-muted-foreground">
                            Normativa: {finding.nombre_archivo_normativa} - Art: {finding.articulo_o_seccion}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => handleOpenDiscussion(e, finding)}>
                            <MessageSquareWarning className="h-5 w-5 text-muted-foreground group-hover:text-primary"/>
                          </Button>
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
              <DialogHeader className="p-6 bg-slate-50 border-b flex flex-row items-center justify-between">
                <DialogTitle className="text-xl">{selectedFinding.titulo_incidencia}</DialogTitle>
                <DialogClose />
              </DialogHeader>
              <div className="p-6 overflow-y-auto">
                <IncidentItemContent finding={selectedFinding} onFindingStatusChange={onFindingStatusChange} onDialogClose={() => setSelectedFinding(null)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!discussionFinding} onOpenChange={(isOpen) => !isOpen && setDiscussionFinding(null)}>
          <DialogContent className="max-w-2xl w-full h-[80vh] p-0 border-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-lg">
             {discussionFinding && <DiscussionPanel finding={discussionFinding} />}
          </DialogContent>
      </Dialog>
    </div>
  );
}
