
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

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, text: newText } : suggestion
            ),
          };
        }
        return block;
      })
    );
    toast({
      title: "Sugerencia Modificada",
      description: "El texto de la sugerencia ha sido actualizado.",
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
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] p-4 md:p-6 space-y-6">
        {/* Content Area: ContentPanel and RisksPanel will be stacked here */}
        {selectedBlock ? (
          <>
            <ContentPanel
              block={selectedBlock}
              onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
              onUpdateSuggestionText={handleUpdateSuggestionText}
            />
            <RisksPanel block={selectedBlock} />
          </>
        ) : (
          <ContentPanel 
            block={null} 
            onUpdateSuggestionStatus={() => { /* No-op */ }} 
            onUpdateSuggestionText={() => { /* No-op */ }} 
          />
        )}
      </main>
    </AppShell>
  );
}
