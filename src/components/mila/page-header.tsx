
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PageHeaderProps {
    documentTitle: string;
    overallComplianceScore: number;
    overallCompletenessIndex: number;
}

const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-300";
    if (score < 75) return "text-amber-300";
    return "text-green-300";
};

const getProgressColorClass = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 75) return "bg-amber-500";
    return "bg-green-500";
}

export function PageHeader({ documentTitle, overallComplianceScore, overallCompletenessIndex }: PageHeaderProps) {
    const completenessScore = overallCompletenessIndex * 10;

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">{documentTitle}</h1>
                <p className="text-md text-white/80">Estado general del documento y sus validaciones.</p>
            </div>
            <Card className="p-4 w-full md:w-auto md:min-w-[300px] bg-white/20 backdrop-blur-md border-white/30 shadow-lg">
                <CardContent className="p-0 flex flex-col gap-3">
                    {/* Compliance Score */}
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-semibold text-white/90">Puntaje de Cumplimiento</span>
                             <span className={cn("text-2xl font-bold", getScoreColor(overallComplianceScore))}>
                                {overallComplianceScore.toFixed(0)}
                                <span className="text-sm">/100</span>
                            </span>
                        </div>
                        <Progress value={overallComplianceScore} indicatorClassName={getProgressColorClass(overallComplianceScore)} className="bg-white/30" />
                    </div>
                    {/* Completeness Score */}
                    <div>
                         <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-semibold text-white/90">Índice de Completitud</span>
                            <span className={cn("text-2xl font-bold", getScoreColor(completenessScore))}>
                                {overallCompletenessIndex.toFixed(1)}
                                <span className="text-sm">/10.0</span>
                            </span>
                        </div>
                        <Progress value={completenessScore} indicatorClassName={getProgressColorClass(completenessScore)} className="bg-white/30"/>
                    </div>
                </CardContent>
            </Card>
        </header>
    );
}
