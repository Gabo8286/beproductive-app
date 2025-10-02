import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { TemplateVariable } from '@/hooks/useTaskTemplates';

type TaskTemplate = Database['public']['Tables']['task_templates']['Row'];

interface VariableInputProps {
  template: TaskTemplate;
  onSubmit: (variables: Record<string, string>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VariableInput({ template, onSubmit, onCancel, isLoading }: VariableInputProps) {
  const variables = (template.variables as unknown as TemplateVariable[]) || [];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    variables.forEach(variable => {
      if (variable.default_value) {
        initial[variable.key] = variable.default_value;
      }
    });
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingRequired = variables.filter(v => v.required && !values[v.key]);
    if (missingRequired.length > 0) {
      alert(`Please fill in required fields: ${missingRequired.map(v => v.label).join(', ')}`);
      return;
    }

    onSubmit(values);
  };

  if (variables.length === 0) {
    // No variables needed, submit immediately
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This template has no variables. Click Create to generate the task.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => onSubmit({})} disabled={isLoading}>
            Create Task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Fill in the variables to customize your task
        </p>

        {variables.map((variable) => (
          <div key={variable.key} className="space-y-2">
            <Label htmlFor={variable.key}>
              {variable.label}
              {variable.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {variable.type === 'text' && (
              <Input
                id={variable.key}
                value={values[variable.key] || ''}
                onChange={(e) => setValues(prev => ({ ...prev, [variable.key]: e.target.value }))}
                placeholder={`Enter ${variable.label.toLowerCase()}`}
                required={variable.required}
              />
            )}

            {variable.type === 'number' && (
              <Input
                id={variable.key}
                type="number"
                value={values[variable.key] || ''}
                onChange={(e) => setValues(prev => ({ ...prev, [variable.key]: e.target.value }))}
                placeholder={`Enter ${variable.label.toLowerCase()}`}
                required={variable.required}
              />
            )}

            {variable.type === 'select' && variable.options && (
              <Select
                value={values[variable.key] || ''}
                onValueChange={(value) => setValues(prev => ({ ...prev, [variable.key]: value }))}
                required={variable.required}
              >
                <SelectTrigger id={variable.key}>
                  <SelectValue placeholder={`Select ${variable.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {variable.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {variable.type === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {values[variable.key] ? format(new Date(values[variable.key]), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={values[variable.key] ? new Date(values[variable.key]) : undefined}
                    onSelect={(date) => setValues(prev => ({
                      ...prev,
                      [variable.key]: date ? format(date, 'yyyy-MM-dd') : ''
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          Create Task
        </Button>
      </div>
    </form>
  );
}
