
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, FileText, Lightbulb, AlertTriangle, Gavel, FlaskConical, ClipboardList, MessageSquareWarning, BookOpen, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SeverityIndicator } from './severity-indicator';


interface ContentPanelProps {
  block: DocumentBlock | null;
  onUpdateSuggestionStatus: (blockId: string, suggestionId: string, status: Suggestion['status']) => void;
  onUpdateSuggestionText: (blockId: string, suggestionId: string, newText: string) => void;
}

const BlockStatusDisplay: React.FC<{ block: DocumentBlock }> = ({ block }) => {
  const totalSuggestionsOriginal = block.suggestions.length; 
  const appliedSuggestionsCount = block.suggestions.filter(s => s.status === 'applied').length;
  const discardedSuggestionsCount = block.suggestions.filter(s => s.status === 'discarded').length;
  const pendingSuggestionsCount = totalSuggestionsOriginal - appliedSuggestionsCount - discardedSuggestionsCount;
  
  const correctionPercentage = totalSuggestionsOriginal > 0 
    ? Math.round(((appliedSuggestionsCount + discardedSuggestionsCount) / totalSuggestionsOriginal) * 100) 
    : (totalSuggestionsOriginal === 0 ? 100 : 0); 

  return (
    <Card className="mb-6 glass-card rounded-xl transition-all duration-200 ease-in-out hover:shadow-2xl">
      <CardHeader className="p-5">
        <CardTitle className="text-xl font-semibold flex items-center gap-2.5 text-foreground">
            <ClipboardList className="h-6 w-6 text-accent"/> Estado del Bloque: {block.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">Progreso de revisión y puntaje normativo del bloque actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-3 p-5 glass-card-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Pendientes</p>
            <p className="font-semibold text-lg text-foreground">{pendingSuggestionsCount} <span className="text-xs text-muted-foreground">de {totalSuggestionsOriginal}</span></p>
          </div>
          <div className="p-3.5 bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Aplicadas</p>
            <p className="font-semibold text-lg text-foreground">{appliedSuggestionsCount}</p>
          </div>
          <div className="p-3.5 bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Score Normativo</p>
            <p className="font-semibold text-lg text-foreground">{block.completenessIndex} / {block.maxCompleteness}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium text-muted-foreground">Progreso de Revisión</span>
            <span className="font-medium text-accent">{correctionPercentage}%</span>
          </div>
          <Progress value={correctionPercentage} className="w-full h-2.5 rounded-full bg-muted/70 transition-all duration-300" />
        </div>
      </CardContent>
    </Card>
  );
};

export function ContentPanel({ block, onUpdateSuggestionStatus, onUpdateSuggestionText }: ContentPanelProps) {
  const { toast } = useToast();
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [currentEditText, setCurrentEditText] = useState<string>('');

  if (!block) {
    return (
        <Card className="glass-card rounded-xl flex flex-col items-center justify-center p-10 min-h-[300px] transition-all duration-200 ease-in-out">
            <Info size={40} className="text-muted-foreground mb-4" />
            <CardTitle className="text-xl text-center font-semibold text-foreground mb-2">Seleccione un Bloque</CardTitle>
            <CardDescription className="text-base text-center text-muted-foreground">
                Elija un bloque de la navegación izquierda para ver su contenido y sugerencias.
            </CardDescription>
        </Card>
    );
  }
  
  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} copiado`, description: "El texto ha sido copiado al portapapeles." });
  };

  const handleEditSuggestion = (suggestion: Suggestion) => {
    setEditingSuggestionId(suggestion.id);
    setCurrentEditText(suggestion.text);
  };

  const handleSaveSuggestion = (suggestionId: string) => {
    if (block) {
      onUpdateSuggestionText(block.id, suggestionId, currentEditText);
      setEditingSuggestionId(null);
      setCurrentEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSuggestionId(null);
    setCurrentEditText('');
  };

  const visibleSuggestions = block.suggestions.filter(suggestion => 
    suggestion.status === 'pending' || editingSuggestionId === suggestion.id
  );
  
  const defaultOpenSuggestionItems: string[] = []; 

  return (
    <div className="flex-1 flex flex-col gap-6">
      <BlockStatusDisplay block={block} />
      
      {/* Section for Suggestions */}
      {visibleSuggestions.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-3 px-1">
             <Lightbulb className="h-6 w-6 text-accent" />
             <h3 className="text-xl font-semibold text-foreground">
                Problemas y Sugerencias de Redacción ({visibleSuggestions.length} pendientes)
             </h3>
          </div>
          <Accordion type="multiple" defaultValue={defaultOpenSuggestionItems} className="w-full space-y-5">
            {visibleSuggestions.map((suggestion) => (
              <AccordionItem value={suggestion.id} key={suggestion.id} className="glass-accordion-item">
                <AccordionTrigger className="p-4 text-base hover:no-underline data-[state=open]:bg-white/20 dark:data-[state=open]:bg-slate-700/30 w-full text-left data-[state=open]:border-b data-[state=open]:border-white/20 dark:data-[state=open]:border-slate-700/40 transition-colors duration-150 ease-in-out group glass-accordion-trigger">
                  <div className="flex items-center gap-3 w-full">
                    <Edit3 className="h-5 w-5 text-accent group-hover:text-accent/80 transition-colors" />
                    <span className="flex-1 font-semibold text-foreground group-hover:text-accent transition-colors">
                      Sugerencia: {suggestion.errorType || `Revisión de ${suggestion.appliedNorm}`}
                    </span>
                    <Badge 
                      variant={suggestion.status === 'pending' ? 'outline' : 'default'}
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 transition-colors duration-150',
                        suggestion.status === 'pending' && 'border-accent/70 text-accent bg-accent/10 backdrop-blur-sm',
                        editingSuggestionId === suggestion.id && 'border-blue-500/70 text-blue-600 bg-blue-500/10 backdrop-blur-sm', 
                      )}
                    >
                      {editingSuggestionId === suggestion.id ? 'En Edición' : suggestion.status === 'pending' ? 'Pendiente' : suggestion.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-5 space-y-6 border-t border-white/20 dark:border-slate-700/40 glass-accordion-content">
                  
                  <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-foreground">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Contexto del Texto Original (Bloque Completo: {block.name})
                    </h4>
                    <div className="flex justify-end items-center mb-1.5">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyText(block.originalText, 'Texto Original del Bloque')} className="transition-colors duration-150 text-muted-foreground hover:text-accent">
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar Texto del Bloque
                      </Button>
                    </div>
                    <ScrollArea className="h-[160px] rounded-md border border-white/20 dark:border-slate-700/40 p-3.5 bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm text-sm text-foreground/80">
                      <pre className="whitespace-pre-wrap">{block.originalText}</pre>
                    </ScrollArea>
                  </div>

                  <Separator className="bg-white/20 dark:bg-slate-700/40" />

                  <div>
                    <h4 className="text-md font-semibold mb-2 text-foreground flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        Propuesta de Redacción Detallada
                    </h4>
                    <p className="text-xs text-technical-norm-blue mb-3 ml-[26px] flex items-center gap-1.5 -mt-1">
                        <BookOpen size={14}/> Norma Principal: {suggestion.appliedNorm}
                    </p>
                    {editingSuggestionId === suggestion.id ? (
                      <Textarea
                        value={currentEditText}
                        onChange={(e) => setCurrentEditText(e.target.value)}
                        rows={5}
                        className="w-full text-sm p-3 border border-white/30 dark:border-slate-700/50 rounded-md bg-white/5 dark:bg-slate-800/20 backdrop-blur-sm focus-visible:ring-accent mb-3.5 text-foreground"
                        aria-label="Editar sugerencia"
                      />
                    ) : (
                      <div className="p-3.5 border border-white/20 dark:border-slate-700/40 rounded-md bg-white/10 dark:bg-slate-700/20 backdrop-blur-sm mb-3.5 text-sm text-foreground">
                        <p className="leading-relaxed">{suggestion.text}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      {editingSuggestionId === suggestion.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveSuggestion(suggestion.id)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-150"
                          >
                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="text-muted-foreground hover:border-destructive hover:text-destructive transition-colors duration-150 border-white/30 dark:border-slate-700/50"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'applied')}
                            className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                            disabled={suggestion.status !== 'pending'}
                          >
                            <Check className="mr-2 h-4 w-4" /> Aplicar Sugerencia
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditSuggestion(suggestion)}
                            disabled={suggestion.status !== 'pending'}
                            className="text-accent hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors duration-150 border-white/30 dark:border-slate-700/50"
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Editar Texto
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                            disabled={suggestion.status !== 'pending'}
                            className="transition-colors duration-150"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Descartar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-accent transition-colors duration-150" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar Sugerencia
                      </Button>
                    </div>

                    <Separator className="my-5 bg-white/20 dark:bg-slate-700/40" />
                    <div>
                      <h5 className="text-sm font-semibold mb-2.5 flex items-center gap-2 text-foreground"><ClipboardList size={16} /> Justificación y Detalles Técnicos</h5>
                      <div className="space-y-2 text-xs pl-1">
                        <p className="flex items-start gap-2"><Gavel size={14} className="inline text-technical-norm-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Justificación Legal:</strong> <span className="text-muted-foreground">{suggestion.justification.legal}</span></p>
                        <p className="flex items-start gap-2"><FlaskConical size={14} className="inline text-technical-norm-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Justificación Técnica:</strong> <span className="text-muted-foreground">{suggestion.justification.technical}</span></p>
                        <p className="mt-1.5 flex items-start gap-2"><AlertCircle size={14} className="inline text-technical-norm-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Tipo de Error Identificado:</strong> <span className="text-technical-text-blue">{suggestion.errorType}</span></p>
                        <p className="flex items-start gap-2"><AlertTriangle size={14} className="inline text-technical-norm-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Consecuencia Estimada:</strong> <span className="text-muted-foreground">{suggestion.estimatedConsequence}</span></p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <Card className="glass-card rounded-xl transition-all duration-200 ease-in-out hover:shadow-2xl">
            <CardHeader className="p-5">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5 text-foreground">
                    <MessageSquareWarning className="h-5 w-5 text-accent"/>
                    Validaciones del Bloque
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-5 px-5 glass-card-content">
                <p className="text-sm text-muted-foreground p-4 border border-white/20 dark:border-slate-700/40 rounded-lg bg-white/10 dark:bg-slate-700/20 backdrop-blur-sm">
                    No hay sugerencias de redacción pendientes para este bloque, o ya fueron procesadas.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
