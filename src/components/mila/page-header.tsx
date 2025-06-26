
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/lib/translations';

interface PageHeaderProps {
    documentTitle: string;
    overallComplianceScore: number;
    appliedSuggestionsCount: number;
    totalSuggestions: number;
}

const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-600";
    if (score < 75) return "text-amber-600";
    return "text-green-600";
};

const getProgressColorClass = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 75) return "bg-amber-500";
    return "bg-green-500";
}

export function PageHeader({ documentTitle, overallComplianceScore, appliedSuggestionsCount, totalSuggestions }: PageHeaderProps) {
    const suggestionProgress = totalSuggestions > 0 ? (appliedSuggestionsCount / totalSuggestions) * 100 : 100;
    const { language } = useLanguage();
    const t = useTranslations(language);
    
    // Determine text color based on background lightness
    const useDarkText = overallComplianceScore >= 75;
    const primaryTextColor = useDarkText ? "text-foreground" : "text-white";

    return (
        <div className="transition-all duration-300">
            <header className="w-full">
                <Card className="p-4 md:p-6 w-full bg-white/20 backdrop-blur-md border-white/30 shadow-lg">
                    <CardContent className="p-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Title */}
                        <div className="flex-1">
                            <h1 className={cn("text-3xl font-bold", primaryTextColor)}>{documentTitle}</h1>
                        </div>
                        
                        <div className="w-full md:w-auto flex items-center gap-x-6 gap-y-4 flex-wrap">
                            {/* Scores */}
                            <div className="w-full sm:w-auto md:min-w-[300px] flex flex-col gap-3">
                                {/* Compliance Score */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-foreground">{t('analysisPage.complianceScore')}</span>
                                        <span className={cn("text-2xl font-bold", getScoreColor(overallComplianceScore))}>
                                            {overallComplianceScore.toFixed(0)}
                                            <span className="text-sm">/100</span>
                                        </span>
                                    </div>
                                    <Progress value={overallComplianceScore} indicatorClassName={getProgressColorClass(overallComplianceScore)} className="bg-muted" />
                                </div>
                                {/* Applied Suggestions Count */}
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-foreground">{t('analysisPage.appliedSuggestions')}</span>
                                        <span className={cn("text-2xl font-bold", getScoreColor(suggestionProgress))}>
                                            {appliedSuggestionsCount}
                                            <span className="text-sm">/{totalSuggestions}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </header>
        </div>
    );
}
