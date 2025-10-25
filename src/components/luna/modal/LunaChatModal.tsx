import React from 'react';
import { cn } from '@/lib/utils';
import { useLuna } from '@/components/luna/context/LunaContext';
import { LunaChat } from '@/components/luna/chat/LunaChat';

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
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center',
        'h-[75vh] pb-20', // Top 3/4 of screen, with padding for nav bar
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
          'max-h-full overflow-hidden'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <LunaChat
          onClose={closeChat}
          autoFocus={true}
          compact={false}
          className="w-full h-[500px] max-h-[60vh]"
        />
      </div>
    </div>
  );
};

export default LunaChatModal;