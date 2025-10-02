import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuickTaskInput } from './QuickTaskInput';
import { TaskTemplateSelector } from './TaskTemplateSelector';
import { QuickTaskDefaults } from '@/hooks/useQuickTask';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuickTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: QuickTaskDefaults;
}

export function QuickTaskModal({ open, onOpenChange, defaults }: QuickTaskModalProps) {
  const [selectedDefaults, setSelectedDefaults] = useState<QuickTaskDefaults | undefined>(defaults);
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  const handleTemplateSelect = (templateDefaults: QuickTaskDefaults) => {
    setSelectedDefaults({ ...selectedDefaults, ...templateDefaults });
  };

  const handleSuccess = () => {
    onOpenChange(false);
    setSelectedDefaults(defaults);
    setMode('single');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedDefaults(defaults);
    setMode('single');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Create Task</DialogTitle>
          <DialogDescription>
            Create tasks quickly. Press Enter to save, Escape to cancel.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'batch')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Task</TabsTrigger>
            <TabsTrigger value="batch">Batch Create</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <TaskTemplateSelector onTemplateSelect={handleTemplateSelect} />
            <QuickTaskInput
              defaults={selectedDefaults}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              placeholder="Task title..."
              autoFocus={true}
            />
          </TabsContent>

          <TabsContent value="batch" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter one task per line. Press Ctrl+Enter to create all tasks.
            </p>
            <QuickTaskInput
              defaults={selectedDefaults}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              placeholder="Task 1&#10;Task 2&#10;Task 3..."
              autoFocus={true}
              batchMode={true}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
