import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mic, MicOff, Bot, User } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { AIMessage } from '@/lib/ai-service';

interface ConversationalInterfaceProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  onTaskCreated?: (task: any) => void;
  onInsightGenerated?: (insight: any) => void;
}

export const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  className,
  placeholder,
  showSuggestions = true,
  onTaskCreated,
  onInsightGenerated
}) => {
  const { t } = useI18n('ai');
  const {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    extractTask,
    generateInsights
  } = useAI();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    try {
      // Send message to AI
      const response = await sendMessage(userMessage);

      // Check if message indicates task creation
      if (userMessage.toLowerCase().includes('remind') ||
          userMessage.toLowerCase().includes('task') ||
          userMessage.toLowerCase().includes('todo')) {
        const taskData = await extractTask(userMessage);
        if (taskData.confidence > 0.7 && onTaskCreated) {
          onTaskCreated(taskData);
        }
      }

      // Check for insight requests
      if (userMessage.toLowerCase().includes('how am i doing') ||
          userMessage.toLowerCase().includes('insights') ||
          userMessage.toLowerCase().includes('analysis')) {
        const insights = await generateInsights();
        if (insights.length > 0 && onInsightGenerated) {
          onInsightGenerated(insights[0]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      inputRef.current?.focus();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const suggestions = [
    'What should I work on next?',
    'Create a task to call the client tomorrow',
    'How am I doing on my goals?',
    'Show me my productivity patterns',
    'What are my peak productivity hours?',
    'Help me prioritize my tasks'
  ];

  const MessageBubble: React.FC<{ message: AIMessage }> = ({ message }) => (
    <div className={cn(
      'flex gap-3 mb-4',
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      {message.role === 'assistant' && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-2',
        message.role === 'user'
          ? 'bg-primary text-primary-foreground ml-auto'
          : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-secondary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          {t('aiAssistant', 'AI Assistant')}
          <Badge variant="secondary" className="ml-auto">
            {t('online', 'Online')}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('welcomeMessage', "Hi! I'm your AI productivity assistant")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('helpText', 'I can help you manage tasks, analyze your productivity, and provide insights.')}
              </p>

              {showSuggestions && (
                <div className="space-y-2 w-full max-w-md">
                  <p className="text-sm font-medium">{t('tryThese', 'Try these commands:')}</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t('thinking', 'Thinking...')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder || t('inputPlaceholder', 'Ask me anything about your productivity...')}
                disabled={isLoading}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleVoiceInput}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Quick Actions */}
          {showSuggestions && messages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.slice(3, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(suggestion)}
                  className="text-xs text-muted-foreground"
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalInterface;