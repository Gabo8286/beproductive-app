import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Home,
  Search,
  Command,
  MessageSquare,
  Settings,
  X,
  Plus,
  ChevronUp,
  Target,
  CheckSquare,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface MenuOptionDemoProps {
  optionId: string;
  theme: 'light' | 'dark';
  onClose: () => void;
}

export const MenuOptionDemo: React.FC<MenuOptionDemoProps> = ({
  optionId,
  theme,
  onClose
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState('luna');

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-900';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const secondaryBg = theme === 'light' ? 'bg-gray-50' : 'bg-gray-800';

  const renderDemo = () => {
    switch (optionId) {
      case 'hamburger':
        return (
          <div className={cn('relative w-full h-full', bgColor)}>
            {/* Header */}
            <div className={cn('h-16 border-b flex items-center px-4', borderColor)}>
              <button
                onClick={() => setIsActive(!isActive)}
                className={cn('p-2 rounded-lg hover:bg-gray-100 transition-colors', textColor)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className={cn('ml-4 text-lg font-semibold', textColor)}>Dashboard</h1>
            </div>

            {/* Slide-out menu */}
            <AnimatePresence>
              {isActive && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 z-40"
                    onClick={() => setIsActive(false)}
                  />
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ type: 'spring', damping: 25 }}
                    className={cn('absolute left-0 top-0 bottom-0 w-72 shadow-xl z-50', cardBg, borderColor, 'border-r')}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <LunaAvatar size="medium" expression="happy" />
                        <div>
                          <h2 className={cn('font-semibold', textColor)}>Luna AI</h2>
                          <p className="text-sm text-gray-400">Your assistant</p>
                        </div>
                      </div>

                      <nav className="space-y-2">
                        {[
                          { icon: Home, label: 'Dashboard', active: true },
                          { icon: Target, label: 'Goals' },
                          { icon: CheckSquare, label: 'Tasks' },
                          { icon: Calendar, label: 'Calendar' },
                          { icon: MessageSquare, label: 'Chat with Luna' },
                          { icon: Settings, label: 'Settings' }
                        ].map((item, idx) => {
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={idx}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                                item.active
                                  ? 'bg-orange-100 text-orange-600'
                                  : cn('hover:bg-gray-100', textColor)
                              )}
                            >
                              <IconComponent className="w-5 h-5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main content */}
            <div className="p-6">
              <div className={cn('h-64 rounded-lg flex items-center justify-center', secondaryBg)}>
                <div className="text-center">
                  <p className={cn('text-lg mb-2', textColor)}>Hamburger Menu Demo</p>
                  <p className="text-gray-400">Click the menu icon to open the drawer</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bottom-nav':
        return (
          <div className={cn('relative w-full h-full', bgColor)}>
            {/* Main content */}
            <div className="p-6 pb-20">
              <h1 className={cn('text-2xl font-bold mb-4', textColor)}>Dashboard</h1>
              <div className={cn('h-80 rounded-lg flex items-center justify-center', secondaryBg)}>
                <div className="text-center">
                  <p className={cn('text-lg mb-2', textColor)}>Bottom Navigation Demo</p>
                  <p className="text-gray-400">Luna is always accessible in the center</p>
                </div>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className={cn('absolute bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-4', cardBg, borderColor)}>
              {[
                { icon: Home, label: 'Home', id: 'home' },
                { icon: Search, label: 'Search', id: 'search' },
                { icon: null, label: 'Luna', id: 'luna' },
                { icon: MessageSquare, label: 'Chat', id: 'chat' },
                { icon: Settings, label: 'Settings', id: 'settings' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className="flex flex-col items-center"
                >
                  {item.id === 'luna' ? (
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <LunaAvatar size="small" expression="happy" />
                    </motion.div>
                  ) : (
                    <div className={cn(
                      'w-6 h-6 flex items-center justify-center',
                      selectedTab === item.id ? 'text-orange-500' : 'text-gray-400'
                    )}>
                      {item.icon && <item.icon className="w-6 h-6" />}
                    </div>
                  )}
                  <span className={cn(
                    'text-xs mt-1',
                    item.id === 'luna' ? 'text-orange-500 font-medium' :
                    selectedTab === item.id ? 'text-orange-500' : 'text-gray-400'
                  )}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'radial':
        return (
          <div className={cn('relative w-full h-full flex items-center justify-center', bgColor)}>
            <div className="relative">
              {/* Central Luna button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsActive(!isActive)}
                className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg relative z-10"
              >
                <LunaAvatar size="medium" expression="happy" />
              </motion.button>

              {/* Orbital items */}
              <AnimatePresence>
                {isActive && (
                  <>
                    {[
                      { icon: FileText, label: 'Notes', angle: 0, color: 'bg-blue-500' },
                      { icon: Target, label: 'Goals', angle: 90, color: 'bg-green-500' },
                      { icon: CheckSquare, label: 'Tasks', angle: 180, color: 'bg-purple-500' },
                      { icon: MessageSquare, label: 'Chat', angle: 270, color: 'bg-pink-500' }
                    ].map((item, idx) => {
                      const IconComponent = item.icon;
                      const radius = 80;
                      const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                      const y = Math.sin((item.angle * Math.PI) / 180) * radius;

                      return (
                        <motion.button
                          key={idx}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{ scale: 1, x, y }}
                          exit={{ scale: 0, x: 0, y: 0 }}
                          transition={{ type: 'spring', delay: idx * 0.1 }}
                          className={cn(
                            'absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                            item.color
                          )}
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
                          }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </motion.button>
                      );
                    })}
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <p className={cn('text-sm', textColor)}>Tap Luna to expand radial menu</p>
            </div>
          </div>
        );

      case 'command':
        return (
          <div className={cn('relative w-full h-full', bgColor)}>
            <div className="p-6">
              <h1 className={cn('text-2xl font-bold mb-4', textColor)}>Command Palette Demo</h1>
              <p className="text-gray-400 mb-6">Press Cmd+K or click below to open</p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  'w-full p-4 border rounded-lg text-left flex items-center gap-3',
                  borderColor, 'hover:border-orange-300'
                )}
              >
                <Command className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Search for anything...</span>
                <span className="ml-auto text-xs text-gray-400">⌘K</span>
              </motion.button>
            </div>

            {/* Command palette overlay */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32"
                  onClick={() => setIsActive(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn('w-96 rounded-lg shadow-xl', cardBg)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Command className="w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Type to search..."
                          className={cn('flex-1 bg-transparent outline-none', textColor)}
                          autoFocus
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 text-orange-600">
                          <LunaAvatar size="small" expression="happy" />
                          <span>Ask Luna AI</span>
                          <span className="ml-auto text-xs">Enter</span>
                        </div>
                        {[
                          { icon: FileText, label: 'Quick Note', shortcut: '⌘N' },
                          { icon: Target, label: 'New Goal', shortcut: '⌘G' },
                          { icon: CheckSquare, label: 'Add Task', shortcut: '⌘T' }
                        ].map((item, idx) => {
                          const IconComponent = item.icon;
                          return (
                            <div key={idx} className={cn('flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50', textColor)}>
                              <IconComponent className="w-4 h-4" />
                              <span>{item.label}</span>
                              <span className="ml-auto text-xs text-gray-400">{item.shortcut}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'action-sheet':
        return (
          <div className={cn('relative w-full h-full', bgColor)}>
            {/* Main content */}
            <div className="p-6">
              <h1 className={cn('text-2xl font-bold mb-4', textColor)}>Action Sheet Demo</h1>
              <div className={cn('h-64 rounded-lg flex items-center justify-center', secondaryBg)}>
                <div className="text-center">
                  <p className={cn('text-lg mb-2', textColor)}>Swipe up or tap Luna</p>
                  <p className="text-gray-400">To access quick actions</p>
                </div>
              </div>
            </div>

            {/* Floating Luna trigger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsActive(!isActive)}
              className="absolute bottom-20 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <LunaAvatar size="small" expression="happy" />
            </motion.button>

            {/* Action sheet */}
            <AnimatePresence>
              {isActive && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20"
                    onClick={() => setIsActive(false)}
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25 }}
                    className={cn('absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-xl', cardBg)}
                  >
                    <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-2" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <LunaAvatar size="large" expression="happy" />
                        <div>
                          <h3 className={cn('text-lg font-semibold', textColor)}>Luna AI Assistant</h3>
                          <p className="text-sm text-gray-400">How can I help you today?</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: FileText, label: 'Quick Note', color: 'bg-blue-100 text-blue-600' },
                          { icon: Target, label: 'New Goal', color: 'bg-green-100 text-green-600' },
                          { icon: CheckSquare, label: 'Add Task', color: 'bg-purple-100 text-purple-600' },
                          { icon: MessageSquare, label: 'AI Chat', color: 'bg-orange-100 text-orange-600' }
                        ].map((item, idx) => {
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={idx}
                              className={cn(
                                'p-4 rounded-xl text-center transition-colors',
                                item.color, 'hover:scale-105'
                              )}
                            >
                              <IconComponent className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return (
          <div className={cn('flex items-center justify-center h-full', bgColor)}>
            <p className={cn('text-lg', textColor)}>Demo not available</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl h-[600px] overflow-hidden relative"
      >
        {/* Demo header */}
        <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-10 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Interactive Demo</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Demo content */}
        <div className="pt-16 h-full">
          {renderDemo()}
        </div>
      </motion.div>
    </motion.div>
  );
};