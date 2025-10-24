import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserMode } from '../contexts/UserModeContext';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'project' | 'ai' | 'git' | 'deploy' | 'tools' | 'navigation' | 'settings';
  action: () => void | Promise<void>;
  keywords: string[];
  shortcut?: string;
  enabled: boolean;
  priority: number;
  context?: string[];
}

interface RecentAction {
  id: string;
  command: Command;
  timestamp: Date;
  frequency: number;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { preferences, trackFeatureUsage, shouldShowFeature } = useUserMode();

  // All available commands
  const allCommands: Command[] = useMemo(() => [
    // Project Commands
    {
      id: 'project.new',
      title: 'Create New Project',
      description: 'Start a new project from scratch or template',
      icon: '📁',
      category: 'project',
      action: async () => {
        trackFeatureUsage('project-create');
        await window.electronAPI?.invoke('hub:createProject', {
          name: 'New Project',
          type: 'react',
          template: 'react-vite'
        });
      },
      keywords: ['new', 'create', 'project', 'start'],
      shortcut: 'Cmd+N',
      enabled: true,
      priority: 100
    },
    {
      id: 'project.import',
      title: 'Import Existing Project',
      description: 'Import a project from your file system',
      icon: '📥',
      category: 'project',
      action: async () => {
        trackFeatureUsage('project-import');
        const result = await window.electronAPI?.invoke('dialog:openDirectory');
        if (result) {
          await window.electronAPI?.invoke('hub:scanDirectory', result);
        }
      },
      keywords: ['import', 'open', 'existing', 'folder'],
      shortcut: 'Cmd+O',
      enabled: true,
      priority: 90
    },
    {
      id: 'project.clone',
      title: 'Clone Repository',
      description: 'Clone a Git repository from GitHub or other sources',
      icon: '🐙',
      category: 'project',
      action: async () => {
        trackFeatureUsage('git-clone');
        const url = prompt('Enter repository URL:');
        if (url) {
          await window.electronAPI?.invoke('git:clone', url);
        }
      },
      keywords: ['clone', 'git', 'github', 'repository', 'repo'],
      enabled: shouldShowFeature('git'),
      priority: 80
    },

    // AI Commands
    {
      id: 'ai.chat',
      title: 'AI Chat',
      description: 'Open conversational AI assistant',
      icon: '🤖',
      category: 'ai',
      action: () => {
        trackFeatureUsage('ai-chat');
        // Navigate to AI chat
        window.postMessage({ type: 'navigate', path: '/ai-chat' }, '*');
      },
      keywords: ['ai', 'chat', 'assistant', 'help', 'claude'],
      shortcut: 'Cmd+/',
      enabled: true,
      priority: 95
    },
    {
      id: 'ai.generate.component',
      title: 'Generate Component',
      description: 'Create a UI component with AI',
      icon: '🎨',
      category: 'ai',
      action: async () => {
        trackFeatureUsage('asset-generate');
        const description = prompt('Describe the component you want to create:');
        if (description) {
          await window.electronAPI?.invoke('hub:createAsset', {
            id: `comp_${Date.now()}`,
            type: 'component',
            description,
            framework: 'react',
            style: 'tailwind'
          });
        }
      },
      keywords: ['generate', 'component', 'ui', 'create', 'build'],
      shortcut: 'Cmd+Shift+G',
      enabled: true,
      priority: 85
    },
    {
      id: 'ai.explain',
      title: 'Explain Code',
      description: 'Get AI explanation of selected code',
      icon: '🧠',
      category: 'ai',
      action: async () => {
        trackFeatureUsage('ai-explain');
        // This would explain currently selected code
        alert('Select code in the editor and use this command to get an AI explanation');
      },
      keywords: ['explain', 'understand', 'code', 'help'],
      shortcut: 'Cmd+Shift+E',
      enabled: true,
      priority: 75
    },
    {
      id: 'ai.optimize',
      title: 'Optimize with M4',
      description: 'Use M4 Foundation Models to optimize your code',
      icon: '⚡',
      category: 'ai',
      action: async () => {
        trackFeatureUsage('m4-optimize');
        const activeProject = await window.electronAPI?.invoke('hub:getActiveProject');
        if (activeProject) {
          await window.electronAPI?.invoke('hub:optimizeProject', {
            projectId: activeProject.id,
            optimizationType: 'm4_acceleration'
          });
        }
      },
      keywords: ['optimize', 'm4', 'performance', 'speed', 'foundation'],
      enabled: shouldShowFeature('m4-optimization'),
      priority: 70
    },

    // Git Commands
    {
      id: 'git.status',
      title: 'Git Status',
      description: 'Check current Git status',
      icon: '📊',
      category: 'git',
      action: async () => {
        trackFeatureUsage('git-status');
        await window.electronAPI?.invoke('git:status');
      },
      keywords: ['git', 'status', 'changes', 'diff'],
      enabled: shouldShowFeature('git'),
      priority: 60
    },
    {
      id: 'git.commit',
      title: 'Commit Changes',
      description: 'Commit your changes to Git',
      icon: '💾',
      category: 'git',
      action: async () => {
        trackFeatureUsage('git-commit');
        const message = prompt('Commit message:');
        if (message) {
          await window.electronAPI?.invoke('git:commit', message);
        }
      },
      keywords: ['commit', 'save', 'git', 'changes'],
      shortcut: 'Cmd+Shift+C',
      enabled: shouldShowFeature('git'),
      priority: 65
    },
    {
      id: 'git.push',
      title: 'Push to Remote',
      description: 'Push your commits to the remote repository',
      icon: '🚀',
      category: 'git',
      action: async () => {
        trackFeatureUsage('git-push');
        await window.electronAPI?.invoke('git:push');
      },
      keywords: ['push', 'remote', 'git', 'upload'],
      enabled: shouldShowFeature('git'),
      priority: 55
    },

    // Deployment Commands
    {
      id: 'deploy.netlify',
      title: 'Deploy to Netlify',
      description: 'Deploy your project to Netlify',
      icon: '🌐',
      category: 'deploy',
      action: async () => {
        trackFeatureUsage('deploy-netlify');
        await window.electronAPI?.invoke('hub:deployProject', {
          projectId: 'current',
          platform: 'netlify'
        });
      },
      keywords: ['deploy', 'netlify', 'publish', 'live'],
      enabled: shouldShowFeature('deployment'),
      priority: 70
    },
    {
      id: 'deploy.vercel',
      title: 'Deploy to Vercel',
      description: 'Deploy your project to Vercel',
      icon: '▲',
      category: 'deploy',
      action: async () => {
        trackFeatureUsage('deploy-vercel');
        await window.electronAPI?.invoke('hub:deployProject', {
          projectId: 'current',
          platform: 'vercel'
        });
      },
      keywords: ['deploy', 'vercel', 'publish', 'live'],
      enabled: shouldShowFeature('deployment'),
      priority: 70
    },
    {
      id: 'deploy.github-pages',
      title: 'Deploy to GitHub Pages',
      description: 'Deploy your project to GitHub Pages',
      icon: '🐙',
      category: 'deploy',
      action: async () => {
        trackFeatureUsage('deploy-github');
        await window.electronAPI?.invoke('hub:deployProject', {
          projectId: 'current',
          platform: 'github-pages'
        });
      },
      keywords: ['deploy', 'github', 'pages', 'publish'],
      enabled: shouldShowFeature('deployment'),
      priority: 65
    },

    // Tools Commands
    {
      id: 'tools.terminal',
      title: 'Open Terminal',
      description: 'Open integrated terminal',
      icon: '💻',
      category: 'tools',
      action: () => {
        trackFeatureUsage('terminal-open');
        window.postMessage({ type: 'toggle-panel', panel: 'terminal' }, '*');
      },
      keywords: ['terminal', 'console', 'shell', 'command'],
      shortcut: 'Ctrl+`',
      enabled: shouldShowFeature('terminal'),
      priority: 80
    },
    {
      id: 'tools.preview',
      title: 'Toggle Preview',
      description: 'Show/hide live preview panel',
      icon: '👁️',
      category: 'tools',
      action: () => {
        trackFeatureUsage('preview-toggle');
        window.postMessage({ type: 'toggle-panel', panel: 'preview' }, '*');
      },
      keywords: ['preview', 'view', 'browser', 'live'],
      shortcut: 'Cmd+Shift+P',
      enabled: true,
      priority: 75
    },
    {
      id: 'tools.format',
      title: 'Format Code',
      description: 'Format current file with Prettier',
      icon: '✨',
      category: 'tools',
      action: async () => {
        trackFeatureUsage('format-code');
        await window.electronAPI?.invoke('tools:format');
      },
      keywords: ['format', 'prettier', 'clean', 'organize'],
      shortcut: 'Shift+Alt+F',
      enabled: shouldShowFeature('formatting'),
      priority: 70
    },

    // Navigation Commands
    {
      id: 'nav.hub',
      title: 'Development Hub',
      description: 'Go to main development hub',
      icon: '🏗️',
      category: 'navigation',
      action: () => {
        window.postMessage({ type: 'navigate', path: '/hub' }, '*');
      },
      keywords: ['hub', 'home', 'main', 'dashboard'],
      enabled: true,
      priority: 85
    },
    {
      id: 'nav.projects',
      title: 'Projects',
      description: 'View all projects',
      icon: '📁',
      category: 'navigation',
      action: () => {
        window.postMessage({ type: 'navigate', path: '/projects' }, '*');
      },
      keywords: ['projects', 'files', 'workspace'],
      enabled: true,
      priority: 80
    },
    {
      id: 'nav.assets',
      title: 'Asset Studio',
      description: 'AI-powered asset creation',
      icon: '🎨',
      category: 'navigation',
      action: () => {
        window.postMessage({ type: 'navigate', path: '/assets' }, '*');
      },
      keywords: ['assets', 'components', 'ui', 'design'],
      enabled: true,
      priority: 75
    },

    // Settings Commands
    {
      id: 'settings.preferences',
      title: 'Preferences',
      description: 'Open app preferences',
      icon: '⚙️',
      category: 'settings',
      action: () => {
        window.postMessage({ type: 'navigate', path: '/settings' }, '*');
      },
      keywords: ['settings', 'preferences', 'config', 'options'],
      shortcut: 'Cmd+,',
      enabled: true,
      priority: 60
    },
    {
      id: 'settings.theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: '🌓',
      category: 'settings',
      action: () => {
        trackFeatureUsage('theme-toggle');
        window.postMessage({ type: 'toggle-theme' }, '*');
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
      shortcut: 'Cmd+Shift+T',
      enabled: true,
      priority: 55
    },
    {
      id: 'settings.mode',
      title: 'Switch User Mode',
      description: 'Change between Creator and Pro modes',
      icon: '🔄',
      category: 'settings',
      action: () => {
        const newMode = preferences.mode === 'creator' ? 'pro' : 'creator';
        window.postMessage({ type: 'switch-mode', mode: newMode }, '*');
      },
      keywords: ['mode', 'creator', 'pro', 'switch'],
      enabled: true,
      priority: 50
    }
  ], [preferences, shouldShowFeature, trackFeatureUsage]);

  // Filter and sort commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent actions and most important commands
      const recentCommandIds = recentActions
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(action => action.command.id);

      const recentCommands = recentCommandIds
        .map(id => allCommands.find(cmd => cmd.id === id))
        .filter(Boolean) as Command[];

      const importantCommands = allCommands
        .filter(cmd => cmd.enabled && cmd.priority >= 80 && !recentCommandIds.includes(cmd.id))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);

