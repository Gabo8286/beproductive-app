import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Category } from './fab-categories';
import { FABCategory } from './FABCategory';

interface FABMenuProps {
  categories: Category[];
  expandedCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  onItemClick: (action: string, value: any) => void;
  className?: string;
}

export const FABMenu = forwardRef<HTMLDivElement, FABMenuProps>(
  ({ categories, expandedCategory, onCategoryClick, onItemClick, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-20 right-5 bg-white rounded-2xl shadow-2xl',
          'overflow-hidden max-w-72 max-h-96 overflow-y-auto z-40',
          'transform-gpu origin-bottom-right',
          'animate-in slide-in-from-bottom-2 fade-in duration-300',
          // Custom scrollbar styling
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300',
          className
        )}
        style={{
          transformOrigin: 'bottom right',
        }}
      >
        {categories.map(category => (
          <FABCategory
            key={category.id}
            category={category}
            expanded={expandedCategory === category.id}
            onHeaderClick={() => onCategoryClick(category.id)}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    );
  }
);