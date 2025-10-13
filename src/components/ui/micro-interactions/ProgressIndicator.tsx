/**
 * Progress Indicator Component
 * Animated progress bars and circular indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'dots' | 'steps';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
  striped?: boolean;
  pulse?: boolean;
}

const SIZE_CONFIGS = {
  sm: {
    height: 'h-2',
    circular: 'w-12 h-12',
    text: 'text-sm',
    strokeWidth: 2,
  },
  md: {
    height: 'h-3',
    circular: 'w-16 h-16',
    text: 'text-base',
    strokeWidth: 3,
  },
  lg: {
    height: 'h-4',
    circular: 'w-20 h-20',
    text: 'text-lg',
    strokeWidth: 4,
  },
};

const COLOR_CONFIGS = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ProgressIndicator({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showValue = false,
  label,
  className,
  animated = true,
  striped = false,
  pulse = false,
}: ProgressIndicatorProps) {
  const sizeConfig = SIZE_CONFIGS[size];
  const colorConfig = COLOR_CONFIGS[color];
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const renderLinearProgress = () => (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className={cn('font-medium text-gray-700 dark:text-gray-300', sizeConfig.text)}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn('font-medium text-gray-500 dark:text-gray-400', sizeConfig.text)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizeConfig.height)}>
        <motion.div
          className={cn(
            'h-full rounded-full relative',
            colorConfig,
            striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]',
            pulse && 'animate-pulse'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? {
            duration: 0.8,
            ease: 'easeOut',
          } : { duration: 0 }}
        >
          {striped && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:1rem_1rem]"
              animate={{
                backgroundPosition: ['0 0', '1rem 0'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );

  const renderCircularProgress = () => {
    const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative', sizeConfig.circular, className)}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${radius * 2 + sizeConfig.strokeWidth * 2} ${radius * 2 + sizeConfig.strokeWidth * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + sizeConfig.strokeWidth}
            cy={radius + sizeConfig.strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <motion.circle
            cx={radius + sizeConfig.strokeWidth}
            cy={radius + sizeConfig.strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            className={colorConfig.replace('bg-', 'text-')}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={animated ? {
              duration: 0.8,
              ease: 'easeOut',
            } : { duration: 0 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showValue && (
            <span className={cn('font-bold', sizeConfig.text)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>

        {label && (
          <div className="text-center mt-2">
            <span className={cn('text-gray-700 dark:text-gray-300', sizeConfig.text)}>
              {label}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderDotsProgress = () => {
    const totalDots = 10;
    const activeDots = Math.round((percentage / 100) * totalDots);

    return (
      <div className={cn('flex flex-col items-center space-y-2', className)}>
        {label && (
          <span className={cn('font-medium text-gray-700 dark:text-gray-300', sizeConfig.text)}>
            {label}
          </span>
        )}

        <div className="flex space-x-1">
          {Array.from({ length: totalDots }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'rounded-full',
                index < activeDots ? colorConfig : 'bg-gray-200 dark:bg-gray-700',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={animated ? {
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              } : { duration: 0 }}
            />
          ))}
        </div>

        {showValue && (
          <span className={cn('text-gray-500 dark:text-gray-400', sizeConfig.text)}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  };

  const renderStepsProgress = () => {
    const steps = Math.max(max, 1);
    const currentStep = Math.min(Math.ceil((value / max) * steps), steps);

    return (
      <div className={cn('flex flex-col space-y-2', className)}>
        {label && (
          <span className={cn('font-medium text-gray-700 dark:text-gray-300', sizeConfig.text)}>
            {label}
          </span>
        )}

        <div className="flex items-center space-x-2">
          {Array.from({ length: steps }).map((_, index) => (
            <React.Fragment key={index}>
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 font-medium',
                  index < currentStep
                    ? `${colorConfig} border-current text-white`
                    : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
                  size === 'sm' ? 'w-6 h-6 text-xs' : size === 'md' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={animated ? {
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                } : { duration: 0 }}
              >
                {index + 1}
              </motion.div>

              {index < steps - 1 && (
                <div
                  className={cn(
                    'flex-1 border-t-2',
                    index < currentStep - 1
                      ? colorConfig.replace('bg-', 'border-')
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {showValue && (
          <span className={cn('text-gray-500 dark:text-gray-400', sizeConfig.text)}>
            Step {currentStep} of {steps}
          </span>
        )}
      </div>
    );
  };

  switch (variant) {
    case 'circular':
      return renderCircularProgress();
    case 'dots':
      return renderDotsProgress();
    case 'steps':
      return renderStepsProgress();
    default:
      return renderLinearProgress();
  }
}

// Preset progress components
export function LoadingProgress({
  label = 'Loading...',
  ...props
}: Omit<ProgressIndicatorProps, 'value'>) {
  return (
    <ProgressIndicator
      value={100}
      variant="linear"
      color="primary"
      striped
      animated
      label={label}
      {...props}
    />
  );
}

export function UploadProgress({
  value,
  label = 'Uploading...',
  ...props
}: Pick<ProgressIndicatorProps, 'value'> & Partial<ProgressIndicatorProps>) {
  return (
    <ProgressIndicator
      value={value}
      variant="linear"
      color="primary"
      showValue
      label={label}
      animated
      {...props}
    />
  );
}