
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/page-header';
import { ContentPanel } from '@/components/mila/content-panel';
import { RisksPanel } from '@/components/mila/risks-panel';
import type { DocumentBlock, Suggestion, MilaAppPData } from '@/components/mila/types';
import { mockData as initialMockData } from '@/components/mila/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [documentData, setDocumentData] = useState<MilaAppPData>(initialMockData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  const { documentTitle, blocks, overallComplianceScore, overallCompletenessIndex } = documentData;

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
    setDocumentData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
            ),
          };
        }
        return block;
      }),
    }));
    toast({
      title: "Sugerencia Actualizada",
      description: `El estado de la sugerencia ha sido cambiado a ${status}.`,
    });
  }, [toast]);

  const handleUpdateSuggestionText = useCallback((blockId: string, suggestionId: string, newText: string) => {
    setDocumentData(prevData => ({
      ...prevData,
      blocks: prevData.blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            suggestions: block.suggestions.map(suggestion =>
              suggestion.id === suggestionId ? { ...suggestion, text: newText, status: 'pending' } : suggestion // Ensure status is pending after edit
            ),
          };
        }
        return block;
      }),
    }));
    toast({
      title: "Sugerencia Modificada",
      description: "El texto de la sugerencia ha sido actualizado y marcado como pendiente.",
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
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {selectedBlock ? (
            <ContentPanel
              block={selectedBlock}
              onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
              onUpdateSuggestionText={handleUpdateSuggestionText}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="p-6 border rounded-lg shadow-md bg-card text-center">
                <h2 className="text-xl font-semibold mb-2">Bienvenido a Mila - Plantilla Viva</h2>
                <p className="text-muted-foreground">
                  Seleccione un bloque del panel de navegación izquierdo para ver su contenido, validaciones y sugerencias.
                </p>
              </div>
            </div>
          )}
        </main>
        <aside className="w-1/3 min-w-[350px] max-w-[450px] border-l bg-card text-card-foreground overflow-y-auto shadow-lg">
          <RisksPanel
            selectedBlock={selectedBlock}
            overallComplianceScore={overallComplianceScore}
            overallCompletenessIndex={overallCompletenessIndex}
          />
        </aside>
      </div>
    </AppShell>
  );
}
