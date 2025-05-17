
"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/page-header';
import { DocumentInputArea } from '@/components/document-input-area';
import { SuggestionsDisplayArea } from '@/components/suggestions-display-area';
import { ValidationSummaryPanel } from '@/components/validation-summary-panel';
import { suggestNormativeDocumentImprovements, type SuggestNormativeDocumentImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiOutput, setAiOutput] = useState<SuggestNormativeDocumentImprovementsOutput | null>(null);
  const { toast } = useToast();

  const handleSuggestImprovements = async () => {
    if (!documentText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some document text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAiOutput(null); 
    try {
      const result = await suggestNormativeDocumentImprovements({ documentText });
      setAiOutput(result);
      toast({
        title: 'Analysis Complete',
        description: 'Suggestions and scores have been generated.',
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader 
        title="Normative Document Analysis" 
        onValidate={handleSuggestImprovements}
        isLoading={isLoading}
      />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Column: Document Input and Validation Summary */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <DocumentInputArea
              documentText={documentText}
              setDocumentText={setDocumentText}
              isLoading={isLoading}
            />
            <ValidationSummaryPanel 
              aiOutput={aiOutput}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Suggestions Display Area */}
          <div className="lg:col-span-2 h-full">
            <SuggestionsDisplayArea 
              originalText={documentText}
              aiOutput={aiOutput}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
