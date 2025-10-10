import React from 'react';
import { cn } from '@/lib/utils';
import {
  LunaSize,
  LunaExpression,
  getLunaAssetWithFallback,
  LUNA_SIZES,
  LUNA_COLORS
} from '@/assets/luna/luna-assets';
import {
  AnimatedLunaWrapper,
  LunaParticleEffect,
  LunaContextGlow
} from '../animations/LunaAnimations';

interface LunaAvatarProps {
  size: LunaSize;
  expression?: LunaExpression;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  context?: 'capture' | 'plan' | 'engage' | 'general';
  showParticles?: boolean;
  showContextGlow?: boolean;
  animationType?: 'breathing' | 'sway' | 'bounce' | 'celebration' | 'steady';
  entrance?: 'fadeIn' | 'slideInFromBottom' | 'slideInFromRight' | 'bounceIn';
}

export const LunaAvatar: React.FC<LunaAvatarProps> = ({
  size,
  expression = 'default',
  className,
  animated = true,
  onClick,
  'aria-label': ariaLabel = 'Luna, your AI productivity assistant',
  context = 'general',
  showParticles = false,
  showContextGlow = false,
  animationType,
  entrance = 'fadeIn',
}) => {
  const sizeConfig = LUNA_SIZES[size];
  const asset = getLunaAssetWithFallback(size, expression);

  // Determine animation type based on expression if not explicitly provided
  const getDefaultAnimationType = () => {
    switch (expression) {
      case 'thinking': return 'sway';
      case 'happy': return 'bounce';
      case 'success': return 'celebration';
      case 'focused': return 'steady';
      default: return 'breathing';
    }
  };

  const finalAnimationType = animationType || getDefaultAnimationType();

  const avatarContent = (
    <div
      className={cn(
        'luna-avatar relative flex items-center justify-center rounded-full',
        'transition-all duration-300 ease-in-out',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
        backgroundColor: LUNA_COLORS.furLight + '20',
        border: `2px solid ${LUNA_COLORS.furPrimary}40`,
      }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Context Glow Effect */}
      {showContextGlow && (
        <LunaContextGlow
          context={context}
          intensity="medium"
          className="absolute inset-0"
        />
      )}

      {/* Luna Emoji/Asset */}
      <span
        className="luna-emoji select-none relative z-10"
        style={{
          fontSize: Math.max(sizeConfig.width * 0.6, 12),
          filter: 'drop-shadow(0 2px 4px rgba(43, 90, 158, 0.3))'
        }}
      >
        {asset}
      </span>

      {/* Particle Effect for Special Moments */}
      {showParticles && (
        <LunaParticleEffect
          particleCount={6}
          color={LUNA_COLORS.orangePrimary}
          className="absolute inset-0"
        />
      )}

      {/* Interactive Glow */}
      {onClick && (
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-0',
            'transition-opacity duration-300',
            'hover:opacity-20 focus:opacity-20',
            'pointer-events-none'
          )}
          style={{
            background: `radial-gradient(circle, ${LUNA_COLORS.lanternGlow}80 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );

  // Wrap with enhanced animations if enabled
  if (animated) {
    return (
      <AnimatedLunaWrapper
        expression={expression}
        animationType={finalAnimationType}
        entrance={entrance}
        interactive={!!onClick}
        className="luna-avatar-wrapper"
      >
        {avatarContent}
      </AnimatedLunaWrapper>
    );
  }

  return avatarContent;
};

// Additional Luna avatar variants for specific use cases
export const LunaAvatarSmall: React.FC<Omit<LunaAvatarProps, 'size'>> = (props) => (
  <LunaAvatar {...props} size="small" />
);

export const LunaAvatarMedium: React.FC<Omit<LunaAvatarProps, 'size'>> = (props) => (
  <LunaAvatar {...props} size="medium" />
);

export const LunaAvatarLarge: React.FC<Omit<LunaAvatarProps, 'size'>> = (props) => (
  <LunaAvatar {...props} size="large" />
);

// Interactive Luna avatar with tooltip
interface InteractiveLunaAvatarProps extends LunaAvatarProps {
  tooltip?: string;
  showTooltip?: boolean;
}

export const InteractiveLunaAvatar: React.FC<InteractiveLunaAvatarProps> = ({
  tooltip = 'Click to chat with Luna',
  showTooltip = true,
  ...props
}) => {
  return (
    <div className="relative group">
      <LunaAvatar {...props} />

      {showTooltip && tooltip && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            'bg-gray-900 text-white text-xs rounded-lg px-2 py-1',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none whitespace-nowrap z-50'
          )}
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};