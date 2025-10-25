import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, Target, Calendar, MessageSquare, Settings, Search, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface RadialMenuProps {
  theme?: 'light' | 'dark';
  className?: string;
}

interface RadialItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  angle: number;
  description: string;
}

export const RadialMenu: React.FC<RadialMenuProps> = ({
  theme = 'light',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RadialItem | null>(null);

  const radialItems: RadialItem[] = [
    {
      id: 'notes',
      icon: FileText,
      label: 'Quick Note',
      color: 'bg-blue-500',
      angle: 0,
      description: 'Capture thoughts and ideas instantly'
    },
    {
      id: 'goals',
      icon: Target,
      label: 'Goals',
      color: 'bg-green-500',
      angle: 60,
      description: 'Track and manage your objectives'
    },
    {
      id: 'calendar',
      icon: Calendar,
      label: 'Schedule',
      color: 'bg-purple-500',
      angle: 120,
      description: 'View and manage your calendar'
    },
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'AI Chat',
      color: 'bg-orange-500',
      angle: 180,
      description: 'Chat with Luna AI assistant'
    },
    {
      id: 'insights',
      icon: TrendingUp,
      label: 'Insights',
      color: 'bg-pink-500',
      angle: 240,
      description: 'View productivity analytics'
    },
    {
      id: 'habits',
      icon: Zap,
      label: 'Habits',
      color: 'bg-yellow-500',
      angle: 300,
      description: 'Track daily habits and streaks'
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedItem(null);
    }
  };

  const handleItemClick = (item: RadialItem) => {
    setSelectedItem(item);
    setTimeout(() => {
      setIsOpen(false);
      setSelectedItem(null);
    }, 1000);
  };

  const getRadialPosition = (angle: number, radius: number = 120) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const centralButtonVariants = {
    closed: {
      rotate: 0,
      scale: 1
    },
    open: {
      rotate: 45,
      scale: 1.1
    }
  };

  const itemVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0
    },
    open: (item: RadialItem) => {
      const position = getRadialPosition(item.angle);
      return {
        scale: 1,
        opacity: 1,
        x: position.x,
        y: position.y,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1
        }
      };
    }
  };

  const connectionLineVariants = {
    closed: {
      pathLength: 0,
      opacity: 0
    },
    open: {
      pathLength: 1,
      opacity: 0.3,
      transition: {
        pathLength: { duration: 0.5, delay: 0.2 },
        opacity: { duration: 0.3, delay: 0.2 }
      }
    }
  };

  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Background Content */}
      <main className={cn(
        'p-6',
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      )}>
        <div className="max-w-4xl mx-auto text-center pt-20">
          <h1 className={cn(
            'text-3xl font-bold mb-4',
            theme === 'light' ? 'text-gray-900' : 'text-white'
          )}>
            Radial Menu Demo
          </h1>
          <p className={cn(
            'text-lg mb-8',
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          )}>
            Click the Luna button to see the radial menu in action.
            Each option expands in a perfect circle for intuitive navigation.
          </p>

          {/* Demo cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { title: 'Equal Distance', desc: 'All options are equidistant from center', icon: '📐' },
              { title: 'Smooth Animation', desc: 'Fluid spring-based animations', icon: '✨' },
              { title: 'Touch Optimized', desc: 'Perfect for touch interfaces', icon: '👆' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-6 rounded-xl border',
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-800 border-gray-700'
                )}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className={cn(
                  'font-semibold mb-2',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  {feature.title}
                </h3>
                <p className={cn(
                  'text-sm',
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Radial Menu Container */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative w-64 h-64 flex items-center justify-center">

          {/* Connection Lines */}
          <AnimatePresence>
            {isOpen && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {radialItems.map((item) => {
                  const position = getRadialPosition(item.angle, 120);
                  return (
                    <motion.line
                      key={`line-${item.id}`}
                      x1="50%"
                      y1="50%"
                      x2={`${50 + (position.x / 2.56)}%`}
                      y2={`${50 + (position.y / 2.56)}%`}
                      stroke="orange"
                      strokeWidth="2"
                      variants={connectionLineVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    />
                  );
                })}
              </svg>
            )}
          </AnimatePresence>

          {/* Radial Items */}
          <AnimatePresence>
            {isOpen && radialItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  custom={item}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2',
                    item.color,
                    selectedItem?.id === item.id && 'ring-4 ring-white'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* Central Luna Button */}
          <motion.button
            variants={centralButtonVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            onClick={toggleMenu}
            className={cn(
              'relative w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-10',
              'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700',
              'transition-all duration-200'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {!isOpen ? (
                <motion.div
                  key="luna"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <LunaAvatar size="medium" expression="happy" />
                </motion.div>
              ) : (
                <motion.div
                  key="close"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-8 h-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse animation when closed */}
            {!isOpen && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-orange-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-orange-300"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </>
            )}
          </motion.button>
        </div>

        {/* Item Label */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'absolute -top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap',
                theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'
              )}
            >
              <div className="text-center">
                <p className="font-semibold">{selectedItem.label}</p>
                <p className="text-xs text-gray-500">{selectedItem.description}</p>
              </div>
              <div className={cn(
                'absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45',
                theme === 'light' ? 'bg-white' : 'bg-gray-800'
              )} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction tooltip when closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1 }}
              className={cn(
                'absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap',
                theme === 'light' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              )}
            >
              <p className="text-sm font-medium">Click Luna for radial menu</p>
              <div className={cn(
                'absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45',
                theme === 'light' ? 'bg-gray-800' : 'bg-white'
              )} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};