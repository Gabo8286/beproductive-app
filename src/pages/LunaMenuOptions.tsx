import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Home,
  Search,
  Command,
  Grid3X3,
  CircleDot,
  Layers,
  PanelBottom,
  MessageSquare,
  Settings,
  ChevronRight,
  Cog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { MenuConfigPanel } from '@/components/luna/menu-options/MenuConfigPanel';

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

const menuOptions: MenuOption[] = [
  {
    id: 'hamburger',
    name: 'Hamburger Menu',
    description: 'Classic three-line menu that opens a slide-out drawer',
    icon: Menu,
    features: [
      'Familiar navigation pattern',
      'Space-efficient design',
      'Smooth slide animation',
      'Full navigation hierarchy'
    ],
    pros: ['Universal recognition', 'Saves screen space', 'Scalable to many items'],
    cons: ['Requires extra tap', 'Hidden navigation'],
    bestFor: 'Apps with complex navigation structures'
  },
  {
    id: 'bottom-nav',
    name: 'Bottom Navigation Bar',
    description: 'Fixed bottom bar with Luna as the center action',
    icon: PanelBottom,
    features: [
      'Always visible navigation',
      'Thumb-friendly placement',
      'Quick access to main sections',
      'Luna as primary action'
    ],
    pros: ['One-tap navigation', 'Mobile-optimized', 'Clear visual hierarchy'],
    cons: ['Limited to 3-5 items', 'Takes permanent space'],
    bestFor: 'Mobile-first applications with clear primary actions'
  },
  {
    id: 'tab-bar',
    name: 'iOS Tab Bar Style',
    description: 'Apple-style tab bar with Luna integration',
    icon: Layers,
    features: [
      'Native iOS feel',
      'Badge notifications',
      'Haptic feedback',
      'Elegant animations'
    ],
    pros: ['Platform consistency', 'User familiarity', 'Professional appearance'],
    cons: ['iOS-specific design', 'Limited customization'],
    bestFor: 'iOS-focused applications'
  },
  {
    id: 'radial',
    name: 'Radial Menu',
    description: 'Center button that expands items in a circle',
    icon: CircleDot,
    features: [
      'Unique interaction pattern',
      'Equal distance to all items',
      'Smooth radial animation',
      'Customizable angles'
    ],
    pros: ['Visually appealing', 'Efficient for touch', 'Memorable experience'],
    cons: ['Learning curve', 'Space requirements'],
    bestFor: 'Creative and playful applications'
  },
  {
    id: 'command',
    name: 'Command Palette',
    description: 'Search-first interface with AI suggestions',
    icon: Command,
    features: [
      'Keyboard-first design',
      'AI-powered suggestions',
      'Quick command execution',
      'Recent actions history'
    ],
    pros: ['Power user friendly', 'Fast navigation', 'Scalable to many actions'],
    cons: ['Requires learning', 'Not touch-optimized'],
    bestFor: 'Productivity and professional tools'
  },
  {
    id: 'action-sheet',
    name: 'Action Sheet',
    description: 'iOS-style bottom sheet that slides up',
    icon: Grid3X3,
    features: [
      'Contextual actions',
      'Swipe gestures',
      'Partial reveal states',
      'Smooth transitions'
    ],
    pros: ['Native mobile feel', 'Non-intrusive', 'Good for quick actions'],
    cons: ['Limited visibility', 'Can be accidentally dismissed'],
    bestFor: 'Mobile apps with contextual actions'
  }
];

