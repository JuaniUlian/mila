
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import type { DocumentBlock, Suggestion } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data'; // Using mock data
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [documentTitle, setDocumentTitle] = useState<string>(initialMockData.documentTitle);
  const [blocks, setBlocks] = useState<DocumentBlock[]>(initialMockData.blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  // Effect to select the first block by default if available
  useEffect(() => {
    if (blocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [blocks, selectedBlockId]);

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  const handleUpdateSuggestionStatus = useCallback((blockId: string, suggestionId: string, status: Suggestion['status']) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
            ),
          };
        }
        return block;
      })
    );
    toast({
      title: "Sugerencia Actualizada",
      description: `El estado de la sugerencia ha sido cambiado a ${status}.`,
    });
  }, [toast]);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId) || null;

  return (
    <AppShell 
      blocks={blocks}
      selectedBlockId={selectedBlockId}
      onSelectBlock={handleSelectBlock}
    >
      <PageHeader title={documentTitle} />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto] overflow-hidden h-[calc(100vh-4rem)]">
        {/* Central Panel: Content Area */}
        <div className="overflow-y-auto h-full">
          <ContentPanel 
            block={selectedBlock} 
            onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
          />
        </div>

        {/* Right Panel: Risks and Validations Area */}
        <div className="overflow-y-auto h-full hidden md:block">
           <RisksPanel block={selectedBlock} />
        </div>
         {/* Mobile: RisksPanel could be a drawer/modal or conditionally rendered if screen is small and a block is selected */}
         {selectedBlock && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-20">
            {/* Placeholder for a mobile-friendly way to show RisksPanel, e.g., a bottom sheet trigger */}
            {/* Or integrate parts of it into ContentPanel for mobile */}
          </div>
        )}
      </main>
    </AppShell>
  );
}
