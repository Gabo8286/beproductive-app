import React from 'react';
import { cn } from '@/lib/utils';
import { useLuna } from '../context/LunaContext';
import { LunaChat } from '../chat/LunaChat';

interface LunaChatModalProps {
  className?: string;
}

export const LunaChatModal: React.FC<LunaChatModalProps> = ({ className }) => {
  const { isOpen, closeChat } = useLuna();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeChat();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeChat();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Luna Chat"
    >
      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'animate-in slide-in-from-bottom-4 zoom-in-95 duration-200',
          'max-h-[80vh] overflow-hidden'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <LunaChat
          onClose={closeChat}
          autoFocus={true}
          compact={false}
          className="w-full h-[600px] max-h-[80vh]"
        />
      </div>
    </div>
  );
};

export default LunaChatModal;