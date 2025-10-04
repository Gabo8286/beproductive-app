import React from 'react';
import { Moon, Sun, Monitor, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';

type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

const themeConfig = {
  light: {
    label: 'Light',
    icon: Sun,
    description: 'Light mode with comfortable contrast'
  },
  dark: {
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode for reduced eye strain'
  },
  'high-contrast': {
    label: 'High Contrast',
    icon: Contrast,
    description: 'Maximum contrast for accessibility'
  },
  system: {
    label: 'System',
    icon: Monitor,
    description: 'Follow system preference'
  }
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themeConfig[theme as Theme];
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label || 'Theme'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(themeConfig).map(([themeKey, config]) => {
          const Icon = config.icon;
          const isSelected = theme === themeKey;

          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey as Theme)}
              className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center w-full">
                <Icon className="h-4 w-4 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="h-2 w-2 bg-primary rounded-full ml-2" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/small spaces
export function CompactThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast'];
    const currentIndex = themes.indexOf(theme as Theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const currentTheme = themeConfig[theme as Theme];
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-8 w-8 p-0"
      title={`Current theme: ${currentTheme?.label}. Click to cycle themes.`}
    >
      <CurrentIcon className="h-4 w-4" />
    </Button>
  );
}