// This component is being replaced by the new RisksPanel
// as part of the "Planilla Viva" redesign.
// Consider removing this file.

import type React from 'react';
// import type { SuggestNormativeDocumentImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


interface ValidationSummaryPanelProps {
  // aiOutput: SuggestNormativeDocumentImprovementsOutput | null;
  isLoading: boolean;
}

export function ValidationSummaryPanel({ isLoading }: ValidationSummaryPanelProps) {
 return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle>Validation Summary (Not Used)</CardTitle>
        <CardDescription>This component is not used in the current version.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>Content would appear here.</p>
      </CardContent>
    </Card>
  );
}
