
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, FileText, Lightbulb, AlertTriangle, Gavel, FlaskConical, ClipboardList, MessageSquareWarning, BookOpen, AlertCircle, Info } from 'lucide-react';
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
  const totalSuggestionsOriginal = block.suggestions.length; // Total original suggestions for the block
  const appliedSuggestionsCount = block.suggestions.filter(s => s.status === 'applied').length;
  const discardedSuggestionsCount = block.suggestions.filter(s => s.status === 'discarded').length;
  const pendingSuggestionsCount = block.suggestions.filter(s => s.status === 'pending').length;
  
  const correctionPercentage = totalSuggestionsOriginal > 0 
    ? Math.round(((appliedSuggestionsCount + discardedSuggestionsCount) / totalSuggestionsOriginal) * 100) 
    : (totalSuggestionsOriginal === 0 ? 100 : 0); // If no suggestions, it's 100% "reviewed"

  return (
    <Card className="mb-6 shadow-lg border rounded-xl bg-card">
      <CardHeader className="p-5">
        <CardTitle className="text-xl font-semibold flex items-center gap-2.5 text-foreground">
            <ClipboardList className="h-6 w-6 text-primary"/> Estado del Bloque: {block.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">Progreso de revisión y puntaje normativo del bloque actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-3 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3.5 bg-muted/60 rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Pendientes</p>
            <p className="font-semibold text-lg text-foreground">{pendingSuggestionsCount} <span className="text-xs text-muted-foreground">de {totalSuggestionsOriginal}</span></p>
          </div>
          <div className="p-3.5 bg-muted/60 rounded-lg">
            <p className="text-muted-foreground mb-0.5">Sugerencias Aplicadas</p>
            <p className="font-semibold text-lg text-foreground">{appliedSuggestionsCount}</p>
          </div>
          <div className="p-3.5 bg-muted/60 rounded-lg">
            <p className="text-muted-foreground mb-0.5">Score Normativo</p>
            <p className="font-semibold text-lg text-foreground">{block.completenessIndex} / {block.maxCompleteness}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium text-muted-foreground">Progreso de Revisión</span>
            <span className="font-medium text-primary">{correctionPercentage}%</span>
          </div>
          <Progress value={correctionPercentage} className="w-full h-2.5 rounded-full bg-muted" />
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
    // This should ideally not be reached if page.tsx handles the "no block selected" case
    return (
        <Card className="shadow-lg border rounded-xl flex flex-col items-center justify-center p-10 min-h-[300px] bg-card">
            <Info size={40} className="text-muted-foreground mb-4" />
            <CardTitle className="text-xl text-center font-semibold text-foreground mb-2">Seleccione un Bloque</CardTitle>
            <CardDescription className="text-base text-center text-muted-foreground">
                Elija un bloque de la navegación para ver su contenido y sugerencias.
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
  
  const defaultOpenSuggestionItems: string[] = []; // Suggestions start collapsed

  return (
    <div className="flex-1 flex flex-col gap-6">
      <BlockStatusDisplay block={block} />

      {/* General Block Alerts */}
      {block.alerts.length > 0 && (
        <Card className="shadow-lg border rounded-xl bg-card">
          <CardHeader className="p-5">
            <CardTitle className="text-lg font-semibold flex items-center gap-2.5 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas Generales del Bloque ({block.alerts.length})
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Advertencias y problemas identificados en este bloque que no corresponden a una sugerencia de redacción específica.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-5 px-5 space-y-3">
            {block.alerts.map(alert => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-3.5 border-l-4 rounded-md flex items-start gap-3 text-sm shadow-sm bg-background",
                  alert.severity === 'grave' && 'border-destructive bg-destructive/10 text-destructive-foreground-alt', // Custom class for text if needed
                  alert.severity === 'media' && 'border-custom-warning-yellow-DEFAULT bg-custom-warning-yellow-DEFAULT/10 text-custom-warning-yellow-foreground-alt',
                  alert.severity === 'leve' && 'border-custom-severity-low-DEFAULT bg-custom-severity-low-DEFAULT/10 text-custom-severity-low-foreground-alt',
                )}
              >
                <SeverityIndicator level={alert.severity} size={5} className={cn(
                    "mt-0.5 flex-shrink-0",
                    alert.severity === 'grave' && 'text-destructive',
                    alert.severity === 'media' && 'text-custom-warning-yellow-DEFAULT',
                    alert.severity === 'leve' && 'text-custom-severity-low-DEFAULT',
                )}/>
                <span className={cn(
                    alert.severity === 'grave' && 'text-destructive-foreground',
                    alert.severity === 'media' && 'text-yellow-700 dark:text-yellow-400',
                    alert.severity === 'leve' && 'text-blue-700 dark:text-blue-400',
                )}>{alert.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Accordion for each Suggestion */}
      {visibleSuggestions.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-3 px-1">
             <Lightbulb className="h-6 w-6 text-primary" />
             <h3 className="text-xl font-semibold text-foreground">
                Problemas y Sugerencias de Redacción ({visibleSuggestions.length} pendientes)
             </h3>
          </div>
          <Accordion type="multiple" defaultValue={defaultOpenSuggestionItems} className="w-full space-y-5">
            {visibleSuggestions.map((suggestion) => (
              <AccordionItem value={suggestion.id} key={suggestion.id} className="border-b-0 overflow-hidden rounded-xl shadow-lg border bg-card">
                <AccordionTrigger className="p-4 text-base hover:no-underline data-[state=open]:bg-muted/50 w-full text-left data-[state=open]:border-b transition-colors duration-150 ease-in-out group">
                  <div className="flex items-center gap-3 w-full">
                    <Edit3 className="h-5 w-5 text-accent group-hover:text-accent/80 transition-colors" />
                    <span className="flex-1 font-semibold text-foreground group-hover:text-accent transition-colors">
                      Sugerencia: {suggestion.errorType || `Revisión de ${suggestion.appliedNorm}`}
                    </span>
                    <Badge 
                      variant={suggestion.status === 'pending' ? 'outline' : 'default'}
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1',
                        suggestion.status === 'pending' && 'border-blue-500/70 text-blue-600 bg-blue-500/10',
                        // Other statuses not shown here as visibleSuggestions filters for pending/editing
                      )}
                    >
                      {suggestion.status === 'pending' ? 'Pendiente' : 'En Edición'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-5 space-y-6 bg-card border-t">
                  
                  <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-foreground">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Contexto del Texto Original (Bloque Completo: {block.name})
                    </h4>
                    <div className="flex justify-end items-center mb-1.5">
                      <Button variant="ghost" size="sm" onClick={() => handleCopyText(block.originalText, 'Texto Original del Bloque')}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar Texto del Bloque
                      </Button>
                    </div>
                    <ScrollArea className="h-[160px] rounded-md border p-3.5 bg-muted/30 text-sm text-foreground/80">
                      <pre className="whitespace-pre-wrap">{block.originalText}</pre>
                    </ScrollArea>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-md font-semibold mb-2 text-foreground flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
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
                        className="w-full text-sm p-3 border rounded-md bg-background focus-visible:ring-primary mb-3.5"
                        aria-label="Editar sugerencia"
                      />
                    ) : (
                      <div className="p-3.5 border rounded-md bg-muted/40 mb-3.5 text-sm text-foreground">
                        <p className="leading-relaxed">{suggestion.text}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      {editingSuggestionId === suggestion.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveSuggestion(suggestion.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="hover:border-destructive hover:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'applied')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={suggestion.status !== 'pending'}
                          >
                            <Check className="mr-2 h-4 w-4" /> Aplicar Sugerencia
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditSuggestion(suggestion)}
                            disabled={suggestion.status !== 'pending'}
                            className="hover:border-accent hover:text-accent"
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Editar Texto
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                            disabled={suggestion.status !== 'pending'}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Descartar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-accent" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar Sugerencia
                      </Button>
                    </div>

                    <Separator className="my-5" />
                    <div>
                      <h5 className="text-sm font-semibold mb-2.5 flex items-center gap-2 text-foreground"><ClipboardList size={16} /> Justificación y Detalles Técnicos</h5>
                      <div className="space-y-2 text-xs text-muted-foreground pl-1">
                        <p className="flex items-start gap-2"><Gavel size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Justificación Legal:</strong> {suggestion.justification.legal}</p>
                        <p className="flex items-start gap-2"><FlaskConical size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Justificación Técnica:</strong> {suggestion.justification.technical}</p>
                        <p className="mt-1.5 flex items-start gap-2"><AlertCircle size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Tipo de Error Identificado:</strong> {suggestion.errorType}</p>
                        <p className="flex items-start gap-2"><AlertTriangle size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90 font-medium">Consecuencia Estimada:</strong> {suggestion.estimatedConsequence}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <Card className="shadow-lg border rounded-xl">
            <CardHeader className="p-5">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5 text-foreground">
                    <MessageSquareWarning className="h-5 w-5 text-primary"/>
                    Validaciones del Bloque
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-5 px-5">
                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
                    {block.alerts.length === 0 ? "No hay alertas generales ni sugerencias de redacción pendientes para este bloque, o ya fueron procesadas." : "No hay sugerencias de redacción pendientes para este bloque. Revise las alertas generales si existen."}
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

