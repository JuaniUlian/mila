
'use client';

import React, { useState, useMemo } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionSeverity, DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Edit3, Trash2, Save, XCircle, FileText, Lightbulb, Gavel, FlaskConical, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type SuggestionWithBlockId = Suggestion & { blockId: string };

interface IncidentsListProps {
  suggestions: SuggestionWithBlockId[];
  blocks: DocumentBlock[];
  onUpdateSuggestionStatus: (blockId: string, suggestionId: string, status: Suggestion['status']) => void;
  onUpdateSuggestionText: (blockId: string, suggestionId: string, newText: string) => void;
  overallComplianceScore: number;
}

interface IncidentItemProps {
  suggestion: SuggestionWithBlockId;
  originalText: string;
  onUpdateStatus: (newStatus: Suggestion['status']) => void;
  onUpdateText: (newText: string) => void;
}

// This function is for the *individual* suggestion items inside a category.
const getSeverityGradientClass = (severity: SuggestionSeverity) => {
    switch (severity) {
      case 'high':
        return 'from-red-500 to-red-400';
      case 'medium':
        return 'from-amber-400 to-amber-300';
      case 'low':
        return 'from-sky-400 to-sky-300';
    }
};

// This function is for the *category* accordion group.
// It creates a multi-color gradient based on all severities present.
const getCategoryGradientStyle = (suggestions: SuggestionWithBlockId[]): React.CSSProperties => {
  const severities = new Set(suggestions.map(s => s.severity));
  const colors: string[] = [];

  const severityColors = {
    high: 'hsl(var(--destructive))',
    medium: 'hsl(var(--severity-medium))',
    low: 'hsl(var(--severity-low))',
  };

  // Order is important for the top-to-bottom gradient
  if (severities.has('high')) colors.push(severityColors.high);
  if (severities.has('medium')) colors.push(severityColors.medium);
  if (severities.has('low')) colors.push(severityColors.low);

  if (colors.length === 0) {
    return { background: 'hsl(var(--border))' }; // Fallback
  }

  if (colors.length === 1) {
    return { backgroundColor: colors[0] };
  }

  return {
    backgroundImage: `linear-gradient(to bottom, ${colors.join(', ')})`,
  };
};

