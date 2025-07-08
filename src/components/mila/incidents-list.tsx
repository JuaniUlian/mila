
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionSeverity, DocumentBlock } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit3, Trash2, Sparkles, XCircle, FileText, Lightbulb, Scale, FlaskConical, AlertTriangle, Loader2, ChevronRight, BookCheck, ClipboardList, FilePen } from 'lucide-react';
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
import { validateSuggestionEdit } from '@/ai/flows/validate-suggestion-edit';

type SuggestionWithBlockId = Suggestion & { blockId: string };

interface IncidentItemContentProps {
  suggestion: SuggestionWithBlockId;
  originalText: string;
  regulationContent?: string;
  onUpdateStatus: (newStatus: Suggestion['status']) => void;
  onUpdateText: (newText: string) => void;
  onClose: () => void;
}

const IncidentItemContent: React.FC<IncidentItemContentProps> = ({ suggestion, originalText, regulationContent, onUpdateStatus, onUpdateText, onClose }) => {
  const [mode, setMode] = useState<'view' | 'editing' | 'validated'>('view');
  const [currentText, setCurrentText] = useState(suggestion.text || '');
  const [isValidationLoading, setIsValidationLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations(language);

  const getProposalTitle = () => {
    if (mode === 'validated') {
      return t('analysisPage.improvedProposal');
    }
    if (suggestion.category === 'Redacción') {
      return t('analysisPage.draftingProposal');
    }
    return t('analysisPage.solutionProposal');
  };

  const handleValidate = async () => {
    if (!regulationContent) {
        toast({ title: "Error", description: "No se encontró contenido de la normativa para validar.", variant: "destructive" });
        return;
    }
    if (!suggestion.text) {
        toast({ title: "Error", description: "No hay texto de sugerencia original para validar.", variant: "destructive" });
        return;
    }

    setIsValidationLoading(true);

    try {
        const result = await validateSuggestionEdit({
            originalText: originalText,
            originalSuggestion: suggestion.text,
            userEditedSuggestion: currentText,
            legalJustification: suggestion.justification.legal,
            regulationContent: regulationContent,
        });

        setCurrentText(result.improvedProposal);
        setMode('validated');
        toast({
            title: result.isValid ? t('analysisPage.toastValidationSuccessTitle') : t('analysisPage.toastValidationNeedsReviewTitle'),
            description: result.feedback,
        });

    } catch (error) {
        console.error("Error during suggestion validation:", error);
        toast({
            title: t('analysisPage.toastValidationErrorTitle'),
            description: t('analysisPage.toastValidationErrorDesc'),
            variant: "destructive",
        });
    } finally {
        setIsValidationLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentText(suggestion.text || '');
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
    setCurrentText(suggestion.text || '');
    setMode('view');
  };

  const handleEdit = () => {
    setMode('editing');
  };
  
  const baseButtonClasses = "font-semibold rounded-lg text-white shadow-md hover:brightness-110 active:scale-95 transition-all duration-150 ease-in-out";
  const greenButtonClasses = "bg-gradient-to-br from-green-500 to-green-600";
  const blueButtonClasses = "bg-gradient-to-br from-blue-500 to-blue-600";
  const redButtonClasses = "bg-gradient-to-br from-red-500 to-red-600";
  const neutralButtonClasses = "bg-gradient-to-br from-slate-400 to-slate-500 text-slate-100";


  return (
    <div className="space-y-6">
        <div>
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-700"><FileText size={16}/> {t('analysisPage.originalText')}</h4>
            <div className="bg-white/60 p-3 rounded-xl shadow-inner border border-white/80">
                <p className="text-sm font-sans text-slate-800 max-h-32 overflow-y-auto">{originalText}</p>
            </div>
        </div>

        {regulationContent && (
           <>
            <Separator className="bg-slate-300/70"/>
            <div>
                <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-700">
                  <BookCheck size={16}/> {t('analysisPage.citedRegulation')}: {suggestion.appliedNorm}
                </h4>
                <div className="bg-blue-50 p-3 rounded-xl shadow-inner border border-blue-200">
                    <p className="text-sm font-sans text-blue-900 max-h-32 overflow-y-auto">{regulationContent}</p>
                </div>
            </div>
          </>
        )}

        <Separator className="bg-slate-300/70"/>
        
        {suggestion.proceduralSuggestion && (
          <div>
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-700">
              <ClipboardList size={16}/> {t('analysisPage.solutionProposal')}
            </h4>
            <div className="bg-white/60 p-3 rounded-xl shadow-inner border border-white/80">
                <p className="text-sm font-sans text-slate-800">{suggestion.proceduralSuggestion}</p>
            </div>
          </div>
        )}

        {suggestion.text && (
          <div>
              <h4 className="text-base font-semibold mb-2 flex items-center gap-2 text-slate-700">
                <Lightbulb size={16} className="text-primary"/> 
                {getProposalTitle()}
              </h4>
              {mode === 'editing' ? (
                <Textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    rows={5}
                    className="w-full text-sm p-3 border-slate-300 rounded-lg bg-white shadow-inner focus-visible:ring-primary mb-2 text-foreground"
                    aria-label="Editar sugerencia"
                />
              ) : (
                <div className={cn(
                  "p-3 border rounded-xl text-sm text-slate-800",
                  "bg-white/60 shadow-inner border-white/80"
                  )}>
                    <p className="leading-relaxed">{currentText}</p>
                </div>
              )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/60 p-3 rounded-xl shadow-inner border border-white/80">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><Scale size={14}/> {t('analysisPage.legalJustification')}</h5>
                <p className="text-slate-700 text-xs">{suggestion.justification.legal}</p>
            </div>
            <div className="bg-white/60 p-3 rounded-xl shadow-inner border border-white/80">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><FlaskConical size={14}/> {t('analysisPage.technicalJustification')}</h5>
                <p className="text-slate-700 text-xs">{suggestion.justification.technical}</p>
            </div>
            <div className="bg-white/60 p-3 rounded-xl shadow-inner border border-white/80 md:col-span-2">
                <h5 className="font-semibold mb-1.5 flex items-center gap-1.5 text-slate-600"><AlertTriangle size={14}/> {t('analysisPage.estimatedConsequence')}</h5>
                <p className="text-slate-700 text-xs">{suggestion.estimatedConsequence}</p>
            </div>
        </div>
        
        <Separator className="bg-slate-300/70"/>
        
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {mode === 'view' && (
              <>
                  {suggestion.text && (
                    <Button size="sm" onClick={handleApply} disabled={suggestion.status !== 'pending'} className={cn(baseButtonClasses, greenButtonClasses)}>
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                    </Button>
                  )}
                  {suggestion.text && (
                    <Button size="sm" onClick={handleEdit} disabled={suggestion.status !== 'pending'} className={cn(baseButtonClasses, blueButtonClasses)}>
                        <Edit3 className="mr-2 h-4 w-4"/> {t('analysisPage.edit')}
                    </Button>
                  )}
                  {!suggestion.text && suggestion.proceduralSuggestion && (
                    <Button size="sm" onClick={() => onUpdateStatus('applied')} disabled={suggestion.status !== 'pending'} className={cn(baseButtonClasses, greenButtonClasses)}>
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.markAsHandled')}
                    </Button>
                  )}
                  <Button size="sm" onClick={handleDiscardOriginal} disabled={suggestion.status !== 'pending'} className={cn(baseButtonClasses, redButtonClasses)}>
                      <Trash2 className="mr-2 h-4 w-4"/> {t('analysisPage.discard')}
                  </Button>
              </>
          )}
          {mode === 'editing' && (
              <>
                  <Button size="sm" onClick={handleValidate} disabled={isValidationLoading} className={cn(baseButtonClasses, greenButtonClasses)}>
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
                  <Button size="sm" onClick={handleCancelEdit} disabled={isValidationLoading} className={cn(baseButtonClasses, neutralButtonClasses)}>
                      <XCircle className="mr-2 h-4 w-4"/> {t('analysisPage.cancel')}
                  </Button>
              </>
          )}
          {mode === 'validated' && (
              <>
                  <Button size="sm" onClick={handleApply} className={cn(baseButtonClasses, greenButtonClasses)}>
                      <Check className="mr-2 h-4 w-4"/> {t('analysisPage.apply')}
                  </Button>
                  <Button size="sm" onClick={handleDiscardNewSuggestion} className={cn(baseButtonClasses, redButtonClasses)}>
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
  selectedRegulations: {name: string, content: string}[];
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

const categoryIcons: { [key in SuggestionCategory]: React.ElementType } = {
  Legal: Scale,
  Administrativa: ClipboardList,
  Redacción: FilePen,
};

const getHighestSeverityColorClass = (suggestions: SuggestionWithBlockId[]): string => {
    const severities = new Set(suggestions.map(s => s.severity));
    if (severities.has('high')) return 'text-[hsl(var(--severity-high))]';
    if (severities.has('medium')) return 'text-[hsl(var(--severity-medium))]';
    if (severities.has('low')) return 'text-[hsl(var(--severity-low))]';
    return 'text-muted-foreground';
};


export function IncidentsList({ 
  suggestions, 
  blocks, 
  selectedRegulations,
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

  const getRegulationContent = (suggestion: SuggestionWithBlockId | null) => {
    if (!suggestion) return undefined;
    // Find the regulation where the name is an exact match for the applied norm.
    const regulation = selectedRegulations.find(r => r.name.startsWith(suggestion.appliedNorm.split(' - ')[0]));
    return regulation?.content;
  };
  
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
                  {groupedSuggestions.map(({ category, suggestions: s_group }) => {
                      const Icon = categoryIcons[category];
                      const iconColorClass = getHighestSeverityColorClass(s_group);
                      return (
                      <AccordionItem
                        key={category}
                        value={category}
                        className="group incident-card-hover relative border rounded-2xl border-white/20 overflow-hidden shadow-lg transition-all duration-500 bg-white/30 backdrop-blur-md"
                      >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={getCategoryGradientStyle(s_group)}/>
                          <AccordionTrigger className="pl-6 pr-4 py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-white/20 rounded-t-2xl data-[state=open]:rounded-b-none transition-colors duration-300">
                              <div className="flex items-center gap-3 flex-1">
                                {Icon && <Icon className={cn("h-6 w-6", iconColorClass)} />}
                                <span className="text-lg font-semibold text-left text-card-foreground transition-colors">{getTranslatedCategory(category)}</span>
                              </div>
                              <div className="bg-white/40 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-inner mr-2">
                                  {s_group.length} {s_group.length === 1 ? t('analysisPage.pendingSingular') : t('analysisPage.pendingPlural')}
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-6 pr-3 pb-3 pt-2 space-y-3">
                              {s_group.map(suggestion => (
                                <div key={suggestion.id} className="rounded-lg shadow-sm overflow-hidden incident-card-hover border border-white/20 bg-white/40 backdrop-blur-sm">
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
                  )})}
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
        <DialogContent className="max-w-3xl w-full p-0 grid grid-rows-[auto,1fr] overflow-hidden rounded-2xl bg-slate-100 shadow-xl border-0">
          {dialogSuggestion && (
            <>
              <DialogHeader className="p-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 backdrop-blur-sm border-b border-white/20 shadow-md">
                  <DialogTitle className="text-slate-800">{dialogSuggestion.errorType}</DialogTitle>
              </DialogHeader>
              <div className="p-6 overflow-y-auto max-h-[75vh]">
                <IncidentItemContent 
                  suggestion={dialogSuggestion}
                  originalText={dialogSuggestion.evidence}
                  regulationContent={getRegulationContent(dialogSuggestion)}
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