export default function LunaMenuOptions() {
  const [selectedOption, setSelectedOption] = useState<MenuOption | null>(null);
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
            Luna Menu Transformation Lab
          </h1>
          <p className="text-gray-600 text-lg">
            Explore different ways to transform Luna's floating action button into intuitive menu systems
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-2 flex gap-1">
            {(['mobile', 'tablet', 'desktop'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setDeviceView(view)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  deviceView === view
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-2 flex gap-1">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  theme === t
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="bg-white rounded-lg shadow-sm p-2 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors">
              <Cog className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Config</span>
            </div>
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedOption(option)}
              >
                {/* iPhone Mockup Container */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                  <div className={cn(
                    'relative mx-auto bg-black rounded-[2rem] p-2',
                    deviceView === 'mobile' ? 'w-48 h-96' :
                    deviceView === 'tablet' ? 'w-64 h-80' : 'w-72 h-64'
                  )}>
                    {/* Screen */}
                    <div className={cn(
                      'w-full h-full rounded-[1.5rem] overflow-hidden flex items-center justify-center',
                      theme === 'light' ? 'bg-white' : 'bg-gray-900'
                    )}>
                      {/* Menu Preview */}
                      <div className="relative w-full h-full">
                        {/* Preview specific to each menu type */}
                        {option.id === 'hamburger' && (
                          <div className="absolute top-4 left-4">
                            <Menu className={cn(
                              'w-6 h-6',
                              theme === 'light' ? 'text-gray-800' : 'text-white'
                            )} />
                          </div>
                        )}

                        {option.id === 'bottom-nav' && (
                          <div className={cn(
                            'absolute bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-4',
                            theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
                          )}>
                            <Home className="w-5 h-5 text-gray-400" />
                            <Search className="w-5 h-5 text-gray-400" />
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                              <LunaAvatar size="small" expression="happy" />
                            </div>
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                            <Settings className="w-5 h-5 text-gray-400" />
                          </div>
                        )}

                        {option.id === 'radial' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center">
                                <LunaAvatar size="small" expression="happy" />
                              </div>
                              {/* Orbital items preview */}
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full opacity-60" />
                              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full opacity-60" />
                              <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-500 rounded-full opacity-60" />
                            </div>
                          </div>
                        )}

                        {option.id === 'command' && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4">
                            <div className={cn(
                              'rounded-lg border p-3',
                              theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-600'
                            )}>
                              <div className="flex items-center gap-2">
                                <Command className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">Type to search...</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {option.id === 'tab-bar' && (
                          <div className={cn(
                            'absolute bottom-0 left-0 right-0 h-12 border-t flex items-center justify-around',
                            theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-gray-700'
                          )}>
                            {[Home, Search, LunaAvatar, MessageSquare, Settings].map((Item, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                {Item === LunaAvatar ? (
                                  <div className="w-6 h-6">
                                    <LunaAvatar size="small" expression="happy" />
                                  </div>
                                ) : (
                                  <Item className={cn(
                                    'w-5 h-5',
                                    idx === 2 ? 'text-orange-500' : 'text-gray-400'
                                  )} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {option.id === 'action-sheet' && (
                          <div className={cn(
                            'absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-lg',
                            theme === 'light' ? 'bg-white' : 'bg-gray-800'
                          )}>
                            <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-2" />
                            <div className="p-4 space-y-2">
                              <div className={cn(
                                'h-8 rounded',
                                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                              )} />
                              <div className={cn(
                                'h-8 rounded',
                                theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                              )} />
                            </div>
                          </div>
                        )}
                      </div>
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedOption(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedOption.name}</h2>
                  <p className="text-gray-600">{selectedOption.description}</p>
                </div>
                <button
                  onClick={() => setSelectedOption(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Features</h3>
                  <ul className="space-y-2">
                    {selectedOption.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pros & Cons */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-600">Pros</h3>
                    <ul className="space-y-2">
                      {selectedOption.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">+</span>
                          <span className="text-gray-700">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-600">Cons</h3>
                    <ul className="space-y-2">
                      {selectedOption.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">−</span>
                          <span className="text-gray-700">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
                  Implement This Style
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Configuration Panel */}
      <MenuConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        theme={theme}
        deviceView={deviceView}
        onThemeChange={setTheme}
        onDeviceViewChange={setDeviceView}
      />
    </div>
  );
}