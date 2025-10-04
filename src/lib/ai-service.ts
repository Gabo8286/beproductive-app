/**
 * AI Service Library
 * Location: src/lib/ai-service.ts
 * Index Reference: CODE_INDEX.md - Library Code > AI & Intelligence
 * Purpose: AI integration with Claude/GPT APIs for productivity features
 */
import { Anthropic } from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface AIConfig {
  provider: "anthropic" | "openai";
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TaskExtractionResult {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  category?: string;
  assignee?: string;
  confidence: number;
}

export interface ProductivityInsight {
  type: "pattern" | "recommendation" | "warning" | "achievement";
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  actionable?: boolean;
  suggestedActions?: string[];
}

class AIService {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private config: AIConfig;
  private conversationContext: AIMessage[] = [];

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    if (this.config.provider === "anthropic") {
      this.anthropic = new Anthropic({
        apiKey: this.config.apiKey,
      });
    } else if (this.config.provider === "openai") {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
      });
    }
  }

  async chat(message: string, systemPrompt?: string): Promise<string> {
    try {
      if (this.config.provider === "anthropic" && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: this.config.model || "claude-3-haiku-20240307",
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.7,
          system: systemPrompt || this.getDefaultSystemPrompt(),
          messages: [
            ...this.conversationContext.slice(-10).map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            { role: "user", content: message },
          ],
        });

        const assistantMessage = response.content[0];
        if (assistantMessage.type === "text") {
          this.addToContext("user", message);
          this.addToContext("assistant", assistantMessage.text);
          return assistantMessage.text;
        }
      } else if (this.config.provider === "openai" && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: this.config.model || "gpt-3.5-turbo",
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.7,
          messages: [
            {
              role: "system",
              content: systemPrompt || this.getDefaultSystemPrompt(),
            },
            ...this.conversationContext.slice(-10).map((msg) => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            })),
            { role: "user", content: message },
          ],
        });

        const assistantMessage = response.choices[0]?.message?.content || "";
        this.addToContext("user", message);
        this.addToContext("assistant", assistantMessage);
        return assistantMessage;
      }

      throw new Error("No AI provider configured");
    } catch (error) {
      console.error("AI chat error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  async extractTaskFromText(text: string): Promise<TaskExtractionResult> {
    const systemPrompt = `You are a task extraction expert. Extract task information from natural language input.
Return a JSON object with the following structure:
{
  "title": "string",
  "description": "string (optional)",
  "dueDate": "ISO date string (optional)",
  "priority": "low|medium|high (optional)",
  "category": "string (optional)",
  "assignee": "string (optional)",
  "confidence": 0-1
}

Examples:
"Remind me to call John tomorrow at 2pm" ->
{
  "title": "Call John",
  "dueDate": "tomorrow 2pm as ISO",
  "confidence": 0.9
}

"High priority meeting with marketing team next Friday" ->
{
  "title": "Meeting with marketing team",
  "dueDate": "next Friday as ISO",
  "priority": "high",
  "category": "meeting",
  "confidence": 0.85
}`;

    try {
      const response = await this.chat(text, systemPrompt);
      const parsed = JSON.parse(response);

      // Validate and clean the response
      return {
        title: parsed.title || "Untitled Task",
        description: parsed.description,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
        priority: ["low", "medium", "high"].includes(parsed.priority)
          ? parsed.priority
          : undefined,
        category: parsed.category,
        assignee: parsed.assignee,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      };
    } catch (error) {
      console.error("Task extraction error:", error);
      return {
        title: text.slice(0, 50),
        confidence: 0.1,
      };
    }
  }

  async generateProductivityInsights(data: {
    tasks: any[];
    goals: any[];
    habits: any[];
    timeEntries: any[];
  }): Promise<ProductivityInsight[]> {
    const systemPrompt = `You are a productivity analyst. Analyze the provided data and generate actionable insights.
Focus on patterns, recommendations, warnings, and achievements.
Return a JSON array of insights with this structure:
{
  "type": "pattern|recommendation|warning|achievement",
  "title": "short title",
  "description": "detailed description",
  "data": {},
  "confidence": 0-1,
  "actionable": boolean,
  "suggestedActions": ["action1", "action2"]
}`;

    try {
      const dataString = JSON.stringify(data, null, 2);
      const response = await this.chat(
        `Analyze this productivity data and provide insights:\n${dataString}`,
        systemPrompt,
      );
      return JSON.parse(response);
    } catch (error) {
      console.error("Insights generation error:", error);
      return [];
    }
  }

  async suggestNextAction(context: {
    currentTime: Date;
    tasks: any[];
    goals: any[];
    userPreferences: any;
  }): Promise<string> {
    const systemPrompt = `You are a productivity coach. Based on the current context, suggest the most productive next action.
Consider:
- Current time and energy levels
- Task priorities and deadlines
- Goal alignment
- User preferences
- Workload balance

Provide a specific, actionable suggestion in natural language.`;

    try {
      const contextString = JSON.stringify(context, null, 2);
      return await this.chat(
        `What should I work on next? Context:\n${contextString}`,
        systemPrompt,
      );
    } catch (error) {
      console.error("Next action suggestion error:", error);
      return "I recommend reviewing your task list and prioritizing the most urgent items.";
    }
  }

  private addToContext(role: "user" | "assistant", content: string) {
    this.conversationContext.push({
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    });

    // Keep only last 20 messages to prevent context overflow
    if (this.conversationContext.length > 20) {
      this.conversationContext = this.conversationContext.slice(-20);
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are BeProductive AI, a helpful productivity assistant.
You help users manage tasks, set goals, track habits, and optimize their productivity.
You are conversational, supportive, and provide actionable advice.
Keep responses concise and helpful.`;
  }

  clearContext() {
    this.conversationContext = [];
  }

  getContext(): AIMessage[] {
    return [...this.conversationContext];
  }

  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeProvider();
  }
}

export default AIService;
