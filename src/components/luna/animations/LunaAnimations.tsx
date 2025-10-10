import React from 'react';
import { motion } from 'framer-motion';
import { LunaExpression } from '@/assets/luna/luna-assets';

// Enhanced animation configurations for different Luna expressions and states
export const LUNA_ANIMATIONS = {
  // Basic expressions
  default: {
    breathing: {
      animate: {
        scale: [1, 1.02, 1],
        rotate: [0, 0.5, 0, -0.5, 0]
      },
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    pulse: {
      animate: {
        boxShadow: [
          "0 0 0 0 rgba(43, 90, 158, 0.4)",
          "0 0 0 10px rgba(43, 90, 158, 0)",
          "0 0 0 0 rgba(43, 90, 158, 0)"
        ]
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  },

  // Active/excited expressions
  happy: {
    bounce: {
      animate: {
        y: [0, -8, 0, -4, 0],
        rotate: [0, 2, 0, -2, 0]
      },
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    sparkle: {
      animate: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      },
      transition: {
        duration: 0.8,
        ease: "backOut"
      }
    }
  },

  // Thinking/processing expressions
  thinking: {
    sway: {
      animate: {
        rotate: [-3, 3, -3],
        x: [0, 2, -2, 0]
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    pulse: {
      animate: {
        opacity: [1, 0.7, 1],
        scale: [1, 1.02, 1]
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Success/achievement expressions
  success: {
    celebration: {
      animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        y: [0, -10, 0]
      },
      transition: {
        duration: 1,
        ease: "backOut"
      }
    },
    glow: {
      animate: {
        filter: [
          "drop-shadow(0 0 0px rgba(255, 153, 51, 0.6))",
          "drop-shadow(0 0 20px rgba(255, 153, 51, 0.8))",
          "drop-shadow(0 0 0px rgba(255, 153, 51, 0.6))"
        ]
      },
      transition: {
        duration: 1.5,
        repeat: 3,
        ease: "easeInOut"
      }
    }
  },

  // Curious/questioning expressions
  curious: {
    tilt: {
      animate: {
        rotate: [-8, 8, -8],
        scale: [1, 1.05, 1]
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Focused/concentrating expressions
  focused: {
    steady: {
      animate: {
        scale: [1, 1.01, 1]
      },
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Animation variants for entrance/exit
export const LUNA_ENTRANCE_ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  slideInFromBottom: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.4, ease: "backOut" }
  },

  slideInFromRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.4, ease: "backOut" }
  },

  bounceIn: {
    initial: { opacity: 0, scale: 0.3, y: -100 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.3, y: -100 },
    transition: { duration: 0.6, ease: "backOut" }
  }
};

// Interactive animations for hover/click states
export const LUNA_INTERACTION_ANIMATIONS = {
  hover: {
    scale: 1.1,
    rotate: 2,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },

  click: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  },

  attention: {
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  }
};

// Context-aware background animations
export const LUNA_BACKGROUND_ANIMATIONS = {
  capture: {
    initial: { backgroundColor: "rgba(59, 130, 246, 0.05)" },
    animate: {
      backgroundColor: [
        "rgba(59, 130, 246, 0.05)",
        "rgba(59, 130, 246, 0.1)",
        "rgba(59, 130, 246, 0.05)"
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },

  plan: {
    initial: { backgroundColor: "rgba(34, 197, 94, 0.05)" },
    animate: {
      backgroundColor: [
        "rgba(34, 197, 94, 0.05)",
        "rgba(34, 197, 94, 0.1)",
        "rgba(34, 197, 94, 0.05)"
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },

  engage: {
    initial: { backgroundColor: "rgba(168, 85, 247, 0.05)" },
    animate: {
      backgroundColor: [
        "rgba(168, 85, 247, 0.05)",
        "rgba(168, 85, 247, 0.1)",
        "rgba(168, 85, 247, 0.05)"
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface AnimatedLunaWrapperProps {
  children: React.ReactNode;
  expression: LunaExpression;
  animationType?: 'breathing' | 'sway' | 'bounce' | 'celebration' | 'steady';
  entrance?: 'fadeIn' | 'slideInFromBottom' | 'slideInFromRight' | 'bounceIn';
  interactive?: boolean;
  className?: string;
}

export const AnimatedLunaWrapper: React.FC<AnimatedLunaWrapperProps> = ({
  children,
  expression,
  animationType,
  entrance = 'fadeIn',
  interactive = false,
  className = ''
}) => {
  // Get animation config based on expression and type
  const getAnimationConfig = () => {
    const expressionAnimations = LUNA_ANIMATIONS[expression];
    if (!expressionAnimations || !animationType) {
      return LUNA_ANIMATIONS.default.breathing;
    }
    return expressionAnimations[animationType] || LUNA_ANIMATIONS.default.breathing;
  };

  const animationConfig = getAnimationConfig();
  const entranceConfig = LUNA_ENTRANCE_ANIMATIONS[entrance];

  return (
    <motion.div
      className={`luna-animated-wrapper ${className}`}
      initial={entranceConfig.initial}
      animate={[entranceConfig.animate, animationConfig.animate]}
      exit={entranceConfig.exit}
      whileHover={interactive ? { scale: 1.1, rotate: 2 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      transition={{
        ...entranceConfig.transition,
        ...animationConfig.transition
      }}
    >
      {children}
    </motion.div>
  );
};

// Typing indicator with animated dots
export const LunaTypingIndicator: React.FC<{
  className?: string;
  dotColor?: string;
}> = ({
  className = '',
  dotColor = '#2B5A9E'
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: dotColor }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Particle effect for special moments
export const LunaParticleEffect: React.FC<{
  particleCount?: number;
  color?: string;
  className?: string;
}> = ({
  particleCount = 6,
  color = '#FF9933',
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Array.from({ length: particleCount }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
            scale: [0, 1, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Context-aware glow effect
export const LunaContextGlow: React.FC<{
  context: 'capture' | 'plan' | 'engage' | 'general';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}> = ({
  context,
  intensity = 'medium',
  className = ''
}) => {
  const getGlowColor = () => {
    switch (context) {
      case 'capture': return 'rgba(59, 130, 246, 0.3)'; // Blue
      case 'plan': return 'rgba(34, 197, 94, 0.3)'; // Green
      case 'engage': return 'rgba(168, 85, 247, 0.3)'; // Purple
      default: return 'rgba(255, 153, 51, 0.3)'; // Orange
    }
  };

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'low': return 0.5;
      case 'high': return 1.5;
      default: return 1;
    }
  };

  const glowColor = getGlowColor();
  const multiplier = getIntensityMultiplier();

  return (
    <motion.div
      className={`absolute inset-0 rounded-full pointer-events-none ${className}`}
      animate={{
        boxShadow: [
          `0 0 0 0 ${glowColor}`,
          `0 0 ${20 * multiplier}px ${5 * multiplier}px ${glowColor}`,
          `0 0 0 0 ${glowColor}`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export default AnimatedLunaWrapper;