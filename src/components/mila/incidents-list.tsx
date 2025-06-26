
'use client';

import React, { useState, useMemo } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionSeverity, DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Edit3, Trash2, Sparkles, XCircle, FileText, Lightbulb, Gavel, FlaskConical, AlertTriangle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

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
  const [mode, setMode] = useState<'view' | 'editing' | 'validated'>('view');
  const [currentText, setCurrentText] = useState(suggestion.text);
  const [isValidationLoading, setIsValidationLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);
  const neumorphicClasses = "bg-slate-100 text-gray-700 font-semibold border-transparent shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff] hover:bg-slate-100 hover:shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] transition-shadow duration-200 ease-in-out";

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
  };

  const handleDiscardOriginal = () => {
    onUpdateStatus('discarded');
  };

  const handleDiscardNewSuggestion = () => {
    setCurrentText(suggestion.text);
    setMode('view');
    setIsExpanded(true); 
  };

  const handleEdit = () => {
    setMode('editing');
    setIsExpanded(true);
  };

  const toggleExpand = () => {
    if (mode === 'editing' || mode === 'validated') {
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="relative pl-3 incident-card-hover rounded-lg">
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", getSeverityGradientClass(suggestion.severity))} />
        <div className="bg-card/90 border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={toggleExpand}>
                <div className="flex-1 space-y-1 pr-8">
                <p className="font-semibold text-card-foreground">{suggestion.errorType}</p>
                <p className="text-sm text-muted-foreground">Normativa: {suggestion.appliedNorm}</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
            </div>
      
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-border/50 space-y-4 animate-accordion-down">
                    <div>
                        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2 text-muted-foreground"><FileText size={16}/> {t('analysisPage.originalTextContext')}</h4>
                        <p className="text-xs bg-secondary p-2 rounded-md font-mono text-foreground/80 max-h-28 overflow-y-auto">{originalText}</p>
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
                            mode === 'validated' ? "bg-blue-100/70 border-blue-300" : "bg-secondary"
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
                              <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'} className={neumorphicClasses}>
                                  <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                              </Button>
                              <Button size="sm" onClick={handleEdit} disabled={suggestion.status !== 'pending'} className={neumorphicClasses}>
                                  <Edit3 className="mr-2 h-4 w-4"/> {t('analysisPage.edit')}
                              </Button>
                              <Button size="sm" onClick={handleDiscardOriginal} disabled={suggestion.status !== 'pending'} className={neumorphicClasses}>
                                  <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
                              </Button>
                          </>
                      )}
                      {mode === 'editing' && (
                          <>
                              <Button size="sm" onClick={handleValidate} disabled={isValidationLoading} className={neumorphicClasses}>
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
                              <Button size="sm" onClick={handleCancelEdit} disabled={isValidationLoading} className={neumorphicClasses}>
                                  <XCircle className="mr-2 h-4 w-4"/> {t('analysisPage.cancel')}
                              </Button>
                          </>
                      )}
                      {mode === 'validated' && (
                          <>
                              <Button size="sm" onClick={handleApply} className={neumorphicClasses}>
                                  <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                              </Button>
                              <Button size="sm" onClick={handleDiscardNewSuggestion} className={neumorphicClasses}>
                                  <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
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
  const [focusedCategories, setFocusedCategories] = useState<string[]>([]);
  const { language } = useLanguage();
  const t = useTranslations(language);
  
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
    const groups: { [key in SuggestionCategory]?: SuggestionWithBlockId[] } = {};
    
    pendingSuggestions.forEach(suggestion => {
      const category = suggestion.category;
      if (!groups[category]) {
        groups[category] = [];
      }
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

  const handleOverlayClick = () => {
    setFocusedCategories([]);
  };

  const isAnyCategoryFocused = focusedCategories.length > 0;

  const getTranslatedCategory = (category: SuggestionCategory) => {
      return t(`suggestionCategories.${category}`);
  }

  return (
    <div className="relative h-full">
      {isAnyCategoryFocused && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 animate-in fade-in-0"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      <Card className={cn(
        "h-full flex flex-col bg-white/20 backdrop-blur-md border-white/30 shadow-lg rounded-2xl overflow-hidden transition-all duration-300",
        "relative z-20"
      )}>
        <CardHeader className="p-4 border-b border-white/10">
          <CardTitle className="text-xl font-bold text-card-foreground">{t('analysisPage.incidentsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <ScrollArea className="h-full w-full pr-2">
              {pendingSuggestions.length > 0 ? (
                  <Accordion
                    type="multiple"
                    className="space-y-4"
                    value={focusedCategories}
                    onValueChange={setFocusedCategories}
                  >
                  {groupedSuggestions.map(({ category, suggestions: s_group }) => {
                      const gradientStyle = getCategoryGradientStyle(s_group);
                      const isFocused = focusedCategories.includes(category);
                      return(
                      <AccordionItem
                        key={category}
                        value={category}
                        className={cn(
                          "group incident-card-hover relative border rounded-lg border-white/10 bg-background/20 overflow-hidden shadow-md",
                          isFocused && "scale-[1.02]"
                        )}
                      >
                          <div 
                              className="absolute left-0 top-0 bottom-0 w-1.5"
                              style={gradientStyle}
                          />
                          <AccordionTrigger className="pl-6 pr-4 py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-white/10 rounded-lg data-[state=open]:rounded-b-none transition-colors duration-300">
                              <span className="text-lg font-semibold flex-1 text-left text-card-foreground transition-colors">{getTranslatedCategory(category)} ({s_group.length})</span>
                          </AccordionTrigger>
                          <AccordionContent className="pl-6 pr-3 pb-3 pt-2 space-y-3 bg-gradient-to-b from-amber-50 to-amber-100">
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
    </div>
  );
}
