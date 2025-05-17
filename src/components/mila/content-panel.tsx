
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, MessageSquare, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
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
  const correctionPercentage = totalSuggestions > 0 ? Math.round((appliedSuggestionsCount / totalSuggestions) * 100) : 100;

  return (
    <Card className="mb-6 shadow-md bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Estado del Bloque: {block.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total de Sugerencias</p>
            <p className="font-semibold text-lg">{totalSuggestions}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sugerencias Aplicadas</p>
            <p className="font-semibold text-lg">{appliedSuggestionsCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Score Normativo</p>
            <p className="font-semibold text-lg">{block.completenessIndex} / {block.maxCompleteness}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Progreso de Corrección</span>
            <span className="text-sm font-medium">{correctionPercentage}%</span>
          </div>
          <Progress value={correctionPercentage} className="w-full h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
};

const getSeverityBadgeVariantForAlert = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'grave': return 'destructive';
    case 'media': return 'default';
    case 'leve': return 'secondary';
    default: return 'outline';
  }
};

const getSeverityBadgeClassForAlert = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'grave': return 'bg-custom-severity-high text-custom-severity-high-foreground';
    case 'media': return 'bg-custom-severity-medium text-custom-severity-medium-foreground';
    case 'leve': return 'bg-custom-severity-low text-custom-severity-low-foreground';
    default: return '';
  }
};


export function ContentPanel({ block, onUpdateSuggestionStatus, onUpdateSuggestionText }: ContentPanelProps) {
  const { toast } = useToast();
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  const [currentEditText, setCurrentEditText] = useState<string>('');

  if (!block) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Planilla Viva</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Seleccione un bloque del panel de navegación para ver su contenido, validaciones y sugerencias.
            </p>
          </CardContent>
        </Card>
      </div>
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

  const accordionDefaultValue = block.alerts.length > 0 || block.suggestions.length > 0 ? "alerts-suggestions" : undefined;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <BlockStatusDisplay block={block} />

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Texto Original del Pliego</CardTitle>
            <CardDescription>Contenido original del bloque seleccionado.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleCopyText(block.originalText, 'Texto Original')}>
            <Copy className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/30">
            <pre className="whitespace-pre-wrap text-sm">{block.originalText}</pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible defaultValue={accordionDefaultValue} className="w-full">
        <AccordionItem value="alerts-suggestions" className="border-b-0">
          <Card className="shadow-md">
            <AccordionTrigger className="p-4 text-lg hover:no-underline bg-card rounded-t-lg data-[state=open]:rounded-b-none">
              <div className="flex items-center gap-2 w-full">
                <MessageSquare size={20} className="text-primary" />
                <span className="flex-1 text-left font-semibold">
                  Validaciones del Bloque: Alertas y Sugerencias
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-card rounded-b-lg space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Alertas Detectadas ({block.alerts.length})
                </h3>
                {block.alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 border rounded-md bg-background/50">No hay alertas activas para este bloque.</p>
                ) : (
                  <ul className="space-y-3">
                    {block.alerts.map((alert) => (
                      <li key={alert.id} className="p-3 border rounded-md bg-background/50 shadow-sm">
                        <div className="flex items-start gap-2">
                          <SeverityIndicator level={alert.severity} size={5} className="mt-0.5"/>
                          <div>
                            <p className="text-sm font-medium">{alert.description}</p>
                            <Badge 
                              variant={getSeverityBadgeVariantForAlert(alert.severity)} 
                              className={`mt-1 text-xs ${getSeverityBadgeClassForAlert(alert.severity)}`}
                            >
                              Severidad: {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Sugerencias de la IA ({block.suggestions.length})
                </h3>
                 {block.suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">No hay sugerencias para este bloque.</p>
                ) : (
                  <div className="space-y-4">
                    {block.suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="shadow-sm hover:shadow-md transition-shadow bg-background">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">Sugerencia</CardTitle>
                            <Badge 
                              variant={suggestion.status === 'applied' ? 'default' : suggestion.status === 'discarded' ? 'destructive' : 'secondary'}
                              className={cn(
                                suggestion.status === 'applied' && 'bg-green-500 hover:bg-green-600 text-white',
                                suggestion.status === 'discarded' && 'bg-red-500 hover:bg-red-600 text-white',
                                suggestion.status === 'pending' && 'bg-blue-500 hover:bg-blue-600 text-white'
                              )}
                            >
                              {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="text-technical-norm-blue">
                            Norma Aplicada: {suggestion.appliedNorm}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {editingSuggestionId === suggestion.id ? (
                            <Textarea
                              value={currentEditText}
                              onChange={(e) => setCurrentEditText(e.target.value)}
                              rows={4}
                              className="w-full text-sm p-3 border rounded-md bg-background focus-visible:ring-primary"
                            />
                          ) : (
                            <div className="p-3 border rounded-md bg-background/80">
                              <p className="text-sm">{suggestion.text}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {editingSuggestionId === suggestion.id ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleSaveSuggestion(suggestion.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
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
                                  variant={suggestion.status === 'applied' ? "default" : "outline"}
                                  onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'applied')}
                                  className={cn(suggestion.status === 'applied' && "bg-primary hover:bg-primary/90")}
                                  disabled={suggestion.status === 'applied' || suggestion.status === 'discarded'}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Aplicar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditSuggestion(suggestion)}
                                  disabled={suggestion.status === 'applied' || suggestion.status === 'discarded'}
                                >
                                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={suggestion.status === 'discarded' ? "destructive" : "outline"}
                                  onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                                  disabled={suggestion.status === 'applied' || suggestion.status === 'discarded'}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Descartar
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                              <Copy className="mr-2 h-4 w-4" /> Copiar
                            </Button>
                          </div>

                          <Separator className="my-3" />
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Justificación Legal y Técnica</h4>
                            <p className="text-xs text-muted-foreground mb-1"><strong className="text-technical-text-blue">Legal:</strong> {suggestion.justification.legal}</p>
                            <p className="text-xs text-muted-foreground"><strong className="text-technical-text-blue">Técnica:</strong> {suggestion.justification.technical}</p>
                          </div>
                          <Separator className="my-3" />
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Resumen Técnico</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <p><strong className="text-technical-text-blue">Tipo de Error:</strong> {suggestion.errorType}</p>
                                <p><strong className="text-technical-text-blue">Consecuencia Estimada:</strong> {suggestion.estimatedConsequence}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
