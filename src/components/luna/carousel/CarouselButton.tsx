import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CarouselPosition } from './types';
import {
  lunaColors,
  lunaShadows,
  lunaSize,
  lunaSpacing,
  lunaTypography,
  getCategoryColor,
  getColoredShadow
} from '../design/DesignTokens';
import {
  entranceAnimations,
  interactionAnimations,
  premiumSprings
} from '../design/AnimationConfigs';

interface CarouselButtonProps {
  icon: LucideIcon;
  label: string;
  position: CarouselPosition;
  onClick: () => void;
  isActive?: boolean;
  size?: number;
  color?: string;
  disabled?: boolean;
  className?: string;
  category?: string;
  variant?: 'primary' | 'secondary' | 'action';
  showPersistentLabel?: boolean;
}

export const CarouselButton: React.FC<CarouselButtonProps> = ({
  icon: Icon,
  label,
  position,
  onClick,
  isActive = false,
  size = lunaSize.action,
  color,
  disabled = false,
  className,
  category,
  variant = 'action',
  showPersistentLabel = true,
}) => {
  // Get premium styling based on category and variant
  const categoryColors = category ? getCategoryColor(category) : null;
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  // Determine background styling
  const getBackgroundStyle = () => {
    if (disabled) {
      return {
        background: lunaColors.neutral.gray200,
        border: `2px solid ${lunaColors.neutral.gray300}`,
      };
    }

    if (isPrimary && categoryColors) {
      return {
        background: `linear-gradient(135deg, ${categoryColors.primary} 0%, ${categoryColors.secondary} 100%)`,
        border: `2px solid ${lunaColors.neutral.white}`,
        ...getColoredShadow(category as keyof typeof lunaShadows.colored),
      };
    }

    if (isSecondary && categoryColors) {
      return {
        background: `linear-gradient(135deg, ${lunaColors.neutral.white} 0%, ${categoryColors.light} 100%)`,
        border: `2px solid ${categoryColors.primary}`,
      };
    }

    // Default action button styling
    return {
      background: `linear-gradient(135deg, ${lunaColors.neutral.white} 0%, ${lunaColors.neutral.gray50} 100%)`,
      border: `2px solid ${lunaColors.neutral.gray200}`,
    };
  };

  // Determine icon color
  const getIconColor = () => {
    if (disabled) return lunaColors.neutral.gray600;
    if (isPrimary) return lunaColors.neutral.white;
    if (isSecondary && categoryColors) return categoryColors.primary;
    return lunaColors.neutral.gray700;
  };
  return (
    <motion.button
      className={cn(
        // Base styles with premium foundation
        'absolute flex items-center justify-center rounded-full',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',

        // Premium touch optimization
        'touch-manipulation select-none',
        'will-change-transform',
        'backdrop-blur-sm',

        // Interactive states
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',

        // Focus ring color based on variant
        isPrimary && categoryColors
          ? `focus:ring-[${categoryColors.primary}]`
          : 'focus:ring-blue-500',

        className
      )}
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${position.x}px - ${size / 2}px)`,
        top: `calc(50% + ${position.y}px - ${size / 2}px)`,
        ...getBackgroundStyle(),
        boxShadow: disabled
          ? lunaShadows.elevation.low.boxShadow
          : lunaShadows.elevation.medium.boxShadow,
      }}
      onClick={onClick}
      disabled={disabled}

      // Premium entrance animation
      variants={entranceAnimations.button}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={position.index}

      // Enhanced interactions
      whileHover={!disabled ? {
        ...interactionAnimations.hover,
        boxShadow: isPrimary && categoryColors
          ? lunaShadows.colored[category as keyof typeof lunaShadows.colored]
          : lunaShadows.elevation.high.boxShadow,
      } : {}}

      whileTap={!disabled ? interactionAnimations.tap : {}}

      whileFocus={!disabled ? interactionAnimations.focus : {}}

      // Accessibility
      aria-label={`${label} button`}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {/* Icon with premium styling */}
      <Icon
        size={size * 0.45} // Slightly smaller for better optical balance
        style={{ color: getIconColor() }}
        className="transition-all duration-300 ease-out"
      />

      {/* Premium tooltip with category-aware styling */}
      <motion.div
        className={cn(
          'absolute z-10 px-3 py-2 text-xs font-medium rounded-lg',
          'opacity-0 pointer-events-none whitespace-nowrap',
          'backdrop-blur-sm border shadow-lg',
          // Category-aware tooltip styling
          categoryColors
            ? 'text-white border-white/20'
            : 'text-white bg-gray-900 border-gray-700'
        )}
        style={{
          top: size + lunaSpacing.sm,
          left: '50%',
          transform: 'translateX(-50%)',
          background: categoryColors
            ? `linear-gradient(135deg, ${categoryColors.primary}f0 0%, ${categoryColors.secondary}f0 100%)`
            : 'rgba(17, 24, 39, 0.95)',
        }}
        initial={{ opacity: 0, y: -4, scale: 0.95 }}
        whileHover={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: premiumSprings.responsive
        }}
      >
        {label}

        {/* Premium tooltip arrow */}
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${categoryColors?.primary || '#111827'}`,
          }}
        />
      </motion.div>

      {/* Active state indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: categoryColors?.primary || lunaColors.primary.from
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1.1,
            opacity: 1,
            transition: premiumSprings.bouncy
          }}
          exit={{ scale: 0.8, opacity: 0 }}
        />
      )}

      {/* Persistent Label */}
      {showPersistentLabel && (
        <motion.div
          className={cn(
            'absolute text-center pointer-events-none',
            'select-none whitespace-nowrap overflow-hidden'
          )}
          style={{
            top: size + lunaSpacing.xs,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: lunaTypography.labels.size,
            fontWeight: lunaTypography.labels.weight,
            lineHeight: lunaTypography.labels.lineHeight,
            letterSpacing: lunaTypography.labels.letterSpacing,
            maxWidth: lunaTypography.labels.maxWidth,
            color: disabled
              ? lunaColors.neutral.gray600
              : categoryColors?.primary || lunaColors.neutral.gray700,
          }}
          initial={{ opacity: 0, y: -4 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              ...premiumSprings.gentle,
              delay: position.index * 0.1 + 0.2, // Stagger with button animation
            }
          }}
          exit={{
            opacity: 0,
            y: -4,
            transition: premiumSprings.smooth
          }}
        >
          {label}
        </motion.div>
      )}
    </motion.button>
  );
};