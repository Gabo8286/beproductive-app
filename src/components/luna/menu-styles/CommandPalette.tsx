import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, FileText, Target, Calendar, MessageSquare, Settings, Zap, TrendingUp, Clock, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface CommandPaletteProps {
  theme?: 'light' | 'dark';
  className?: string;
}

interface CommandItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  category: string;
  shortcut?: string;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  theme = 'light',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'luna-chat',
      icon: () => <LunaAvatar size="small" expression="happy" />,
      title: 'Ask Luna AI',
      description: 'Start a conversation with your AI assistant',
      category: 'AI',
      shortcut: '⌘L'
    },
    {
      id: 'quick-note',
      icon: FileText,
      title: 'Quick Note',
      description: 'Create a new note instantly',
      category: 'Create',
      shortcut: '⌘N'
    },
    {
      id: 'new-goal',
      icon: Target,
      title: 'New Goal',
      description: 'Set a new goal or objective',
      category: 'Create',
      shortcut: '⌘G'
    },
    {
      id: 'schedule-event',
      icon: Calendar,
      title: 'Schedule Event',
      description: 'Add an event to your calendar',
      category: 'Create',
      shortcut: '⌘E'
    },
    {
      id: 'search-everything',
      icon: Search,
      title: 'Search Everything',
      description: 'Search across all your content',
      category: 'Navigation',
      shortcut: '⌘K'
    },
    {
      id: 'habit-tracker',
      icon: Zap,
      title: 'Habit Tracker',
      description: 'View and update your habits',
      category: 'Navigation',
      shortcut: '⌘H'
    },
    {
      id: 'productivity-insights',
      icon: TrendingUp,
      title: 'Productivity Insights',
      description: 'View your productivity analytics',
      category: 'Navigation',
      shortcut: '⌘I'
    },
    {
      id: 'time-tracker',
      icon: Clock,
      title: 'Time Tracker',
      description: 'Start or stop time tracking',
      category: 'Tools',
      shortcut: '⌘T'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings',
      description: 'Configure your preferences',
      category: 'Navigation',
      shortcut: '⌘,'
    },
    {
      id: 'profile',
      icon: User,
      title: 'Profile',
      description: 'View and edit your profile',
      category: 'Navigation',
      shortcut: '⌘P'
    }
  ];

  const recentCommands = [
    'Ask Luna AI',
    'Quick Note',
    'Schedule Event',
    'Productivity Insights'
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((groups, cmd) => {
    const category = cmd.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(cmd);
    return groups;
  }, {} as Record<string, CommandItem[]>);

  const togglePalette = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      togglePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCommand = filteredCommands[selectedIndex];
      if (selectedCommand?.action) {
        selectedCommand.action();
      }
      togglePalette();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
              Command Palette Demo
            </h1>
            <p className={cn(
              'text-lg mb-6',
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            )}>
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-sm font-mono">⌘K</kbd> or click the Luna button to open the command palette.
              Search and execute actions quickly with keyboard navigation.
            </p>
            <div className="flex justify-center gap-4">
              {[
                { key: '⌘K', desc: 'Open palette' },
                { key: '↑↓', desc: 'Navigate' },
                { key: 'Enter', desc: 'Execute' },
                { key: 'Esc', desc: 'Close' }
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800'
                  )}
                >
                  <kbd className={cn(
                    'px-2 py-1 rounded text-xs font-mono',
                    theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                  )}>
                    {shortcut.key}
                  </kbd>
                  <span className={cn(
                    'text-sm',
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  )}>
                    {shortcut.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Quick Actions', items: ['Create Note', 'New Goal', 'Schedule Event'], color: 'bg-blue-500' },
              { title: 'Navigation', items: ['Dashboard', 'Goals', 'Calendar'], color: 'bg-green-500' },
              { title: 'AI Features', items: ['Ask Luna', 'Insights', 'Suggestions'], color: 'bg-orange-500' }
            ].map((section, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-6 rounded-xl border',
                  theme === 'light'
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-800 border-gray-700'
                )}
              >
                <div className={cn('p-3 rounded-lg mb-4', section.color)}>
                  <Command className="w-6 h-6 text-white" />
                </div>
                <h3 className={cn(
                  'font-semibold mb-3',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className={cn(
                        'text-sm',
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      )}
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Luna Button */}
      <motion.button
        onClick={togglePalette}
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

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={togglePalette}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn(
                'rounded-2xl shadow-2xl border overflow-hidden',
                theme === 'light'
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-900 border-gray-700'
              )}>
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                  <Command className={cn(
                    'w-5 h-5',
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  )} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className={cn(
                      'flex-1 text-lg bg-transparent border-none outline-none',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}
                  />
                  <kbd className={cn(
                    'px-2 py-1 rounded text-xs font-mono',
                    theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'
                  )}>
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query === '' && (
                    <div className="p-4">
                      <h3 className={cn(
                        'text-sm font-semibold mb-3',
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      )}>
                        Recent Commands
                      </h3>
                      <div className="space-y-1">
                        {recentCommands.map((cmd, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                              theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-800'
                            )}
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={cn(
                              'text-sm',
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            )}>
                              {cmd}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {query !== '' && Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="p-4">
                      <h3 className={cn(
                        'text-sm font-semibold mb-3',
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      )}>
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {items.map((cmd, idx) => {
                          const globalIndex = filteredCommands.indexOf(cmd);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = cmd.icon;

                          return (
                            <motion.div
                              key={cmd.id}
                              onClick={() => {
                                if (cmd.action) cmd.action();
                                togglePalette();
                              }}
                              className={cn(
                                'flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors',
                                isSelected
                                  ? theme === 'light'
                                    ? 'bg-orange-50 border border-orange-200'
                                    : 'bg-orange-900/20 border border-orange-800'
                                  : theme === 'light'
                                  ? 'hover:bg-gray-50'
                                  : 'hover:bg-gray-800'
                              )}
                              layout
                            >
                              <div className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-lg',
                                isSelected
                                  ? 'bg-orange-500'
                                  : theme === 'light'
                                  ? 'bg-gray-100'
                                  : 'bg-gray-800'
                              )}>
                                {cmd.id === 'luna-chat' ? (
                                  <Icon />
                                ) : (
                                  <Icon className={cn(
                                    'w-4 h-4',
                                    isSelected ? 'text-white' : 'text-gray-500'
                                  )} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className={cn(
                                  'font-medium',
                                  theme === 'light' ? 'text-gray-900' : 'text-white'
                                )}>
                                  {cmd.title}
                                </div>
                                <div className={cn(
                                  'text-sm',
                                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                )}>
                                  {cmd.description}
                                </div>
                              </div>
                              {cmd.shortcut && (
                                <kbd className={cn(
                                  'px-2 py-1 rounded text-xs font-mono',
                                  theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'
                                )}>
                                  {cmd.shortcut}
                                </kbd>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {query !== '' && filteredCommands.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className={cn(
                        'w-12 h-12 mx-auto mb-4',
                        theme === 'light' ? 'text-gray-300' : 'text-gray-600'
                      )} />
                      <p className={cn(
                        'text-lg font-medium mb-2',
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      )}>
                        No results found
                      </p>
                      <p className={cn(
                        'text-sm',
                        theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                      )}>
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};