import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaCarousel } from '@/components/luna/carousel/LunaCarousel';
import { useCarouselData } from '@/components/luna/carousel/carouselData';
import { CarouselCategory } from '@/components/luna/carousel/types';
import {
  lunaColors,
  lunaShadows,
  lunaSize,
  lunaSpacing,
} from '@/components/luna/design/DesignTokens';
import {
  overlayAnimations,
  premiumSprings,
} from '@/components/luna/design/AnimationConfigs';

interface LunaCarouselOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const LunaCarouselOverlay: React.FC<LunaCarouselOverlayProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const carouselCategories = useCarouselData();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop */}
          <motion.div
            className={cn(
              'fixed inset-0 z-50',
              'bg-gradient-to-br from-black/40 via-gray-900/50 to-black/40',
              'backdrop-blur-md'
            )}
            variants={overlayAnimations.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Premium Overlay Content */}
          <motion.div
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center',
              'pointer-events-none',
              className
            )}
            style={{
              padding: lunaSpacing.lg,
            }}
            variants={overlayAnimations.content}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Premium Content Container */}
            <div className="relative pointer-events-auto">
              {/* Premium Close Button */}
              <motion.button
                className={cn(
                  'absolute z-10 rounded-full',
                  'flex items-center justify-center',
                  'text-white transition-all duration-300',
                  'border-2 border-white/30 backdrop-blur-sm',
                  'hover:border-white/50 focus:border-white/70',
                  'focus:outline-none focus:ring-2 focus:ring-white/30'
                )}
                style={{
                  top: -lunaSpacing.xxl,
                  right: -lunaSpacing.xxl,
                  width: 44,
                  height: 44,
                  background: `linear-gradient(135deg, ${lunaColors.neutral.white}20 0%, ${lunaColors.neutral.gray800}30 100%)`,
                  boxShadow: lunaShadows.elevation.medium.boxShadow,
                }}
                onClick={onClose}
                whileHover={{
                  scale: 1.05,
                  boxShadow: lunaShadows.elevation.high.boxShadow,
                  transition: premiumSprings.responsive
                }}
                whileTap={{
                  scale: 0.95,
                  transition: premiumSprings.snappy
                }}
                aria-label="Close Luna menu"
              >
                <X size={20} />
              </motion.button>

              {/* Premium Luna Carousel */}
              <div className="flex items-center justify-center">
                <LunaCarousel
                  categories={carouselCategories}
                  config={{
                    radius: lunaSize.radius.large,
                    centerSize: lunaSize.center,
                    buttonSize: lunaSize.category,
                    longPressDuration: 800,
                    hapticEnabled: true
                  }}
                />
              </div>

              {/* Premium Instructions */}
              <motion.div
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{ bottom: -lunaSpacing.xxl * 1.5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6,
                  ...premiumSprings.gentle
                }}
              >
                <div
                  className={cn(
                    'text-center space-y-2 px-6 py-3 rounded-2xl',
                    'backdrop-blur-sm border border-white/20'
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${lunaColors.neutral.white}10 0%, ${lunaColors.neutral.gray800}20 100%)`,
                  }}
                >
                  <p className="text-sm font-medium text-white/90">
                    Tap to expand • Long press for chat
                  </p>
                  <p className="text-xs text-white/70">
                    Drag → Menu • ↑ Favorites • ← Search
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};