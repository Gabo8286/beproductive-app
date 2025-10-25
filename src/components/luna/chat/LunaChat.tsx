import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, X, Sparkles, FileText, Mic, Upload, Target, CheckSquare, Folder, Play, Calendar, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLuna, useLunaChat } from '@/components/luna/context/LunaContext';
import { LunaAvatar } from '@/components/luna/core/LunaAvatar';
import { LUNA_COLORS } from '@/assets/luna/luna-assets';
import { LunaTypingIndicator } from '@/components/luna/animations/LunaAnimations';
import { PromptSuggestions } from '@/components/luna/prompt-library/PromptSuggestions';
import { useNavigate } from 'react-router-dom';

interface LunaChatProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  showHeader?: boolean;
  compact?: boolean;
}

export const LunaChat: React.FC<LunaChatProps> = ({
  className,
  onClose,
  autoFocus = true,
  showHeader = true,
  compact = false,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    currentContext,
    currentExpression,
    lunaPersonality,
    hasUnreadMessages,
    markMessagesAsRead
  } = useLuna();

  const {
    isOpen,
    messages,
    isTyping,
    sendMessage,
    clearMessages
  } = useLunaChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoFocus]);

  // Mark messages as read when chat is visible
  useEffect(() => {
    if (isOpen && hasUnreadMessages) {
      markMessagesAsRead();
    }
  }, [isOpen, hasUnreadMessages, markMessagesAsRead]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    sendMessage(input.trim(), currentContext);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContextEmoji = (context: string) => {
    switch (context) {
      case 'capture': return '📝';
      case 'plan': return '📋';
      case 'engage': return '🎯';
      default: return '🦊';
    }
  };

  const getPersonalityGreeting = () => {
    switch (lunaPersonality) {
      case 'enthusiastic':
        return "Hey there! I'm Luna, and I'm SO excited to help you be more productive! 🌟";
      case 'focused':
        return "Hello. I'm Luna, your AI productivity assistant. Let's get things done efficiently.";
      default:
        return "Hi! I'm Luna, your friendly AI productivity companion. How can I help you today? 🦊";
    }
  };

  const getContextActions = (context: string) => {
    switch (context) {
      case 'capture':
        return [
          { icon: FileText, label: 'Quick Note', path: '/notes' },
          { icon: Upload, label: 'Upload File', path: '/notes' },
          { icon: CheckSquare, label: 'Add Task', path: '/tasks' },
        ];
      case 'plan':
        return [
          { icon: Target, label: 'New Goal', path: '/goals' },
          { icon: CheckSquare, label: 'Add Task', path: '/tasks' },
          { icon: Folder, label: 'New Project', path: '/projects' },
        ];
      case 'engage':
        return [
          { icon: Play, label: 'Start Timer', path: '/pomodoro' },
          { icon: Calendar, label: 'View Calendar', path: '/calendar' },
          { icon: BookOpen, label: 'Reflection', path: '/reflections' },
        ];
      default:
        return [];
    }
  };

  const contextActions = getContextActions(currentContext);

  return (
    <div
      className={cn(
        'flex flex-col bg-white rounded-xl shadow-xl border',
        'overflow-hidden transition-all duration-300',
        compact ? 'h-96' : 'h-[500px]',
        className
      )}
      style={{
        borderColor: LUNA_COLORS.furLight + '40',
        boxShadow: `0 10px 25px ${LUNA_COLORS.furPrimary}20, 0 0 0 1px ${LUNA_COLORS.furLight}20`,
      }}
    >
      {/* Header */}
      {showHeader && (
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            background: `linear-gradient(135deg, ${LUNA_COLORS.furLight}10 0%, ${LUNA_COLORS.lanternGlow}05 100%)`,
            borderBottomColor: LUNA_COLORS.furLight + '20',
          }}
        >
          <div className="flex items-center gap-3">
            <LunaAvatar
              size="small"
              expression={currentExpression}
              animated={true}
            />
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Luna
                <span className="text-xs">{getContextEmoji(currentContext)}</span>
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {currentContext} assistant • {lunaPersonality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Clear conversation"
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div className="text-center py-6">
              <LunaAvatar
                size="large"
                expression="happy"
                className="mx-auto mb-4"
                context={currentContext}
                showContextGlow={true}
                entrance="bounceIn"
                animated={true}
              />
              <p
                className="text-sm mb-2 font-medium"
                style={{ color: LUNA_COLORS.furPrimary }}
              >
                {getPersonalityGreeting()}
              </p>
              <p className="text-xs text-gray-500">
                I can help you capture ideas, plan your work, and stay focused on your goals.
              </p>
            </div>
          )}

          {/* Message History */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'luna' && (
                <LunaAvatar
                  size="small"
                  expression={currentExpression}
                  className="mt-1 flex-shrink-0"
                  context={currentContext}
                  animated={true}
                />
              )}

              <div
                className={cn(
                  'max-w-[75%] rounded-xl px-4 py-3 text-sm',
                  message.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-sm'
                    : 'bg-gray-50 text-gray-900 rounded-bl-sm border',
                )}
                style={message.role === 'luna' ? {
                  borderColor: LUNA_COLORS.furLight + '30',
                  backgroundColor: LUNA_COLORS.furLight + '08',
                } : undefined}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                  <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {message.context && (
                    <span className="text-xs opacity-60">
                      {getContextEmoji(message.context)}
                    </span>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium mt-1 flex-shrink-0">
                  You
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <LunaAvatar
                size="small"
                expression="thinking"
                className="mt-1 flex-shrink-0"
                context={currentContext}
                animated={true}
                animationType="sway"
              />

              <div
                className="bg-gray-50 rounded-xl rounded-bl-sm px-4 py-3 border"
                style={{
                  borderColor: LUNA_COLORS.furLight + '30',
                  backgroundColor: LUNA_COLORS.furLight + '08',
                }}
              >
                <div className="flex items-center gap-3">
                  <LunaTypingIndicator
                    dotColor={LUNA_COLORS.furPrimary}
                    className="flex-shrink-0"
                  />
                  <span className="text-xs text-gray-500">
                    Luna is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div
        className="border-t p-4"
        style={{ borderTopColor: LUNA_COLORS.furLight + '20' }}
      >
        {/* Context Quick Actions */}
        {contextActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {contextActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  onClick={() => {
                    navigate(action.path);
                    onClose?.();
                  }}
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Prompt Suggestions */}
        {messages.length === 0 && (
          <div className="mb-4">
            <PromptSuggestions
              context={currentContext}
              maxSuggestions={3}
              onPromptSelect={(prompt) => {
                setInput(`Help me with ${prompt.description.toLowerCase()}`);
                inputRef.current?.focus();
              }}
            />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask Luna about ${currentContext}...`}
            disabled={isTyping}
            className="flex-1 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />

          <Button
            type="submit"
            disabled={isTyping || !input.trim()}
            size="sm"
            className="rounded-xl px-4"
            style={{
              backgroundColor: LUNA_COLORS.furPrimary,
              color: 'white',
            }}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Context Indicator */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{getContextEmoji(currentContext)}</span>
            <span>Currently in {currentContext} mode</span>
          </div>

          <div className="text-xs text-gray-400">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunaChat;