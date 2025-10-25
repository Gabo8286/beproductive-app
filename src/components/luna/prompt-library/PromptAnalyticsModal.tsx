import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PromptAnalyticsDashboard } from '@/components/luna/prompt-library/PromptAnalyticsDashboard';

interface PromptAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptAnalyticsModal: React.FC<PromptAnalyticsModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Prompt Analytics Dashboard</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <PromptAnalyticsDashboard onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};