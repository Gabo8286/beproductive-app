import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, MessageSquare, Settings, Target, Calendar, Zap, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface BottomNavigationProps {
  theme?: 'light' | 'dark';
  className?: string;
}

type TabId = 'home' | 'search' | 'luna' | 'chat' | 'profile';

interface Tab {
  id: TabId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isLuna?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  theme = 'light',
  className
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const tabs: Tab[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'luna', icon: () => <LunaAvatar size="small" expression="happy" />, label: 'Luna', isLuna: true },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const getTabContent = (tabId: TabId) => {
    switch (tabId) {
      case 'home':
        return (
          <div className="space-y-6">
            <h1 className={cn(
              'text-2xl font-bold',
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Target, title: 'Goals', count: '3 active', color: 'bg-blue-500' },
                { icon: Calendar, title: 'Calendar', count: '2 today', color: 'bg-green-500' },
                { icon: Zap, title: 'Habits', count: '5 streak', color: 'bg-purple-500' },
                { icon: FileText, title: 'Notes', count: '12 items', color: 'bg-orange-500' }
              ].map((widget, idx) => {
                const Icon = widget.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer',
                      theme === 'light'
                        ? 'bg-white border-gray-200 hover:shadow-md'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn('p-2 rounded-lg', widget.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className={cn(
                        'font-semibold',
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      )}>
                        {widget.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">{widget.count}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <h1 className={cn(
              'text-2xl font-bold',
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              Search
            </h1>
            <div className={cn(
              'relative rounded-lg border',
              theme === 'light' ? 'border-gray-300' : 'border-gray-600'
            )}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, notes, goals..."
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500',
                  theme === 'light'
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-white'
                )}
              />
            </div>
            <div className="space-y-3">
              <h3 className={cn(
                'font-semibold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Recent Searches
              </h3>
              {['morning routine', 'project deadlines', 'workout plan'].map((search, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer',
                    theme === 'light'
                      ? 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  )}>
                    {search}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'luna':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <LunaAvatar size="large" expression="happy" />
                <h1 className={cn(
                  'text-2xl font-bold',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Luna AI Assistant
                </h1>
              </div>
              <p className={cn(
                'text-lg',
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              )}>
                How can I help you be more productive today?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Quick Capture', desc: 'Add tasks, notes, or ideas instantly', emoji: '⚡' },
                { title: 'Daily Planning', desc: 'Plan your day with AI assistance', emoji: '📅' },
                { title: 'Goal Insights', desc: 'Get insights on your progress', emoji: '🎯' },
                { title: 'Smart Suggestions', desc: 'Receive personalized recommendations', emoji: '💡' }
              ].map((action, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer',
                    theme === 'light'
                      ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                      : 'bg-orange-900/20 border-orange-800 hover:bg-orange-900/30'
                  )}
                >
                  <div className="text-2xl mb-2">{action.emoji}</div>
                  <h3 className={cn(
                    'font-semibold mb-1',
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  )}>
                    {action.title}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  )}>
                    {action.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-6">
            <h1 className={cn(
              'text-2xl font-bold',
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              Chat History
            </h1>
            <div className="space-y-4">
              {[
                { time: '2 hours ago', preview: 'How can I improve my morning routine?', unread: false },
                { time: '1 day ago', preview: 'Help me plan my project timeline', unread: true },
                { time: '3 days ago', preview: 'What are some good productivity habits?', unread: false }
              ].map((chat, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer',
                    theme === 'light'
                      ? 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <LunaAvatar size="small" expression="neutral" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          'font-medium',
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        )}>
                          Luna AI
                        </span>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className={cn(
                        'text-sm',
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      )}>
                        {chat.preview}
                      </p>
                      {chat.unread && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">JD</span>
              </div>
              <h1 className={cn(
                'text-2xl font-bold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                John Doe
              </h1>
              <p className={cn(
                'text-lg',
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              )}>
                Productivity Enthusiast
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Settings, label: 'Settings', badge: null },
                { icon: Target, label: 'Goals Progress', badge: '87%' },
                { icon: Zap, label: 'Habit Streaks', badge: '5 active' },
                { icon: FileText, label: 'Export Data', badge: null }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border cursor-pointer',
                      theme === 'light'
                        ? 'bg-white border-gray-200 hover:bg-gray-50'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    )}
                  >
                    <div className="flex items-center gap-3">
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
                    </div>
                    {item.badge && (
                      <span className="text-sm text-orange-600 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('relative min-h-screen pb-20', className)}>
      {/* Main Content */}
      <main className={cn(
        'p-6',
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      )}>
        <div className="max-w-4xl mx-auto">
          {getTabContent(activeTab)}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm',
        theme === 'light'
          ? 'bg-white/95 border-gray-200'
          : 'bg-gray-900/95 border-gray-700'
      )}>
        <div className="flex items-center justify-around px-4 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-0"
                whileTap={{ scale: 0.95 }}
              >
                {tab.isLuna ? (
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                    className={cn(
                      'p-2 rounded-full',
                      isActive ? 'bg-orange-500 shadow-lg' : 'bg-gray-200'
                    )}
                  >
                    <Icon />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                  >
                    <Icon className={cn(
                      'w-6 h-6',
                      isActive
                        ? 'text-orange-500'
                        : theme === 'light'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    )} />
                  </motion.div>
                )}

                <motion.span
                  animate={{
                    color: isActive
                      ? theme === 'light' ? '#ea580c' : '#fb923c'
                      : theme === 'light' ? '#9ca3af' : '#6b7280'
                  }}
                  className="text-xs font-medium truncate"
                >
                  {tab.label}
                </motion.span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};