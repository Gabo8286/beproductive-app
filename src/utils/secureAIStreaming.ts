import React from 'react';
import { streamSecureAI, secureAIProxy, AIRateLimiter } from '@/services/secureAIProxy';
import { toast } from 'sonner';

export interface SecureStreamOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context?: string;
  personality?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
  onRateLimit?: (retryAfter: number) => void;
  onCostUpdate?: (estimatedCost: number) => void;
}

// Enhanced streaming with security and monitoring
export const streamSecureChat = async (options: SecureStreamOptions) => {
  const {
    messages,
    context = 'general',
    personality = 'helpful',
    provider = 'openai', // Default to OpenAI
    model,
    temperature = 0.7,
    maxTokens = 1000,
    onDelta,
    onDone,
    onError,
    onRateLimit,
    onCostUpdate,
  } = options;

  const startTime = performance.now();

  try {
    // Check rate limits before making request
    const rateLimitCheck = await AIRateLimiter.checkUserLimits(provider);
    if (!rateLimitCheck.allowed) {
      const retryAfter = rateLimitCheck.retryAfter || 60;
      onRateLimit?.(retryAfter);
      throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }

    // Check user's remaining quota
    const quota = await AIRateLimiter.getRemainingQuota(provider);
    if (quota.minute <= 0) {
      throw new Error('Minute rate limit reached. Please wait before making another request.');
    }

    // Get estimated cost before request
    const providerConfig = secureAIProxy.getProviderConfig(provider);
    if (providerConfig) {
      const estimatedTokens = estimateTokenUsage(messages);
      const estimatedCost = (estimatedTokens / 1000) * providerConfig.costTracking.tokenCost;
      onCostUpdate?.(estimatedCost);
    }

    // Show user-friendly loading state
    toast.loading('AI is thinking...', {
      id: 'ai-request',
      description: `Using ${secureAIProxy.getProviderConfig(provider)?.name || provider}`,
    });

    await streamSecureAI({
      provider,
      model,
      messages,
      context,
      personality,
      temperature,
      maxTokens,
      stream: true,
      onDelta: (text: string) => {
        // Dismiss loading toast on first response
        toast.dismiss('ai-request');
        onDelta(text);
      },
      onDone: () => {
        toast.dismiss('ai-request');
        onDone();

        // Track successful completion
        const executionTime = performance.now() - startTime;
        trackAIUsage({
          provider,
          context,
          success: true,
          executionTime,
          tokenCount: estimateTokenUsage(messages),
        });
      },
      onError: (error: Error) => {
        toast.dismiss('ai-request');

        // Enhanced error handling with user-friendly messages
        const userFriendlyError = processAIError(error, provider);
        onError?.(userFriendlyError);

        // Track failed request
        const executionTime = performance.now() - startTime;
        trackAIUsage({
          provider,
          context,
          success: false,
          executionTime,
          error: error.message,
        });
      },
    });

  } catch (error) {
    toast.dismiss('ai-request');

    const processedError = error instanceof Error ? error : new Error('Unknown error occurred');
    const userFriendlyError = processAIError(processedError, provider);

    // Show appropriate error message to user
    if (processedError.message.includes('rate limit')) {
      toast.error('Rate Limit Reached', {
        description: 'Please wait a moment before making another AI request.',
        duration: 5000,
      });
    } else if (processedError.message.includes('authentication')) {
      toast.error('Authentication Required', {
        description: 'Please sign in to use AI features.',
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/login',
        },
      });
    } else if (processedError.message.includes('cost') || processedError.message.includes('quota')) {
      toast.error('Usage Limit Reached', {
        description: 'You have reached your AI usage limit for today.',
        duration: 8000,
      });
    } else {
      toast.error('AI Request Failed', {
        description: 'There was an issue processing your request. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => streamSecureChat(options),
        },
      });
    }

    onError?.(userFriendlyError);

    // Track failed request
    const executionTime = performance.now() - startTime;
    trackAIUsage({
      provider,
      context,
      success: false,
      executionTime,
      error: processedError.message,
    });
  }
};

