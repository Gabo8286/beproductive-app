import { supabase } from '@/integrations/supabase/client';

// Types for AI service configuration
interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  costTracking: {
    tokenCost: number;
    currency: string;
  };
}

interface SecureAIRequest {
  provider: string;
  model?: string;
  messages: Array<{ role: string; content: string }>;
  context?: string;
  personality?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
}

interface AIUsageMetrics {
  requestCount: number;
  tokenUsage: number;
  estimatedCost: number;
  lastRequest: Date;
  rateLimitRemaining: number;
}

// Rate limiting and usage tracking
class AIUsageTracker {
  private usage: Map<string, AIUsageMetrics> = new Map();
  private rateLimits: Map<string, { requests: number; resetTime: number }> = new Map();

  async trackRequest(userId: string, provider: string, tokenCount: number, cost: number): Promise<void> {
    const key = `${userId}-${provider}`;
    const current = this.usage.get(key) || {
      requestCount: 0,
      tokenUsage: 0,
      estimatedCost: 0,
      lastRequest: new Date(),
      rateLimitRemaining: 0,
    };

    current.requestCount += 1;
    current.tokenUsage += tokenCount;
    current.estimatedCost += cost;
    current.lastRequest = new Date();

    this.usage.set(key, current);

    // Store in database for persistent tracking
    try {
      await supabase.rpc('track_ai_usage', {
        user_id_param: userId,
        provider_param: provider,
        request_count_param: 1,
        token_count_param: tokenCount,
        estimated_cost_param: cost,
      });
    } catch (error) {
      console.error('Failed to track AI usage:', error);
    }
  }

  async checkRateLimit(userId: string, provider: string, limits: AIProvider['rateLimits']): Promise<boolean> {
    const key = `${userId}-${provider}`;
    const now = Date.now();

    // Check minute limit
    const minuteKey = `${key}-minute-${Math.floor(now / 60000)}`;
    const minuteCount = this.rateLimits.get(minuteKey)?.requests || 0;

    if (minuteCount >= limits.requestsPerMinute) {
      return false;
    }

    // Check hour limit
    const hourKey = `${key}-hour-${Math.floor(now / 3600000)}`;
    const hourCount = this.rateLimits.get(hourKey)?.requests || 0;

    if (hourCount >= limits.requestsPerHour) {
      return false;
    }

    // Check day limit
    const dayKey = `${key}-day-${Math.floor(now / 86400000)}`;
    const dayCount = this.rateLimits.get(dayKey)?.requests || 0;

    if (dayCount >= limits.requestsPerDay) {
      return false;
    }

    return true;
  }

  async incrementRateLimit(userId: string, provider: string): Promise<void> {
    const key = `${userId}-${provider}`;
    const now = Date.now();

    // Increment all time windows
    const timeWindows = [
      { suffix: 'minute', window: Math.floor(now / 60000), ttl: 60000 },
      { suffix: 'hour', window: Math.floor(now / 3600000), ttl: 3600000 },
      { suffix: 'day', window: Math.floor(now / 86400000), ttl: 86400000 },
    ];

    for (const { suffix, window, ttl } of timeWindows) {
      const windowKey = `${key}-${suffix}-${window}`;
      const current = this.rateLimits.get(windowKey) || { requests: 0, resetTime: now + ttl };
      current.requests += 1;
      this.rateLimits.set(windowKey, current);
    }

    // Clean up expired rate limits
    this.cleanupExpiredLimits();
  }

  private cleanupExpiredLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.rateLimits.entries()) {
      if (limit.resetTime <= now) {
        this.rateLimits.delete(key);
      }
    }
  }

  async getUserUsage(userId: string, provider: string): Promise<AIUsageMetrics | null> {
    const key = `${userId}-${provider}`;
    return this.usage.get(key) || null;
  }
}

// Global usage tracker instance
const usageTracker = new AIUsageTracker();

