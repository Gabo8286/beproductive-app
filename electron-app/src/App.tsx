import React, { useEffect, useState } from 'react';
import { AutomationStudio } from './components/AutomationStudio';
import DevelopmentHub from './components/DevelopmentHub';
import { AdaptiveWorkspace } from './components/AdaptiveWorkspace';
import { ConversationalAI } from './components/ConversationalAI';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingFlow, shouldShowOnboarding } from './components/OnboardingFlow';
import { UserModeProvider } from './contexts/UserModeContext';
import { useElectronAPI, useWindowControls } from './hooks/useElectronAPI';

function App() {
  const { api, isElectron } = useElectronAPI();
  const { minimize, close } = useWindowControls();
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('workspace');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());

  // Initialize dark mode from system preference
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for menu navigation events
  useEffect(() => {
    if (!api) return;

    const handleNavigate = (event: any, route: string) => {
      setCurrentView(route.replace('/', ''));
    };

    const handleNewBrowser = () => {
      // Trigger new browser action in AutomationStudio
      console.log('New browser requested from menu');
    };

    const handleQuickTest = () => {
      // Trigger quick test in AutomationStudio
      console.log('Quick test requested from menu');
    };

    const handleOpenChat = () => {
      setCurrentView('automation'); // Switch to automation view which has chat
      // Focus on chat component
      setTimeout(() => {
        const chatInput = document.querySelector('input[placeholder*="Claude"]') as HTMLInputElement;
        if (chatInput) {
          chatInput.focus();
        }
      }, 100);
    };

    api.window.onNavigate(handleNavigate);
    api.window.onNewBrowser(handleNewBrowser);
    api.window.onQuickTest(handleQuickTest);
    api.window.onOpenChat(handleOpenChat);

    return () => {
      // Cleanup listeners if needed
    };
  }, [api]);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Cmd+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // AI Assistant (Cmd+Shift+A)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsAIAssistantOpen(true);
      }

      // Close modals on Escape
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAIAssistantOpen(false);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navigationItems = [
    { id: 'workspace', label: 'Workspace', icon: '✨' },
    { id: 'hub', label: 'Development Hub', icon: '🏗️' },
    { id: 'automation', label: 'Automation Studio', icon: '🎯' },
    { id: 'testing', label: 'Test Results', icon: '🧪' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <UserModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Custom Title Bar (for Electron) */}
      {isElectron && (
        <div className="flex items-center justify-between h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 select-none">
          {/* App Title */}
          <div className="flex items-center space-x-3 px-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              BeProductive Coding Framework
            </span>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Window Controls */}
          <div className="flex items-center space-x-2 px-4">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="AI Assistant (⌘⇧A)"
            >
              🤖
            </button>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Command Palette (⌘K)"
            >
              ⌘
            </button>
            <button
              onClick={handleThemeToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={minimize}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Minimize"
            >
              <div className="w-3 h-0.5 bg-gray-600 dark:bg-gray-400"></div>
            </button>
            <button
              onClick={close}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors group"
              title="Close"
            >
              <div className="w-3 h-3 relative">
                <div className="absolute inset-0 w-3 h-0.5 bg-gray-600 dark:bg-gray-400 group-hover:bg-red-600 transform rotate-45 translate-y-1"></div>
                <div className="absolute inset-0 w-3 h-0.5 bg-gray-600 dark:bg-gray-400 group-hover:bg-red-600 transform -rotate-45 translate-y-1"></div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">
        {currentView === 'workspace' && <AdaptiveWorkspace />}
        {currentView === 'hub' && <DevelopmentHub />}
        {currentView === 'automation' && <AutomationStudio />}

        {currentView === 'testing' && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Test Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed test results and reports will appear here
              </p>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Performance metrics and insights will be displayed here
              </p>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                ⚙️ Settings
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    General
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </label>
                      <button
                        onClick={handleThemeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          darkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-launch on startup
                      </label>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    AI Integration
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred AI Provider
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Anthropic Claude</option>
                        <option>OpenAI GPT-4</option>
                        <option>Google Gemini</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Response Speed
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Balanced</option>
                        <option>Fast</option>
                        <option>Quality</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Automation Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Automation
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Browser
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Chrome</option>
                        <option>Safari</option>
                        <option>Firefox</option>
                        <option>Edge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Screenshot Quality
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>High (100%)</option>
                        <option>Medium (80%)</option>
                        <option>Low (60%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* iPad Pro Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    iPad Pro Integration
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-enable Sidecar
                      </label>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-1" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mirror testing by default
                      </label>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  About
                </h2>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Electron:</strong> {window.versions?.electron || 'N/A'}</p>
                  <p><strong>Platform:</strong> {window.platform?.isDarwin ? 'macOS' : 'Other'}</p>
                  <p><strong>Node:</strong> {window.versions?.node || 'N/A'}</p>
                  <p><strong>Chrome:</strong> {window.versions?.chrome || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar (for non-Electron) */}
      {!isElectron && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-2">
          <div className="text-center text-yellow-800 text-sm">
            🌐 Running in web mode - Install the desktop app for full functionality
          </div>
        </div>
      )}

      {/* Global Components */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <ConversationalAI
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsAIAssistantOpen(false);
        }}
      />

      {/* Onboarding Flow */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
    </UserModeProvider>
  );
}

export default App;