import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PromptLibraryBrowser } from '@/components/luna/prompt-library/PromptLibraryBrowser';
import { PromptTemplate } from '@/types/promptLibrary';
import { useLuna } from '@/components/luna/context/LunaContext';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: PromptTemplate) => void;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const { sendMessage } = useLuna();

  const handlePromptSelect = (prompt: PromptTemplate) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    } else {
      // Default behavior: send the prompt description as a message to Luna
      const promptMessage = `Use the "${prompt.name}" prompt template to help me with ${prompt.description.toLowerCase()}`;
      sendMessage(promptMessage);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Prompt Library</DialogTitle>
        </DialogHeader>
        <PromptLibraryBrowser
          onSelectPrompt={handlePromptSelect}
          onClose={onClose}
          className="h-[80vh]"
        />
      </DialogContent>
    </Dialog>
  );
};