import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';

interface MenuOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
}

interface MenuOptionCardProps {
  option: MenuOption;
  deviceView: 'mobile' | 'tablet' | 'desktop';
  theme: 'light' | 'dark';
  onClick: () => void;
}

export const MenuOptionCard: React.FC<MenuOptionCardProps> = ({
  option,
  deviceView,
  theme,
  onClick
}) => {
  const Icon = option.icon;

  const getDeviceSize = () => {
    switch (deviceView) {
      case 'mobile':
        return 'w-48 h-96';
      case 'tablet':
        return 'w-64 h-80';
      case 'desktop':
        return 'w-72 h-64';
      default:
        return 'w-48 h-96';
    }
  };

  const renderMenuPreview = () => {
    const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
    const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-900';
    const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const secondaryBg = theme === 'light' ? 'bg-gray-50' : 'bg-gray-900';

    switch (option.id) {
      case 'hamburger':
        return (
          <div className="relative w-full h-full">
            {/* Header with hamburger */}
            <div className={cn('absolute top-0 left-0 right-0 h-12 border-b flex items-center px-4', cardBg, borderColor)}>
              <Icon className={cn('w-6 h-6', textColor)} />
              <span className={cn('ml-3 font-medium', textColor)}>Menu</span>
            </div>
            {/* Slide-out menu preview */}
            <div className={cn('absolute top-12 left-0 w-3/4 h-32 border-r shadow-lg', cardBg, borderColor)}>
              <div className="p-3 space-y-2">
                <div className={cn('h-4 rounded', theme === 'light' ? 'bg-gray-100' : 'bg-gray-700')} />
                <div className={cn('h-4 rounded w-3/4', theme === 'light' ? 'bg-gray-100' : 'bg-gray-700')} />
                <div className={cn('h-4 rounded w-1/2', theme === 'light' ? 'bg-gray-100' : 'bg-gray-700')} />
              </div>
            </div>
            {/* Luna in menu */}
            <div className="absolute top-16 left-3">
              <div className="flex items-center gap-2">
                <LunaAvatar size="small" expression="happy" />
                <span className={cn('text-xs font-medium', textColor)}>Luna AI</span>
              </div>
            </div>
          </div>
        );

      case 'bottom-nav':
        return (
          <div className="relative w-full h-full">
            <div className={cn(
              'absolute bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-4',
              cardBg, borderColor
            )}>
              <div className="flex flex-col items-center">
                <div className={cn('w-5 h-5 rounded', theme === 'light' ? 'bg-gray-300' : 'bg-gray-600')} />
                <span className={cn('text-xs mt-1', theme === 'light' ? 'text-gray-400' : 'text-gray-500')}>Home</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={cn('w-5 h-5 rounded', theme === 'light' ? 'bg-gray-300' : 'bg-gray-600')} />
                <span className={cn('text-xs mt-1', theme === 'light' ? 'text-gray-400' : 'text-gray-500')}>Search</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <LunaAvatar size="small" expression="happy" />
                </div>
                <span className="text-xs mt-1 text-orange-500 font-medium">Luna</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={cn('w-5 h-5 rounded', theme === 'light' ? 'bg-gray-300' : 'bg-gray-600')} />
                <span className={cn('text-xs mt-1', theme === 'light' ? 'text-gray-400' : 'text-gray-500')}>Chat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={cn('w-5 h-5 rounded', theme === 'light' ? 'bg-gray-300' : 'bg-gray-600')} />
                <span className={cn('text-xs mt-1', theme === 'light' ? 'text-gray-400' : 'text-gray-500')}>More</span>
              </div>
            </div>
            {/* Main content area */}
            <div className="absolute top-4 left-4 right-4 bottom-20">
              <div className={cn('h-full rounded-lg flex items-center justify-center', secondaryBg)}>
                <span className={cn('text-sm', theme === 'light' ? 'text-gray-400' : 'text-gray-500')}>App Content</span>
              </div>
            </div>
          </div>
        );

      case 'tab-bar':
        return (
          <div className="relative w-full h-full">
            <div className={cn(
              'absolute bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around',
              secondaryBg, borderColor
            )}>
              {['Home', 'Search', 'Luna', 'Chat', 'Settings'].map((label, idx) => (
                <div key={label} className="flex flex-col items-center">
                  {label === 'Luna' ? (
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <LunaAvatar size="small" expression="happy" />
                    </div>
                  ) : (
                    <div className={cn(
                      'w-6 h-6 rounded',
                      idx === 2 ? 'bg-orange-500' : theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                    )} />
                  )}
                  <span className={cn(
                    'text-xs mt-1',
                    label === 'Luna' ? 'text-orange-500 font-medium' : theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {/* iOS-style content */}
            <div className="absolute top-4 left-4 right-4 bottom-20">
              <div className={cn('h-full rounded-lg', secondaryBg)}>
                <div className="p-4 space-y-3">
                  <div className={cn('h-6 rounded', theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')} />
                  <div className={cn('h-4 rounded w-3/4', theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')} />
                  <div className={cn('h-4 rounded w-1/2', theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'radial':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              {/* Central Luna button */}
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <LunaAvatar size="medium" expression="happy" />
              </div>

              {/* Orbital items */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full opacity-70 flex items-center justify-center">
                <span className="text-white text-xs">📝</span>
              </div>
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 rounded-full opacity-70 flex items-center justify-center">
                <span className="text-white text-xs">✅</span>
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 rounded-full opacity-70 flex items-center justify-center">
                <span className="text-white text-xs">🎯</span>
              </div>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-pink-500 rounded-full opacity-70 flex items-center justify-center">
                <span className="text-white text-xs">💬</span>
              </div>

              {/* Connection lines */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <line x1="50" y1="30" x2="50" y2="45" stroke="orange" strokeWidth="1" opacity="0.3" />
                  <line x1="30" y1="50" x2="45" y2="50" stroke="orange" strokeWidth="1" opacity="0.3" />
                  <line x1="70" y1="50" x2="55" y2="50" stroke="orange" strokeWidth="1" opacity="0.3" />
                  <line x1="50" y1="70" x2="50" y2="55" stroke="orange" strokeWidth="1" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'command':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-5/6">
              <div className={cn(
                'rounded-lg border p-4 shadow-lg',
                cardBg, borderColor
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Type to search...</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-orange-50">
                    <LunaAvatar size="small" expression="happy" />
                    <span className={cn('text-sm', textColor)}>Ask Luna AI</span>
                    <span className="text-xs text-gray-400 ml-auto">⌘K</span>
                  </div>
                  <div className={cn('flex items-center gap-2 p-2 rounded', theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-gray-700')}>
                    <span className="text-sm">📝</span>
                    <span className={cn('text-sm', textColor)}>Quick Note</span>
                    <span className="text-xs text-gray-400 ml-auto">⌘N</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'action-sheet':
        return (
          <div className="relative w-full h-full">
            {/* Background content */}
            <div className="absolute inset-0 p-4">
              <div className={cn('h-full rounded-lg', secondaryBg)}>
                <div className="p-4 space-y-3">
                  <div className={cn('h-6 rounded', theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')} />
                  <div className={cn('h-4 rounded w-3/4', theme === 'light' ? 'bg-gray-200' : 'bg-gray-700')} />
                </div>
              </div>
            </div>

            {/* Action sheet */}
            <div className={cn(
              'absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-xl',
              cardBg
            )}>
              <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-2" />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <LunaAvatar size="medium" expression="happy" />
                  <div>
                    <h3 className={cn('font-medium', textColor)}>Luna AI Assistant</h3>
                    <p className="text-xs text-gray-400">How can I help you?</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={cn('h-8 rounded flex items-center px-3', theme === 'light' ? 'bg-gray-100' : 'bg-gray-700')}>
                    <span className={cn('text-sm', textColor)}>Quick Capture</span>
                  </div>
                  <div className={cn('h-8 rounded flex items-center px-3', theme === 'light' ? 'bg-gray-100' : 'bg-gray-700')}>
                    <span className={cn('text-sm', textColor)}>AI Chat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <Icon className={cn('w-8 h-8', textColor)} />
          </div>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* iPhone Mockup Container */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <div className={cn(
          'relative mx-auto bg-black rounded-[2rem] p-2',
          getDeviceSize()
        )}>
          {/* Screen */}
          <div className={cn(
            'w-full h-full rounded-[1.5rem] overflow-hidden',
            theme === 'light' ? 'bg-white' : 'bg-gray-900'
          )}>
            {renderMenuPreview()}
          </div>
        </div>
      </div>

      {/* Option Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 mb-4">{option.description}</p>

        <div className="space-y-2">
          <div className="text-xs text-gray-500">Best for:</div>
          <div className="text-sm font-medium text-orange-600">{option.bestFor}</div>
        </div>

        {/* Feature highlights */}
        <div className="mt-4 flex flex-wrap gap-1">
          {option.features.slice(0, 2).map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
          {option.features.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              +{option.features.length - 2} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};