import type React from 'react';
import type { SuggestNormativeDocumentImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Edit3, Trash2, Copy } from 'lucide-react';
import { Button } from './ui/button';

interface SuggestionsDisplayAreaProps {
  originalText: string;
  aiOutput: SuggestNormativeDocumentImprovementsOutput | null;
  isLoading: boolean;
}

export function SuggestionsDisplayArea({ originalText, aiOutput, isLoading }: SuggestionsDisplayAreaProps) {
  
  const handleCopySuggestion = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
    // Potentially use a toast notification here
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-lg flex-1">
        <CardHeader>
          <CardTitle>Original Document</CardTitle>
          <CardDescription>The content you provided for analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4 bg-muted/50">
            {originalText ? (
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{originalText}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Document text will appear here once entered.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="shadow-lg flex-1">
        <CardHeader>
          <CardTitle>AI-Powered Suggestions</CardTitle>
          <CardDescription>Review the suggestions below to improve your document.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-450px-4rem)] min-h-[300px] rounded-md">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            {!isLoading && !aiOutput && (
              <p className="text-sm text-muted-foreground text-center py-10">
                Suggestions will appear here after analysis. Click "Validate Sheet" to begin.
              </p>
            )}
            {!isLoading && aiOutput && aiOutput.suggestions.length > 0 && (
              <ul className="space-y-4">
                {aiOutput.suggestions.map((suggestion, index) => (
                  <li key={index} className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <p className="flex-1 text-sm text-foreground">{suggestion}</p>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" title="Copy Suggestion" onClick={() => handleCopySuggestion(suggestion)} className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Suggestion (placeholder)" className="h-8 w-8">
                          <Edit3 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Discard Suggestion (placeholder)" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-technical-blue">
                      Consider referencing applicable standards like ISO 9001:2015 or relevant legal articles.
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {!isLoading && aiOutput && aiOutput.suggestions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No specific improvement suggestions found for this document.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
