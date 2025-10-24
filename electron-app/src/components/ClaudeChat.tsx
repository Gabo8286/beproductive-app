import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../hooks/useElectronAPI';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: string;
  model?: string;
}

export function ClaudeChat() {
  const { sendMessage, generateTest, messages, isThinking, clearMessages, isElectron } = useAI();
  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const message = inputMessage.trim();
    setInputMessage('');

    if (isElectron) {
      await sendMessage(message);
    } else {
      // Mock response for web development
      setTimeout(() => {
        console.log('Mock Claude response for:', message);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    const quickPrompts = {
      'analyze-ui': 'Analyze the current UI design and provide UX improvement suggestions',
      'generate-tests': 'Generate comprehensive test scenarios for the current application',
      'performance-audit': 'Review the application performance and suggest optimizations',
      'accessibility-check': 'Audit accessibility compliance and provide WCAG recommendations'
    };

    const prompt = quickPrompts[action as keyof typeof quickPrompts];
    if (prompt) {
      setInputMessage(prompt);
      await handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-48'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            🤖 Claude Assistant
          </h3>
          {!isElectron && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Web Mode
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '🔽' : '🔼'}
          </button>
          <button
            onClick={clearMessages}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: isExpanded ? '240px' : '120px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-4">💭 Ready to help with automation and testing</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickAction('analyze-ui')}
                className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded text-blue-700 dark:text-blue-300"
              >
                🎨 Analyze UI
              </button>
              <button
                onClick={() => handleQuickAction('generate-tests')}
                className="p-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded text-green-700 dark:text-green-300"
              >
                🧪 Generate Tests
              </button>
              <button
                onClick={() => handleQuickAction('performance-audit')}
                className="p-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 rounded text-orange-700 dark:text-orange-300"
              >
                ⚡ Performance
              </button>
              <button
                onClick={() => handleQuickAction('accessibility-check')}
                className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded text-purple-700 dark:text-purple-300"
              >
                ♿ Accessibility
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.provider && (
                      <span className="text-xs bg-black/10 px-1 rounded">
                        {message.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Claude is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isElectron ? "Ask Claude anything..." : "Claude not available in web mode"}
            disabled={isThinking || !isElectron}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isThinking || !isElectron}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                     text-white rounded-md transition-colors duration-200
                     disabled:cursor-not-allowed"
          >
            {isThinking ? '⏳' : '▶️'}
          </button>
          <button
            onClick={() => inputRef.current?.focus()}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
            title="Attach file"
          >
            📎
          </button>
        </div>

        {/* Quick suggestions */}
        {inputMessage === '' && !isThinking && (
          <div className="flex flex-wrap gap-1 mt-2">
            {[
              'Take a screenshot and analyze it',
              'Generate tests for this page',
              'Check performance metrics',
              'Run accessibility audit'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                         text-gray-600 dark:text-gray-400 rounded transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}