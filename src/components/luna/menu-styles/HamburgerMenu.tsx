import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Search, Settings, User, MessageSquare, Calendar, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface HamburgerMenuProps {
  theme?: 'light' | 'dark';
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  theme = 'light',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/app' },
    { icon: Target, label: 'Goals', path: '/app/goals' },
    { icon: Calendar, label: 'Calendar', path: '/app/calendar' },
    { icon: Zap, label: 'Habits', path: '/app/habits' },
    { icon: MessageSquare, label: 'Chat', path: '/app/chat' },
    { icon: Search, label: 'Search', path: '/app/search' },
    { icon: User, label: 'Profile', path: '/app/profile' },
    { icon: Settings, label: 'Settings', path: '/app/settings' }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItemVariants = {
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: (index: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const drawerVariants = {
    closed: {
      x: '-100%',
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Header with Hamburger Button */}
      <header className={cn(
        'flex items-center justify-between px-4 py-3 border-b',
        theme === 'light'
          ? 'bg-white border-gray-200'
          : 'bg-gray-900 border-gray-700'
      )}>
        <button
          onClick={toggleMenu}
          className={cn(
            'p-2 rounded-lg transition-colors hover:bg-gray-100',
            theme === 'dark' && 'hover:bg-gray-800'
          )}
          aria-label="Toggle menu"
        >
          <Menu className={cn(
            'w-6 h-6',
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          )} />
        </button>

        <h1 className={cn(
          'text-lg font-semibold',
          theme === 'light' ? 'text-gray-900' : 'text-white'
        )}>
          Spark Bloom Flow
        </h1>

        <div className="w-10" /> {/* Spacer for center alignment */}
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'fixed top-0 left-0 bottom-0 w-80 z-50 shadow-xl',
              theme === 'light' ? 'bg-white' : 'bg-gray-900'
            )}
          >
            {/* Menu Header */}
            <div className={cn(
              'flex items-center justify-between p-4 border-b',
              theme === 'light' ? 'border-gray-200' : 'border-gray-700'
            )}>
              <div className="flex items-center gap-3">
                <LunaAvatar size="medium" expression="happy" />
                <div>
                  <h2 className={cn(
                    'font-semibold',
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  )}>
                    Luna AI Assistant
                  </h2>
                  <p className="text-sm text-gray-500">Always here to help</p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className={cn(
                  'p-2 rounded-lg transition-colors hover:bg-gray-100',
                  theme === 'dark' && 'hover:bg-gray-800'
                )}
                aria-label="Close menu"
              >
                <X className={cn(
                  'w-5 h-5',
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                )} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="py-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.path}
                    href={item.path}
                    custom={index}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className={cn(
                      'flex items-center gap-3 px-6 py-3 transition-colors hover:bg-gray-50',
                      theme === 'dark' && 'hover:bg-gray-800'
                    )}
                    onClick={toggleMenu}
                  >
                    <Icon className={cn(
                      'w-5 h-5',
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      {item.label}
                    </span>
                  </motion.a>
                );
              })}
            </nav>

            {/* Menu Footer */}
            <div className={cn(
              'absolute bottom-0 left-0 right-0 p-4 border-t',
              theme === 'light' ? 'border-gray-200' : 'border-gray-700'
            )}>
              <div className={cn(
                'rounded-lg p-3',
                theme === 'light' ? 'bg-orange-50' : 'bg-orange-900/20'
              )}>
                <p className={cn(
                  'text-sm font-medium mb-1',
                  theme === 'light' ? 'text-orange-900' : 'text-orange-100'
                )}>
                  Need help?
                </p>
                <p className={cn(
                  'text-xs',
                  theme === 'light' ? 'text-orange-700' : 'text-orange-200'
                )}>
                  Ask Luna anything about your productivity workflow
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        'min-h-screen p-6',
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
      )}>
        <div className={cn(
          'max-w-4xl mx-auto rounded-lg p-8 text-center',
          theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-900 shadow-xl'
        )}>
          <h2 className={cn(
            'text-2xl font-bold mb-4',
            theme === 'light' ? 'text-gray-900' : 'text-white'
          )}>
            Hamburger Menu Demo
          </h2>
          <p className={cn(
            'text-gray-600 mb-6',
            theme === 'dark' && 'text-gray-400'
          )}>
            Click the menu button in the top-left to see Luna's hamburger menu in action.
            This classic pattern provides easy access to all navigation options while
            keeping the interface clean and uncluttered.
          </p>
          <div className="flex justify-center gap-4">
            <div className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              theme === 'light'
                ? 'bg-green-100 text-green-800'
                : 'bg-green-900/30 text-green-300'
            )}>
              ✓ Space Efficient
            </div>
            <div className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              theme === 'light'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-blue-900/30 text-blue-300'
            )}>
              ✓ Familiar Pattern
            </div>
            <div className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              theme === 'light'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-purple-900/30 text-purple-300'
            )}>
              ✓ Smooth Animation
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};