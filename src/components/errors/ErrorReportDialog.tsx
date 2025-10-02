import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ErrorReportDialogProps {
  error: Error;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ErrorReportDialog = ({
  error,
  open,
  onOpenChange,
}: ErrorReportDialogProps) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit error report to backend
      await fetch('/api/errors/user-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          userDescription: description,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }),
      });

      toast({
        title: 'Report Submitted',
        description: 'Thank you for helping us improve!',
      });

      onOpenChange(false);
      setDescription('');
    } catch (submitError) {
      toast({
        title: 'Failed to Submit',
        description: 'Could not send the error report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Help us fix this problem by providing additional details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="error-message">Error Message</Label>
            <div className="p-3 bg-destructive/10 rounded-md text-sm text-destructive">
              {error.message}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              What were you doing when this happened?
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you were trying to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
