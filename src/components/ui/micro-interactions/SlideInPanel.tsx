/**
 * Slide In Panel Component
 * Panel that slides in from any direction with smooth animations
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSlideIn } from './hooks/useSlideIn';

interface SlideInPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const SIZE_CONFIGS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'w-full',
};

export function SlideInPanel({
  children,
  isOpen,
  direction = 'right',
  className,
  overlayClassName,
  panelClassName,
  showOverlay = true,
  closeOnOverlayClick = true,
  onClose,
  size = 'md',
}: SlideInPanelProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'up':
        return { y: '-100%' };
      case 'down':
        return { y: '100%' };
      default:
        return { x: '100%' };
    }
  };

  const getPanelPosition = () => {
    switch (direction) {
      case 'left':
        return 'left-0 top-0 h-full';
      case 'right':
        return 'right-0 top-0 h-full';
      case 'up':
        return 'top-0 left-0 w-full';
      case 'down':
        return 'bottom-0 left-0 w-full';
      default:
        return 'right-0 top-0 h-full';
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    hidden: {
      ...getInitialPosition(),
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      ...getInitialPosition(),
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className={cn('fixed inset-0 z-50', className)}>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'absolute inset-0 bg-black/50 backdrop-blur-sm',
                overlayClassName
              )}
              onClick={handleOverlayClick}
            />
          )}

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute bg-background border shadow-lg',
              getPanelPosition(),
              direction === 'left' || direction === 'right' ? SIZE_CONFIGS[size] : 'w-full',
              direction === 'up' || direction === 'down' ? 'max-h-[80vh]' : 'h-full',
              panelClassName
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Preset slide-in panels
export function SidePanel({
  children,
  isOpen,
  onClose,
  side = 'right',
  ...props
}: Omit<SlideInPanelProps, 'direction'> & {
  side?: 'left' | 'right';
}) {
  return (
    <SlideInPanel
      isOpen={isOpen}
      direction={side}
      onClose={onClose}
      size="lg"
      {...props}
    >
      {children}
    </SlideInPanel>
  );
}

export function BottomSheet({
  children,
  isOpen,
  onClose,
  ...props
}: Omit<SlideInPanelProps, 'direction'>) {
  return (
    <SlideInPanel
      isOpen={isOpen}
      direction="up"
      onClose={onClose}
      size="full"
      panelClassName="rounded-t-lg"
      {...props}
    >
      {children}
    </SlideInPanel>
  );
}

export function TopBar({
  children,
  isOpen,
  onClose,
  ...props
}: Omit<SlideInPanelProps, 'direction'>) {
  return (
    <SlideInPanel
      isOpen={isOpen}
      direction="down"
      onClose={onClose}
      size="full"
      panelClassName="rounded-b-lg max-h-32"
      {...props}
    >
      {children}
    </SlideInPanel>
  );
}