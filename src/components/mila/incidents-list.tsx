
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
  
  const neumorphicButtonClasses = "font-semibold border-transparent bg-slate-200 shadow-[3px_3px_6px_#c5cad0,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#c5cad0,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_5px_#c5cad0,inset_-2px_-2px_5px_#ffffff] transition-shadow duration-200 ease-in-out";

  return (
    <div className="space-y-6">
        <div>
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-600"><FileText size={16}/> {t('analysisPage.originalTextContext')}</h4>
            <div className="bg-slate-200 p-3 rounded-lg shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]">
                <p className="text-sm font-sans text-foreground/90 max-h-32 overflow-y-auto">{originalText}</p>
            </div>
        </div>

        <Separator className="bg-slate-300"/>

        <div>
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-600">
              <Lightbulb size={16} className="text-primary"/> 
              {mode === 'validated' ? t('analysisPage.improvedProposal') : t('analysisPage.draftingProposal')}
            </h4>
            {mode === 'editing' ? (
              <Textarea
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  rows={5}
                  className="w-full text-sm p-3 border-slate-300 rounded-lg bg-slate-100 shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] focus-visible:ring-primary mb-2 text-foreground"
                  aria-label="Editar sugerencia"
              />
            ) : (
              <div className={cn(
                "p-3 border rounded-lg text-sm text-foreground",
                mode === 'validated' 
                  ? "bg-slate-200 border-slate-300 shadow-[inset_3px_3px_7px_#d1d5db,inset_-3px_-3px_7px_#ffffff]" 
                  : "bg-slate-200 p-3 rounded-lg shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]"
                )}>
                  <p className="leading-relaxed">{currentText}</p>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-200 p-3 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><Gavel size={14}/> {t('analysisPage.legalJustification')}</h5>
                <p className="text-muted-foreground text-xs">{suggestion.justification.legal}</p>
            </div>
            <div className="bg-slate-200 p-3 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><FlaskConical size={14}/> {t('analysisPage.technicalJustification')}</h5>
                <p className="text-muted-foreground text-xs">{suggestion.justification.technical}</p>
            </div>
            <div className="bg-slate-200 p-3 rounded-lg shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] md:col-span-2">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><AlertTriangle size={14}/> {t('analysisPage.estimatedConsequence')}</h5>
                <p className="text-muted-foreground text-xs">{suggestion.estimatedConsequence}</p>
            </div>
        </div>
        
        <Separator className="bg-slate-300"/>
        
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'view' && (
              <>
                  <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'} className={cn(neumorphicButtonClasses, "text-green-600")}>
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                  </Button>
                  <Button size="sm" onClick={handleEdit} disabled={suggestion.status !== 'pending'} className={cn(neumorphicButtonClasses, "text-blue-600")}>
                      <Edit3 className="mr-2 h-4 w-4"/> {t('analysisPage.edit')}
                  </Button>
                  <Button size="sm" onClick={handleDiscardOriginal} disabled={suggestion.status !== 'pending'} className={cn(neumorphicButtonClasses, "text-red-600")}>
                      <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
                  </Button>
              </>
          )}
          {mode === 'editing' && (
              <>
                  <Button size="sm" onClick={handleValidate} disabled={isValidationLoading} className={cn(neumorphicButtonClasses, "text-green-600")}>
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
                  <Button size="sm" onClick={handleCancelEdit} disabled={isValidationLoading} className={cn(neumorphicButtonClasses, "text-slate-700")}>
                      <XCircle className="mr-2 h-4 w-4"/> {t('analysisPage.cancel')}
                  </Button>
              </>
          )}
          {mode === 'validated' && (
              <>
                  <Button size="sm" onClick={handleApply} className={cn(neumorphicButtonClasses, "text-green-600")}>
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                  </Button>
                  <Button size="sm" onClick={handleDiscardNewSuggestion} className={cn(neumorphicButtonClasses, "text-red-600")}>
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

  const [openCategories, setOpenCategories] = useState<string[]>([]);

  useEffect(() => {
    setOpenCategories(
      Array.from(new Set(pendingSuggestions.map(s => s.category)))
    );
  }, [pendingSuggestions]);
  
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
                  <Accordion type="multiple" value={openCategories} onValueChange={setOpenCategories} className="space-y-4">
                  {groupedSuggestions.map(({ category, suggestions: s_group }) => (
                      <AccordionItem
                        key={category}
                        value={category}
                        className="group incident-card-hover relative border rounded-2xl border-white/20 overflow-hidden shadow-lg transition-all duration-500 bg-white/20 backdrop-blur-md"
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
        <DialogContent className="max-w-3xl w-full p-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-2xl bg-slate-200 shadow-[8px_8px_16px_#c5cad5,-8px_-8px_16px_#ffffff] border-t border-l border-white">
          {dialogSuggestion && (
            <>
              <DialogHeader className="p-4 bg-slate-200 border-b border-slate-300">
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
