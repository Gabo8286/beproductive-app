import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useTaskTemplates, useTemplateCategories, useCreateTaskFromTemplate } from '@/hooks/useTaskTemplates';
import { TemplateCard } from './TemplateCard';
import { VariableInput } from './VariableInput';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (taskId: string) => void;
}

export function TemplateSelector({ open, onOpenChange, onSuccess }: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates, isLoading } = useTaskTemplates(selectedCategory);
  const { data: categories } = useTemplateCategories();
  const createFromTemplate = useCreateTaskFromTemplate();

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTask = async (variables?: Record<string, string>) => {
    if (!selectedTemplate) return;

    const taskId = await createFromTemplate.mutateAsync({
      templateId: selectedTemplate,
      variables,
    });

    if (onSuccess) onSuccess(taskId);
    onOpenChange(false);
    setSelectedTemplate(null);
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Task from Template</DialogTitle>
          <DialogDescription>
            Choose a template to quickly create a new task with predefined settings
          </DialogDescription>
        </DialogHeader>

        {selectedTemplate && selectedTemplateData ? (
          <VariableInput
            template={selectedTemplateData}
            onSubmit={handleCreateTask}
            onCancel={() => setSelectedTemplate(null)}
            isLoading={createFromTemplate.isPending}
          />
        ) : (
          <>
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {categories && categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Categories:</span>
                  <Badge
                    variant={!selectedCategory ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(undefined)}
                  >
                    All
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                      {selectedCategory === category && (
                        <X className="ml-1 h-3 w-3" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(undefined);
                        }} />
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : filteredTemplates && filteredTemplates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => setSelectedTemplate(template.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No templates found</p>
                  {search && (
                    <Button
                      variant="link"
                      onClick={() => setSearch('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
