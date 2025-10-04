import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  insights?: any[];
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { generateInsights, extractTaskFromText, isConnected } = useAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Try to extract task from message
      const taskResult = await extractTaskFromText(message);

      let aiResponse = '';
      let insights = [];

      if (taskResult.confidence > 0.7) {
        aiResponse = `I've analyzed your message and extracted a task: "${taskResult.title}"`;
        if (taskResult.dueDate) {
          aiResponse += ` with due date ${taskResult.dueDate.toLocaleDateString()}`;
        }
        if (taskResult.priority) {
          aiResponse += ` and ${taskResult.priority} priority`;
        }
        aiResponse += '. Would you like me to create this task for you?';
      } else {
        // Generate insights based on the message
        const insightResults = await generateInsights(message);
        insights = insightResults;

        if (insights.length > 0) {
          aiResponse = `Here are some insights I found: ${insights.map(i => i.title).join(', ')}. `;
        }

        aiResponse += 'How can I help you be more productive today?';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        insights
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Show my insights', icon: Brain, action: () => setMessage('Show me my productivity insights') },
    { label: 'Create a task', icon: Lightbulb, action: () => setMessage('Create a task to ') },
    { label: 'Analyze my week', icon: Sparkles, action: () => setMessage('Analyze my productivity this week') }
  ];

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50 w-80 h-96"
    >
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? 'Connected' : 'Offline'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 p-3">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground text-sm py-4"
                >
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                  <p>Ask me anything about your productivity!</p>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="break-words">{msg.content}</div>
                    {msg.insights && msg.insights.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.insights.map((insight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {insight.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-muted mr-4 p-2 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                  Thinking...
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="space-y-1">
              <Separator />
              <div className="text-xs text-muted-foreground mb-1">Quick actions:</div>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  className="w-full justify-start text-xs h-7"
                  disabled={isLoading}
                >
                  <action.icon className="h-3 w-3 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              disabled={!message.trim() || isLoading}
              className="shrink-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}