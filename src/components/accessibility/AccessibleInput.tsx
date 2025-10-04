import { useId, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AccessibleInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
}

/**
 * Accessible input component with proper ARIA attributes
 * Automatically handles label association, error states, and helper text
 */
export const AccessibleInput = ({
  label,
  error,
  helperText,
  required,
  hideLabel = false,
  className,
  ...props
}: AccessibleInputProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={cn("block text-sm font-medium", hideLabel && "sr-only")}
      >
        {label}
        {required && (
          <span aria-label="required" className="text-destructive ml-1">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-required={required}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />

      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
