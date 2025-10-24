/**
 * Luna AI Providers Module
 * Multi-provider support for different AI services with unified interface
 */

export interface AIProvider {
  name: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
  isAvailable: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  apiKey?: string;
  endpoint = 'https://api.openai.com/v1';
  maxTokens = 4000;
  temperature = 0.7;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('OpenAI API key not provided');

    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model
    };
  }
}

// Anthropic Claude Provider
export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  apiKey?: string;
  endpoint = 'https://api.anthropic.com/v1';
  maxTokens = 4000;
  temperature = 0.7;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('Claude API key not provided');

    const response = await fetch(`${this.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      usage: data.usage,
      model: data.model
    };
  }
}

// Google Gemini Provider
export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  apiKey?: string;
  endpoint = 'https://generativelanguage.googleapis.com/v1beta';
  maxTokens = 4000;
  temperature = 0.7;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.apiKey) throw new Error('Gemini API key not provided');

    const response = await fetch(`${this.endpoint}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'assistant' ? 'model' : msg.role
        })),
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens
        }
      })
    });

    const data = await response.json();
    return {
      content: data.candidates[0]?.content?.parts[0]?.text || '',
      model: 'gemini-pro'
    };
  }
}

// Provider Factory
export class ProviderFactory {
  static createProvider(type: 'openai' | 'claude' | 'gemini', apiKey?: string): AIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'claude':
        return new ClaudeProvider(apiKey);
      case 'gemini':
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  static getAvailableProviders(apiKeys: Record<string, string>): AIProvider[] {
    const providers = [
      new OpenAIProvider(apiKeys.openai),
      new ClaudeProvider(apiKeys.claude),
      new GeminiProvider(apiKeys.gemini)
    ];

    return providers.filter(provider => provider.isAvailable);
  }
}

export default {
  OpenAIProvider,
  ClaudeProvider,
  GeminiProvider,
  ProviderFactory
};