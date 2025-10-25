import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Send,
  Mic,
  Brain,
  Target,
  Clock,
  CheckSquare,
  ArrowRight,
  Home,
  Calendar,
  BarChart3,
  Settings,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { useLuna } from '@/components/luna/context/LunaContext';
import { useLunaFramework } from '@/components/luna/context/LunaFrameworkContext';
import { generateContextualSuggestions } from '@/utils/aiFrameworkStreaming';

interface LunaCommandCenterProps {
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path: string;
  timestamp: Date;
}

export const LunaCommandCenter: React.FC<LunaCommandCenterProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>([]);

  const {
    isOpen,
    messages,
    isTyping,
    currentContext,
    contextualSuggestions,
    sendMessage,
    setContext,
  } = useLuna();

  const { productivityProfile } = useLunaFramework();

  // Generate contextual suggestions based on current context
  useEffect(() => {
    const frameworkContext = {
      userStage: productivityProfile.currentStage,
      weekInStage: productivityProfile.weekInStage,
      completedPrinciples: productivityProfile.completedPrinciples,
      currentMetrics: productivityProfile.currentMetrics,
      wellBeingScore: productivityProfile.wellBeingScore,
      systemHealthScore: productivityProfile.systemHealthScore,
    };

    const suggestions = generateContextualSuggestions(currentContext, frameworkContext);
    setQuickActions(suggestions);
  }, [currentContext, productivityProfile]);

  // Add breadcrumb when context changes or commands are executed
  const addBreadcrumb = (label: string, path: string) => {
    setBreadcrumbs(prev => [
      { label, path, timestamp: new Date() },
      ...prev.slice(0, 4) // Keep only last 5 breadcrumbs
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    sendMessage(message);
    setInputValue('');

    // Add breadcrumb for the command
    addBreadcrumb(
      message.length > 30 ? message.substring(0, 30) + '...' : message,
      'command'
    );
  };

  const handleQuickAction = (suggestion: string) => {
    sendMessage(suggestion);
    addBreadcrumb(
      suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion,
      'quick-action'
    );
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const contextIcons = {
    capture: CheckSquare,
    plan: Target,
    engage: Zap,
    general: Brain,
  };

  const ContextIcon = contextIcons[currentContext] || Brain;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Luna Command Center</h1>
        </div>
        <p className="text-gray-600">
          AI-powered productivity assistant with BeProductive Framework guidance
        </p>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {breadcrumbs.map((breadcrumb, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {breadcrumb.label}
                  <span className="ml-2 text-gray-400">
                    {breadcrumb.timestamp.toLocaleTimeString()}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'capture', label: 'Capture', icon: CheckSquare, description: 'Add ideas & tasks' },
              { key: 'plan', label: 'Plan', icon: Target, description: 'Organize & prioritize' },
              { key: 'engage', label: 'Engage', icon: Zap, description: 'Focus & execute' },
              { key: 'general', label: 'General', icon: Brain, description: 'Open assistance' },
            ].map((ctx) => (
              <Button
                key={ctx.key}
                variant={currentContext === ctx.key ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setContext(ctx.key as any);
                  addBreadcrumb(`Switched to ${ctx.label}`, ctx.key);
                }}
              >
                <ctx.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">{ctx.label}</div>
                  <div className="text-xs text-gray-500">{ctx.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Current Context Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ContextIcon className="h-4 w-4" />
              <span>
                {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)} Mode
              </span>
              <Badge variant="outline">
                {productivityProfile.currentStage} Stage
              </Badge>
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Luna anything about your productivity..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
                </Button>
              </div>
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Quick Actions:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Suggestions */}
            {contextualSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Framework Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {contextualSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleQuickAction(suggestion)}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Luna's Response</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {messages.slice(-3).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'luna' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-600">Luna</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-600">Luna</span>
                      </div>
                      <div className="text-gray-500">Thinking...</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Navigation Links */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-700 mb-3">Navigate to App Sections:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Dashboard', icon: Home, path: '/dashboard' },
              { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
              { label: 'Calendar', icon: Calendar, path: '/calendar' },
              { label: 'Analytics', icon: BarChart3, path: '/analytics' },
            ].map((item) => (
              <Button
                key={item.path}
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = item.path;
                  addBreadcrumb(`Navigated to ${item.label}`, item.path);
                }}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Framework Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {productivityProfile.wellBeingScore}/10
              </div>
              <div className="text-sm text-gray-600">Well-being</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {productivityProfile.systemHealthScore}/10
              </div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {productivityProfile.completedPrinciples.length}/5
              </div>
              <div className="text-sm text-gray-600">Principles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                Week {productivityProfile.weekInStage}
              </div>
              <div className="text-sm text-gray-600">{productivityProfile.currentStage}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LunaCommandCenter;