// Secure AI proxy service
export class SecureAIProxy {
  private providers: Map<string, AIProvider> = new Map();
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize supported AI providers with their configurations
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      enabled: true,
      rateLimits: {
        requestsPerMinute: 50,
        requestsPerHour: 500,
        requestsPerDay: 2000,
      },
      costTracking: {
        tokenCost: 0.002, // $0.002 per 1K tokens (GPT-4 average)
        currency: 'USD',
      },
    });

    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude',
      enabled: true,
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 300,
        requestsPerDay: 1000,
      },
      costTracking: {
        tokenCost: 0.008, // Claude pricing
        currency: 'USD',
      },
    });

    this.providers.set('gemini', {
      id: 'gemini',
      name: 'Google Gemini',
      enabled: true,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 600,
        requestsPerDay: 3000,
      },
      costTracking: {
        tokenCost: 0.001, // Gemini pricing
        currency: 'USD',
      },
    });
  }

  async makeSecureRequest(request: SecureAIRequest): Promise<Response> {
    // Get current user session
    const { data: session, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.session?.access_token) {
      throw new Error('Authentication required. Please sign in to use AI features.');
    }

    const userId = session.session.user?.id;
    if (!userId) {
      throw new Error('User ID not found in session.');
    }

    // Validate provider
    const provider = this.providers.get(request.provider);
    if (!provider || !provider.enabled) {
      throw new Error(`AI provider '${request.provider}' is not available.`);
    }

    // Check rate limits
    const withinLimits = await usageTracker.checkRateLimit(userId, request.provider, provider.rateLimits);
    if (!withinLimits) {
      throw new Error(`Rate limit exceeded for ${provider.name}. Please try again later.`);
    }

    // Validate request parameters
    this.validateRequest(request);

    // Make the request through secure proxy
    const response = await this.callSecureEndpoint(request, session.session.access_token);

    // Track usage if request was successful
    if (response.ok) {
      await usageTracker.incrementRateLimit(userId, request.provider);

      // Estimate token usage and cost
      const estimatedTokens = this.estimateTokenUsage(request);
      const estimatedCost = (estimatedTokens / 1000) * provider.costTracking.tokenCost;

      await usageTracker.trackRequest(userId, request.provider, estimatedTokens, estimatedCost);
    }

    return response;
  }

  private validateRequest(request: SecureAIRequest): void {
    // Validate required fields
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty.');
    }

    // Validate message format
    for (const message of request.messages) {
      if (!message.role || !message.content) {
        throw new Error('Each message must have a role and content.');
      }

      if (!['user', 'assistant', 'system'].includes(message.role)) {
        throw new Error('Message role must be user, assistant, or system.');
      }

      // Content length validation
      if (message.content.length > 50000) {
        throw new Error('Message content is too long. Maximum 50,000 characters per message.');
      }
    }

    // Validate optional parameters
    if (request.temperature !== undefined) {
      if (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 2) {
        throw new Error('Temperature must be a number between 0 and 2.');
      }
    }

    if (request.maxTokens !== undefined) {
      if (typeof request.maxTokens !== 'number' || request.maxTokens < 1 || request.maxTokens > 4000) {
        throw new Error('Max tokens must be a number between 1 and 4000.');
      }
    }

    // Content filtering for safety
    this.filterContent(request);
  }

  private filterContent(request: SecureAIRequest): void {
    const prohibited = [
      'password', 'api_key', 'secret', 'token', 'private_key',
      'credit_card', 'ssn', 'social_security', 'personal_info'
    ];

    for (const message of request.messages) {
      const content = message.content.toLowerCase();
      for (const term of prohibited) {
        if (content.includes(term)) {
          console.warn(`Potentially sensitive content detected: ${term}`);
          // In production, you might want to reject the request or sanitize it
        }
      }
    }
  }

  private async callSecureEndpoint(request: SecureAIRequest, accessToken: string): Promise<Response> {
    const endpoint = `${this.baseURL}/secure-ai-proxy`;

    // Prepare secure request payload
    const payload = {
      provider: request.provider,
      model: request.model,
      messages: request.messages,
      context: request.context,
      personality: request.personality,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 1000,
      stream: request.stream || false,
      timestamp: Date.now(),
      requestId: this.generateRequestId(),
    };

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Request-Source': 'secure-ai-proxy',
      },
      body: JSON.stringify(payload),
    });
  }

  private estimateTokenUsage(request: SecureAIRequest): number {
    // Simple token estimation (1 token ≈ 4 characters for English text)
    let totalChars = 0;
    for (const message of request.messages) {
      totalChars += message.content.length;
    }

    // Add system prompt overhead
    totalChars += 500;

    return Math.ceil(totalChars / 4);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for usage monitoring
  async getUserUsage(provider: string): Promise<AIUsageMetrics | null> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return null;
    }

    return usageTracker.getUserUsage(userId, provider);
  }

  async getUserCosts(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<number> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return 0;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_ai_costs', {
        user_id_param: userId,
        timeframe_param: timeframe,
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Failed to get user costs:', error);
      return 0;
    }
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.enabled);
  }

  getProviderConfig(providerId: string): AIProvider | null {
    return this.providers.get(providerId) || null;
  }
}

// Global proxy instance
export const secureAIProxy = new SecureAIProxy();

// Utility functions for backward compatibility
export async function makeSecureAICall(request: SecureAIRequest): Promise<Response> {
  return secureAIProxy.makeSecureRequest(request);
}

export async function streamSecureAI(request: SecureAIRequest & { onDelta: (text: string) => void; onDone: () => void; onError?: (error: Error) => void }): Promise<void> {
  const { onDelta, onDone, onError, ...aiRequest } = request;

  try {
    const response = await secureAIProxy.makeSecureRequest({ ...aiRequest, stream: true });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onDelta(content);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    onDone();
  } catch (error) {
    console.error('Secure AI streaming error:', error);
    onError?.(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// Rate limiting utilities
export class AIRateLimiter {
  static async checkUserLimits(provider: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return { allowed: false };
    }

    try {
      const { data, error } = await supabase.rpc('check_ai_rate_limits', {
        user_id_param: userId,
        provider_param: provider,
      });

      if (error) throw error;

      return {
        allowed: data.allowed,
        retryAfter: data.retry_after,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: false };
    }
  }

  static async getRemainingQuota(provider: string): Promise<{ minute: number; hour: number; day: number }> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return { minute: 0, hour: 0, day: 0 };
    }

    try {
      const { data, error } = await supabase.rpc('get_ai_quota_remaining', {
        user_id_param: userId,
        provider_param: provider,
      });

      if (error) throw error;

      return data || { minute: 0, hour: 0, day: 0 };
    } catch (error) {
      console.error('Quota check failed:', error);
      return { minute: 0, hour: 0, day: 0 };
    }
  }
}

export default secureAIProxy;