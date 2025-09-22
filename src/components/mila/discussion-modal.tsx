
'use client';

import React from 'react';
import type { FindingWithStatus } from '@/ai/flows/compliance-scoring';
import { DiscussionPanel } from './incidents-list';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding: FindingWithStatus | null;
}

export const DiscussionModal: React.FC<DiscussionModalProps> = ({ isOpen, onClose, finding }) => {
  if (!isOpen || !finding) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full h-[90vh] p-0 border-0 grid grid-rows-[auto,1fr,auto] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl">
            <DiscussionPanel finding={finding} onClose={onClose} />
        </DialogContent>
    </Dialog>
  );
};
