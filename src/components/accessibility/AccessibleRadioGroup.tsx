import { useId } from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface AccessibleRadioGroupProps {
  label: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Accessible radio group with proper ARIA attributes
 */
export const AccessibleRadioGroup = ({
  label,
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  className,
}: AccessibleRadioGroupProps) => {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  const errorId = `${groupId}-error`;

  return (
    <div className={cn("space-y-3", className)}>
      <div role="radiogroup" aria-labelledby={labelId} aria-required={required} aria-invalid={!!error}>
        <div id={labelId} className="text-sm font-medium mb-2">
          {label}
          {required && (
            <span aria-label="required" className="text-destructive ml-1">
              *
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {options.map((option) => {
            const optionId = `${groupId}-${option.value}`;
            const descId = option.description ? `${optionId}-desc` : undefined;
            
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={cn(
                  "flex items-start gap-3 cursor-pointer",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <input
                  type="radio"
                  id={optionId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  aria-describedby={descId}
                  disabled={disabled}
                  className="mt-0.5 h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <span className="text-sm">{option.label}</span>
                  {option.description && (
                    <p id={descId} className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
