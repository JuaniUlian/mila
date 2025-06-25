
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    documentTitle: string;
    overallCompletenessIndex: number;
}

const getRiskStyles = (riskPercentage: number) => {
    if (riskPercentage > 50) return "text-[hsl(var(--severity-high))]"; // High risk
    if (riskPercentage >= 25) return "text-[hsl(var(--severity-medium))]"; // Medium risk
    return "text-[hsl(var(--severity-low))]"; // Low risk
};

export function PageHeader({ documentTitle, overallCompletenessIndex }: PageHeaderProps) {
    const riskPercentage = Math.max(0, Math.min(100, (10 - overallCompletenessIndex) * 10));
    const riskColorClass = getRiskStyles(riskPercentage);

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{documentTitle}</h1>
                <p className="text-md text-muted-foreground">Estado general del documento y sus validaciones.</p>
            </div>
            <div className="flex items-center gap-3 text-right">
                 <div className="flex flex-col items-end">
                    <span className={cn("text-5xl font-extrabold", riskColorClass)}>
                        {riskPercentage.toFixed(0)}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground -mt-2">Puntaje de Riesgo</span>
                 </div>
            </div>
        </header>
    );
}
