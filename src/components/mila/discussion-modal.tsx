
'use client';

import React from 'react';
import type { FindingWithStatus } from '@/ai/flows/compliance-scoring';
import { DiscussionPanel } from './incidents-list';

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: FindingWithStatus | null; 
}

export const DiscussionModal: React.FC<DiscussionModalProps> = ({ isOpen, onClose, finding }) => {
  if (!isOpen || !finding) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0">
      {/* Modal content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DiscussionPanel finding={finding} onClose={onClose} />
      </div>
    </div>
  );
};
