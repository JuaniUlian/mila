
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
    if (score < 40) return "text-red-500";
    if (score < 75) return "text-amber-500";
    return "text-green-500";
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
                <h1 className="text-3xl font-bold text-foreground">{documentTitle}</h1>
                <p className="text-md text-muted-foreground">Estado general del documento y sus validaciones.</p>
            </div>
            <Card className="panel-glass p-4 rounded-lg w-full md:w-auto md:min-w-[300px]">
                <CardContent className="p-0 flex flex-col gap-3">
                    {/* Compliance Score */}
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-semibold text-muted-foreground">Puntaje de Cumplimiento</span>
                             <span className={cn("text-2xl font-bold", getScoreColor(overallComplianceScore))}>
                                {overallComplianceScore.toFixed(0)}
                                <span className="text-sm">/100</span>
                            </span>
                        </div>
                        <Progress value={overallComplianceScore} indicatorClassName={getProgressColorClass(overallComplianceScore)} />
                    </div>
                    {/* Completeness Score */}
                    <div>
                         <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-semibold text-muted-foreground">Índice de Completitud</span>
                            <span className={cn("text-2xl font-bold", getScoreColor(completenessScore))}>
                                {overallCompletenessIndex.toFixed(1)}
                                <span className="text-sm">/10.0</span>
                            </span>
                        </div>
                        <Progress value={completenessScore} indicatorClassName={getProgressColorClass(completenessScore)} />
                    </div>
                </CardContent>
            </Card>
        </header>
    );
}
