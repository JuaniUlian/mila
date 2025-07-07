
"use client";
import React from 'react';
import type { MilaAppPData } from './types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Check, FileText, FileCheck2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface RisksPanelProps {
  documentData: MilaAppPData;
  onDownloadReport: () => void;
  appliedChangesExist: boolean;
  onDownloadCorrectedDocument: () => void;
}

export function RisksPanel({
  documentData,
  onDownloadReport,
  appliedChangesExist,
  onDownloadCorrectedDocument,
}: RisksPanelProps) {
  const { blocks, overallComplianceScore } = documentData;
  const { language } = useLanguage();
  const t = useTranslations(language);

  const totalSuggestions = blocks.reduce((acc, block) => acc + block.suggestions.length, 0);
  const highSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'high').length, 0);
  const mediumSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'medium').length, 0);
  const lowSeverityCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.severity === 'low').length, 0);
  const appliedCount = blocks.reduce((acc, block) => acc + block.suggestions.filter(s => s.status === 'applied').length, 0);

  const uniqueNorms = [...new Set(blocks.flatMap(b => b.suggestions.map(s => s.appliedNorm)))];

  return (
    <Card className="flex flex-col h-full bg-white/60 backdrop-blur-xl border-white/50 shadow-xl transition-all duration-300">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">{t('analysisPage.partialResults')}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{t('analysisPage.realTimeSummary')}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-3 text-sm overflow-y-auto">
            <Separator className="mb-3 bg-foreground/20"/>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('analysisPage.overallCompliance')}</span>
                <span className="font-semibold text-foreground">{overallComplianceScore.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('analysisPage.totalIncidents')}</span>
                <span className="font-semibold text-foreground">{totalSuggestions}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t('analysisPage.highSeverity')}</span>
                <span className="font-semibold text-red-500">{highSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {t('analysisPage.mediumSeverity')}</span>
                <span className="font-semibold text-amber-500">{mediumSeverityCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> {t('analysisPage.lowSeverity')}</span>
                <span className="font-semibold text-sky-500">{lowSeverityCount}</span>
            </div>

            <Separator className="my-3 bg-foreground/20"/>

             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> {t('analysisPage.correctionsApplied')}</span>
                <span className="font-semibold text-green-500">{appliedCount}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-4 h-4" /> {t('analysisPage.involvedRegulations')}</span>
                <span className="font-semibold text-foreground">{uniqueNorms.length}</span>
            </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch pt-6 space-y-3">
            <Button 
                className="w-full text-base py-6 btn-neu-light"
                size="lg"
                onClick={onDownloadReport}
            >
                <Download className="mr-2 h-5 w-5" />
                {t('analysisPage.downloadReport')}
            </Button>
            {appliedChangesExist && (
                <Button 
                    className="w-full text-base py-6 btn-neu-green"
                    size="lg"
                    onClick={onDownloadCorrectedDocument}
                >
                    <FileCheck2 className="mr-2 h-5 w-5" />
                    {t('analysisPage.downloadCorrectedDoc')}
                </Button>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">{t('analysisPage.downloadReportDesc')}</p>
        </CardFooter>
    </Card>
  );
}
