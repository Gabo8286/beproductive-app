import { ReactNode, CSSProperties } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  focusable?: boolean;
}

/**
 * Alternative to .sr-only class with programmatic control
 * Hides content visually while keeping it in the accessibility tree
 * 
 * @param children - Content to hide visually
 * @param focusable - If true, content becomes visible when focused (default: false)
 */
export const VisuallyHidden = ({ children, focusable = false }: VisuallyHiddenProps) => {
  const baseStyles: CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  const focusableStyles: CSSProperties = focusable
    ? {
        position: 'static',
        width: 'auto',
        height: 'auto',
        padding: 'inherit',
        margin: 'inherit',
        overflow: 'visible',
        clip: 'auto',
        whiteSpace: 'normal',
      }
    : {};

  return (
    <span
      style={baseStyles}
      className={focusable ? 'focus-within:relative focus-within:w-auto focus-within:h-auto' : undefined}
      onFocus={(e) => {
        if (focusable && e.currentTarget) {
          Object.assign(e.currentTarget.style, focusableStyles);
        }
      }}
      onBlur={(e) => {
        if (focusable && e.currentTarget) {
          Object.assign(e.currentTarget.style, baseStyles);
        }
      }}
    >
      {children}
    </span>
  );
};
