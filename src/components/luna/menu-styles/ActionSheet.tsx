import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FileText, Target, Calendar, MessageSquare, Settings, Zap, TrendingUp, Camera, Mic, Image, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface ActionSheetProps {
  theme?: 'light' | 'dark';
  className?: string;
}

interface ActionItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  action?: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  theme = 'light',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragY, setDragY] = useState(0);

  const quickActions: ActionItem[] = [
    {
      id: 'quick-note',
      icon: FileText,
      title: 'Quick Note',
      description: 'Capture thoughts instantly',
      color: 'text-blue-500'
    },
    {
      id: 'voice-memo',
      icon: Mic,
      title: 'Voice Memo',
      description: 'Record a quick voice note',
      color: 'text-green-500'
    },
    {
      id: 'photo-capture',
      icon: Camera,
      title: 'Photo Capture',
      description: 'Take a photo for your notes',
      color: 'text-purple-500'
    },
    {
      id: 'new-goal',
      icon: Target,
      title: 'New Goal',
      description: 'Set a new objective',
      color: 'text-orange-500'
    }
  ];

  const primaryActions: ActionItem[] = [
    {
      id: 'ai-chat',
      icon: () => <LunaAvatar size="small" expression="happy" />,
      title: 'Chat with Luna',
      description: 'Get AI assistance and insights',
      color: 'text-orange-500'
    },
    {
      id: 'schedule-event',
      icon: Calendar,
      title: 'Schedule Event',
      description: 'Add to your calendar',
      color: 'text-red-500'
    },
    {
      id: 'habit-check',
      icon: Zap,
      title: 'Habit Check-in',
      description: 'Update your daily habits',
      color: 'text-yellow-500'
    },
    {
      id: 'productivity-insights',
      icon: TrendingUp,
      title: 'View Insights',
      description: 'See your productivity data',
      color: 'text-indigo-500'
    },
    {
      id: 'share-progress',
      icon: Share2,
      title: 'Share Progress',
      description: 'Share your achievements',
      color: 'text-pink-500'
    }
  ];

  const toggleSheet = () => {
    setIsOpen(!isOpen);
    setDragY(0);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 0) {
      setDragY(info.offset.y);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  const sheetVariants = {
    hidden: {
      y: '100%',
      transition: {
        type: 'tween',
        duration: 0.3
      }
    },
    visible: {
      y: 0,
      transition: {
        type: 'tween',
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Background Content */}
      <main className={cn(
        'p-6',
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      )}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={cn(
              'text-3xl font-bold mb-4',
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              Action Sheet Demo
            </h1>
            <p className={cn(
              'text-lg mb-8',
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            )}>
              Tap the Luna button to see the iOS-style action sheet slide up from the bottom.
              Swipe down or tap outside to dismiss.
            </p>
            <div className="flex justify-center gap-6">
              {[
                { emoji: '👆', title: 'Tap to Open', desc: 'Single tap on Luna' },
                { emoji: '👇', title: 'Swipe to Close', desc: 'Drag down to dismiss' },
                { emoji: '✨', title: 'Smooth Animation', desc: 'Native iOS feel' }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-center p-4 rounded-xl',
                    theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800'
                  )}
                >
                  <div className="text-3xl mb-2">{feature.emoji}</div>
                  <h3 className={cn(
                    'font-semibold mb-1',
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

          {/* Sample content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cn(
              'p-6 rounded-xl border',
              theme === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-gray-800 border-gray-700'
            )}>
              <h3 className={cn(
                'text-lg font-semibold mb-4',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Today's Tasks
              </h3>
              <div className="space-y-3">
                {['Review project proposal', 'Call team meeting', 'Update documentation'].map((task, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg',
                      theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                    )}
                  >
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    <span className={cn(
                      'text-sm',
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    )}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn(
              'p-6 rounded-xl border',
              theme === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-gray-800 border-gray-700'
            )}>
              <h3 className={cn(
                'text-lg font-semibold mb-4',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Quick Stats
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Goals Completed', value: '7/10', color: 'bg-green-500' },
                  { label: 'Habits Streak', value: '12 days', color: 'bg-blue-500' },
                  { label: 'Focus Time', value: '4.5h', color: 'bg-purple-500' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full', stat.color)} />
                    <span className={cn(
                      'text-sm flex-1',
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    )}>
                      {stat.label}
                    </span>
                    <span className={cn(
                      'text-sm font-medium',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Luna Button */}
      <motion.button
        onClick={toggleSheet}
        className={cn(
          'fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-40',
          'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700',
          'transition-all duration-200'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LunaAvatar size="medium" expression="happy" />

        {/* Pulse animation */}
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
      </motion.button>

      {/* Action Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={toggleSheet}
            />

            {/* Sheet */}
            <motion.div
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{ y: dragY }}
              className={cn(
                'fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden',
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={cn(
                  'w-12 h-1 rounded-full',
                  theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                )} />
              </div>

              {/* Header */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <LunaAvatar size="medium" expression="happy" />
                  <div>
                    <h2 className={cn(
                      'text-xl font-bold',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      Luna AI Assistant
                    </h2>
                    <p className={cn(
                      'text-sm',
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    )}>
                      What would you like to do?
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* Quick Actions */}
                <div className="px-6 pb-4">
                  <h3 className={cn(
                    'text-sm font-semibold mb-3',
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => {
                            if (action.action) action.action();
                            toggleSheet();
                          }}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                            theme === 'light'
                              ? 'bg-gray-50 hover:bg-gray-100'
                              : 'bg-gray-800 hover:bg-gray-700'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-700'
                          )}>
                            <Icon className={cn('w-5 h-5', action.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium text-sm',
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            )}>
                              {action.title}
                            </p>
                            <p className={cn(
                              'text-xs truncate',
                              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            )}>
                              {action.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="px-6 pb-6">
                  <h3 className={cn(
                    'text-sm font-semibold mb-3',
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    More Actions
                  </h3>
                  <div className="space-y-2">
                    {primaryActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          custom={index + quickActions.length}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => {
                            if (action.action) action.action();
                            toggleSheet();
                          }}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors',
                            theme === 'light'
                              ? 'hover:bg-gray-50'
                              : 'hover:bg-gray-800'
                          )}
                        >
                          <div className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-xl',
                            theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
                          )}>
                            {action.id === 'ai-chat' ? (
                              <Icon />
                            ) : (
                              <Icon className={cn('w-5 h-5', action.color)} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              'font-semibold',
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            )}>
                              {action.title}
                            </p>
                            <p className={cn(
                              'text-sm',
                              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            )}>
                              {action.description}
                            </p>
                          </div>
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                          )}>
                            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Safe area for iPhone home indicator */}
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};