
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
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../layout/logo';
import { DiscussionModal } from './discussion-modal';


const CATEGORY_META: Record<string, { icon: React.ElementType }> = {
  'Legal': { icon: Scale },
  'Redacción': { icon: FilePen },
  'Procedimental': { icon: Briefcase },
  'Administrativa': { icon: ClipboardList },
  'Formal': { icon: DraftingCompass },
  'Técnica': { icon: AlertTriangle },
  'Informativo': { icon: Lightbulb },
};

// MEJORA: Nuevos gradientes más profesionales y sutiles
const SEVERITY_STYLES: Record<string, {
  gradient: string;
  hoverClass: string;
  badgeClass: string;
  iconColor: string;
}> = {
  'Alta': { 
    gradient: 'border-l-red-500 bg-gradient-to-r from-red-50/80 to-transparent',
    hoverClass: 'hover:from-red-100/90 hover:to-red-50/30',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  'Media': { 
    gradient: 'border-l-amber-500 bg-gradient-to-r from-amber-50/80 to-transparent',
    hoverClass: 'hover:from-amber-100/90 hover:to-amber-50/30',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: 'text-amber-600'
  },
  'Baja': { 
    gradient: 'border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-transparent',
    hoverClass: 'hover:from-blue-100/90 hover:to-blue-50/30',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  'Informativa': { 
    gradient: 'border-l-slate-500 bg-gradient-to-r from-slate-50/80 to-transparent',
    hoverClass: 'hover:from-slate-100/90 hover:to-slate-50/30',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    iconColor: 'text-slate-600'
  }
};

const SEVERITY_ORDER: Record<string, number> = {
    'Alta': 1,
    'Media': 2,
    'Baja': 3,
    'Informativa': 4,
};

export const DiscussionPanel = ({ finding, onClose }: { finding: FindingWithStatus; onClose?: () => void; }) => {
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
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquareWarning size={20} />
                    Discutir Incidencia
                </h3>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                       <XCircle className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800">
                <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                        {history.map((msg, index) => (
                            <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                {msg.role === 'assistant' && (
                                    <Avatar className="h-8 w-8 p-1">
                                        <Logo variant="color"/>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-md p-3 rounded-lg",
                                    msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted dark:bg-gray-700'
                                )}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.role === 'user' && (
                                    <Avatar className="h-8 w-8 bg-primary/20">
                                        <AvatarFallback className="text-primary font-semibold text-xs">TÚ</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8 p-1">
                                    <Logo variant="color"/>
                                </Avatar>
                                <div className="max-w-md p-3 rounded-lg bg-muted border">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={discussionEndRef} />
                    </div>
                </ScrollArea>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Textarea 
                        placeholder="Escribe tu argumento aquí..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        rows={1}
                        className="flex-1 resize-none bg-gray-100 dark:bg-gray-700"
                        disabled={isLoading}
                    />
                    <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !userInput.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};


const IncidentItemContent = ({ finding, onFindingStatusChange, onDialogClose, onOpenDiscussion }: {
  finding: FindingWithStatus;
  onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
  onDialogClose: () => void;
  onOpenDiscussion: (finding: FindingWithStatus) => void;
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
          <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText size={16}/> Evidencia:</h4>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md text-sm">
              <em className="text-gray-800">"{finding.evidencia}"</em>
          </div>
      </div>

      {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
        <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb size={16}/> Propuesta de Solución:</h4>
            {isEditing ? (
              <div className="space-y-4 bg-blue-50/50 p-4 rounded-md border border-blue-200">
                  {finding.propuesta_redaccion !== undefined && (
                      <div>
                          <Label htmlFor="edit-redaccion" className="text-sm font-medium mb-1 block">Propuesta de Redacción:</Label>
                          <Textarea 
                            id="edit-redaccion" 
                            value={editForm.propuesta_redaccion} 
                            onChange={e => setEditForm({...editForm, propuesta_redaccion: e.target.value})} 
                            rows={4}
                            className="bg-background"
                          />
                      </div>
                  )}
                  {finding.propuesta_procedimiento !== undefined && (
                     <div>
                          <Label htmlFor="edit-procedimiento" className="text-sm font-medium mb-1 block">Propuesta de Procedimiento:</Label>
                          <Textarea 
                            id="edit-procedimiento" 
                            value={editForm.propuesta_procedimiento} 
                            onChange={e => setEditForm({...editForm, propuesta_procedimiento: e.target.value})} 
                            rows={2}
                            className="bg-background"
                          />
                      </div>
                  )}
                  <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Check className="mr-1 h-4 w-4"/> Guardar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><XCircle className="mr-1 h-4 w-4"/> Cancelar</Button>
                  </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded text-sm space-y-3 border-l-4 border-green-400">
                {(finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion) && (
                  <div><strong className="text-gray-900">Redacción sugerida:</strong><p className="mt-1 italic text-gray-700">"{finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion}"</p></div>
                )}
                {(finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento) && (
                  <div><strong className="text-gray-900">Procedimiento sugerido:</strong><p className="mt-1 text-gray-700">{finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento}</p></div>
                )}
              </div>
            )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><h4 className="font-semibold mb-2 flex items-center gap-2"><Scale size={16}/> Justificación Legal:</h4><p className="text-muted-foreground bg-slate-100 p-3 rounded-md border">{finding.justificacion_legal}</p></div>
          <div><h4 className="font-semibold mb-2 flex items-center gap-2"><ClipboardList size={16}/> Justificación Técnica:</h4><p className="text-muted-foreground bg-slate-100 p-3 rounded-md border">{finding.justificacion_tecnica}</p></div>
      </div>
      
      <div><h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-destructive"/> Consecuencias Estimadas:</h4><p className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-md border border-destructive/20">{finding.consecuencia_estimada}</p></div>

      {/* MEJORA: Botón "Discutir" junto a las otras acciones */}
      <div className="flex gap-2 pt-4 border-t items-center justify-end flex-wrap">
          {finding.status === 'pending' ? (
            <>
              <Button size="sm" variant="outline" onClick={() => onOpenDiscussion(finding)}>
                <MessageSquareWarning className="mr-2 h-4 w-4"/> Discutir
              </Button>
              {finding.propuesta_procedimiento && !finding.propuesta_redaccion ? (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleMarkAsHandled}><Check className="mr-2 h-4 w-4"/> Marcar como Atendido</Button>
              ) : (
                  <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApply}><Check className="mr-2 h-4 w-4"/> Aplicar</Button>
                      <Button size="sm" onClick={() => setIsEditing(true)}><Edit3 className="mr-2 h-4 w-4"/> Editar</Button>
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
  
  const handleOpenDiscussion = (finding: FindingWithStatus) => {
    setDiscussionFinding(finding);
    setSelectedFinding(null); // Close details dialog if open
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
        <h3 className="text-xl font-semibold">{t('analysisPage.excellent')}</h3>
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
        const severityStyle = SEVERITY_STYLES[highestSeverity];

        return (
          <Accordion type="single" collapsible key={category} defaultValue="item-1" className={cn(
            "w-full rounded-xl overflow-hidden border-l-4 shadow-sm card-neumorphism",
            severityStyle.gradient
          )}>
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className={cn(
                "p-6 hover:no-underline w-full text-left group transition-all duration-300",
                severityStyle.hoverClass
              )}>
                <div className="flex items-center gap-4 w-full">
                  {React.createElement(categoryIcon, { 
                    className: cn("h-7 w-7", severityStyle.iconColor)
                  })}
                  <h3 className="text-lg font-semibold flex-1">{category}</h3>
                  {pendingCount > 0 && (
                    <span className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border",
                      severityStyle.badgeClass
                    )}>
                      {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground group-data-[state=open]:rotate-90" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-2">
                <div className="space-y-4">
                  {categoryFindings.map((finding) => {
                    const findingSeverityStyle = SEVERITY_STYLES[finding.gravedad];
                    return (
                      <div 
                        key={finding.id} 
                        className={cn(
                          "group relative rounded-xl cursor-pointer transition-all duration-300 card-neumorphism",
                          "border-l-4 shadow-sm hover:shadow-md",
                          findingSeverityStyle.gradient,
                          findingSeverityStyle.hoverClass
                        )}
                        onClick={() => handleOpenDetails(finding)}
                      >
                        <div className="flex items-center justify-between py-4 px-5">
                          <div className="flex-1">
                            <p className="font-semibold mb-1">{finding.titulo_incidencia}</p>
                            <p className="text-xs text-muted-foreground">
                              Normativa: {finding.nombre_archivo_normativa} - Art: {finding.articulo_o_seccion}
                            </p>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", 
                              finding.status === 'pending' && 'bg-amber-100 text-amber-800 border-amber-200',
                              finding.status === 'applied' && 'bg-green-100 text-green-800 border-green-200',
                              finding.status === 'discarded' && 'bg-slate-200 text-slate-700 border-slate-300',
                              finding.status === 'modified' && 'bg-blue-100 text-blue-800 border-blue-200'
                            )}>
                              {getTranslatedStatus(finding.status)}
                            </span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}

      <Dialog open={!!selectedFinding} onOpenChange={(isOpen) => !isOpen && setSelectedFinding(null)}>
        <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-2xl">
          {selectedFinding && (
            <>
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex items-center justify-between">
                  <DialogTitle className="text-xl text-gray-900 dark:text-gray-100">{selectedFinding.titulo_incidencia}</DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </DialogClose>
              </div>
              <ScrollArea className="bg-white dark:bg-gray-800">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <IncidentItemContent 
                      finding={selectedFinding} 
                      onFindingStatusChange={onFindingStatusChange} 
                      onDialogClose={() => setSelectedFinding(null)}
                      onOpenDiscussion={handleOpenDiscussion}
                    />
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <DiscussionModal 
        isOpen={!!discussionFinding} 
        onClose={() => setDiscussionFinding(null)} 
        finding={discussionFinding} 
      />
    </div>
  );
}
