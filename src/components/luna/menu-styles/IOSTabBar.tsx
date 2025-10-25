import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, MessageSquare, Settings, User, Target, Calendar, FileText, TrendingUp, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface IOSTabBarProps {
  theme?: 'light' | 'dark';
  className?: string;
}

type TabId = 'today' | 'search' | 'luna' | 'inbox' | 'profile';

interface Tab {
  id: TabId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  isLuna?: boolean;
}

export const IOSTabBar: React.FC<IOSTabBarProps> = ({
  theme = 'light',
  className
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('today');

  const tabs: Tab[] = [
    { id: 'today', icon: Calendar, label: 'Today' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'luna', icon: () => <LunaAvatar size="small" expression="happy" />, label: 'Luna', isLuna: true },
    { id: 'inbox', icon: Bell, label: 'Inbox', badge: 3 },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const getTabContent = (tabId: TabId) => {
    switch (tabId) {
      case 'today':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={cn(
                  'text-3xl font-bold',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Today
                </h1>
                <p className={cn(
                  'text-lg mt-1',
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                )}>
                  Monday, October 24
                </p>
              </div>
              <div className={cn(
                'p-3 rounded-full',
                theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
              )}>
                <Settings className={cn(
                  'w-6 h-6',
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                )} />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'p-4 rounded-2xl',
                  theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
                )}
              >
                <Target className="w-8 h-8 text-blue-500 mb-2" />
                <p className={cn(
                  'text-2xl font-bold',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  7
                </p>
                <p className="text-sm text-blue-600">Goals Active</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'p-4 rounded-2xl',
                  theme === 'light' ? 'bg-green-50' : 'bg-green-900/20'
                )}
              >
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <p className={cn(
                  'text-2xl font-bold',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  85%
                </p>
                <p className="text-sm text-green-600">Completion</p>
              </motion.div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-4">
              <h2 className={cn(
                'text-xl font-semibold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Today's Focus
              </h2>

              {[
                { title: 'Review quarterly goals', completed: true, priority: 'high' },
                { title: 'Team standup meeting', completed: false, priority: 'medium' },
                { title: 'Update project documentation', completed: false, priority: 'low' },
                { title: 'Prepare presentation slides', completed: true, priority: 'high' }
              ].map((task, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border',
                    theme === 'light'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-800 border-gray-700'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  )}>
                    {task.completed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      task.completed && 'line-through text-gray-500',
                      !task.completed && (theme === 'light' ? 'text-gray-900' : 'text-white')
                    )}>
                      {task.title}
                    </p>
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    task.priority === 'high' && 'bg-red-100 text-red-700',
                    task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                    task.priority === 'low' && 'bg-gray-100 text-gray-700'
                  )}>
                    {task.priority}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <h1 className={cn(
              'text-3xl font-bold',
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              Search
            </h1>

            <div className={cn(
              'relative rounded-2xl',
              theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
            )}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search everything..."
                className={cn(
                  'w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent focus:outline-none',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, label: 'Goals', count: 12, color: 'bg-blue-500' },
                { icon: FileText, label: 'Notes', count: 84, color: 'bg-green-500' },
                { icon: Calendar, label: 'Events', count: 5, color: 'bg-purple-500' },
                { icon: MessageSquare, label: 'Chats', count: 28, color: 'bg-orange-500' }
              ].map((category, idx) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'p-4 rounded-2xl cursor-pointer',
                      theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800'
                    )}
                  >
                    <div className={cn('p-3 rounded-xl mb-3', category.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={cn(
                      'font-semibold',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      {category.label}
                    </h3>
                    <p className="text-sm text-gray-500">{category.count} items</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'luna':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl mb-4"
              >
                <LunaAvatar size="large" expression="happy" />
              </motion.div>
              <h1 className={cn(
                'text-3xl font-bold mb-2',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Luna AI
              </h1>
              <p className={cn(
                'text-lg',
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              )}>
                Your intelligent productivity companion
              </p>
            </div>

            <div className="space-y-4">
              <h2 className={cn(
                'text-xl font-semibold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Quick Actions
              </h2>

              {[
                { emoji: '⚡', title: 'Quick Capture', desc: 'Add thoughts instantly', color: 'from-blue-400 to-blue-600' },
                { emoji: '🎯', title: 'Goal Check-in', desc: 'Review your progress', color: 'from-green-400 to-green-600' },
                { emoji: '📅', title: 'Plan Tomorrow', desc: 'Set up tomorrow\'s focus', color: 'from-purple-400 to-purple-600' },
                { emoji: '💡', title: 'Get Insights', desc: 'Discover patterns & tips', color: 'from-orange-400 to-orange-600' }
              ].map((action, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl cursor-pointer',
                    theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br',
                    action.color
                  )}>
                    {action.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className={cn(
                      'font-semibold',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">{action.desc}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'inbox':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={cn(
                'text-3xl font-bold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                Inbox
              </h1>
              <span className="text-sm text-gray-500">3 unread</span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Weekly Review Reminder', time: '2 hours ago', unread: true, type: 'reminder' },
                { title: 'Goal milestone achieved!', time: '1 day ago', unread: true, type: 'achievement' },
                { title: 'Luna AI update available', time: '2 days ago', unread: false, type: 'update' },
                { title: 'Habit streak: 7 days!', time: '3 days ago', unread: false, type: 'achievement' }
              ].map((notification, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'p-4 rounded-2xl border relative',
                    notification.unread && 'border-l-4 border-l-orange-500',
                    theme === 'light'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-800 border-gray-700'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={cn(
                        'font-semibold',
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      )}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white font-bold">JD</span>
              </div>
              <h1 className={cn(
                'text-3xl font-bold',
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                John Doe
              </h1>
              <p className={cn(
                'text-lg',
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              )}>
                Productivity Master
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Target, label: 'Goals & Progress', value: '8 active' },
                { icon: TrendingUp, label: 'Productivity Score', value: '87%' },
                { icon: Calendar, label: 'Days Active', value: '142' },
                { icon: Settings, label: 'Preferences', value: null }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-2xl cursor-pointer',
                      theme === 'light' ? 'bg-white shadow-sm' : 'bg-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'p-3 rounded-xl',
                        theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                      )}>
                        <Icon className={cn(
                          'w-6 h-6',
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        )} />
                      </div>
                      <span className={cn(
                        'font-medium',
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      )}>
                        {item.label}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-sm font-medium text-orange-600">
                        {item.value}
                      </span>
                    )}
                  </motion.div>
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
    <div className={cn('relative min-h-screen pb-24', className)}>
      {/* Status Bar Simulation */}
      <div className={cn(
        'flex items-center justify-between px-6 py-2 text-sm font-medium',
        theme === 'light' ? 'text-gray-900' : 'text-white'
      )}>
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full opacity-60" />
          </div>
          <span className="ml-2">100%</span>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        'px-6 py-4',
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      )}>
        {getTabContent(activeTab)}
      </main>

      {/* iOS Tab Bar */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl',
        theme === 'light'
          ? 'bg-white/80 border-gray-200'
          : 'bg-gray-900/80 border-gray-800'
      )}>
        <div className="flex items-center justify-around px-4 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-0 relative"
                whileTap={{ scale: 0.95 }}
              >
                {tab.isLuna ? (
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0
                    }}
                    className={cn(
                      'p-2 rounded-2xl',
                      isActive ? 'bg-orange-500 shadow-lg' : ''
                    )}
                  >
                    <Icon />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      y: isActive ? -1 : 0
                    }}
                    className="relative"
                  >
                    <Icon className={cn(
                      'w-6 h-6',
                      isActive
                        ? 'text-orange-500'
                        : theme === 'light'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    )} />
                    {tab.badge && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{tab.badge}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                <motion.span
                  animate={{
                    color: isActive
                      ? theme === 'light' ? '#ea580c' : '#fb923c'
                      : theme === 'light' ? '#9ca3af' : '#6b7280',
                    fontWeight: isActive ? 600 : 400
                  }}
                  className="text-xs truncate"
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-gray-300 rounded-full" />
        </div>
      </nav>
    </div>
  );
};