import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LunaActionSheetSettings } from '@/components/luna/settings/LunaActionSheetSettings';
import { ActionSheetType } from '@/components/luna/actionsheets/types';

interface LunaActionSheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType?: ActionSheetType;
  onTypeChange?: (type: ActionSheetType) => void;
}

export const LunaActionSheetSettingsModal: React.FC<LunaActionSheetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentType,
  onTypeChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Luna Action Sheet Settings</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <LunaActionSheetSettings
            onClose={onClose}
            currentType={currentType}
            onTypeChange={onTypeChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};