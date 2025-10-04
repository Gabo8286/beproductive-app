import { supabase } from "@/integrations/supabase/client";
import { APIProviderType, APIKey } from "@/types/api-management";

export interface AIServiceRequest {
  provider: APIProviderType;
  model?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  requestType: string;
  metadata?: Record<string, any>;
}

export interface AIServiceResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export class AIServiceManager {
  private static instance: AIServiceManager;
  private activeApiKeys: Map<APIProviderType, APIKey> = new Map();
  private lastKeyUpdate: number = 0;
  private readonly KEY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  private async refreshApiKeys(): Promise<void> {
    const now = Date.now();
    if (now - this.lastKeyUpdate < this.KEY_CACHE_DURATION) {
      return; // Use cached keys
    }

    try {
      const { data: apiKeys, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("status", "active")
        .order("last_used_at", { ascending: false });

      if (error) throw error;

      this.activeApiKeys.clear();
      apiKeys?.forEach((key) => {
        if (!this.activeApiKeys.has(key.provider)) {
          this.activeApiKeys.set(key.provider, {
            ...key,
            additional_headers: (key.additional_headers || {}) as Record<
              string,
              any
            >,
          } as APIKey);
        }
      });

      this.lastKeyUpdate = now;
    } catch (error) {
      console.error("Failed to refresh API keys:", error);
      throw new Error("API keys unavailable");
    }
  }

  private async getApiKey(provider: APIProviderType): Promise<APIKey> {
    await this.refreshApiKeys();

    const key = this.activeApiKeys.get(provider);
    if (!key) {
      throw new Error(`No active API key found for provider: ${provider}`);
    }

    // Check usage limits
    if (key.current_month_cost >= key.monthly_limit_usd) {
      throw new Error(`Monthly cost limit exceeded for ${provider}`);
    }

    if (key.current_day_requests >= key.daily_request_limit) {
      throw new Error(`Daily request limit exceeded for ${provider}`);
    }

    return key;
  }

  private async callOpenAI(
    request: AIServiceRequest,
    apiKey: APIKey,
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.encrypted_key}`, // In real implementation, decrypt first
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: request.model || apiKey.model_name || "gpt-3.5-turbo",
            messages: [{ role: "user", content: request.prompt }],
            max_tokens: request.maxTokens || 1000,
            temperature: request.temperature || 0.7,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const tokensUsed = {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      };

      // Calculate cost (approximate)
      const cost = (tokensUsed.total / 1000) * 0.002; // $0.002 per 1K tokens

      return {
        content: data.choices[0]?.message?.content || "",
        tokensUsed,
        cost,
        responseTime,
        success: true,
      };
    } catch (error) {
      return {
        content: "",
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async callClaude(
    request: AIServiceRequest,
    apiKey: APIKey,
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.encrypted_key}`, // In real implementation, decrypt first
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:
            request.model || apiKey.model_name || "claude-3-sonnet-20240229",
          max_tokens: request.maxTokens || 1000,
          messages: [{ role: "user", content: request.prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const tokensUsed = {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      };

      // Calculate cost (approximate)
      const cost = (tokensUsed.total / 1000) * 0.015; // $0.015 per 1K tokens

      return {
        content: data.content[0]?.text || "",
        tokensUsed,
        cost,
        responseTime,
        success: true,
      };
    } catch (error) {
      return {
        content: "",
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async callGemini(
    request: AIServiceRequest,
    apiKey: APIKey,
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${request.model || "gemini-1.5-flash"}:generateContent?key=${apiKey.encrypted_key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: request.prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 1000,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const tokensUsed = {
        prompt: data.usageMetadata?.promptTokenCount || 0,
        completion: data.usageMetadata?.candidatesTokenCount || 0,
        total: data.usageMetadata?.totalTokenCount || 0,
      };

      // Calculate cost (approximate - Gemini pricing varies by model)
      const cost = (tokensUsed.total / 1000) * 0.001; // $0.001 per 1K tokens for flash model

      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
        tokensUsed,
        cost,
        responseTime,
        success: true,
      };
    } catch (error) {
      return {
        content: "",
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async callLovable(
    request: AIServiceRequest,
    apiKey: APIKey,
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();

    // For now, simulate Lovable AI response since it's not a real API
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const responseTime = Date.now() - startTime;
    const tokensUsed = {
      prompt: Math.floor(request.prompt.length / 4), // Rough estimation
      completion: 100 + Math.floor(Math.random() * 200),
      total: 0,
    };
    tokensUsed.total = tokensUsed.prompt + tokensUsed.completion;

    const cost = (tokensUsed.total / 1000) * 0.002;

    return {
      content: `AI Analysis: Based on your productivity data, here are some insights...`,
      tokensUsed,
      cost,
      responseTime,
      success: true,
    };
  }

  public async makeRequest(
    request: AIServiceRequest,
  ): Promise<AIServiceResponse> {
    const apiKey = await this.getApiKey(request.provider);

    let response: AIServiceResponse;

    // Route to appropriate provider
    switch (request.provider) {
      case "openai":
        response = await this.callOpenAI(request, apiKey);
        break;
      case "claude":
        response = await this.callClaude(request, apiKey);
        break;
      case "gemini":
        response = await this.callGemini(request, apiKey);
        break;
      case "lovable":
        response = await this.callLovable(request, apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${request.provider}`);
    }

    // Log usage analytics
    await this.logUsage(request, response, apiKey.id);

    // Update API key usage counters
    await this.updateUsageCounters(apiKey.id, response);

    return response;
  }

  private async logUsage(
    request: AIServiceRequest,
    response: AIServiceResponse,
    apiKeyId: string,
  ): Promise<void> {
    try {
      await supabase.from("api_usage_analytics").insert({
        api_key_id: apiKeyId,
        user_id: request.userId,
        provider: request.provider,
        model_name: request.model,
        tokens_prompt: response.tokensUsed.prompt,
        tokens_completion: response.tokensUsed.completion,
        tokens_total: response.tokensUsed.total,
        estimated_cost: response.cost,
        response_time_ms: response.responseTime,
        success: response.success,
        error_message: response.error,
        request_metadata: {
          request_type: request.requestType,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          ...request.metadata,
        },
      });
    } catch (error) {
      console.error("Failed to log usage:", error);
      // Don't throw - usage logging shouldn't break the main flow
    }
  }

  private async updateUsageCounters(
    apiKeyId: string,
    response: AIServiceResponse,
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("increment_api_key_usage", {
        key_id: apiKeyId,
        cost_amount: response.cost || 0,
        token_amount: response.tokensUsed.total || 0,
      });

      if (error) {
        console.error("Error updating usage counters:", error);
      }
    } catch (error) {
      console.error("Failed to update usage counters:", error);
    }
  }

  public async checkUsageLimits(provider: APIProviderType): Promise<{
    withinLimits: boolean;
    costUsage: number;
    requestUsage: number;
    tokenUsage: number;
    warnings: string[];
  }> {
    const apiKey = await this.getApiKey(provider);

    const costUsage =
      (apiKey.current_month_cost / apiKey.monthly_limit_usd) * 100;
    const requestUsage =
      (apiKey.current_day_requests / apiKey.daily_request_limit) * 100;
    const tokenUsage =
      (apiKey.current_month_tokens / apiKey.monthly_token_limit) * 100;

    const warnings: string[] = [];
    if (costUsage > 80) warnings.push(`Cost usage at ${costUsage.toFixed(1)}%`);
    if (requestUsage > 80)
      warnings.push(`Request usage at ${requestUsage.toFixed(1)}%`);
    if (tokenUsage > 80)
      warnings.push(`Token usage at ${tokenUsage.toFixed(1)}%`);

    return {
      withinLimits: costUsage < 100 && requestUsage < 100 && tokenUsage < 100,
      costUsage,
      requestUsage,
      tokenUsage,
      warnings,
    };
  }
}

// Export singleton instance
export const aiServiceManager = AIServiceManager.getInstance();
