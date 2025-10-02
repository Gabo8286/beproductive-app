import { useEffect, useState, RefObject } from 'react';

interface UseRovingTabIndexOptions {
  items: RefObject<HTMLElement>[];
  circular?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onFocusChange?: (index: number) => void;
}

/**
 * Roving tabindex for accessible keyboard navigation in lists
 * Implements ARIA authoring practices for composite widgets
 * 
 * @param items - Array of refs to focusable elements
 * @param circular - Whether navigation wraps around (default: true)
 * @param orientation - Determines which arrow keys to use (default: 'vertical')
 * @param onFocusChange - Callback when focused item changes
 */
export function useRovingTabIndex({
  items,
  circular = true,
  orientation = 'vertical',
  onFocusChange,
}: UseRovingTabIndexOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const moveFocus = (newIndex: number) => {
    const maxIndex = items.length - 1;
    
    let nextIndex: number;
    
    if (newIndex < 0) {
      nextIndex = circular ? maxIndex : 0;
    } else if (newIndex > maxIndex) {
      nextIndex = circular ? 0 : maxIndex;
    } else {
      nextIndex = newIndex;
    }

    setFocusedIndex(nextIndex);
    onFocusChange?.(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        moveFocus(focusedIndex + 1);
        break;

      case prevKey:
        event.preventDefault();
        moveFocus(focusedIndex - 1);
        break;

      case 'Home':
        event.preventDefault();
        moveFocus(0);
        break;

      case 'End':
        event.preventDefault();
        moveFocus(items.length - 1);
        break;
    }
  };

  // Focus the current item
  useEffect(() => {
    items[focusedIndex]?.current?.focus();
  }, [focusedIndex, items]);

  return {
    focusedIndex,
    setFocusedIndex: moveFocus,
    handleKeyDown,
  };
}
