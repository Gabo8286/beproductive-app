import React, { useState, useEffect } from 'react';
import { adaptiveInterface } from '../services/adaptive-interface';
import { trustedAI } from '../services/trusted-ai-service';
import { analyticsService } from '../services/analytics-service';

interface AdaptiveWorkspaceProps {
  className?: string;
}

export const AdaptiveWorkspace: React.FC<AdaptiveWorkspaceProps> = ({ className = '' }) => {
  const [settings, setSettings] = useState(adaptiveInterface.getSettings());
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [activeView, setActiveView] = useState<'creator' | 'code' | 'preview'>('creator');

  useEffect(() => {
    // Listen for interface settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('interface-settings-changed', handleSettingsChange as EventListener);
    return () => window.removeEventListener('interface-settings-changed', handleSettingsChange as EventListener);
  }, []);

  const handleAIRequest = async (prompt: string, task: string = 'code-generation') => {
    setIsAIProcessing(true);
    setCurrentTask(task);

    try {
      const response = await trustedAI.processRequest({
        id: Date.now().toString(),
        provider: trustedAI.getActiveProvider(),
        task: task as any,
        prompt,
        context: {
          projectType: 'web-app',
          framework: 'react',
          userLevel: settings.persona === 'learner' ? 'beginner' : 'intermediate'
        },
        settings: {
          includeExplanation: settings.contextualHelp,
          codeOnly: !settings.showCode,
          followBestPractices: true
        }
      });

      if (response.success) {
        setAiResponse(response.content);
        if (response.explanation && settings.contextualHelp) {
          setAiResponse(prev => prev + '\\n\\n' + response.explanation);
        }

        // Auto-switch to code view if code was generated and user allows it
        if (response.metadata.codeBlocks && response.metadata.codeBlocks.length > 0 && !settings.autoHideComplexity) {
          setActiveView('code');
        }
      } else {
        setAiResponse('Sorry, I encountered an error: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      setAiResponse('Error processing your request. Please try again.');
    } finally {
      setIsAIProcessing(false);
      setCurrentTask('');
    }
  };

  const handleQuickAction = (action: string) => {
    adaptiveInterface.trackAction(action);

    const quickPrompts = {
      'create-component': 'Create a modern React component for a user profile card with avatar, name, and bio',
      'create-page': 'Create a complete React page with navigation, hero section, and footer',
      'create-form': 'Create a contact form with validation using React Hook Form',
      'create-animation': 'Create a smooth fade-in animation using Framer Motion',
      'explain-react': 'Explain React hooks and state management in simple terms',
      'debug-code': 'Help me debug a React component that\'s not rendering properly'
    };

    const prompt = quickPrompts[action as keyof typeof quickPrompts];
    if (prompt) {
      setUserInput(prompt);
      handleAIRequest(prompt);
    }
  };

  const uiClasses = adaptiveInterface.getUIClasses().join(' ');

  return (
    <div className={`adaptive-workspace ${uiClasses} ${className}`}>
      {/* Interface Mode Toggle */}
      {!settings.minimalistUI && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <button
            onClick={() => adaptiveInterface.setMode('simple')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              settings.mode === 'simple'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => adaptiveInterface.setMode('balanced')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              settings.mode === 'balanced'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Balanced
          </button>
          <button
            onClick={() => adaptiveInterface.setMode('developer')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              settings.mode === 'developer'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Pro
          </button>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar - File Tree (conditional) */}
        {adaptiveInterface.shouldShowComponent('file-tree') && (
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Project Files</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">📁</span> src/
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 ml-4">
                <span className="mr-2">📄</span> App.tsx
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 ml-4">
                <span className="mr-2">📄</span> components/
              </div>
              <div className="flex items-center text-blue-600 dark:text-blue-400 ml-8">
                <span className="mr-2">📄</span> UserCard.tsx
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {settings.persona === 'creator' ? '✨ Create Something Amazing' :
                   settings.persona === 'developer' ? '⚡ Development Workspace' :
                   '🎯 Project Builder'}
                </h1>

                {/* View Toggles */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('creator')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      activeView === 'creator'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Creator
                  </button>

                  {settings.showCode && (
                    <button
                      onClick={() => setActiveView('code')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        activeView === 'code'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Code
                    </button>
                  )}

                  <button
                    onClick={() => setActiveView('preview')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      activeView === 'preview'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* AI Provider Status */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{trustedAI.getActiveProvider() === 'claude-code' ? 'Claude Code' :
                       trustedAI.getActiveProvider() === 'grok' ? 'Grok AI' : 'Local M4'}</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'creator' && (
              <CreatorView
                settings={settings}
                onAIRequest={handleAIRequest}
                isProcessing={isAIProcessing}
                userInput={userInput}
                setUserInput={setUserInput}
                aiResponse={aiResponse}
                onQuickAction={handleQuickAction}
              />
            )}

            {activeView === 'code' && adaptiveInterface.shouldShowComponent('code-editor') && (
              <CodeView
                settings={settings}
                aiResponse={aiResponse}
                isProcessing={isAIProcessing}
              />
            )}

            {activeView === 'preview' && (
              <PreviewView
                settings={settings}
                aiResponse={aiResponse}
              />
            )}
          </div>

          {/* Terminal (conditional) */}
          {adaptiveInterface.shouldShowComponent('terminal') && (
            <div className="h-48 bg-gray-900 text-green-400 p-4 font-mono text-sm border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400">BeProductive Terminal</span>
              </div>
              <div>$ npm run dev</div>
              <div className="text-gray-400">🚀 Development server running at http://localhost:3000</div>
              <div className="animate-pulse">█</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Creator View - Simplified interface for non-coders
const CreatorView: React.FC<{
  settings: any;
  onAIRequest: (prompt: string) => void;
  isProcessing: boolean;
  userInput: string;
  setUserInput: (value: string) => void;
  aiResponse: string;
  onQuickAction: (action: string) => void;
}> = ({ settings, onAIRequest, isProcessing, userInput, setUserInput, aiResponse, onQuickAction }) => {
  const quickActions = [
    { id: 'create-component', label: 'Create Component', icon: '🧩', description: 'Build a reusable UI component' },
    { id: 'create-page', label: 'Create Page', icon: '📄', description: 'Build a complete web page' },
    { id: 'create-form', label: 'Create Form', icon: '📝', description: 'Build a contact or signup form' },
    { id: 'create-animation', label: 'Add Animation', icon: '✨', description: 'Add smooth animations' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      {!aiResponse && settings.guidedWorkflow && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            👋 Welcome to BeProductive!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tell me what you want to build, and I'll create it for you. No coding required!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => onQuickAction(action.id)}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💬 Chat with AI Assistant
          </h3>

          <div className="space-y-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe what you want to build... For example: 'Create a user profile card with avatar and bio'"
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />

            <button
              onClick={() => onAIRequest(userInput)}
              disabled={isProcessing || !userInput.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create with AI ✨'
              )}
            </button>
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              🤖 AI Response
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {aiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Code View - For users who want to see/edit code
const CodeView: React.FC<{
  settings: any;
  aiResponse: string;
  isProcessing: boolean;
}> = ({ settings, aiResponse, isProcessing }) => {
  return (
    <div className="h-full flex">
      <div className="flex-1 p-4">
        <div className="bg-gray-900 rounded-lg h-full overflow-auto">
          <div className="flex items-center space-x-2 p-4 border-b border-gray-700">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm">UserCard.tsx</span>
          </div>

          <div className="p-4 font-mono text-sm">
            {isProcessing ? (
              <div className="text-gray-400">
                <div className="animate-pulse">Generating code...</div>
              </div>
            ) : aiResponse ? (
              <pre className="text-green-400 whitespace-pre-wrap">{aiResponse}</pre>
            ) : (
              <div className="text-gray-500">
                // Your generated code will appear here
                // Use the Creator view to generate components
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview View - Visual preview of created components
const PreviewView: React.FC<{
  settings: any;
  aiResponse: string;
}> = ({ settings, aiResponse }) => {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            👀 Live Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            See your creation come to life
          </p>
        </div>

        <div className="p-6 flex items-center justify-center h-full">
          {aiResponse ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Component Preview
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Your component would render here in a real implementation
              </p>

              {/* Sample component preview */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">John Doe</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">UI/UX Designer</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">📱</div>
              <p>Create something to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};