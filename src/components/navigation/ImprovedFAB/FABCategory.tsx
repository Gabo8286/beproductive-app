import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, MenuItem } from './fab-categories';

interface FABCategoryProps {
  category: Category;
  expanded: boolean;
  onHeaderClick: () => void;
  onItemClick: (action: string, value: any) => void;
}

export const FABCategory: React.FC<FABCategoryProps> = ({
  category,
  expanded,
  onHeaderClick,
  onItemClick,
}) => {
  const itemsRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  // Calculate max-height for smooth animation
  useEffect(() => {
    if (itemsRef.current) {
      setMaxHeight(expanded ? `${itemsRef.current.scrollHeight}px` : '0px');
    }
  }, [expanded]);

  return (
    <div className="fab-category border-b border-gray-100 last:border-b-0">
      {/* Category Header */}
      <button
        className={cn(
          'flex items-center justify-between w-full p-4 bg-white',
          'border-none cursor-pointer transition-colors duration-200',
          'text-left font-family-inherit hover:bg-gray-50',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset',
          expanded && 'bg-gray-50'
        )}
        onClick={onHeaderClick}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl w-6 flex items-center justify-center">
            {category.icon}
          </span>
          <span className="font-medium text-gray-900 text-sm">
            {category.label}
          </span>
        </div>

        <ChevronRight
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-300',
            expanded && 'rotate-90'
          )}
        />
      </button>

      {/* Category Items */}
      <div
        ref={itemsRef}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out bg-gray-25',
          'border-none'
        )}
        style={{ maxHeight }}
      >
        <div className="bg-gray-25">
          {category.items.map((item: MenuItem) => (
            <button
              key={item.id}
              className={cn(
                'flex items-center gap-3 w-full py-3 px-4 pl-11',
                'bg-transparent border-none border-b border-gray-100 last:border-b-0',
                'cursor-pointer transition-all duration-200',
                'text-sm text-gray-700 text-left font-family-inherit',
                'hover:bg-white hover:pl-12',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset',
                'active:bg-gray-100'
              )}
              onClick={() => onItemClick(item.action, item.value)}
            >
              <span className="text-lg w-5 flex items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};