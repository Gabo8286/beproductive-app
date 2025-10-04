import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Brain,
  Loader2,
  Settings,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProductivityCoach } from '@/hooks/useProductivityCoach';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'suggestion' | 'insight' | 'question' | 'encouragement';
    confidence?: number;
    relatedData?: any;
  };
}

interface CoachingSession {
  id: string;
  title: string;
  startedAt: Date;
  lastActiveAt: Date;
  messageCount: number;
  focus: string;
}

export function ProductivityCoachAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini' | 'lovable'>('lovable');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    getSuggestions,
    getQuickActions,
    getProductivityInsights,
    isGenerating
  } = useProductivityCoach(selectedProvider);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = () => {
    const newSession: CoachingSession = {
      id: crypto.randomUUID(),
      title: 'New Coaching Session',
      startedAt: new Date(),
      lastActiveAt: new Date(),
      messageCount: 0,
      focus: 'general'
    };

    setCurrentSession(newSession);
    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Hello! I'm your AI productivity coach. I'm here to help you optimize your workflow, achieve your goals, and maintain a healthy work-life balance.

How can I assist you today? I can help with:
• Task prioritization and planning
• Goal setting and tracking
• Time management strategies
• Productivity insights and analysis
• Habit formation and optimization
• Stress management and burnout prevention

What would you like to focus on?`,
      timestamp: new Date(),
      metadata: {
        type: 'question',
        confidence: 1.0
      }
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: inputMessage.trim(),
        userId: user.id,
        sessionContext: {
          sessionId: currentSession?.id || '',
          messageHistory: messages.slice(-5), // Last 5 messages for context
          userFocus: currentSession?.focus || 'general'
        }
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          type: response.type || 'suggestion',
          confidence: response.confidence || 0.8,
          relatedData: response.relatedData
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          lastActiveAt: new Date(),
          messageCount: currentSession.messageCount + 2
        });
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again or rephrase your question.',
        timestamp: new Date(),
        metadata: {
          type: 'question',
          confidence: 0.5
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await getQuickActions(user!.id, action);

      const actionMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          type: 'insight',
          confidence: response.confidence
        }
      };

      setMessages(prev => [...prev, actionMessage]);
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSession(null);
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm');
  };

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="h-3 w-3 text-yellow-500" />;
      case 'insight':
        return <TrendingUp className="h-3 w-3 text-blue-500" />;
      case 'question':
        return <MessageSquare className="h-3 w-3 text-green-500" />;
      case 'encouragement':
        return <Target className="h-3 w-3 text-purple-500" />;
      default:
        return <Brain className="h-3 w-3 text-gray-500" />;
    }
  };

  const quickActions = [
    { id: 'priorities', label: 'What should I focus on today?', icon: Target },
    { id: 'time-management', label: 'Help me manage my time better', icon: Clock },
    { id: 'goal-progress', label: 'Review my goal progress', icon: TrendingUp },
    { id: 'productivity-tips', label: 'Give me productivity tips', icon: Lightbulb },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" />
          AI Coach
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Productivity Coach
              </DialogTitle>
              <DialogDescription>
                Your AI-powered productivity assistant
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lovable">Lovable</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Welcome to your AI Productivity Coach!</h3>
                <p className="text-muted-foreground text-sm">
                  Start a conversation to get personalized productivity insights and recommendations.
                </p>
              </div>
              <Button onClick={startNewSession} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Coaching Session
              </Button>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          {message.metadata?.type && getMessageTypeIcon(message.metadata.type)}
                          <span>{formatMessageTime(message.timestamp)}</span>
                        </div>
                        {message.metadata?.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.metadata.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Quick Actions */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 py-2 border-t">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className="text-xs gap-1"
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          {messages.length > 0 && (
            <div className="p-4 border-t flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your productivity coach anything..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}