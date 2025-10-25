import {
  PromptTemplate,
  UserIntent,
  AppContext,
  PromptSearchOptions,
  PromptLibraryResponse,
  GetPromptsResponse,
  GetPromptResponse,
  RecognizeIntentResponse,
  SearchPromptsResponse,
  LibraryStatsResponse,
  PromptLibraryStats,
  CustomPrompt,
  PromptFeedback,
  PromptChain,
  PromptLibraryEventData
} from '@/types/promptLibrary';

import { IntentRecognitionEngine } from '@/services/intentRecognition';
import { PromptEnhancer } from '@/services/promptEnhancer';
import { promptAnalytics } from '@/services/promptAnalytics';
import { PROMPT_TEMPLATES } from '@/data/promptTemplates';

/**
 * PromptLibraryManager - Central service for managing Luna's prompt library
 * Handles intent recognition, prompt selection, enhancement, and execution
 */
export class PromptLibraryManager {
  private intentEngine: IntentRecognitionEngine;
  private promptEnhancer: PromptEnhancer;
  private customPrompts: Map<string, CustomPrompt> = new Map();
  private promptChains: Map<string, PromptChain> = new Map();
  private analytics: PromptLibraryEventData[] = [];

  constructor() {
    this.intentEngine = new IntentRecognitionEngine();
    this.promptEnhancer = new PromptEnhancer();
    this.loadCustomPrompts();
    this.loadPromptChains();
  }

  // ========================================
  // MAIN INTENT-TO-PROMPT FLOW
  // ========================================

  /**
   * Main method: Processes user input through the complete intent-to-prompt pipeline
   */
  async processUserInput(
    userInput: string,
    context: AppContext
  ): Promise<{
    intent: UserIntent;
    prompt: PromptTemplate;
    enhancedPrompt: string;
    confidence: number;
    analyticsEventId?: string;
  }> {
    try {
      // 1. Recognize user intent
      const intent = await this.intentEngine.recognizeIntent(userInput, context);

      // 2. Find best matching prompt
      const prompt = await this.findBestPrompt(intent, context);

      // 3. Enhance prompt with context
      const enhancedPrompt = await this.promptEnhancer.enhancePrompt(
        prompt,
        intent,
        context
      );

      // 4. Track analytics
      const eventId = promptAnalytics.trackPromptUsage({
        promptId: prompt.id,
        templateId: prompt.id,
        userInput,
        enhancedPrompt,
        intent,
        confidence: intent.confidence,
        context: context.currentModule,
        outcome: 'successful'
      });

      // 5. Log the interaction for legacy compatibility
      this.logInteraction(intent, prompt.id, 'success');

      return {
        intent,
        prompt,
        enhancedPrompt,
        confidence: intent.confidence,
        analyticsEventId: eventId
      };

    } catch (error) {
      console.error('Error processing user input:', error);

      // Fallback to general helper
      const fallbackIntent: UserIntent = {
        id: this.generateId(),
        category: 'general',
        action: 'explain',
        entities: { originalInput: userInput },
        confidence: 0.3,
        confidenceLevel: 'low',
        promptId: 'general-productivity-helper',
        requiresConfirmation: false,
        rawInput: userInput,
        timestamp: new Date(),
        context
      };

      const fallbackPrompt = PROMPT_TEMPLATES['general-productivity-helper'];
      const enhancedPrompt = await this.promptEnhancer.enhancePrompt(
        fallbackPrompt,
        fallbackIntent,
        context
      );

      this.logInteraction(fallbackIntent, fallbackPrompt.id, 'fallback');

      return {
        intent: fallbackIntent,
        prompt: fallbackPrompt,
        enhancedPrompt,
        confidence: 0.3
      };
    }
  }

  /**
   * Find the best prompt template for a given intent
   */
  async findBestPrompt(intent: UserIntent, context: AppContext): Promise<PromptTemplate> {
    // Start with direct prompt ID match if available
    if (intent.promptId && PROMPT_TEMPLATES[intent.promptId]) {
      return PROMPT_TEMPLATES[intent.promptId];
    }

    // Score all prompts for this intent
    const candidates = await this.scorePromptsForIntent(intent, context);

    if (candidates.length === 0) {
      // Return general helper as fallback
      return PROMPT_TEMPLATES['general-productivity-helper'];
    }

    // Return the best scoring prompt
    const bestPrompt = candidates[0];
    intent.promptId = bestPrompt.id; // Update intent with selected prompt

    return bestPrompt;
  }

