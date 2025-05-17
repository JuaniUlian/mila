
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, FileText, Lightbulb, AlertTriangle, Gavel, FlaskConical, ClipboardList, MessageSquareWarning, BookOpen, AlertCircle } from 'lucide-react';
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
  const totalSuggestions = block.suggestions.length;
  const appliedSuggestionsCount = block.suggestions.filter(s => s.status === 'applied').length;
  const discardedSuggestionsCount = block.suggestions.filter(s => s.status === 'discarded').length;
  const pendingSuggestionsCount = totalSuggestions - appliedSuggestionsCount - discardedSuggestionsCount;
  
  const correctionPercentage = totalSuggestions > 0 
    ? Math.round(((appliedSuggestionsCount + discardedSuggestionsCount) / totalSuggestions) * 100) 
    : 100; 

  return (
    <Card className="mb-6 shadow-md bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary"/> Estado del Bloque: {block.name}
        </CardTitle>
        <CardDescription>Progreso de revisión y puntaje normativo del bloque actual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4"> {/* Added pt-4 for consistency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Sugerencias Pendientes</p>
            <p className="font-semibold text-lg">{pendingSuggestionsCount} <span className="text-xs text-muted-foreground">de {totalSuggestions}</span></p>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Sugerencias Aplicadas</p>
            <p className="font-semibold text-lg">{appliedSuggestionsCount}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Score Normativo</p>
            <p className="font-semibold text-lg">{block.completenessIndex} / {block.maxCompleteness}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium text-muted-foreground">Progreso de Revisión</span>
            <span className="font-medium text-primary">{correctionPercentage}%</span>
          </div>
          <Progress value={correctionPercentage} className="w-full h-2.5 rounded-full" />
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
    return null; 
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

      <Accordion type="single" collapsible defaultValue="original-text-accordion" className="w-full space-y-4">
        <AccordionItem value="original-text-accordion" className="border-b-0">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <AccordionTrigger className="p-4 text-lg hover:no-underline bg-card rounded-t-lg data-[state=open]:rounded-b-none w-full text-left data-[state=open]:border-b">
              <div className="flex items-center gap-3 w-full">
                <FileText className="h-5 w-5 text-primary" />
                <span className="flex-1 font-semibold text-base">
                  Texto Original del Bloque: {block.name}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-card rounded-b-lg">
              <div className="flex justify-end items-center mb-2">
                <Button variant="ghost" size="sm" onClick={() => handleCopyText(block.originalText, 'Texto Original del Bloque')}>
                  <Copy className="h-4 w-4 mr-1" /> Copiar Texto Original
                </Button>
              </div>
              <ScrollArea className="h-[180px] rounded-md border p-3 bg-muted/30">
                <pre className="whitespace-pre-wrap text-sm">{block.originalText}</pre>
              </ScrollArea>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
      
      {block.alerts.length > 0 || visibleSuggestions.length > 0 ? (
        <Card className="shadow-md">
            <CardHeader>
                 <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquareWarning className="h-6 w-6 text-primary"/>
                    Validaciones del Bloque: Alertas y Sugerencias
                </CardTitle>
                <CardDescription>Problemas detectados y propuestas de mejora para este bloque.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4"> {/* Added pt-4 */}
                {block.alerts.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" /> Alertas Detectadas ({block.alerts.length})
                        </h3>
                        <ul className="space-y-3"> {/* Increased space-y */}
                        {block.alerts.map(alert => (
                            <li 
                                key={alert.id} 
                                className={cn(
                                    "p-3.5 border-l-4 rounded-r-md flex items-start gap-2.5 text-sm shadow-sm", // Added shadow-sm, increased p and gap
                                    alert.severity === 'grave' && 'border-custom-severity-high-bg bg-custom-severity-high-bg/10 text-custom-severity-high-fg',
                                    alert.severity === 'media' && 'border-custom-severity-medium-bg bg-custom-severity-medium-bg/10 text-custom-severity-medium-fg',
                                    alert.severity === 'leve' && 'border-custom-severity-low-bg bg-custom-severity-low-bg/10 text-custom-severity-low-fg',
                                )}
                            >
                            <SeverityIndicator level={alert.severity} size={5} className="mt-0.5 flex-shrink-0"/>
                            <span>{alert.description}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                {visibleSuggestions.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" /> Sugerencias de Redacción Pendientes ({visibleSuggestions.length})
                        </h3>
                        <Accordion type="multiple" defaultValue={defaultOpenSuggestionItems} className="w-full space-y-4">
                        {visibleSuggestions.map((suggestion) => (
                            <AccordionItem value={suggestion.id} key={suggestion.id} className="border-b-0">
                            <Card className="shadow-sm hover:shadow-md transition-shadow bg-background/70">
                                <AccordionTrigger className="p-4 text-base hover:no-underline rounded-t-md data-[state=open]:rounded-b-none w-full text-left data-[state=open]:border-b data-[state=open]:bg-muted/30">
                                <div className="flex items-center gap-3 w-full">
                                    <Edit3 className="h-5 w-5 text-blue-600" />
                                    <span className="flex-1 font-medium">
                                    Revisión: {suggestion.errorType || suggestion.appliedNorm}
                                    </span>
                                    <Badge 
                                        variant={'outline'}
                                        className={cn(
                                            'text-xs ml-auto font-semibold px-2 py-0.5', // Standardized badge padding
                                            suggestion.status === 'pending' && 'border-blue-500 text-blue-600 bg-blue-500/10'
                                        )}
                                    >
                                    Pendiente
                                    </Badge>
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 py-4 rounded-b-md space-y-4 bg-background"> {/* Ensure content bg is distinct */}
                                  <div>
                                    <h4 className="text-md font-semibold mb-1 text-foreground flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-primary" />
                                        Propuesta de Redacción
                                    </h4>
                                    <p className="text-xs text-technical-norm-blue mb-3 ml-7 flex items-center gap-1.5">
                                        <BookOpen size={14}/> Norma Principal: {suggestion.appliedNorm}
                                    </p>
                                    {editingSuggestionId === suggestion.id ? (
                                    <Textarea
                                        value={currentEditText}
                                        onChange={(e) => setCurrentEditText(e.target.value)}
                                        rows={4}
                                        className="w-full text-sm p-3 border rounded-md bg-background focus-visible:ring-primary mb-3"
                                    />
                                    ) : (
                                    <div className="p-3 border rounded-md bg-muted/50 mb-3">
                                        <p className="text-sm leading-relaxed">{suggestion.text}</p> {/* Added leading-relaxed */}
                                    </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-2">
                                    {editingSuggestionId === suggestion.id ? (
                                        <>
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleSaveSuggestion(suggestion.id)}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Save className="mr-2 h-4 w-4" /> Guardar
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={handleCancelEdit}
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
                                            <Check className="mr-2 h-4 w-4" /> Aplicar
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleEditSuggestion(suggestion)}
                                            disabled={suggestion.status !== 'pending'}
                                        >
                                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" // Using destructive variant for clarity
                                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                                            disabled={suggestion.status !== 'pending'}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Descartar
                                        </Button>
                                        </>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                                        <Copy className="mr-2 h-4 w-4" /> Copiar Sugerencia
                                    </Button>
                                    </div>

                                    <Separator className="my-4" />
                                    <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ClipboardList size={16} /> Justificación y Detalles</h4>
                                    <div className="space-y-1.5 text-xs text-muted-foreground"> {/* Increased space-y */}
                                        <p className="flex items-start gap-1.5"><Gavel size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90">Justificación Legal:</strong> {suggestion.justification.legal}</p>
                                        <p className="flex items-start gap-1.5"><FlaskConical size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90">Justificación Técnica:</strong> {suggestion.justification.technical}</p>
                                        <p className="mt-1 flex items-start gap-1.5"><AlertCircle size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90">Tipo de Error:</strong> {suggestion.errorType}</p>
                                        <p className="flex items-start gap-1.5"><AlertTriangle size={14} className="inline text-technical-text-blue flex-shrink-0 mt-0.5" /> <strong className="text-foreground/90">Consecuencia Estimada:</strong> {suggestion.estimatedConsequence}</p>
                                    </div>
                                    </div>
                                </div>
                                </AccordionContent>
                            </Card>
                            </AccordionItem>
                        ))}
                        </Accordion>
                    </div>
                )}

                {block.alerts.length === 0 && visibleSuggestions.length === 0 && (
                     <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50"> {/* Lightened background */}
                        No hay alertas activas ni sugerencias pendientes para este bloque, o ya fueron procesadas.
                    </p>
                )}
            </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquareWarning className="h-6 w-6 text-primary"/>
                    Validaciones del Bloque
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4"> {/* Added pt-4 */}
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background/50"> {/* Lightened background */}
                    No hay validaciones (alertas o sugerencias) para mostrar para este bloque.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
