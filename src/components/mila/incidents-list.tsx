
'use client';

import React, { useState, useMemo } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionSeverity, DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Edit3, Trash2, Save, XCircle, FileText, Lightbulb, Gavel, FlaskConical, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

type SuggestionWithBlockId = Suggestion & { blockId: string };

interface IncidentsListProps {
  suggestions: SuggestionWithBlockId[];
  blocks: DocumentBlock[];
  onUpdateSuggestionStatus: (blockId: string, suggestionId: string, status: Suggestion['status']) => void;
  onUpdateSuggestionText: (blockId: string, suggestionId: string, newText: string) => void;
}

interface IncidentItemProps {
  suggestion: SuggestionWithBlockId;
  originalText: string;
  onUpdateStatus: (newStatus: Suggestion['status']) => void;
  onUpdateText: (newText: string) => void;
}

const IncidentItem: React.FC<IncidentItemProps> = ({ suggestion, originalText, onUpdateStatus, onUpdateText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(suggestion.text);

  const severityBarClass = {
    high: 'incident-bar-high',
    medium: 'incident-bar-medium',
    low: 'incident-bar-low',
  }[suggestion.severity];

  const handleSave = () => {
    onUpdateText(editText);
    setIsEditing(false);
    // After saving, we collapse the item as the action is done.
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
    setIsExpanded(true); // Keep it expanded for editing
  }

  return (
    <div className="bg-card/80 border border-border/50 rounded-lg overflow-hidden transition-all duration-200">
      {/* Header Row */}
      <div className="relative pl-8 pr-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className={cn("incident-bar", severityBarClass)}></div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{suggestion.errorType}</p>
          <p className="text-xs text-muted-foreground">Normativa aplicada: {suggestion.appliedNorm}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className={cn("text-xs font-bold px-2 py-1 rounded-md", 
                suggestion.status === 'pending' && 'bg-amber-500/20 text-amber-400',
                suggestion.status === 'applied' && 'bg-green-500/20 text-green-400',
                suggestion.status === 'discarded' && 'bg-red-500/20 text-red-400'
            )}>
                {suggestion.status}
            </span>
            <Button variant="ghost" size="sm" className="hover:bg-secondary">
                {isExpanded ? "Ocultar" : "Mostrar"}
                <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", isExpanded && "rotate-180")} />
            </Button>
        </div>
      </div>
      
      {/* Collapsible Content */}
      {isExpanded && (
        <div className="pl-8 pr-4 pb-4 border-t border-border/50 space-y-4 animate-accordion-down">
          {/* Original Text */}
          <div>
            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-muted-foreground"><FileText size={16}/> Contexto del Texto Original</h4>
            <p className="text-xs bg-black/30 p-2 rounded-md font-mono text-foreground/70 max-h-28 overflow-y-auto">{originalText}</p>
          </div>

          <Separator className="bg-border/30"/>

          {/* Suggested Text */}
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
              <div className="p-3 border border-border/30 rounded-md bg-secondary/30 text-sm text-foreground">
                <p className="leading-relaxed">{suggestion.text}</p>
              </div>
            )}
          </div>

          {/* Justification */}
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
          
          <Separator className="bg-border/30"/>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isEditing ? (
                <>
                    <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Guardar Cambio</Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}><XCircle className="mr-2 h-4 w-4"/> Cancelar</Button>
                </>
            ) : (
                 <>
                    <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'}>
                        <Check className="mr-2 h-4 w-4"/> Aplicar Corrección
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEdit} disabled={suggestion.status !== 'pending'}>
                        <Edit3 className="mr-2 h-4 w-4"/> Editar y Aplicar
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
  );
};


export function IncidentsList({ suggestions, blocks, onUpdateSuggestionStatus, onUpdateSuggestionText }: IncidentsListProps) {
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

  return (
    <Card className="panel-glass h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Incidencias y Sugerencias</CardTitle>
        <CardDescription>Hallazgos pendientes detectados por la IA, agrupados por categoría y ordenados por severidad.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        <ScrollArea className="h-full w-full pr-4">
            {pendingSuggestions.length > 0 ? (
                <div className="space-y-6">
                {groupedSuggestions.map(([category, s_group]) => (
                    <div key={category}>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{category} ({s_group.length})</h3>
                    <div className="space-y-3">
                        {s_group.map(suggestion => (
                        <IncidentItem 
                            key={suggestion.id}
                            suggestion={suggestion}
                            originalText={getOriginalText(suggestion.blockId)}
                            onUpdateStatus={(newStatus) => onUpdateSuggestionStatus(suggestion.blockId, suggestion.id, newStatus)}
                            onUpdateText={(newText) => onUpdateSuggestionText(suggestion.blockId, suggestion.id, newText)}
                        />
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Check className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground">¡Excelente!</h3>
                    <p>No hay incidencias pendientes de revisión.</p>
                    <p>El documento ha sido completamente validado.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