  /**
   * Score prompts based on intent relevance and context
   */
  private async scorePromptsForIntent(
    intent: UserIntent,
    context: AppContext
  ): Promise<PromptTemplate[]> {
    const scores: Array<{ prompt: PromptTemplate; score: number }> = [];

    // Score all prompts
    Object.values(PROMPT_TEMPLATES).forEach(prompt => {
      let score = 0;

      // Category match (high weight)
      if (prompt.category === intent.category) {
        score += 10;
      }

      // Keyword matching in prompt keywords
      const inputWords = intent.rawInput.toLowerCase().split(' ');
      inputWords.forEach(word => {
        if (prompt.keywords.primary.some(k => k.includes(word))) score += 3;
        if (prompt.keywords.synonyms.some(k => k.includes(word))) score += 2;
        if (prompt.keywords.contextVariations.some(k => k.includes(word))) score += 2;
        if (prompt.keywords.informalVersions.some(k => k.includes(word))) score += 1;
      });

      // Context relevance
      if (context.currentRoute.includes(prompt.category)) {
        score += 2;
      }

      // Performance boost for high-performing prompts
      if (prompt.performance.successRate > 0.8) {
        score += 1;
      }

      // User experience level matching
      if (this.matchesDifficultyLevel(prompt, context)) {
        score += 1;
      }

      scores.push({ prompt, score });
    });

    // Include custom prompts
    this.customPrompts.forEach(customPrompt => {
      const prompt = this.convertCustomToPrompt(customPrompt);
      let score = 0;

      if (prompt.category === intent.category) score += 10;

      // Custom prompts get a small boost for personalization
      score += 0.5;

      scores.push({ prompt, score });
    });

    // Sort by score and return prompts
    return scores
      .sort((a, b) => b.score - a.score)
      .filter(s => s.score > 0)
      .map(s => s.prompt);
  }

  // ========================================
  // PROMPT LIBRARY MANAGEMENT
  // ========================================

