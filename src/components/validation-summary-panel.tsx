import type React from 'react';
import type { SuggestNormativeDocumentImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ValidationSummaryPanelProps {
  aiOutput: SuggestNormativeDocumentImprovementsOutput | null;
  isLoading: boolean;
}

const ScoreDisplay: React.FC<{ title: string; value: number | undefined; description: string }> = ({ title, value, description }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <span className={`text-lg font-bold ${value && value >= 70 ? 'text-green-600' : value && value >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
        {value !== undefined ? `${value}%` : 'N/A'}
      </span>
    </div>
    <Progress value={value} className="h-2 mb-1" 
      indicatorClassName={value && value >= 70 ? 'bg-green-600' : value && value >= 40 ? 'bg-yellow-500' : 'bg-red-500'}
    />
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);


export function ValidationSummaryPanel({ aiOutput, isLoading }: ValidationSummaryPanelProps) {
  const hasResults = aiOutput !== null && !isLoading;

  // Placeholder for alerts derived from suggestions.
  // The current AI output only has generic suggestions.
  // For now, we'll just indicate the number of suggestions as a proxy for "alerts".
  const alertsCount = aiOutput?.suggestions?.length ?? 0;

  return (
    <Card className="bg-card border-border shadow-lg"> {/* Styled as "Partial Results" box */}
      <CardHeader>
        <CardTitle>Validation Summary</CardTitle>
        <CardDescription>Overall assessment of the document.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">Calculating scores...</p>
          </div>
        )}
        {!isLoading && !aiOutput && (
          <p className="text-sm text-muted-foreground">Results will appear here after analysis.</p>
        )}
        {hasResults && (
          <>
            <ScoreDisplay 
              title="Compliance Score" 
              value={aiOutput.complianceScore} 
              description="Estimated compliance with standards." 
            />
            <ScoreDisplay 
              title="Completeness Index" 
              value={aiOutput.completenessIndex} 
              description="Overall document completeness." 
            />

            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Alerts & Notifications</h4>
              {alertsCount > 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-md border bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {alertsCount} potential {alertsCount === 1 ? 'issue' : 'issues'} or areas for improvement identified. Review suggestions.
                  </p>
                </div>
              ) : (
                 <div className="flex items-center gap-2 p-3 rounded-md border bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700/50">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    No major alerts. The document appears to be in good shape based on initial analysis.
                  </p>
                </div>
              )}
              <div className="mt-3 flex space-x-2">
                <Badge className="bg-severity-low">Low Severity</Badge>
                <Badge className="bg-severity-medium">Medium Severity</Badge>
                <Badge className="bg-severity-high">High Severity</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">(Severity levels are indicative and require manual review)</p>
            </div>
          </>
        )}

        <div className="space-y-2 pt-4 border-t">
           <h4 className="text-sm font-medium text-foreground mb-2">Export Options</h4>
          <Button variant="outline" className="w-full bg-alert-major-error text-white hover:bg-opacity-90" disabled={!hasResults}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
          <Button variant="outline" className="w-full" disabled={!hasResults}>
            <FileText className="mr-2 h-4 w-4" />
            Include in Master Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper icon, as lucide-react might not have all specific ones
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