const IncidentItem: React.FC<IncidentItemProps> = ({ suggestion, originalText, onUpdateStatus, onUpdateText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(suggestion.text);

  const handleSave = () => {
    onUpdateText(editText);
    setIsEditing(false);
    setIsExpanded(false); 
  };
  
  const handleCancel = () => {
    setEditText(suggestion.text);
    setIsEditing(false);
  };

  const handleApply = () => {
    onUpdateStatus('applied');
    setIsExpanded(false);
  };

  const handleDiscard = () => {
    onUpdateStatus('discarded');
    setIsExpanded(false);
  }

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  }

  return (
    <div className="relative pl-3">
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", getSeverityGradientClass(suggestion.severity))} />
        <div className="bg-card/90 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1 space-y-1 pr-8">
                <p className="font-semibold text-card-foreground">{suggestion.errorType}</p>
                <p className="text-sm text-muted-foreground">Normativa: {suggestion.appliedNorm}</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
            </div>
      
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-border/50 space-y-4 animate-accordion-down">
                    <div>
                        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-muted-foreground"><FileText size={16}/> Contexto del Texto Original</h4>
                        <p className="text-xs bg-secondary p-2 rounded-md font-mono text-foreground/80 max-h-28 overflow-y-auto">{originalText}</p>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-primary"/> Propuesta de Redacción</h4>
                        {isEditing ? (
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            className="w-full text-sm p-2 border-primary/50 rounded-md bg-background focus-visible:ring-primary mb-2 text-foreground"
                            aria-label="Editar sugerencia"
                        />
                        ) : (
                        <div className="p-3 border rounded-md bg-secondary text-sm text-foreground">
                            <p className="leading-relaxed">{suggestion.text}</p>
                        </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <h5 className="font-semibold mb-1 flex items-center gap-1.5"><Gavel size={14}/> Justificación Legal</h5>
                            <p className="text-muted-foreground">{suggestion.justification.legal}</p>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-1 flex items-center gap-1.5"><FlaskConical size={14}/> Justificación Técnica</h5>
                            <p className="text-muted-foreground">{suggestion.justification.technical}</p>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-1 flex items-center gap-1.5"><AlertTriangle size={14}/> Consecuencia Estimada</h5>
                            <p className="text-muted-foreground">{suggestion.estimatedConsequence}</p>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                            <>
                                <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Guardar</Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}><XCircle className="mr-2 h-4 w-4"/> Cancelar</Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'}>
                                    <Check className="mr-2 h-4 w-4"/> Aplicar
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleEdit} disabled={suggestion.status !== 'pending'}>
                                    <Edit3 className="mr-2 h-4 w-4"/> Editar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={handleDiscard} disabled={suggestion.status !== 'pending'}>
                                    <Trash2 className="mr-2 h-4 w-4"/> Descartar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};


export function IncidentsList({ suggestions, blocks, onUpdateSuggestionStatus, onUpdateSuggestionText, overallComplianceScore }: IncidentsListProps) {
  const severityOrder: { [key in SuggestionSeverity]: number } = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const pendingSuggestions = useMemo(() => {
    return [...suggestions]
      .filter(s => s.status === 'pending')
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [suggestions]);
  
  const groupedSuggestions = useMemo(() => {
    const groups: Record<SuggestionCategory, SuggestionWithBlockId[]> = {
      'Legal': [],
      'Técnica': [],
      'Administrativa': [],
      'Redacción': [],
    };
    
    pendingSuggestions.forEach(suggestion => {
      if (groups[suggestion.category]) {
        groups[suggestion.category].push(suggestion);
      }
    });

    return Object.entries(groups).filter(([, s]) => s.length > 0);
  }, [pendingSuggestions]);

  const getOriginalText = (blockId: string) => {
    return blocks.find(b => b.id === blockId)?.originalText || "Contexto no encontrado.";
  }
  
  const useDarkText = overallComplianceScore >= 75;

  return (
    <Card className="h-full flex flex-col bg-white/20 backdrop-blur-md border-white/30 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="p-4 border-b border-white/10">
        <CardTitle className="text-xl font-bold text-card-foreground">Incidencias y Sugerencias</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <ScrollArea className="h-full w-full pr-2">
            {pendingSuggestions.length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                {groupedSuggestions.map(([category, s_group]) => {
                    const gradientStyle = getCategoryGradientStyle(s_group);
                    return(
                    <AccordionItem key={category} value={category} className="group relative border rounded-lg border-white/10 bg-background/20 overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/30 hover:border-primary/30">
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={gradientStyle}
                        />
                        <AccordionTrigger className="pl-6 pr-4 py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-white/10 rounded-lg data-[state=open]:rounded-b-none group-hover:bg-primary/90 transition-colors duration-300">
                            <span className="text-lg font-semibold flex-1 text-left text-card-foreground group-hover:text-primary-foreground transition-colors">{category} ({s_group.length})</span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-6 pr-3 pb-3 pt-2 space-y-3 bg-gradient-to-b from-amber-100 to-amber-50">
                            {s_group.map(suggestion => (
                            <IncidentItem 
                                key={suggestion.id}
                                suggestion={suggestion}
                                originalText={getOriginalText(suggestion.blockId)}
                                onUpdateStatus={(newStatus) => onUpdateSuggestionStatus(suggestion.blockId, suggestion.id, newStatus)}
                                onUpdateText={(newText) => onUpdateSuggestionText(suggestion.blockId, suggestion.id, newText)}
                            />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                    )
                })}
                </Accordion>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <Card className="p-6 w-full max-w-md bg-white/20 backdrop-blur-md border-white/30 shadow-lg">
                        <CardContent className="p-0 flex flex-col items-center justify-center text-center">
                            <Check className="w-16 h-16 text-green-400 mb-4" />
                            <h3 className={cn("text-xl font-semibold", useDarkText ? 'text-foreground' : 'text-white')}>¡Excelente!</h3>
                            <p className={cn(useDarkText ? 'text-muted-foreground' : 'text-white/80')}>No hay incidencias pendientes de revisión.</p>
                            <p className={cn(useDarkText ? 'text-muted-foreground' : 'text-white/80')}>El documento ha sido completamente validado.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
