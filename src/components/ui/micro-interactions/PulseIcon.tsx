/**
 * Pulse Icon Component
 * Icon wrapper with pulsing animation for notifications and status indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LOADING_ANIMATIONS } from './configs/animations';
import { DURATION_PRESETS } from './configs/easing';

interface PulseIconProps {
  children: React.ReactNode;
  pulse?: boolean;
  pulseColor?: string;
  intensity?: 'subtle' | 'normal' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  notification?: boolean;
  notificationCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

const INTENSITY_CONFIGS = {
  subtle: { scale: 1.05, opacity: 0.8 },
  normal: { scale: 1.1, opacity: 0.6 },
  strong: { scale: 1.2, opacity: 0.4 },
};

const SPEED_CONFIGS = {
  slow: 2,
  normal: 1.5,
  fast: 1,
};

const SIZE_CONFIGS = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function PulseIcon({
  children,
  pulse = false,
  pulseColor = 'rgb(59, 130, 246)', // blue-500
  intensity = 'normal',
  speed = 'normal',
  className,
  notification = false,
  notificationCount,
  size = 'md',
}: PulseIconProps) {
  const intensityConfig = INTENSITY_CONFIGS[intensity];
  const duration = SPEED_CONFIGS[speed];

  const pulseVariants = {
    initial: {
      scale: 1,
      opacity: 1,
    },
    animate: pulse
      ? {
          scale: intensityConfig.scale,
          opacity: intensityConfig.opacity,
        }
      : {
          scale: 1,
          opacity: 1,
        },
  };

  const notificationVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15,
      },
    },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className={cn('relative inline-block', SIZE_CONFIGS[size], className)}>
      {/* Main icon with pulse effect */}
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration,
          repeat: pulse ? Infinity : 0,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* Pulse ring effect */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${pulseColor}20 0%, transparent 70%)`,
            border: `1px solid ${pulseColor}40`,
          }}
          animate={{
            scale: [1, intensityConfig.scale * 1.2],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: duration * 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Notification badge */}
      {notification && (
        <motion.div
          variants={notificationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'absolute -top-1 -right-1 min-w-[16px] h-4',
            'bg-red-500 text-white text-xs font-medium',
            'rounded-full flex items-center justify-center',
            'border-2 border-white dark:border-gray-900',
            'shadow-sm',
            notificationCount && notificationCount > 9 ? 'px-1' : 'w-4'
          )}
        >
          {notificationCount !== undefined && (
            <span className="leading-none">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </motion.div>
      )}

      {/* Glow effect for notifications */}
      {notification && pulse && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgb(239, 68, 68, 0.2) 0%, transparent 70%)`,
            filter: 'blur(4px)',
          }}
          animate={{
            scale: [1, 1.3],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}

// Preset components for common use cases
export function NotificationIcon({ children, count, ...props }: Omit<PulseIconProps, 'notification' | 'notificationCount'> & { count?: number }) {
  return (
    <PulseIcon
      notification
      notificationCount={count}
      pulse={count !== undefined && count > 0}
      {...props}
    >
      {children}
    </PulseIcon>
  );
}

export function StatusIcon({
  children,
  active = false,
  status = 'normal',
  ...props
}: Omit<PulseIconProps, 'pulse' | 'pulseColor'> & {
  active?: boolean;
  status?: 'success' | 'warning' | 'error' | 'normal';
}) {
  const statusColors = {
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
    normal: 'rgb(59, 130, 246)', // blue-500
  };

  return (
    <PulseIcon
      pulse={active}
      pulseColor={statusColors[status]}
      {...props}
    >
      {children}
    </PulseIcon>
  );
}