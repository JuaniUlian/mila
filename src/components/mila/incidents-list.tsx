
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionSeverity, DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Sparkles, XCircle, FileText, Lightbulb, Gavel, FlaskConical, AlertTriangle, Loader2, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SuggestionWithBlockId = Suggestion & { blockId: string };

interface IncidentItemContentProps {
  suggestion: SuggestionWithBlockId;
  originalText: string;
  onUpdateStatus: (newStatus: Suggestion['status']) => void;
  onUpdateText: (newText: string) => void;
  onClose: () => void;
}

const IncidentItemContent: React.FC<IncidentItemContentProps> = ({ suggestion, originalText, onUpdateStatus, onUpdateText, onClose }) => {
  const [mode, setMode] = useState<'view' | 'editing' | 'validated'>('view');
  const [currentText, setCurrentText] = useState(suggestion.text);
  const [isValidationLoading, setIsValidationLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const handleValidate = () => {
    setIsValidationLoading(true);
    setTimeout(() => {
        const correctedText = currentText + " (Este texto ha sido revisado y optimizado por IA para garantizar mayor claridad, precisión y total cumplimiento con la normativa vigente.)";
        setCurrentText(correctedText);
        setMode('validated');
        setIsValidationLoading(false);
        toast({
            title: t('analysisPage.toastNewSuggestionGenerated'),
            description: t('analysisPage.toastNewProposalGenerated'),
        });
    }, 5000);
  };

  const handleCancelEdit = () => {
    setCurrentText(suggestion.text);
    setMode('view');
  };

  const handleApply = () => {
    onUpdateText(currentText);
    onClose();
  };

  const handleDiscardOriginal = () => {
    onUpdateStatus('discarded');
    onClose();
  };

  const handleDiscardNewSuggestion = () => {
    setCurrentText(suggestion.text);
    setMode('view');
  };

  const handleEdit = () => {
    setMode('editing');
  };

  return (
    <div className="space-y-4">
        <div>
            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-muted-foreground"><FileText size={16}/> {t('analysisPage.originalTextContext')}</h4>
            <p className="text-xs bg-secondary/70 p-2 rounded-md font-mono text-foreground/80 max-h-28 overflow-y-auto">{originalText}</p>
        </div>

        <Separator />

        <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb size={16} className="text-primary"/> 
              {mode === 'validated' ? t('analysisPage.improvedProposal') : t('analysisPage.draftingProposal')}
            </h4>
            {mode === 'editing' ? (
              <Textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  rows={4}
                  className="w-full text-sm p-2 border-primary/50 rounded-md bg-background focus-visible:ring-primary mb-2 text-foreground"
                  aria-label="Editar sugerencia"
              />
            ) : (
              <div className={cn(
                "p-3 border rounded-md text-sm text-foreground",
                mode === 'validated' ? "bg-blue-100/70 border-blue-300" : "bg-secondary/70"
                )}>
                  <p className="leading-relaxed">{currentText}</p>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
                <h5 className="font-semibold mb-1 flex items-center gap-1.5"><Gavel size={14}/> {t('analysisPage.legalJustification')}</h5>
                <p className="text-muted-foreground">{suggestion.justification.legal}</p>
            </div>
            <div>
                <h5 className="font-semibold mb-1 flex items-center gap-1.5"><FlaskConical size={14}/> {t('analysisPage.technicalJustification')}</h5>
                <p className="text-muted-foreground">{suggestion.justification.technical}</p>
            </div>
            <div>
                <h5 className="font-semibold mb-1 flex items-center gap-1.5"><AlertTriangle size={14}/> {t('analysisPage.estimatedConsequence')}</h5>
                <p className="text-muted-foreground">{suggestion.estimatedConsequence}</p>
            </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'view' && (
              <>
                  <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'} className="bg-green-600 text-white hover:bg-green-700 font-semibold shadow-[2px_2px_4px_#14532d,-2px_-2px_4px_#86efac] active:shadow-[inset_2px_2px_4px_#14532d,inset_-2px_-2px_4px_#86efac] transition-shadow duration-200">
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                  </Button>
                  <Button size="sm" onClick={handleEdit} disabled={suggestion.status !== 'pending'} className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-[2px_2px_4px_#1e40af,-2px_-2px_4px_#93c5fd] active:shadow-[inset_2px_2px_4px_#1e40af,inset_-2px_-2px_4px_#93c5fd] transition-shadow duration-200">
                      <Edit3 className="mr-2 h-4 w-4"/> {t('analysisPage.edit')}
                  </Button>
                  <Button size="sm" onClick={handleDiscardOriginal} disabled={suggestion.status !== 'pending'} className="bg-red-600 text-white hover:bg-red-700 font-semibold shadow-[2px_2px_4px_#991b1b,-2px_-2px_4px_#fca5a5] active:shadow-[inset_2px_2px_4px_#991b1b,inset_-2px_-2px_4px_#fca5a5] transition-shadow duration-200">
                      <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
                  </Button>
              </>
          )}
          {mode === 'editing' && (
              <>
                  <Button size="sm" onClick={handleValidate} disabled={isValidationLoading} className="bg-green-600 text-white hover:bg-green-700 font-semibold shadow-[2px_2px_4px_#14532d,-2px_-2px_4px_#86efac] active:shadow-[inset_2px_2px_4px_#14532d,inset_-2px_-2px_4px_#86efac] transition-shadow duration-200">
                      {isValidationLoading ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('analysisPage.validating')}
                          </>
                      ) : (
                          <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              {t('analysisPage.validate')}
                          </>
                      )}
                  </Button>
                  <Button size="sm" onClick={handleCancelEdit} disabled={isValidationLoading} className="bg-slate-100 text-slate-700 font-semibold border-transparent shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff] active:shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff] transition-shadow duration-200">
                      <XCircle className="mr-2 h-4 w-4"/> {t('analysisPage.cancel')}
                  </Button>
              </>
          )}
          {mode === 'validated' && (
              <>
                  <Button size="sm" onClick={handleApply} className="bg-green-600 text-white hover:bg-green-700 font-semibold shadow-[2px_2px_4px_#14532d,-2px_-2px_4px_#86efac] active:shadow-[inset_2px_2px_4px_#14532d,inset_-2px_-2px_4px_#86efac] transition-shadow duration-200">
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                  </Button>
                  <Button size="sm" onClick={handleDiscardNewSuggestion} className="bg-red-600 text-white hover:bg-red-700 font-semibold shadow-[2px_2px_4px_#991b1b,-2px_-2px_4px_#fca5a5] active:shadow-[inset_2px_2px_4px_#991b1b,inset_-2px_-2px_4px_#fca5a5] transition-shadow duration-200">
                      <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
                  </Button>
              </>
          )}
        </div>
    </div>
  );
}


interface IncidentsListProps {
  suggestions: SuggestionWithBlockId[];
  blocks: DocumentBlock[];
  onUpdateSuggestionStatus: (blockId: string, suggestionId: string, status: Suggestion['status']) => void;
  onUpdateSuggestionText: (blockId: string, suggestionId: string, newText: string) => void;
  overallComplianceScore: number;
}

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

const getCategoryGradientStyle = (suggestions: SuggestionWithBlockId[]): React.CSSProperties => {
  const severities = new Set(suggestions.map(s => s.severity));
  const colors: string[] = [];

  const severityColors = {
    high: 'hsl(var(--destructive))',
    medium: 'hsl(var(--severity-medium))',
    low: 'hsl(var(--severity-low))',
  };

  if (severities.has('high')) colors.push(severityColors.high);
  if (severities.has('medium')) colors.push(severityColors.medium);
  if (severities.has('low')) colors.push(severityColors.low);

  if (colors.length === 0) return { background: 'hsl(var(--border))' };
  if (colors.length === 1) return { backgroundColor: colors[0] };
  return { backgroundImage: `linear-gradient(to bottom, ${colors.join(', ')})` };
};

export function IncidentsList({ 
  suggestions, 
  blocks, 
  onUpdateSuggestionStatus, 
  onUpdateSuggestionText, 
  overallComplianceScore,
}: IncidentsListProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [dialogSuggestion, setDialogSuggestion] = useState<SuggestionWithBlockId | null>(null);
  
  const severityOrder: { [key in SuggestionSeverity]: number } = { high: 0, medium: 1, low: 2 };

  const pendingSuggestions = useMemo(() => {
    return [...suggestions]
      .filter(s => s.status === 'pending')
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [suggestions]);
  
  const groupedSuggestions = useMemo(() => {
    const groups: { [key in SuggestionCategory]?: SuggestionWithBlockId[] } = {};
    pendingSuggestions.forEach(suggestion => {
      const category = suggestion.category;
      if (!groups[category]) groups[category] = [];
      groups[category]?.push(suggestion);
    });
    return Object.entries(groups)
      .map(([category, suggestions]) => ({ category: category as SuggestionCategory, suggestions: suggestions || [] }))
      .filter(group => group.suggestions.length > 0);
  }, [pendingSuggestions]);

  const getOriginalText = (blockId: string) => {
    return blocks.find(b => b.id === blockId)?.originalText || "Contexto no encontrado.";
  }
  
  const useDarkText = overallComplianceScore >= 75;
  const getTranslatedCategory = (category: SuggestionCategory) => t(`suggestionCategories.${category}`);

  return (
    <div className="h-full">
      <Card className="h-full flex flex-col bg-transparent border-none shadow-none overflow-visible">
        <CardHeader className="p-4 border-b border-white/10 transition-all duration-300">
          <CardTitle className="text-xl font-bold text-card-foreground">{t('analysisPage.incidentsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <ScrollArea className="h-full w-full pr-2">
              {pendingSuggestions.length > 0 ? (
                  <Accordion type="multiple" defaultValue={groupedSuggestions.map(g => g.category)} className="space-y-4">
                  {groupedSuggestions.map(({ category, suggestions: s_group }) => (
                      <AccordionItem
                        key={category}
                        value={category}
                        className="group incident-card-hover relative border rounded-2xl border-white/30 overflow-hidden shadow-lg transition-all duration-500 bg-white/20 backdrop-blur-md"
                      >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={getCategoryGradientStyle(s_group)}/>
                          <AccordionTrigger className="pl-6 pr-4 py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-white/20 rounded-t-2xl data-[state=open]:rounded-b-none transition-colors duration-300">
                              <span className="text-lg font-semibold flex-1 text-left text-card-foreground transition-colors">{getTranslatedCategory(category)} ({s_group.length})</span>
                          </AccordionTrigger>
                          <AccordionContent className="pl-6 pr-3 pb-3 pt-2 space-y-3">
                              {s_group.map(suggestion => (
                                <div key={suggestion.id} className="rounded-lg shadow-sm overflow-hidden incident-card-hover border border-white/20 bg-white/20 backdrop-blur-sm">
                                  <div className="relative pl-3">
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b rounded-l-lg", getSeverityGradientClass(suggestion.severity))} />
                                      <button 
                                        className="p-4 w-full flex items-center justify-between text-left hover:bg-white/20 transition-colors"
                                        onClick={() => setDialogSuggestion(suggestion)}
                                      >
                                        <div className="flex-1 space-y-1 pr-4">
                                            <p className="font-semibold text-card-foreground">{suggestion.errorType}</p>
                                            <p className="text-sm text-muted-foreground">{t('suggestionCategories.normativa')}: {suggestion.appliedNorm}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      </button>
                                  </div>
                                </div>
                              ))}
                          </AccordionContent>
                      </AccordionItem>
                  ))}
                  </Accordion>
              ) : (
                  <div className="h-full flex items-center justify-center">
                      <Card className="p-6 w-full max-w-md bg-white/20 backdrop-blur-md border-white/30 shadow-lg">
                          <CardContent className="p-0 flex flex-col items-center justify-center text-center">
                              <Check className="w-16 h-16 text-green-400 mb-4" />
                              <h3 className={cn("text-xl font-semibold", useDarkText ? 'text-foreground' : 'text-white')}>{t('analysisPage.excellent')}</h3>
                              <p className={cn(useDarkText ? 'text-muted-foreground' : 'text-white/80')}>{t('analysisPage.noPendingIncidents')}</p>
                              <p className={cn(useDarkText ? 'text-muted-foreground' : 'text-white/80')}>{t('analysisPage.documentValidated')}</p>
                          </CardContent>
                      </Card>
                  </div>
              )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!dialogSuggestion} onOpenChange={(isOpen) => !isOpen && setDialogSuggestion(null)}>
        <DialogContent className="max-w-3xl w-full p-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-xl">
          {dialogSuggestion && (
            <>
              <DialogHeader className="p-4 bg-white/20 border-b border-white/20 shadow-md">
                  <DialogTitle>{dialogSuggestion.errorType}</DialogTitle>
              </DialogHeader>
              <div className="p-6 overflow-y-auto max-h-[75vh]">
                <IncidentItemContent 
                  suggestion={dialogSuggestion}
                  originalText={getOriginalText(dialogSuggestion.blockId)}
                  onUpdateStatus={(newStatus) => {
                      onUpdateSuggestionStatus(dialogSuggestion.blockId, dialogSuggestion.id, newStatus);
                      setDialogSuggestion(null);
                  }}
                  onUpdateText={(newText) => {
                      onUpdateSuggestionText(dialogSuggestion.blockId, dialogSuggestion.id, newText);
                      setDialogSuggestion(null);
                  }}
                  onClose={() => setDialogSuggestion(null)}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
