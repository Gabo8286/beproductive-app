import React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABButtonProps {
  open: boolean;
  onClick: () => void;
  className?: string;
}

export const FABButton: React.FC<FABButtonProps> = ({ open, onClick, className }) => {
  return (
    <button
      className={cn(
        'fixed w-14 h-14 rounded-full shadow-xl transition-all duration-300',
        'bg-gradient-to-r from-primary to-blue-600 text-white',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-primary/30',
        'z-45',
        open && 'rotate-45',
        className
      )}
      style={{ bottom: 'calc(4rem + 1.25rem)', right: '1.25rem' }} // Above bottom nav
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
    >
      <div className="flex items-center justify-center transition-transform duration-300">
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </div>
    </button>
  );
};