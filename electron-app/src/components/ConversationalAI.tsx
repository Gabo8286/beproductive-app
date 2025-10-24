import React, { useState, useEffect, useRef } from 'react';
import { useUserMode } from '../contexts/UserModeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'action' | 'suggestion' | 'tutorial';
  metadata?: {
    project?: string;
    action?: string;
    confidence?: number;
    followUpActions?: FollowUpAction[];
  };
}

interface FollowUpAction {
  id: string;
  label: string;
  action: string;
  icon: string;
  type: 'quick' | 'detailed' | 'tutorial';
}

interface ConversationContext {
  currentProject?: string;
  userGoal?: string;
  skillLevel: string;
  recentActions: string[];
  preferences: any;
}

interface AIPersonality {
  name: string;
  role: string;
  style: 'casual' | 'professional' | 'encouraging' | 'expert';
  specialization: string[];
  avatar: string;
}

export const ConversationalAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    skillLevel: 'beginner',
    recentActions: [],
    preferences: {}
  });
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality>({
    name: 'Spark',
    role: 'Your Personal Development Assistant',
    style: 'encouraging',
    specialization: ['project-creation', 'code-generation', 'deployment'],
    avatar: '🚀'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { preferences, isCreatorMode, trackFeatureUsage } = useUserMode();

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    updatePersonalityForMode();
  }, [preferences.mode, preferences.experience]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: getPersonalizedWelcome(),
      timestamp: new Date(),
      type: 'text',
      metadata: {
        followUpActions: getWelcomeActions()
      }
    };

    setMessages([welcomeMessage]);
  };

  const updatePersonalityForMode = () => {
    if (isCreatorMode) {
      setCurrentPersonality({
        name: 'Spark',
        role: 'Your Creative Assistant',
        style: 'encouraging',
        specialization: ['visual-design', 'idea-development', 'simple-deployment'],
        avatar: '🎨'
      });
    } else {
      setCurrentPersonality({
        name: 'Spark Pro',
        role: 'Your Development Partner',
        style: 'professional',
        specialization: ['advanced-coding', 'architecture', 'devops'],
        avatar: '⚡'
      });
    }
  };

  const getPersonalizedWelcome = (): string => {
    const { mode, experience } = preferences;

    if (mode === 'creator') {
      return `Hey there! 👋 I'm Spark, your creative assistant. I'm here to help you bring your ideas to life without any coding headaches!

What would you like to create today? I can help you build:
• Beautiful websites
• Mobile apps
• Online stores
• Portfolios
• And much more!

Just tell me your idea in plain English - like "I want to create a restaurant website with online ordering" - and I'll guide you through everything step by step.`;
    }

    if (experience === 'beginner') {
      return `Welcome to BeProductive Coding Framework! 🚀 I'm your AI development assistant, and I'm excited to help you start your coding journey.

I can help you:
• Learn programming concepts step by step
• Build real projects while learning
• Understand code explanations in plain English
• Set up your development environment
• Deploy your projects to the web

What would you like to learn or build today?`;
    }

    return `Welcome back to BeProductive Coding Framework! ⚡ Ready to build something amazing?

I'm here to help with:
• Advanced project architecture
• Code optimization and review
• Complex deployment scenarios
• Team collaboration setup
• Performance optimization

What are you working on today?`;
  };

  const getWelcomeActions = (): FollowUpAction[] => {
    if (isCreatorMode) {
      return [
        {
          id: 'create-website',
          label: 'Create a Website',
          action: 'start-website-wizard',
          icon: '🌐',
          type: 'quick'
        },
        {
          id: 'create-app',
          label: 'Build an App',
          action: 'start-app-wizard',
          icon: '📱',
          type: 'quick'
        },
        {
          id: 'explore-templates',
          label: 'Browse Templates',
          action: 'show-templates',
          icon: '📋',
          type: 'quick'
        },
        {
          id: 'take-tour',
          label: 'Take a Tour',
          action: 'start-tour',
          icon: '🎯',
          type: 'tutorial'
        }
      ];
    }

    return [
      {
        id: 'new-project',
        label: 'Start New Project',
        action: 'create-project',
        icon: '📁',
        type: 'quick'
      },
      {
        id: 'import-project',
        label: 'Import Existing Project',
        action: 'import-project',
        icon: '📥',
        type: 'quick'
      },
      {
        id: 'ai-generate',
        label: 'Generate with AI',
        action: 'ai-generation',
        icon: '🤖',
        type: 'detailed'
      },
      {
        id: 'learn-features',
        label: 'Explore Features',
        action: 'feature-tour',
        icon: '🔍',
        type: 'tutorial'
      }
    ];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Track AI interaction
    trackFeatureUsage('ai-chat');

    // Process the message and generate response
    const response = await processUserMessage(inputValue, context);

    setTimeout(() => {
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Simulate processing time
  };

  const processUserMessage = async (message: string, context: ConversationContext): Promise<Message> => {
    // Analyze user intent
    const intent = analyzeIntent(message);

    // Generate contextual response
    const response = await generateResponse(message, intent, context);

    return {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      type: response.type,
      metadata: response.metadata
    };
  };

  const analyzeIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    // Project creation intents
    if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
      if (lowerMessage.includes('website') || lowerMessage.includes('site')) return 'create-website';
      if (lowerMessage.includes('app')) return 'create-app';
      if (lowerMessage.includes('component')) return 'create-component';
      return 'create-project';
    }

    // Learning intents
    if (lowerMessage.includes('how') || lowerMessage.includes('learn') || lowerMessage.includes('explain')) {
      return 'explain-concept';
    }

    // Help intents
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('problem')) {
      return 'provide-help';
    }

    // Deployment intents
    if (lowerMessage.includes('deploy') || lowerMessage.includes('publish') || lowerMessage.includes('live')) {
      return 'deploy-project';
    }

    // Code-related intents
    if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('bug')) {
      return 'code-assistance';
    }

    return 'general-chat';
  };

  const generateResponse = async (message: string, intent: string, context: ConversationContext) => {
    switch (intent) {
      case 'create-website':
        return generateWebsiteCreationResponse(message);

      case 'create-app':
        return generateAppCreationResponse(message);

      case 'create-component':
        return generateComponentCreationResponse(message);

      case 'explain-concept':
        return generateExplanationResponse(message);

      case 'provide-help':
        return generateHelpResponse(message);

      case 'deploy-project':
        return generateDeploymentResponse(message);

      case 'code-assistance':
        return generateCodeAssistanceResponse(message);

      default:
        return generateGeneralResponse(message);
    }
  };

  const generateWebsiteCreationResponse = (message: string) => {
    return {
      content: `Great! I'd love to help you create a website! 🌐

To get started, I need to understand what kind of website you want. Could you tell me:

1. **What's the purpose?** (e.g., restaurant, portfolio, blog, business)
2. **Who's your audience?** (customers, employers, readers, etc.)
3. **Any specific features?** (contact form, online store, galleries, etc.)

I'll then:
✨ Generate a custom design
🎨 Create all the pages you need
📱 Make it mobile-friendly
🚀 Help you publish it online

What kind of website did you have in mind?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'restaurant-template',
            label: 'Restaurant Website',
            action: 'use-template:restaurant',
            icon: '🍽️',
            type: 'quick' as const
          },
          {
            id: 'portfolio-template',
            label: 'Portfolio Website',
            action: 'use-template:portfolio',
            icon: '💼',
            type: 'quick' as const
          },
          {
            id: 'business-template',
            label: 'Business Website',
            action: 'use-template:business',
            icon: '🏢',
            type: 'quick' as const
          },
          {
            id: 'custom-website',
            label: 'Custom Website',
            action: 'start-custom-website',
            icon: '⚡',
            type: 'detailed' as const
          }
        ]
      }
    };
  };

  const generateAppCreationResponse = (message: string) => {
    return {
      content: `Awesome! Let's build an app together! 📱

I can help you create different types of apps:

**Web Apps** - Run in browsers, work on all devices
**Mobile Apps** - Native iOS/Android or cross-platform
**Desktop Apps** - For Mac, Windows, or Linux

To get started, tell me:
1. **What should your app do?** (main purpose)
2. **Who will use it?** (target users)
3. **Which platform?** (web, mobile, desktop)

I'll handle all the technical stuff - you just focus on your ideas!

What kind of app are you thinking about?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'web-app',
            label: 'Web App',
            action: 'create-web-app',
            icon: '🌐',
            type: 'quick' as const
          },
          {
            id: 'mobile-app',
            label: 'Mobile App',
            action: 'create-mobile-app',
            icon: '📱',
            type: 'quick' as const
          },
          {
            id: 'desktop-app',
            label: 'Desktop App',
            action: 'create-desktop-app',
            icon: '💻',
            type: 'quick' as const
          }
        ]
      }
    };
  };

  const generateComponentCreationResponse = (message: string) => {
    return {
      content: `Perfect! I can help you create custom UI components! 🎨

Tell me what you need:
• **Button** with custom styling and animations
• **Form** with validation and submission
• **Card** to display information beautifully
• **Navigation** menu or sidebar
• **Modal** or popup dialog
• **Custom component** - describe what you want!

Just describe what you want in plain English, like:
"Create a blue button that glows when you hover over it"

What component would you like to create?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'create-button',
            label: 'Custom Button',
            action: 'generate-component:button',
            icon: '🔘',
            type: 'quick' as const
          },
          {
            id: 'create-form',
            label: 'Contact Form',
            action: 'generate-component:form',
            icon: '📝',
            type: 'quick' as const
          },
          {
            id: 'create-card',
            label: 'Info Card',
            action: 'generate-component:card',
            icon: '🃏',
            type: 'quick' as const
          }
        ]
      }
    };
  };

  const generateExplanationResponse = (message: string) => {
    return {
      content: `I'd be happy to explain that! 🤓

I can break down any programming concept in simple terms:

• **How websites work** - The basics of HTML, CSS, and JavaScript
• **What is React/Vue/etc** - Modern web frameworks explained simply
• **Databases** - How to store and retrieve data
• **APIs** - How different software talks to each other
• **Deployment** - How to get your app online
• **And much more!**

I'll use analogies and simple examples to make everything clear. No confusing jargon!

What would you like me to explain?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'explain-web-basics',
            label: 'Web Development Basics',
            action: 'explain:web-basics',
            icon: '🌐',
            type: 'tutorial' as const
          },
          {
            id: 'explain-react',
            label: 'What is React?',
            action: 'explain:react',
            icon: '⚛️',
            type: 'tutorial' as const
          },
          {
            id: 'explain-deployment',
            label: 'How Deployment Works',
            action: 'explain:deployment',
            icon: '🚀',
            type: 'tutorial' as const
          }
        ]
      }
    };
  };

  const generateHelpResponse = (message: string) => {
    return {
      content: `Don't worry, I'm here to help! 🤝

Let me know:
• **What are you trying to do?** (your goal)
• **What's happening?** (the problem)
• **What did you expect?** (what should happen)

I can help with:
✅ Fixing errors and bugs
✅ Understanding confusing concepts
✅ Finding the right approach
✅ Debugging code step by step
✅ Optimizing performance
✅ Best practices

The more details you give me, the better I can help. What's going on?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'debug-code',
            label: 'Debug My Code',
            action: 'debug-assistance',
            icon: '🐛',
            type: 'detailed' as const
          },
          {
            id: 'explain-error',
            label: 'Explain This Error',
            action: 'error-explanation',
            icon: '❗',
            type: 'detailed' as const
          },
          {
            id: 'best-practices',
            label: 'Best Practices',
            action: 'show-best-practices',
            icon: '⭐',
            type: 'tutorial' as const
          }
        ]
      }
    };
  };

  const generateDeploymentResponse = (message: string) => {
    return {
      content: `Let's get your project live! 🚀

I can help you deploy to:
• **Netlify** - Great for static sites (free tier)
• **Vercel** - Perfect for React/Next.js apps (free tier)
• **GitHub Pages** - Free hosting with your GitHub account
• **Your own server** - More control and customization

The process is simple:
1. I'll prepare your project for deployment
2. Connect to your chosen platform
3. Deploy with one click
4. Your project goes live!

Which project would you like to deploy?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'deploy-netlify',
            label: 'Deploy to Netlify',
            action: 'deploy:netlify',
            icon: '🌐',
            type: 'quick' as const
          },
          {
            id: 'deploy-vercel',
            label: 'Deploy to Vercel',
            action: 'deploy:vercel',
            icon: '▲',
            type: 'quick' as const
          },
          {
            id: 'deploy-github',
            label: 'Deploy to GitHub Pages',
            action: 'deploy:github-pages',
            icon: '🐙',
            type: 'quick' as const
          }
        ]
      }
    };
  };

  const generateCodeAssistanceResponse = (message: string) => {
    return {
      content: `I'm here to help with your code! 💻

I can:
🔍 **Review your code** and suggest improvements
🐛 **Find and fix bugs** step by step
⚡ **Optimize performance** for speed and efficiency
📝 **Explain how code works** in plain English
✨ **Generate new code** based on your requirements
🧪 **Write tests** to ensure your code works correctly

Share your code with me (copy and paste) or describe what you're trying to build, and I'll help you out!

What coding challenge are you facing?`,
      type: 'text' as const,
      metadata: {
        followUpActions: [
          {
            id: 'review-code',
            label: 'Review My Code',
            action: 'code-review',
            icon: '🔍',
            type: 'detailed' as const
          },
          {
            id: 'generate-code',
            label: 'Generate Code',
            action: 'code-generation',
            icon: '⚡',
            type: 'detailed' as const
          },
          {
            id: 'fix-bug',
            label: 'Fix a Bug',
            action: 'bug-fixing',
            icon: '🐛',
            type: 'detailed' as const
          }
        ]
      }
    };
  };

  const generateGeneralResponse = (message: string) => {
    const responses = [
      "I'm here to help you build amazing projects! What would you like to create today?",
      "That's interesting! How can I help you turn that into a digital project?",
      "I'd love to help you with that! Can you tell me more about what you're trying to achieve?",
      "Great question! Let me know how I can assist you with your development goals.",
      "I'm ready to help you build something awesome! What's on your mind?"
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      type: 'text' as const,
      metadata: {
        followUpActions: getWelcomeActions()
      }
    };
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
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

  const handleActionClick = async (action: FollowUpAction) => {
    trackFeatureUsage(action.action);

    // Add user action as a message
    const actionMessage: Message = {
      id: `action-${Date.now()}`,
      role: 'user',
      content: `🎯 ${action.label}`,
      timestamp: new Date(),
      type: 'action'
    };

    setMessages(prev => [...prev, actionMessage]);

    // Process the action
    const response = await processAction(action);

    setTimeout(() => {
      setMessages(prev => [...prev, response]);
    }, 500);
  };

  const processAction = async (action: FollowUpAction): Promise<Message> => {
    // Handle different action types
    switch (action.action) {
      case 'use-template:restaurant':
        return {
          id: `response-${Date.now()}`,
          role: 'assistant',
          content: `Perfect choice! 🍽️ Let's create a beautiful restaurant website!

I'll set up:
• **Homepage** with hero section and restaurant info
• **Menu** page with food categories and prices
• **About** page with your story
• **Contact** page with location and hours
• **Online ordering** system (optional)

What's your restaurant called? And do you have any specific colors or style preferences?`,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            followUpActions: [
              {
                id: 'customize-restaurant',
                label: 'Customize Design',
                action: 'customize-template',
                icon: '🎨',
                type: 'detailed'
              },
              {
                id: 'add-menu',
                label: 'Add Menu Items',
                action: 'setup-menu',
                icon: '📝',
                type: 'detailed'
              }
            ]
          }
        };

      default:
        return {
          id: `response-${Date.now()}`,
          role: 'assistant',
          content: `I'm working on that feature! In the meantime, feel free to tell me more about what you'd like to build.`,
          timestamp: new Date(),
          type: 'text'
        };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{currentPersonality.avatar}</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {currentPersonality.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentPersonality.role}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMessages([])}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'action'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Follow-up actions */}
              {message.metadata?.followUpActions && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm opacity-75 mb-2">Quick actions:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {message.metadata.followUpActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors text-left"
                      >
                        <span>{action.icon}</span>
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef as any}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isCreatorMode
                ? "Describe what you want to build... (e.g., 'Create a restaurant website with online ordering')"
                : "Ask me anything about development..."
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={inputValue.split('\n').length || 1}
              style={{ minHeight: '52px', maxHeight: '120px' }}
            />
          </div>

          {preferences.enableVoiceCommands && (
            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {preferences.enableVoiceCommands && (
            <span>🎤 Voice input enabled</span>
          )}
        </div>
      </div>
    </div>
  );
};