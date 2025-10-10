import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGlobalView } from '@/contexts/GlobalViewContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sample tags - in real app, fetch from database
const AVAILABLE_TAGS = [
  { id: 'urgent', label: 'Urgent', category: 'Priority' },
  { id: 'important', label: 'Important', category: 'Priority' },
  { id: 'ai', label: 'AI & Claude', category: 'Project' },
  { id: 'product', label: 'Product', category: 'Project' },
  { id: 'marketing', label: 'Marketing', category: 'Project' },
  { id: 'design', label: 'Design', category: 'Project' },
  { id: 'engineering', label: 'Engineering', category: 'Project' },
  { id: 'bug', label: 'Bug', category: 'Type' },
  { id: 'feature', label: 'Feature', category: 'Type' },
  { id: 'improvement', label: 'Improvement', category: 'Type' },
];

export function TagFilterModal() {
  const [open, setOpen] = useState(false);
  const { activeTags, setTagFilters } = useGlobalView();
  const [selectedTags, setSelectedTags] = useState<string[]>(activeTags);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-tag-filter-modal', handleOpen);
    return () => window.removeEventListener('open-tag-filter-modal', handleOpen);
  }, []);

  useEffect(() => {
    setSelectedTags(activeTags);
  }, [activeTags, open]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleApply = () => {
    setTagFilters(selectedTags);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedTags([]);
  };

  const tagsByCategory = AVAILABLE_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TAGS>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by Tags</DialogTitle>
          <DialogDescription>
            Select one or more tags to filter your items
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-6">
            {Object.entries(tagsByCategory).map(([category, tags]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleToggleTag(tag.id)}
                      />
                      <Label
                        htmlFor={tag.id}
                        className="text-sm cursor-pointer"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply ({selectedTags.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