      return [...recentCommands, ...importantCommands];
    }

    const searchTerms = query.toLowerCase().split(' ');

    return allCommands
      .filter(cmd => cmd.enabled)
      .map(cmd => {
        let score = 0;
        const searchableText = [
          cmd.title,
          cmd.description,
          ...cmd.keywords,
          cmd.category
        ].join(' ').toLowerCase();

        // Exact title match gets highest score
        if (cmd.title.toLowerCase().includes(query.toLowerCase())) {
          score += 100;
        }

        // Keyword matches
        searchTerms.forEach(term => {
          if (searchableText.includes(term)) {
            score += 10;
          }
        });

        // Fuzzy matching for typos
        searchTerms.forEach(term => {
          if (searchableText.includes(term.slice(0, -1)) && term.length > 2) {
            score += 5;
          }
        });

        // Recent usage boost
        const recentAction = recentActions.find(action => action.command.id === cmd.id);
        if (recentAction) {
          score += recentAction.frequency * 2;
        }

        return { command: cmd, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.command)
      .slice(0, 10);
  }, [query, allCommands, recentActions]);

  // Load recent actions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentActions(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load recent actions:', error);
    }
  }, []);

  // Save recent actions to localStorage
  const saveRecentActions = (actions: RecentAction[]) => {
    try {
      localStorage.setItem('command-palette-recent', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save recent actions:', error);
    }
  };

  // Track command execution
  const trackCommandExecution = (command: Command) => {
    const existing = recentActions.find(action => action.command.id === command.id);

    let newRecentActions: RecentAction[];

    if (existing) {
      // Update frequency and timestamp
      newRecentActions = recentActions.map(action =>
        action.command.id === command.id
          ? { ...action, frequency: action.frequency + 1, timestamp: new Date() }
          : action
      );
    } else {
      // Add new action
      const newAction: RecentAction = {
        id: `recent_${Date.now()}`,
        command,
        timestamp: new Date(),
        frequency: 1
      };

      newRecentActions = [newAction, ...recentActions.slice(0, 19)]; // Keep max 20
    }

    setRecentActions(newRecentActions);
    saveRecentActions(newRecentActions);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = async (command: Command) => {
    setIsExecuting(true);
    trackCommandExecution(command);

    try {
      await command.action();
      onClose();
    } catch (error) {
      console.error('Command execution failed:', error);
      alert(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getCategoryIcon = (category: Command['category']): string => {
    const icons = {
      project: '📁',
      ai: '🤖',
      git: '🌿',
      deploy: '🚀',
      tools: '🔧',
      navigation: '🧭',
      settings: '⚙️'
    };
    return icons[category];
  };

  const getCategoryColor = (category: Command['category']): string => {
    const colors = {
      project: 'text-blue-600 dark:text-blue-400',
      ai: 'text-purple-600 dark:text-purple-400',
      git: 'text-green-600 dark:text-green-400',
      deploy: 'text-orange-600 dark:text-orange-400',
      tools: 'text-gray-600 dark:text-gray-400',
      navigation: 'text-indigo-600 dark:text-indigo-400',
      settings: 'text-red-600 dark:text-red-400'
    };
    return colors[category];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black bg-opacity-50">
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 mr-3">
            🔍
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands... (type to search, ↑↓ to navigate, Enter to execute)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {isExecuting && (
            <div className="ml-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {query.trim() ? 'No commands found' : 'Start typing to search commands...'}
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{command.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {command.title}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(command.category)} bg-opacity-10`}>
                            {getCategoryIcon(command.category)} {command.category}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {command.description}
                        </div>
                      </div>
                    </div>
                    {command.shortcut && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {command.shortcut}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {filteredCommands.length > 0 && (
                <>↵ Execute • ↑↓ Navigate • </>
              )}
              Esc Close
            </span>
            <span className="flex items-center space-x-4">
              <span>⚡ Powered by M4</span>
              <span>🏠 100% Offline</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global command palette hook
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  };
};

// Declare global window interface for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}