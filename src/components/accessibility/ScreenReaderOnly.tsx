import { ReactNode, ElementType } from 'react';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/**
 * Component that hides content visually but keeps it accessible to screen readers
 * More flexible than using .sr-only class directly
 * 
 * @param children - Content to hide visually
 * @param as - HTML element to render (default: 'span')
 * @param className - Additional classes (will be merged with sr-only)
 */
export const ScreenReaderOnly = ({ 
  children, 
  as: Component = 'span',
  className = ''
}: ScreenReaderOnlyProps) => (
  <Component className={`sr-only ${className}`}>
    {children}
  </Component>
);