  /**
   * Get all prompts with optional filtering
   */
  async getPrompts(options: PromptSearchOptions = {}): Promise<GetPromptsResponse> {
    try {
      let prompts = Object.values(PROMPT_TEMPLATES);

      // Add custom prompts if user wants them
      if (options.author === 'user') {
        const customPromptTemplates = Array.from(this.customPrompts.values())
          .map(cp => this.convertCustomToPrompt(cp));
        prompts = [...prompts, ...customPromptTemplates];
      }

      // Apply filters
      if (options.category) {
        prompts = prompts.filter(p => p.category === options.category);
      }

      if (options.tags && options.tags.length > 0) {
        prompts = prompts.filter(p =>
          options.tags!.some(tag => p.tags.includes(tag))
        );
      }

      if (options.difficulty) {
        prompts = prompts.filter(p => p.difficulty === options.difficulty);
      }

      if (options.minRating) {
        prompts = prompts.filter(p =>
          p.performance.userSatisfactionScore >= options.minRating!
        );
      }

      // Apply search query
      if (options.query) {
        prompts = this.searchPromptsInternal(prompts, options.query);
      }

      // Sort results
      prompts = this.sortPrompts(prompts, options.sortBy || 'relevance');

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const paginatedPrompts = prompts.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedPrompts,
        metadata: {
          total: prompts.length,
          page: Math.floor(offset / limit) + 1,
          hasMore: offset + limit < prompts.length
        }
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get prompts'
      };
    }
  }

  /**
   * Get a specific prompt by ID
   */
  async getPrompt(id: string): Promise<GetPromptResponse> {
    try {
      const prompt = PROMPT_TEMPLATES[id] || this.getCustomPromptAsTemplate(id);

      if (!prompt) {
        return {
          success: false,
          data: {} as PromptTemplate,
          error: 'Prompt not found'
        };
      }

      return {
        success: true,
        data: prompt
      };

    } catch (error) {
      return {
        success: false,
        data: {} as PromptTemplate,
        error: error instanceof Error ? error.message : 'Failed to get prompt'
      };
    }
  }

  /**
   * Search prompts by query
   */
  async searchPrompts(query: string, options: PromptSearchOptions = {}): Promise<SearchPromptsResponse> {
    try {
      const searchOptions = { ...options, query };
      return await this.getPrompts(searchOptions);

    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Get library statistics
   */
  async getLibraryStats(): Promise<LibraryStatsResponse> {
    try {
      const allPrompts = Object.values(PROMPT_TEMPLATES);
      const customPrompts = Array.from(this.customPrompts.values());

      // Calculate category counts
      const categoryCounts = allPrompts.reduce((acc, prompt) => {
        acc[prompt.category] = (acc[prompt.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average rating
      const ratings = allPrompts
        .map(p => p.performance.userSatisfactionScore)
        .filter(r => r > 0);
      const averageRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      // Get popular prompts
      const popularPrompts = allPrompts
        .sort((a, b) => b.usage.totalUses - a.usage.totalUses)
        .slice(0, 5)
        .map(p => p.id);

      // Get recent prompts
      const recentlyAdded = allPrompts
        .sort((a, b) => b.created.getTime() - a.created.getTime())
        .slice(0, 5)
        .map(p => p.id);

      // Get top performers
      const topPerformers = allPrompts
        .filter(p => p.performance.successRate > 0)
        .sort((a, b) => b.performance.successRate - a.performance.successRate)
        .slice(0, 5)
        .map(p => p.id);

      const stats: PromptLibraryStats = {
        totalPrompts: allPrompts.length + customPrompts.length,
        categoryCounts: categoryCounts as any,
        averageRating,
        mostPopularPrompts: popularPrompts,
        recentlyAdded,
        topPerformers,
        userEngagement: {
          activeUsers: this.getActiveUserCount(),
          averageSessionLength: this.getAverageSessionLength(),
          promptsPerSession: this.getPromptsPerSession()
        }
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      return {
        success: false,
        data: {} as PromptLibraryStats,
        error: error instanceof Error ? error.message : 'Failed to get stats'
      };
    }
  }

  // ========================================
  // CUSTOM PROMPT MANAGEMENT
  // ========================================

  /**
   * Create a custom prompt
   */
  async createCustomPrompt(customPrompt: Omit<CustomPrompt, 'userId'>): Promise<string> {
    const id = this.generateId();
    const fullCustomPrompt: CustomPrompt = {
      ...customPrompt,
      userId: 'current-user', // This would come from auth context
    };

    this.customPrompts.set(id, fullCustomPrompt);
    this.saveCustomPrompts();

    this.logInteraction(
      { id, category: 'general', action: 'create' } as UserIntent,
      id,
      'custom_prompt_created'
    );

    return id;
  }

  /**
   * Update a custom prompt
   */
  async updateCustomPrompt(id: string, updates: Partial<CustomPrompt>): Promise<boolean> {
    const existing = this.customPrompts.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.customPrompts.set(id, updated);
    this.saveCustomPrompts();

    return true;
  }

  /**
   * Delete a custom prompt
   */
  async deleteCustomPrompt(id: string): Promise<boolean> {
    const success = this.customPrompts.delete(id);
    if (success) {
      this.saveCustomPrompts();
    }
    return success;
  }

  // ========================================
  // FEEDBACK AND ANALYTICS
  // ========================================

  /**
   * Submit feedback for a prompt
   */
  async submitFeedback(feedback: Omit<PromptFeedback, 'id' | 'userId' | 'timestamp'>, eventId?: string): Promise<void> {
    const fullFeedback: PromptFeedback = {
      ...feedback,
      id: this.generateId(),
      userId: 'current-user',
      timestamp: new Date()
    };

    // Update prompt performance
    const prompt = PROMPT_TEMPLATES[feedback.promptId];
    if (prompt) {
      prompt.performance.feedback.push(fullFeedback);
      this.updatePromptPerformance(prompt, fullFeedback);
    }

    // Track analytics feedback
    if (eventId) {
      promptAnalytics.trackUserFeedback(eventId, {
        rating: feedback.rating,
        wasHelpful: feedback.wasHelpful,
        feedback: feedback.feedback
      });
    }

    this.logInteraction(
      { id: this.generateId(), category: 'general', action: 'review' } as UserIntent,
      feedback.promptId,
      'feedback_submitted'
    );
  }

  /**
   * Train intent recognition from user feedback
   */
  async trainFromFeedback(
    originalInput: string,
    correctIntent: UserIntent,
    wasCorrect: boolean,
    predictedIntent?: UserIntent
  ): Promise<void> {
    await this.intentEngine.trainFromFeedback(originalInput, correctIntent, wasCorrect);

    // Track intent correction analytics
    if (predictedIntent && !wasCorrect) {
      promptAnalytics.trackIntentCorrection(originalInput, predictedIntent, correctIntent);
    }

    this.logInteraction(
      correctIntent,
      correctIntent.promptId,
      wasCorrect ? 'intent_confirmed' : 'intent_corrected'
    );
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Internal search implementation
   */
  private searchPromptsInternal(prompts: PromptTemplate[], query: string): PromptTemplate[] {
    const searchTerms = query.toLowerCase().split(' ');

    return prompts.filter(prompt => {
      const searchableText = [
        prompt.name,
        prompt.description,
        ...prompt.keywords.primary,
        ...prompt.keywords.synonyms,
        ...prompt.keywords.informalVersions,
        ...prompt.tags
      ].join(' ').toLowerCase();

      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  /**
   * Sort prompts by different criteria
   */
  private sortPrompts(prompts: PromptTemplate[], sortBy: string): PromptTemplate[] {
    switch (sortBy) {
      case 'popularity':
        return prompts.sort((a, b) => b.usage.totalUses - a.usage.totalUses);

      case 'rating':
        return prompts.sort((a, b) =>
          b.performance.userSatisfactionScore - a.performance.userSatisfactionScore
        );

      case 'recent':
        return prompts.sort((a, b) => b.updated.getTime() - a.updated.getTime());

      case 'relevance':
      default:
        return prompts.sort((a, b) => {
          const scoreA = (a.performance.successRate * 0.4) +
                        (a.usage.totalUses * 0.3) +
                        (a.performance.userSatisfactionScore * 0.3);
          const scoreB = (b.performance.successRate * 0.4) +
                        (b.usage.totalUses * 0.3) +
                        (b.performance.userSatisfactionScore * 0.3);
          return scoreB - scoreA;
        });
    }
  }

  /**
   * Check if prompt difficulty matches user experience
   */
  private matchesDifficultyLevel(prompt: PromptTemplate, context: AppContext): boolean {
    // This would ideally analyze user's interaction history to determine experience level
    // For now, assume all users can handle any difficulty
    return true;
  }

  /**
   * Convert custom prompt to template format
   */
  private convertCustomToPrompt(custom: CustomPrompt): PromptTemplate {
    return {
      ...custom,
      id: `custom_${custom.userId}_${Date.now()}`,
      author: custom.userId,
      usage: {
        totalUses: 0,
        uniqueUsers: 1,
        averageResponseTime: 0,
        lastUsed: new Date(),
        popularVariations: [],
        commonFollowUps: []
      },
      performance: {
        successRate: 0,
        userSatisfactionScore: 0,
        accuracyRate: 0,
        completionRate: 0,
        errorRate: 0,
        feedback: []
      },
      created: new Date(),
      updated: new Date()
    };
  }

  /**
   * Get custom prompt as template
   */
  private getCustomPromptAsTemplate(id: string): PromptTemplate | null {
    const custom = this.customPrompts.get(id);
    return custom ? this.convertCustomToPrompt(custom) : null;
  }

  /**
   * Update prompt performance metrics
   */
  private updatePromptPerformance(prompt: PromptTemplate, feedback: PromptFeedback): void {
    const allFeedback = prompt.performance.feedback;

    // Recalculate metrics
    prompt.performance.userSatisfactionScore =
      allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

    // Update other metrics (this would be more sophisticated in practice)
    prompt.performance.successRate =
      allFeedback.filter(f => f.wasHelpful).length / allFeedback.length;
  }

  /**
   * Log interaction for analytics
   */
  private logInteraction(intent: UserIntent, promptId: string, result: string): void {
    const event: PromptLibraryEventData = {
      eventType: 'prompt_used',
      userId: 'current-user',
      promptId,
      intentId: intent.id,
      metadata: {
        result,
        category: intent.category,
        action: intent.action,
        confidence: intent.confidence
      },
      timestamp: new Date()
    };

    this.analytics.push(event);

    // Keep only recent events (last 1000)
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }
  }

  /**
   * Load custom prompts from storage
   */
  private loadCustomPrompts(): void {
    try {
      const stored = localStorage.getItem('luna_custom_prompts');
      if (stored) {
        const prompts = JSON.parse(stored);
        Object.entries(prompts).forEach(([id, prompt]) => {
          this.customPrompts.set(id, prompt as CustomPrompt);
        });
      }
    } catch (error) {
      console.warn('Failed to load custom prompts:', error);
    }
  }

  /**
   * Save custom prompts to storage
   */
  private saveCustomPrompts(): void {
    try {
      const prompts = Object.fromEntries(this.customPrompts);
      localStorage.setItem('luna_custom_prompts', JSON.stringify(prompts));
    } catch (error) {
      console.warn('Failed to save custom prompts:', error);
    }
  }

  /**
   * Load prompt chains from storage
   */
  private loadPromptChains(): void {
    // This would load saved prompt chains
    // For now, we'll keep it empty
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Analytics helper methods
   */
  private getActiveUserCount(): number {
    const recentEvents = this.analytics.filter(
      e => e.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    return new Set(recentEvents.map(e => e.userId)).size;
  }

  private getAverageSessionLength(): number {
    // This would calculate based on session data
    return 0; // Placeholder
  }

  private getPromptsPerSession(): number {
    // This would calculate average prompts used per session
    return 0; // Placeholder
  }

  /**
   * Get intent recognition statistics
   */
  getIntentStats() {
    return this.intentEngine.getStats();
  }

  /**
   * Get recent analytics events
   */
  getRecentAnalytics(limit: number = 100): PromptLibraryEventData[] {
    return this.analytics.slice(-limit);
  }
}