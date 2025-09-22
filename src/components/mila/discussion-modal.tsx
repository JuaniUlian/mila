
'use client';

import React from 'react';
import type { FindingWithStatus } from '@/ai/flows/compliance-scoring';
import { DiscussionPanel } from './incidents-list';
import { cn } from '@/lib/utils';

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: FindingWithStatus | null; 
}

export const DiscussionModal: React.FC<DiscussionModalProps> = ({ isOpen, onClose, finding }) => {
  if (!isOpen || !finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={cn(
          "relative z-10 w-full max-w-2xl mx-4 h-[80vh] max-h-[700px] rounded-2xl overflow-hidden shadow-2xl border",
          'bg-white border-gray-200'
        )}>
        <DiscussionPanel finding={finding} onClose={onClose} />
      </div>
    </div>
  );
};
