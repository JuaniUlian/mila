
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, FileText, Lightbulb, Gavel, FlaskConical, ClipboardList, BookOpen, AlertCircle, AlertTriangle, Layers, MessageSquareWarning } from 'lucide-react';
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
    <Card className="mb-4 glass-card rounded-xl transition-all duration-200 ease-in-out hover:shadow-2xl">
      <CardHeader className="p-3">
        <CardTitle className="text-md font-semibold flex items-center gap-2 text-foreground">
            <ClipboardList className="h-5 w-5 text-primary"/> Estado del Bloque: {block.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">Progreso de revisión y puntaje normativo del bloque actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-1 p-3 glass-card-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-[hsla(var(--muted-rgb),0.5)] backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Pendientes</p>
            <p className="font-semibold text-sm text-foreground">{pendingSuggestionsCount} <span className="text-xs text-muted-foreground">de {totalSuggestionsOriginal}</span></p>
          </div>
          <div className="p-2 bg-[hsla(var(--muted-rgb),0.5)] backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Aplicadas</p>
            <p className="font-semibold text-sm text-foreground">{appliedSuggestionsCount}</p>
          </div>
          <div className="p-2 bg-[hsla(var(--muted-rgb),0.5)] backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground mb-0.5">Score Normativo</p>
            <p className="font-semibold text-sm text-foreground">{block.completenessIndex} / {block.maxCompleteness}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-xs">
            <span className="font-medium text-muted-foreground">Progreso de Revisión</span>
            <span className="font-medium text-primary">{correctionPercentage}%</span>
          </div>
          <Progress value={correctionPercentage} className="w-full h-1.5 rounded-full bg-muted/70 transition-all duration-300" />
        </div>
      </CardContent>
    </Card>
  );
};

