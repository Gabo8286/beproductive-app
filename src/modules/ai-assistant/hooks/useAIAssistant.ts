// Main AI Assistant Hook
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { intentRecognitionService } from '../services/intentRecognition';
import { ConversationMessage, ConversationState, ConversationContext } from '../types/conversation';
import { IntentProcessingResult } from '../types/intent';
import { AIResponse } from '../types/aiResponses';

interface UseAIAssistantOptions {
  context?: {
    module?: string;
    data?: any;
  };
  autoExecuteActions?: boolean;
  voiceEnabled?: boolean;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionIdRef = useRef<string>(Date.now().toString());

  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: `Hi! I'm your AI productivity assistant. I can help you create tasks, set goals, manage your productivity cycle, and much more. What would you like to work on today?`,
        timestamp: new Date()
      }
    ],
    context: {
      sessionId: sessionIdRef.current,
      userId: user?.id || '',
      startedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 1,
      activeModules: [options.context?.module || 'general'],
      userPreferences: {}
    },
    isProcessing: false,
    waitingForClarification: false,
    pendingActions: []
  });

  const [isListening, setIsListening] = useState(false);

  // Process user input and generate AI response
  const processMessage = useCallback(async (content: string): Promise<AIResponse> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setConversationState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Step 1: Recognize intent
      const intentResult: IntentProcessingResult = await intentRecognitionService.recognizeIntent(
        content,
        {
          conversationHistory: conversationState.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          currentWorkspace: {
            activeModule: options.context?.module,
            currentPhase: 'capture' // TODO: Get from productivity cycle context
          },
          userProfile: {
            preferences: conversationState.context.userPreferences,
            patterns: {},
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      );

      // Step 2: Execute actions if confidence is high and auto-execute is enabled
      const executedActions = [];
      if (
        options.autoExecuteActions &&
        intentResult.confidence > 0.8 &&
        !intentResult.needsClarification
      ) {
        for (const action of intentResult.suggestedActions) {
          try {
            const result = await executeAction(action);
            executedActions.push(result);
          } catch (error) {
            console.error('Failed to execute action:', action, error);
          }
        }
      }

      // Step 3: Generate AI response
      const aiResponse: AIResponse = {
        id: Date.now().toString(),
        content: generateResponseContent(intentResult, executedActions),
        type: intentResult.needsClarification ? 'clarification' : 'text',
        confidence: intentResult.confidence,
        timestamp: new Date(),
        processingTime: intentResult.processingTime,
        metadata: {
          intentRecognized: intentResult.intent.type,
          actionsExecuted: executedActions.map(a => a.id),
          suggestedFollowUps: generateFollowUpSuggestions(intentResult)
        }
      };

      return aiResponse;

    } catch (error) {
      console.error('Error processing message:', error);

      return {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        type: 'error',
        confidence: 0,
        timestamp: new Date(),
        processingTime: 0,
        metadata: {
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      };
    } finally {
      setConversationState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [user?.id, conversationState.messages, options]);

  // Send a message to the AI assistant
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    // Add user message to conversation
    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      context: {
        ...prev.context,
        lastActivity: new Date(),
        messageCount: prev.messageCount + 1
      }
    }));

    try {
      // Process the message and get AI response
      const aiResponse = await processMessage(content.trim());

      const assistantMessage: ConversationMessage = {
        id: aiResponse.id,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: aiResponse.timestamp,
        metadata: aiResponse.metadata
      };

      // Add assistant response to conversation
      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        context: {
          ...prev.context,
          lastActivity: new Date(),
          messageCount: prev.messageCount + 1
        },
        waitingForClarification: aiResponse.type === 'clarification'
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Assistant Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    }
  }, [processMessage, toast]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    sessionIdRef.current = Date.now().toString();

    setConversationState({
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `Hi! I'm your AI productivity assistant. I can help you create tasks, set goals, manage your productivity cycle, and much more. What would you like to work on today?`,
          timestamp: new Date()
        }
      ],
      context: {
        sessionId: sessionIdRef.current,
        userId: user?.id || '',
        startedAt: new Date(),
        lastActivity: new Date(),
        messageCount: 1,
        activeModules: [options.context?.module || 'general'],
        userPreferences: {}
      },
      isProcessing: false,
      waitingForClarification: false,
      pendingActions: []
    });
  }, [user?.id, options.context?.module]);

  // Execute an action through the module system
  const executeAction = async (action: any) => {
    // TODO: Implement action execution through module registry
    console.log('Executing action:', action);

    return {
      id: action.id,
      success: true,
      data: {},
      affectedEntities: []
    };
  };

  // Generate response content based on intent and executed actions
  const generateResponseContent = (
    intentResult: IntentProcessingResult,
    executedActions: any[]
  ): string => {
    if (intentResult.needsClarification) {
      return `I need a bit more information: ${intentResult.clarificationQuestions.join(' ')}`;
    }

    if (executedActions.length > 0) {
      const actionDescriptions = executedActions.map(action =>
        `✅ ${action.description || 'Action completed'}`
      ).join('\n');

      return `I've completed the following actions:\n\n${actionDescriptions}\n\nIs there anything else you'd like me to help with?`;
    }

    // Generate contextual response based on intent
    switch (intentResult.intent.type) {
      case 'create-task':
        return `I understand you want to create a task. ${intentResult.suggestedActions[0]?.previewText || 'Let me help you with that.'}`;
      case 'get-summary':
        return `I'll show you a summary of your progress. ${intentResult.suggestedActions[0]?.previewText || ''}`;
      default:
        return `I recognize that you want to ${intentResult.intent.type.replace('-', ' ')}. Let me help you with that.`;
    }
  };

  // Generate follow-up suggestions
  const generateFollowUpSuggestions = (intentResult: IntentProcessingResult): string[] => {
    const suggestions = [];

    switch (intentResult.intent.type) {
      case 'create-task':
        suggestions.push('Set a priority for this task');
        suggestions.push('Add a due date');
        suggestions.push('Break it into subtasks');
        break;
      case 'create-goal':
        suggestions.push('Create supporting tasks');
        suggestions.push('Set milestone dates');
        suggestions.push('Add success metrics');
        break;
      default:
        suggestions.push('Show me what\'s next');
        suggestions.push('Help me prioritize');
        break;
    }

    return suggestions.slice(0, 3);
  };

  // Voice recognition (placeholder)
  const startListening = useCallback(() => {
    if (!options.voiceEnabled) return;

    setIsListening(true);
    // TODO: Implement voice recognition
    console.log('Starting voice recognition...');
  }, [options.voiceEnabled]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    // TODO: Stop voice recognition
    console.log('Stopping voice recognition...');
  }, []);

  return {
    // State
    conversationState,
    isListening,

    // Actions
    sendMessage,
    clearConversation,
    startListening,
    stopListening,

    // Utilities
    isProcessing: conversationState.isProcessing,
    messageCount: conversationState.context.messageCount,
    hasMessages: conversationState.messages.length > 1,
    waitingForClarification: conversationState.waitingForClarification
  };
}