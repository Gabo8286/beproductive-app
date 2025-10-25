import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Monitor, Smartphone, Tablet, Sun, Moon, Contrast, Download, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  deviceView: 'mobile' | 'tablet' | 'desktop';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onDeviceViewChange: (view: 'mobile' | 'tablet' | 'desktop') => void;
}

export const MenuConfigPanel: React.FC<MenuConfigPanelProps> = ({
  isOpen,
  onClose,
  theme,
  deviceView,
  onThemeChange,
  onDeviceViewChange
}) => {
  const [selectedMenuStyle, setSelectedMenuStyle] = useState('hamburger');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [enableSounds, setEnableSounds] = useState(false);

  const menuStyles = [
    { id: 'hamburger', name: 'Hamburger Menu', description: 'Classic slide-out navigation' },
    { id: 'bottom-nav', name: 'Bottom Navigation', description: 'Mobile-first bottom bar' },
    { id: 'tab-bar', name: 'iOS Tab Bar', description: 'Apple-style tabs' },
    { id: 'radial', name: 'Radial Menu', description: 'Circular expansion' },
    { id: 'command', name: 'Command Palette', description: 'Keyboard-first interface' },
    { id: 'action-sheet', name: 'Action Sheet', description: 'iOS bottom sheet' }
  ];

  const exportConfiguration = () => {
    const config = {
      menuStyle: selectedMenuStyle,
      theme,
      deviceView,
      animationSpeed,
      enableHaptics,
      enableSounds,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-menu-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareConfiguration = async () => {
    const config = {
      menuStyle: selectedMenuStyle,
      theme,
      deviceView,
      animationSpeed,
      enableHaptics,
      enableSounds
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Luna Menu Configuration',
          text: `Check out my Luna menu configuration: ${selectedMenuStyle} with ${theme} theme`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const configText = `Luna Menu Config:\n- Style: ${selectedMenuStyle}\n- Theme: ${theme}\n- Device: ${deviceView}\n- Speed: ${animationSpeed}x`;
      navigator.clipboard.writeText(configText);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={cn(
              'fixed top-0 right-0 h-full w-96 shadow-2xl z-50 overflow-y-auto',
              theme === 'light' ? 'bg-white' : 'bg-gray-900'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              'sticky top-0 p-6 border-b backdrop-blur-sm',
              theme === 'light'
                ? 'bg-white/95 border-gray-200'
                : 'bg-gray-900/95 border-gray-700'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className={cn(
                    'w-6 h-6',
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  )} />
                  <h2 className={cn(
                    'text-xl font-bold',
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  )}>
                    Menu Configuration
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-500'
                      : 'hover:bg-gray-800 text-gray-400'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Menu Style Selection */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Menu Style
                </h3>
                <div className="space-y-2">
                  {menuStyles.map((style) => (
                    <label
                      key={style.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors',
                        selectedMenuStyle === style.id
                          ? theme === 'light'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-orange-900/20 border-orange-800'
                          : theme === 'light'
                          ? 'border-gray-200 hover:bg-gray-50'
                          : 'border-gray-700 hover:bg-gray-800'
                      )}
                    >
                      <input
                        type="radio"
                        name="menuStyle"
                        value={style.id}
                        checked={selectedMenuStyle === style.id}
                        onChange={(e) => setSelectedMenuStyle(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className={cn(
                          'font-medium',
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        )}>
                          {style.name}
                        </p>
                        <p className={cn(
                          'text-sm',
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        )}>
                          {style.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Theme Selection */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'light', name: 'Light', icon: Sun },
                    { id: 'dark', name: 'Dark', icon: Moon }
                  ].map((themeOption) => {
                    const Icon = themeOption.icon;
                    return (
                      <button
                        key={themeOption.id}
                        onClick={() => onThemeChange(themeOption.id as 'light' | 'dark')}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                          theme === themeOption.id
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : theme === 'light'
                            ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
                            : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{themeOption.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Device View */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Device Preview
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mobile', name: 'Mobile', icon: Smartphone },
                    { id: 'tablet', name: 'Tablet', icon: Tablet },
                    { id: 'desktop', name: 'Desktop', icon: Monitor }
                  ].map((device) => {
                    const Icon = device.icon;
                    return (
                      <button
                        key={device.id}
                        onClick={() => onDeviceViewChange(device.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors',
                          deviceView === device.id
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : theme === 'light'
                            ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
                            : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{device.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Animation Speed */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Animation Speed
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm',
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    )}>
                      Slow
                    </span>
                    <span className={cn(
                      'text-sm font-medium',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      {animationSpeed}x
                    </span>
                    <span className={cn(
                      'text-sm',
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    )}>
                      Fast
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </section>

              {/* Interaction Options */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Interaction
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className={cn(
                      'font-medium',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      Enable Haptic Feedback
                    </span>
                    <input
                      type="checkbox"
                      checked={enableHaptics}
                      onChange={(e) => setEnableHaptics(e.target.checked)}
                      className="toggle"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className={cn(
                      'font-medium',
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    )}>
                      Enable Sound Effects
                    </span>
                    <input
                      type="checkbox"
                      checked={enableSounds}
                      onChange={(e) => setEnableSounds(e.target.checked)}
                      className="toggle"
                    />
                  </label>
                </div>
              </section>

              {/* Export/Share */}
              <section>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  Export Configuration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={exportConfiguration}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                      theme === 'light'
                        ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                    )}
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Export</span>
                  </button>
                  <button
                    onClick={shareConfiguration}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                      theme === 'light'
                        ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                    )}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </section>

              {/* Apply Button */}
              <section>
                <button
                  onClick={onClose}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Apply Configuration
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};