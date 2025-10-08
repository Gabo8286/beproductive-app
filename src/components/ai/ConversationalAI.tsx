import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageCircle,
  Send,
  Sparkles,
  MoreHorizontal,
  Trash2,
  Download,
  Settings,
  Bot,
  User,
  Lightbulb,
  Target,
  Activity,
  CheckSquare,
  RefreshCw
} from 'lucide-react';
import { generateInsight, AIMessage } from '@/lib/ai-service';
import { APIProviderType } from '@/types/api-management';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationMessage extends AIMessage {
  type: 'user' | 'assistant' | 'system';
  suggestions?: string[];
  actions?: ConversationAction[];
}

interface ConversationAction {
  id: string;
  label: string;
  type: 'navigate' | 'create' | 'suggest';
  data?: any;
}

interface ConversationalAIProps {
  context?: {
    type: 'goal' | 'habit' | 'task' | 'general';
    data?: any;
  };
  className?: string;
  embedded?: boolean;
}

const CONVERSATION_STARTERS = [
  {
    icon: Target,
    text: "Help me set a meaningful goal",
    prompt: "I want to set a meaningful goal. Can you help me think through what I want to achieve and break it down into actionable steps?"
  },
  {
    icon: Activity,
    text: "Suggest habits for my goals",
    prompt: "I have some goals and would like suggestions for habits that could help me achieve them. Can you analyze my current goals and recommend specific habits?"
  },
  {
    icon: CheckSquare,
    text: "Organize my tasks better",
    prompt: "I'm struggling with task management and productivity. Can you help me organize my tasks more effectively and suggest better workflows?"
  },
  {
    icon: Lightbulb,
    text: "Get productivity insights",
    prompt: "Can you analyze my current progress with goals, habits, and tasks to give me insights on how to improve my productivity?"
  }
];

const QUICK_ACTIONS = [
  "How can I improve my goal progress?",
  "What habits should I focus on this week?",
  "Help me prioritize my tasks",
  "Give me motivation for today",
  "Analyze my productivity patterns"
];

export function ConversationalAI({ context, className, embedded = false }: ConversationalAIProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI productivity coach. I'm here to help you with goal setting, habit building, task management, and getting insights about your progress. What would you like to work on today?`,
      timestamp: new Date(),
      type: 'assistant',
      suggestions: QUICK_ACTIONS
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState<APIProviderType>('openai');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create context-aware prompt
      let contextPrompt = content;
      if (context?.type) {
        contextPrompt = `Context: User is working with ${context.type}${context.data ? ` (${JSON.stringify(context.data)})` : ''}.

User question: ${content}

Please provide helpful, actionable advice for productivity, goal achievement, and habit building. Be conversational and supportive. If relevant, suggest specific actions they can take.`;
      }

      const response = await generateInsight(contextPrompt, aiProvider, user.id);

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.description,
        timestamp: new Date(),
        type: 'assistant',
        suggestions: response.suggestedActions?.slice(0, 3) || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        type: 'assistant'
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "AI Assistant Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleConversationStarter = (starter: typeof CONVERSATION_STARTERS[0]) => {
    handleSendMessage(starter.prompt);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi! I'm your AI productivity coach. I'm here to help you with goal setting, habit building, task management, and getting insights about your progress. What would you like to work on today?`,
        timestamp: new Date(),
        type: 'assistant',
        suggestions: QUICK_ACTIONS
      }
    ]);
  };

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.type.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const MessageBubble = ({ message }: { message: ConversationMessage }) => (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      message.type === 'user' ? "ml-auto" : "mr-auto"
    )}>
      {message.type === 'assistant' && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="space-y-2 flex-1">
        <div className={cn(
          "p-3 rounded-lg text-sm",
          message.type === 'user'
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        )}>
          {message.content}
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                className="text-xs h-auto py-1 px-2"
                onClick={() => handleQuickAction(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>

      {message.type === 'user' && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  const ConversationInterface = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Coach</h3>
            <Badge variant="outline" className="text-xs">
              {aiProvider}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportConversation}>
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearConversation}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {/* Conversation Starters (only show at beginning) */}
          {messages.length <= 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Choose a conversation starter or ask me anything:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {CONVERSATION_STARTERS.map((starter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handleConversationStarter(starter)}
                  >
                    <starter.icon className="h-4 w-4 mr-3 shrink-0" />
                    <span className="text-sm">{starter.text}</span>
                  </Button>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about productivity, goals, or habits..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className={cn("h-[500px] border rounded-lg", className)}>
        <ConversationInterface />
      </div>
    );
  }

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <ConversationInterface />

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Assistant Settings</DialogTitle>
            <DialogDescription>
              Configure your AI assistant preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as APIProviderType)}
                className="w-full p-2 border rounded-md"
              >
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}