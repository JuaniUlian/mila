
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { FindingWithStatus, FindingStatus } from '@/ai/flows/compliance-scoring';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Check, Edit3, Trash2, XCircle, FileText, Lightbulb, Scale, ChevronRight, BookCheck, ClipboardList, FilePen, AlertTriangle, Briefcase, DraftingCompass, Loader2, MessageSquareWarning, Send, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { Label } from '../ui/label';
import { discussFinding, type DiscussionMessage, discussFindingAction } from '@/ai/flows/discuss-finding';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../layout/logo';
import { DiscussionModal } from './discussion-modal';
import { z } from 'zod';


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


const TypingStream = ({
  stream,
  onFinished,
}: {
  stream: ReadableStream<Uint8Array>;
  onFinished: (fullText: string) => void;
}) => {
  const [text, setText] = useState('');
  const fullTextRef = useRef('');
  const decoder = new TextDecoder();

  useEffect(() => {
    let isMounted = true;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    
    async function processStream() {
      try {
        reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (isMounted) {
            const chunk = decoder.decode(value, { stream: true });
            fullTextRef.current += chunk;
            setText(fullTextRef.current);
          }
        }
        if (isMounted) {
          onFinished(fullTextRef.current);
        }
      } catch (error) {
        if (isMounted) {
          // Check if the error is due to cancellation, which is expected on unmount
          if (!error || (error as Error).name !== 'AbortError') {
             console.error("Stream reading error:", error);
          }
        }
      } finally {
        if (reader) {
          reader.releaseLock();
        }
      }
    }
    
    processStream();

    return () => {
      isMounted = false;
      // Attempt to cancel the stream on component unmount
      if (stream.cancel) {
        stream.cancel().catch(e => console.warn("Stream cancellation failed:", e));
      }
    };
  }, [stream, onFinished, decoder]);

  return <p className="text-sm whitespace-pre-wrap">{text}</p>;
};

