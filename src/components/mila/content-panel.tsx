
"use client";
import React, { useState } from 'react';
import type { DocumentBlock, Suggestion } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Copy, Save, XCircle, FileText, Lightbulb, AlertTriangle, Gavel, FlaskConical, ClipboardList } from 'lucide-react';
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

  // Determine default open accordion items: all pending suggestions
  const defaultOpenItems = visibleSuggestions
    .filter(s => s.status === 'pending')
    .map(s => s.id);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <BlockStatusDisplay block={block} />

      {visibleSuggestions.length > 0 ? (
        <Accordion type="multiple" defaultValue={defaultOpenItems} className="w-full space-y-4">
          {visibleSuggestions.map((suggestion) => (
            <AccordionItem value={suggestion.id} key={suggestion.id} className="border-b-0">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <AccordionTrigger className="p-4 text-lg hover:no-underline bg-card rounded-t-lg data-[state=open]:rounded-b-none w-full">
                  <div className="flex items-center gap-3 w-full">
                    {suggestion.status === 'pending' && <Lightbulb className="h-5 w-5 text-yellow-500" />}
                    {suggestion.status === 'applied' && <Check className="h-5 w-5 text-green-500" />}
                    {suggestion.status === 'discarded' && <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="flex-1 text-left font-semibold text-base">
                      Revisión Sugerida: {suggestion.errorType || suggestion.appliedNorm}
                    </span>
                    <Badge 
                      variant={suggestion.status === 'applied' ? 'default' : suggestion.status === 'discarded' ? 'destructive' : 'secondary'}
                      className={cn(
                        'text-xs ml-auto',
                        suggestion.status === 'applied' && 'bg-green-500 hover:bg-green-600 text-white',
                        suggestion.status === 'discarded' && 'bg-red-500 hover:bg-red-600 text-white',
                        suggestion.status === 'pending' && 'bg-blue-500 hover:bg-blue-600 text-white'
                      )}
                    >
                      {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-card rounded-b-lg space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Contexto del Texto Original del Bloque
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyText(block.originalText, 'Texto Original del Bloque')}>
                        <Copy className="h-4 w-4 mr-1" /> Copiar
                      </Button>
                    </div>
                    <ScrollArea className="h-[150px] rounded-md border p-3 bg-muted/30">
                      <pre className="whitespace-pre-wrap text-sm">{block.originalText}</pre>
                    </ScrollArea>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-md font-semibold mb-1 text-foreground flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-primary" />
                      Propuesta de Redacción
                    </h3>
                     <p className="text-xs text-technical-norm-blue mb-3 ml-7">
                        Norma Aplicada Principalmente: {suggestion.appliedNorm}
                     </p>
                    {editingSuggestionId === suggestion.id ? (
                      <Textarea
                        value={currentEditText}
                        onChange={(e) => setCurrentEditText(e.target.value)}
                        rows={4}
                        className="w-full text-sm p-3 border rounded-md bg-background focus-visible:ring-primary mb-3"
                      />
                    ) : (
                      <div className="p-3 border rounded-md bg-background/80 mb-3">
                        <p className="text-sm">{suggestion.text}</p>
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
                            variant="outline"
                            onClick={() => onUpdateSuggestionStatus(block.id, suggestion.id, 'discarded')}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            disabled={suggestion.status !== 'pending'}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Descartar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleCopyText(editingSuggestionId === suggestion.id ? currentEditText : suggestion.text, 'Sugerencia')}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar Texto Sugerido
                      </Button>
                    </div>

                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><ClipboardList size={16} /> Justificación y Detalles Técnicos</h4>
                      <div className="space-y-1 text-xs">
                        <p><Gavel size={12} className="inline mr-1.5 text-technical-text-blue" /> <strong className="text-technical-text-blue">Justificación Legal:</strong> {suggestion.justification.legal}</p>
                        <p><FlaskConical size={12} className="inline mr-1.5 text-technical-text-blue" /> <strong className="text-technical-text-blue">Justificación Técnica:</strong> {suggestion.justification.technical}</p>
                        <p className="mt-1"><strong className="text-technical-text-blue">Tipo de Error Identificado:</strong> {suggestion.errorType}</p>
                        <p><strong className="text-technical-text-blue">Consecuencia Estimada:</strong> {suggestion.estimatedConsequence}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary"/>
                    Sugerencias del Bloque
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-background">
                    No hay sugerencias pendientes para este bloque o ya fueron procesadas.
                </p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
