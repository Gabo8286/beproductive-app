import { FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  ariaLabel: string;
  legend?: string;
  hideLegend?: boolean;
  className?: string;
}

/**
 * Accessible form wrapper with proper structure
 * Uses fieldset/legend for better screen reader support
 */
export const AccessibleForm = ({
  children,
  onSubmit,
  ariaLabel,
  legend,
  hideLegend = false,
  className,
  ...props
}: AccessibleFormProps) => {
  const legendText = legend || ariaLabel;

  return (
    <form
      onSubmit={onSubmit}
      aria-label={ariaLabel}
      noValidate // Use custom validation with proper error announcement
      className={className}
      {...props}
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className={cn(hideLegend && "sr-only", "mb-4 text-lg font-semibold")}>
          {legendText}
        </legend>
        {children}
      </fieldset>
    </form>
  );
};