export const DiscussionPanel = ({ finding, onClose }: { finding: FindingWithStatus; onClose?: () => void; }) => {
    const [history, setHistory] = useState<DiscussionMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [stream, setStream] = useState<ReadableStream<Uint8Array> | null>(null);
    const discussionEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedHistory = localStorage.getItem(`discussion_${finding.id}`);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch {
                localStorage.removeItem(`discussion_${finding.id}`);
            }
        } else {
            setHistory([]);
        }
    }, [finding.id]);

    useEffect(() => {
        discussionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, stream]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: DiscussionMessage = { role: 'user', content: userInput };
        const updatedHistory = [...history, newUserMessage];
        setHistory(updatedHistory);
        setUserInput('');
        setIsLoading(true);
        setStream(null);

        try {
          const response = await fetch('/api/discuss-finding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: updatedHistory, finding }),
          });

          if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({ error: 'Streaming failed' }));
            throw new Error(errorData.error);
          }
          
          setStream(response.body);

        } catch (error) {
            console.error("Error in discussion stream:", error);
            const errorMessage: DiscussionMessage = { role: 'assistant', content: "Lo siento, ha ocurrido un error al procesar tu argumento. Por favor, intenta de nuevo." };
            setHistory([...updatedHistory, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleStreamFinished = (fullText: string) => {
        const newAssistantMessage: DiscussionMessage = { role: 'assistant', content: fullText };
        setHistory(prevHistory => {
            const finalHistory = [...prevHistory, newAssistantMessage];
            localStorage.setItem(`discussion_${finding.id}`, JSON.stringify(finalHistory));
            return finalHistory;
        });
        setIsLoading(false);
        setStream(null);
    };

    return (
        <>
            <DialogHeader className="bg-slate-100 px-6 py-4 border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <MessageSquareWarning size={20} />
                        Discutir Incidencia
                    </DialogTitle>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500 hover:bg-slate-200">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cerrar</span>
                        </Button>
                    )}
                </div>
                 <div className="mt-4 bg-slate-200/70 border border-slate-300/80 rounded-lg p-3 text-sm space-y-2">
                    <div>
                        <p className="font-semibold text-slate-800">{finding.titulo_incidencia}</p>
                        <blockquote className="mt-1 text-slate-600 border-l-2 border-slate-400 pl-2 italic">
                            "{finding.evidencia}"
                        </blockquote>
                    </div>
                    <p className="text-xs text-slate-500">
                        <span className="font-semibold">Normativa:</span> {finding.nombre_archivo_normativa} (Art. {finding.articulo_o_seccion})
                    </p>
                </div>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto">
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
                                    : 'bg-muted'
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
                     {isLoading && !stream && (
                        <div className="flex items-start gap-3 justify-start">
                             <Avatar className="h-8 w-8 p-1"><Logo variant="color"/></Avatar>
                             <div className="max-w-md p-3 rounded-lg bg-muted border">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                             </div>
                        </div>
                    )}
                    {stream && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="h-8 w-8 p-1"><Logo variant="color"/></Avatar>
                            <div className="max-w-md p-3 rounded-lg bg-muted">
                                <TypingStream stream={stream} onFinished={handleStreamFinished} />
                            </div>
                        </div>
                    )}
                    <div ref={discussionEndRef} />
                </div>
            </div>
            <div className="p-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <Textarea 
                        placeholder="Escribe tu argumento aquí..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        rows={1}
                        className="flex-1 resize-none bg-slate-100"
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
        </>
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

  const EditDialogContent = ({ finding, onFindingStatusChange, onDialogClose }: {
    finding: FindingWithStatus;
    onFindingStatusChange: (findingId: string, newStatus: FindingStatus, userModifications?: any) => void;
    onDialogClose: () => void;
  }) => {
      const [editForm, setEditForm] = useState({
        propuesta_redaccion: finding.userModifications?.propuesta_redaccion || finding.propuesta_redaccion || '',
        propuesta_procedimiento: finding.userModifications?.propuesta_procedimiento || finding.propuesta_procedimiento || '',
      });

      const handleSave = () => {
        onFindingStatusChange(finding.id, 'modified', editForm);
        onDialogClose();
        toast({ title: "Sugerencia Modificada", description: "La propuesta de solución ha sido actualizada." });
      };

      return (
        <>
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <DialogTitle className="text-xl text-slate-900">Editar Propuesta de Solución</DialogTitle>
          </DialogHeader>
          <ScrollArea>
              <div className="p-6 space-y-4">
                  {finding.propuesta_redaccion !== undefined && (
                    <div>
                      <Label htmlFor="edit-redaccion" className="text-sm font-medium mb-1 block text-gray-700">Propuesta de Redacción:</Label>
                      <Textarea id="edit-redaccion" value={editForm.propuesta_redaccion} onChange={e => setEditForm({...editForm, propuesta_redaccion: e.target.value})} rows={6} className="bg-white" />
                    </div>
                  )}
                  {finding.propuesta_procedimiento !== undefined && (
                    <div>
                      <Label htmlFor="edit-procedimiento" className="text-sm font-medium mb-1 block text-gray-700">Propuesta de Procedimiento:</Label>
                      <Textarea id="edit-procedimiento" value={editForm.propuesta_procedimiento} onChange={e => setEditForm({...editForm, propuesta_procedimiento: e.target.value})} rows={3} className="bg-white" />
                    </div>
                  )}
              </div>
          </ScrollArea>
          <DialogFooter className="bg-slate-100/80 p-3 border-t">
              <Button size="sm" variant="ghost" onClick={onDialogClose}><XCircle className="mr-1 h-4 w-4"/> Cancelar</Button>
              <Button size="sm" onClick={handleSave} className="btn-neu-green"><Check className="mr-1 h-4 w-4"/> Guardar Cambios</Button>
          </DialogFooter>
        </>
      )
  }

  if (isEditing) {
    return (
      <EditDialogContent
        finding={finding}
        onFindingStatusChange={onFindingStatusChange}
        onDialogClose={() => {
          setIsEditing(false);
          onDialogClose();
        }}
      />
    );
  }


  return (
    <>
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="p-6 text-slate-900 space-y-6">
      {/* Evidencia */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base"><FileText size={16}/> Evidencia</h4>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md text-sm text-gray-700">
          <em className="leading-relaxed">"{finding.evidencia}"</em>
        </div>
      </div>

      {/* Propuesta de Solución */}
      {(finding.propuesta_redaccion || finding.propuesta_procedimiento) && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base"><Lightbulb size={16}/> Propuesta de Solución</h4>
            <div className="bg-green-50 p-4 rounded text-sm space-y-3 border-l-4 border-green-400">
              {(finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion) && (
                <div><strong className="text-slate-900 block mb-1">Redacción sugerida:</strong><p className="italic text-slate-700 leading-relaxed">"{finding.userModifications?.propuesta_redaccion ?? finding.propuesta_redaccion}"</p></div>
              )}
              {(finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento) && (
                <div><strong className="text-slate-900 block mb-1">Procedimiento sugerido:</strong><p className="text-slate-700 leading-relaxed">{finding.userModifications?.propuesta_procedimiento ?? finding.propuesta_procedimiento}</p></div>
              )}
            </div>
        </div>
      )}

      {/* Justificaciones */}
      <div className="space-y-4">
        <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base"><Scale size={16}/> Justificación Legal</h4>
            <p className="text-sm text-gray-600 bg-slate-100 p-4 rounded-md border border-slate-200 leading-relaxed">{finding.justificacion_legal}</p>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base"><ClipboardList size={16}/> Justificación Técnica</h4>
            <p className="text-sm text-gray-600 bg-slate-100 p-4 rounded-md border border-slate-200 leading-relaxed">{finding.justificacion_tecnica}</p>
        </div>
      </div>
      
      {/* Consecuencias */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base"><AlertTriangle size={16} className="text-red-600"/> Consecuencias Estimadas</h4>
        <p className="text-sm text-red-800 bg-red-50 p-4 rounded-md border border-red-200 leading-relaxed">{finding.consecuencia_estimada}</p>
      </div>

    </div>
    </div>
    <DialogFooter className="bg-slate-100/80 backdrop-blur-md p-3 border-t border-slate-200/50 flex items-center justify-end gap-2 flex-wrap">
        {finding.status === 'pending' ? (
        <>
            <Button size="sm" variant="ghost" className="text-foreground hover:bg-black/5" onClick={() => onOpenDiscussion(finding)}>
            <MessageSquareWarning className="mr-2 h-4 w-4"/> Discutir
            </Button>
            {finding.propuesta_procedimiento && !finding.propuesta_redaccion ? (
            <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={handleMarkAsHandled}><Check className="mr-2 h-4 w-4"/> Marcar como Atendido</Button>
            ) : (
            <>
                <Button size="sm" className="btn-neu-green" onClick={handleApply}><Check className="mr-2 h-4 w-4"/> Aplicar</Button>
                <Button size="sm" className="btn-neu-light" onClick={() => setIsEditing(true)}><Edit3 className="mr-2 h-4 w-4"/> Editar</Button>
            </>
            )}
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDiscard}><Trash2 className="mr-2 h-4 w-4"/> Descartar</Button>
        </>
        ) : (
        <Button size="sm" variant="ghost" className="text-foreground hover:bg-black/5" onClick={() => onFindingStatusChange(finding.id, 'pending')}>↩️ Revertir a Pendiente</Button>
        )}
    </DialogFooter>
    </>
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
            "w-full rounded-xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-50/50"
          )}>
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className={cn(
                "p-6 hover:no-underline w-full text-left group transition-all duration-300",
                "hover:bg-slate-100/50"
              )}>
                <div className="flex items-center gap-4 w-full">
                  {React.createElement(categoryIcon, { 
                    className: cn("h-7 w-7", severityStyle.iconColor)
                  })}
                  <h3 className="text-lg font-semibold flex-1 text-slate-800">{category}</h3>
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
                    return (
                      <div 
                        key={finding.id} 
                        className="group relative overflow-hidden rounded-lg shadow-sm border border-slate-200/80 cursor-pointer bg-slate-50/50 text-slate-800 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300"
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
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr,auto] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl">
          {selectedFinding && (
              <>
                <DialogHeader className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex-row items-center justify-between">
                    <DialogTitle className="text-xl text-slate-900">{selectedFinding.titulo_incidencia}</DialogTitle>
                     
                </DialogHeader>
                <IncidentItemContent 
                  finding={selectedFinding} 
                  onFindingStatusChange={onFindingStatusChange} 
                  onDialogClose={() => setSelectedFinding(null)}
                  onOpenDiscussion={handleOpenDiscussion}
                />
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
