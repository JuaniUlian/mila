
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion, AlertItem } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, MessageSquare, FileText, Lightbulb, ShieldAlert, Gavel, FlaskConical, ClipboardList } from 'lucide-react';
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
  const totalSuggestions = block.suggestions.length; // Total original suggestions for the block
  const appliedSuggestionsCount = block.suggestions.filter(s => s.status === 'applied').length;
  const discardedSuggestionsCount = block.suggestions.filter(s => s.status === 'discarded').length;
  const pendingSuggestionsCount = totalSuggestions - appliedSuggestionsCount - discardedSuggestionsCount;
  
  const correctionPercentage = totalSuggestions > 0 
    ? Math.round(((appliedSuggestionsCount + discardedSuggestionsCount) / totalSuggestions) * 100) 
    : 100;

  return (
    <Card className="mb-6 shadow-md bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Estado del Bloque: {block.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Sugerencias Pendientes</p>
            <p className="font-semibold text-lg">{pendingSuggestionsCount} / {totalSuggestions}</p>
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
            <span className="text-sm font-medium">Progreso de Revisión</span>
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
    case 'media': return 'default'; // Using default for yellow as it's more prominent than outline
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
    // This case should ideally be handled by the parent (page.tsx) showing a general placeholder
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

  // Filter suggestions to only show 'pending' ones, or the one being edited
  const visibleSuggestions = block.suggestions.filter(suggestion => 
    suggestion.status === 'pending' || editingSuggestionId === suggestion.id
  );

  const accordionDefaultValue = block.alerts.length > 0 || visibleSuggestions.length > 0 ? "alerts-suggestions" : undefined;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <BlockStatusDisplay block={block} />

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Texto Original del Pliego</CardTitle>
              <CardDescription>Contenido original del bloque seleccionado.</CardDescription>
            </div>
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
                  Validaciones del Bloque: Alertas y Sugerencias Pendientes
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-card rounded-b-lg space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
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
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Sugerencias de la IA Pendientes ({visibleSuggestions.length})
                </h3>
                 {visibleSuggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">No hay sugerencias pendientes para este bloque o ya fueron procesadas.</p>
                ) : (
                  <div className="space-y-4">
                    {visibleSuggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="shadow-sm hover:shadow-md transition-shadow bg-background">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                               <Edit3 className="h-5 w-5 text-primary" />
                               <CardTitle className="text-base">Sugerencia de Redacción</CardTitle>
                            </div>
                            <Badge 
                              variant={suggestion.status === 'applied' ? 'default' : suggestion.status === 'discarded' ? 'destructive' : 'secondary'}
                              className={cn(
                                'text-xs',
                                suggestion.status === 'applied' && 'bg-green-500 hover:bg-green-600 text-white',
                                suggestion.status === 'discarded' && 'bg-red-500 hover:bg-red-600 text-white',
                                suggestion.status === 'pending' && 'bg-blue-500 hover:bg-blue-600 text-white'
                              )}
                            >
                              {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="text-technical-norm-blue ml-7">
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
                                  variant="outline"
                                  onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'applied')}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Check className="mr-2 h-4 w-4" /> Aplicar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditSuggestion(suggestion)}
                                >
                                  <Edit3 className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                                  className="bg-red-500 hover:bg-red-600 text-white"
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
                            <h4 className="text-sm font-semibold mb-1 flex items-center gap-1"><ClipboardList size={16} /> Justificación Detallada</h4>
                            <p className="text-xs text-muted-foreground mb-1"><Gavel size={12} className="inline mr-1 text-technical-text-blue" /> <strong className="text-technical-text-blue">Legal:</strong> {suggestion.justification.legal}</p>
                            <p className="text-xs text-muted-foreground"><FlaskConical size={12} className="inline mr-1 text-technical-text-blue" /> <strong className="text-technical-text-blue">Técnica:</strong> {suggestion.justification.technical}</p>
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