// Enhanced error processing for user-friendly messages
function processAIError(error: Error, provider: string): Error {
  const message = error.message.toLowerCase();

  if (message.includes('rate limit') || message.includes('429')) {
    return new Error(`Rate limit reached for ${provider}. Please wait a moment before trying again.`);
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return new Error('Authentication required. Please sign in to use AI features.');
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return new Error('Access denied. You may not have permission to use this AI provider.');
  }

  if (message.includes('quota') || message.includes('usage limit')) {
    return new Error('Daily usage limit reached. Please try again tomorrow or upgrade your plan.');
  }

  if (message.includes('network') || message.includes('fetch')) {
    return new Error('Network error. Please check your connection and try again.');
  }

  if (message.includes('timeout')) {
    return new Error('Request timed out. Please try again with a shorter message.');
  }

  if (message.includes('content') || message.includes('policy')) {
    return new Error('Content not allowed. Please rephrase your request.');
  }

  if (message.includes('overloaded') || message.includes('503')) {
    return new Error('AI service is temporarily overloaded. Please try again in a moment.');
  }

  // Return original error if no specific case matches
  return error;
}

// Token usage estimation
function estimateTokenUsage(messages: Array<{ role: string; content: string }>): number {
  let totalChars = 0;
  for (const message of messages) {
    totalChars += message.content.length;
  }

  // Add overhead for system prompt and formatting
  totalChars += 500;

  // Estimate tokens (roughly 1 token per 4 characters for English)
  return Math.ceil(totalChars / 4);
}

// Usage tracking for analytics and monitoring
async function trackAIUsage(data: {
  provider: string;
  context: string;
  success: boolean;
  executionTime: number;
  tokenCount?: number;
  error?: string;
}): Promise<void> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: user } = await supabase.auth.getUser();

    if (user.user) {
      await supabase.rpc('track_secure_ai_usage', {
        user_id_param: user.user.id,
        provider_param: data.provider,
        context_param: data.context,
        success_param: data.success,
        execution_time_param: data.executionTime,
        token_count_param: data.tokenCount || 0,
        error_message_param: data.error || null,
      });
    }
  } catch (error) {
    console.debug('Usage tracking failed (non-critical):', error);
  }
}

// Utility functions for managing AI usage
export class AIUsageManager {
  static async getUserQuota(): Promise<{
    provider: string;
    remainingRequests: { minute: number; hour: number; day: number };
    estimatedCost: number;
  }[]> {
    const providers = secureAIProxy.getAvailableProviders();
    const quotas = [];

    for (const provider of providers) {
      const remaining = await AIRateLimiter.getRemainingQuota(provider.id);
      const usage = await secureAIProxy.getUserUsage(provider.id);

      quotas.push({
        provider: provider.name,
        remainingRequests: remaining,
        estimatedCost: usage?.estimatedCost || 0,
      });
    }

    return quotas;
  }

  static async getCurrentCosts(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<number> {
    return secureAIProxy.getUserCosts(timeframe);
  }

  static async checkCanMakeRequest(provider: string): Promise<{
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  }> {
    try {
      const rateLimitCheck = await AIRateLimiter.checkUserLimits(provider);

      if (!rateLimitCheck.allowed) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded',
          retryAfter: rateLimitCheck.retryAfter,
        };
      }

      const quota = await AIRateLimiter.getRemainingQuota(provider);

      if (quota.minute <= 0) {
        return {
          allowed: false,
          reason: 'Minute rate limit reached',
          retryAfter: 60,
        };
      }

      if (quota.hour <= 0) {
        return {
          allowed: false,
          reason: 'Hourly rate limit reached',
          retryAfter: 3600,
        };
      }

      if (quota.day <= 0) {
        return {
          allowed: false,
          reason: 'Daily rate limit reached',
          retryAfter: 86400,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Failed to check request limits:', error);
      return {
        allowed: false,
        reason: 'Unable to verify limits',
      };
    }
  }
}

// Hook for React components to monitor AI usage
export function useAIUsage(provider?: string) {
  const [usage, setUsage] = React.useState<{
    requestCount: number;
    tokenUsage: number;
    estimatedCost: number;
    remainingQuota: { minute: number; hour: number; day: number };
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUsage() {
      if (!provider) return;

      try {
        setIsLoading(true);
        const [usageData, quotaData] = await Promise.all([
          secureAIProxy.getUserUsage(provider),
          AIRateLimiter.getRemainingQuota(provider),
        ]);

        setUsage({
          requestCount: usageData?.requestCount || 0,
          tokenUsage: usageData?.tokenUsage || 0,
          estimatedCost: usageData?.estimatedCost || 0,
          remainingQuota: quotaData,
        });
      } catch (error) {
        console.error('Failed to fetch AI usage:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, [provider]);

  return { usage, isLoading };
}

// Export for backward compatibility
export { streamChat } from './aiStreaming';