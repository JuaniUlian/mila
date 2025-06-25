
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PageHeaderProps {
    documentTitle: string;
    overallComplianceScore: number;
    appliedSuggestionsCount: number;
    totalSuggestions: number;
}

const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 75) return "text-amber-500";
    return "text-green-500";
};

const getProgressColorClass = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 75) return "bg-amber-500";
    return "bg-green-500";
}

export function PageHeader({ documentTitle, overallComplianceScore, appliedSuggestionsCount, totalSuggestions }: PageHeaderProps) {
    const suggestionProgress = totalSuggestions > 0 ? (appliedSuggestionsCount / totalSuggestions) * 100 : 100;
    
    const primaryTextColor = "text-foreground";
    const secondaryTextColor = "text-muted-foreground";

    return (
        <header className="w-full">
            <Card className="p-4 md:p-6 w-full bg-white/20 backdrop-blur-md border-white/30 shadow-lg">
                <CardContent className="p-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Title and Subtitle */}
                    <div className="flex-1">
                        <h1 className={cn("text-3xl font-bold", primaryTextColor)}>{documentTitle}</h1>
                        <p className={cn("text-md", secondaryTextColor)}>Informe de situación</p>
                    </div>

                    {/* Scores */}
                    <div className="w-full md:w-auto md:min-w-[300px] flex flex-col gap-3">
                        {/* Compliance Score */}
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-semibold text-foreground">Puntaje de Cumplimiento</span>
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
                                <span className="text-sm font-semibold text-foreground">Sugerencias Aplicadas</span>
                                <span className={cn("text-2xl font-bold", getScoreColor(suggestionProgress))}>
                                    {appliedSuggestionsCount}
                                    <span className="text-sm">/{totalSuggestions}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </header>
    );
}