// NOTE: This component is likely no longer used in the new "IncidentsList" design.
// It is kept for reference or potential future use in other contexts.
export function ContentPanel({ block, onUpdateSuggestionStatus, onUpdateSuggestionText }: ContentPanelProps) {
  const { toast } = useToast();
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [currentEditText, setCurrentEditText] = useState<string>('');

  if (!block) {
    return ( 
        <Card className="glass-card rounded-xl flex flex-col items-center justify-center p-6 min-h-[200px] transition-all duration-200 ease-in-out">
            <Layers size={32} className="text-muted-foreground mb-3" />
            <CardTitle className="text-lg text-center font-semibold text-foreground mb-1.5">Contenido del Bloque</CardTitle>
            <CardDescription className="text-sm text-center text-muted-foreground">
                Seleccione un bloque para ver su contenido y sugerencias aquí.
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
    <div className="flex-1 flex flex-col gap-4">
      <BlockStatusDisplay block={block} />
      
      {visibleSuggestions.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
             <Lightbulb className="h-5 w-5 text-primary" />
             <h3 className="text-lg font-semibold text-foreground">
                Problemas y Sugerencias de Redacción ({visibleSuggestions.length} pendientes)
             </h3>
          </div>
          <Accordion type="multiple" defaultValue={defaultOpenSuggestionItems} className="w-full space-y-2.5">
            {visibleSuggestions.map((suggestion) => (
              <AccordionItem value={suggestion.id} key={suggestion.id} className="glass-accordion-item hover:shadow-lg hover:border-accent/50 transition-all duration-200 ease-in-out">
                <AccordionTrigger className="p-2.5 text-sm hover:no-underline data-[state=open]:bg-[hsla(var(--card-rgb),0.8)] w-full text-left data-[state=open]:border-b data-[state=open]:border-[hsla(var(--border-rgb),0.3)] transition-colors duration-150 ease-in-out group glass-accordion-trigger hover:bg-accent/20">
                  <div className="flex items-center gap-1.5 w-full">
                    <Edit3 className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
                    <span className="flex-1 font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                      Sugerencia: {suggestion.errorType || `Revisión de ${suggestion.appliedNorm}`}
                    </span>
                    <Badge 
                      variant={suggestion.status === 'pending' ? 'outline' : 'default'}
                      className={cn(
                        'text-xs font-semibold px-1.5 py-0.5 transition-colors duration-150 rounded-md',
                        suggestion.status === 'pending' && 'border-primary/70 text-primary bg-primary/20 backdrop-blur-sm',
                        editingSuggestionId === suggestion.id && 'border-blue-500/70 text-blue-400 bg-blue-500/20 backdrop-blur-sm',
                        suggestion.status === 'applied' && 'bg-green-500/30 text-green-300 border-green-500/50',
                        suggestion.status === 'discarded' && 'bg-red-500/30 text-red-300 border-red-500/50'
                      )}
                    >
                      {editingSuggestionId === suggestion.id ? 'Editando' : suggestion.status === 'pending' ? 'Pendiente' : suggestion.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 py-2.5 space-y-2.5 border-t border-[hsla(var(--border-rgb),0.3)] glass-accordion-content">
                  
                  <div>
                    <h4 className="text-xs font-semibold mb-0.5 flex items-center gap-1 text-foreground">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Contexto del Texto Original (Bloque: {block.name})
                    </h4>
                    <div className="flex justify-end items-center mb-0.5 -mt-1">
                      <Button variant="ghost" size="xs" onClick={() => handleCopyText(block.originalText, 'Texto Original del Bloque')} className="transition-colors duration-150 text-muted-foreground hover:text-primary text-[0.7rem] h-5 px-1">
                        <Copy className="h-2 w-2 mr-0.5" /> Copiar
                      </Button>
                    </div>
                    <ScrollArea className="h-[100px] rounded-md border border-[hsla(var(--border-rgb),0.3)] p-2 bg-[hsla(var(--background-rgb),0.3)] backdrop-blur-sm text-[0.7rem] text-foreground/80">
                      <pre className="whitespace-pre-wrap">{block.originalText}</pre>
                    </ScrollArea>
                  </div>

                  <Separator className="bg-[hsla(var(--border-rgb),0.3)]" />

                  <div>
                    <h4 className="text-xs font-semibold mb-0.5 text-foreground flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5 text-primary" />
                        Propuesta de Redacción
                    </h4>
                    <p className="text-[0.65rem] text-primary/80 mb-1 ml-[1.25rem] flex items-center gap-0.5 -mt-0.5">
                        <BookOpen size={11}/> Norma Principal: {suggestion.appliedNorm}
                    </p>
                    {editingSuggestionId === suggestion.id ? (
                      <Textarea
                        value={currentEditText}
                        onChange={(e) => setCurrentEditText(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-1.5 border border-[hsla(var(--border-rgb),0.4)] rounded-md bg-[hsla(var(--background-rgb),0.2)] backdrop-blur-sm focus-visible:ring-primary mb-2 text-foreground"
                        aria-label="Editar sugerencia"
                      />
                    ) : (
                      <div className="p-2 border border-[hsla(var(--border-rgb),0.3)] rounded-md bg-[hsla(var(--muted-rgb),0.3)] backdrop-blur-sm mb-2 text-xs text-foreground">
                        <p className="leading-relaxed">{suggestion.text}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-1">
                      {editingSuggestionId === suggestion.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveSuggestion(suggestion.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-150 h-7 text-xs px-2 rounded-md"
                          >
                            <Save className="mr-1 h-2.5 w-2.5" /> Guardar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="text-muted-foreground hover:border-destructive hover:text-destructive transition-colors duration-150 border-[hsla(var(--border-rgb),0.4)] h-7 text-xs px-2 rounded-md"
                          >
                            <XCircle className="mr-1 h-2.5 w-2.5" /> Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'applied')}
                            className="bg-green-600/80 hover:bg-green-600 text-white transition-colors duration-150 h-7 text-xs px-2 rounded-md"
                            disabled={suggestion.status !== 'pending'}
                          >
                            <Check className="mr-1 h-2.5 w-2.5" /> Aplicar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditSuggestion(suggestion)}
                            disabled={suggestion.status !== 'pending'}
                            className="text-primary hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors duration-150 border-[hsla(var(--border-rgb),0.4)] h-7 text-xs px-2 rounded-md"
                          >
                            <Edit3 className="mr-1 h-2.5 w-2.5" /> Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                            disabled={suggestion.status !== 'pending'}
                            className="transition-colors duration-150 h-7 text-xs px-2 rounded-md bg-destructive/80 hover:bg-destructive"
                          >
                            <Trash2 className="mr-1 h-2.5 w-2.5" /> Descartar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary transition-colors duration-150 h-7 text-xs px-2 rounded-md" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                        <Copy className="mr-1 h-2.5 w-2.5" /> Copiar
                      </Button>
                    </div>

                    <Separator className="my-2 bg-[hsla(var(--border-rgb),0.3)]" />
                    <div>
                      <h5 className="text-xs font-semibold mb-1 flex items-center gap-1 text-foreground"><ClipboardList size={12} /> Detalles Técnicos</h5>
                      <div className="space-y-1 text-[0.65rem] leading-snug pl-0.5">
                        <p className="flex items-start gap-0.5"><Gavel size={11} className="inline text-primary/80 flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Legal:</strong> <span className="text-muted-foreground">{suggestion.justification.legal}</span></p>
                        <p className="flex items-start gap-0.5"><FlaskConical size={11} className="inline text-primary/80 flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Técnica:</strong> <span className="text-muted-foreground">{suggestion.justification.technical}</span></p>
                        <p className="mt-0.5 flex items-start gap-0.5"><AlertCircle size={11} className="inline text-primary/80 flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Error:</strong> <span className="text-custom-technical-text-blue">{suggestion.errorType}</span></p>
                        <p className="flex items-start gap-0.5"><AlertTriangle size={11} className="inline text-primary/80 flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Consecuencia:</strong> <span className="text-muted-foreground">{suggestion.estimatedConsequence}</span></p>
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
            <CardHeader className="p-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <MessageSquareWarning className="h-4 w-4 text-primary"/>
                    Validaciones del Bloque
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0.5 pb-2.5 px-2.5 glass-card-content">
                <p className="text-xs text-muted-foreground p-2 border border-[hsla(var(--border-rgb),0.3)] rounded-lg bg-[hsla(var(--muted-rgb),0.3)] backdrop-blur-sm">
                    No hay sugerencias de redacción pendientes para este bloque, o ya fueron procesadas.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
