// Intent Recognition Service
import { Intent, IntentType, IntentProcessingResult, IntentContext, EntityExtraction, SuggestedAction } from '../types/intent';

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  keywords: string[];
  entityExtractors: Array<(text: string) => Partial<EntityExtraction>>;
  confidence: number;
}

class IntentRecognitionService {
  private patterns: IntentPattern[] = [
    {
      type: 'create-task',
      patterns: [
        /(?:create|add|make|new)\s+(?:a\s+)?task/i,
        /(?:i\s+)?need\s+to\s+(?:do|complete|finish)/i,
        /(?:remind\s+me\s+to|remember\s+to)/i,
        /(?:todo|to-do).*(?:item|task)/i
      ],
      keywords: ['task', 'todo', 'remind', 'complete', 'finish', 'do'],
      entityExtractors: [
        this.extractTaskTitle,
        this.extractPriority,
        this.extractDueDate,
        this.extractTimeEstimate
      ],
      confidence: 0.9
    },
    {
      type: 'create-goal',
      patterns: [
        /(?:set|create|add|make)\s+(?:a\s+)?goal/i,
        /(?:i\s+)?want\s+to\s+achieve/i,
        /(?:my\s+)?objective\s+is/i,
        /(?:aim|target|goal)\s+(?:for|to)/i
      ],
      keywords: ['goal', 'achieve', 'objective', 'aim', 'target'],
      entityExtractors: [
        this.extractGoalTitle,
        this.extractTimeframe,
        this.extractMeasurement
      ],
      confidence: 0.85
    },
    {
      type: 'complete-task',
      patterns: [
        /(?:mark|set)\s+(?:as\s+)?(?:done|complete|finished)/i,
        /(?:i\s+)?(?:completed|finished|done)\s+(?:with\s+)?(?:the\s+)?task/i,
        /(?:task\s+)?(?:is\s+)?(?:done|complete|finished)/i
      ],
      keywords: ['done', 'complete', 'finished', 'mark'],
      entityExtractors: [this.extractTaskReference],
      confidence: 0.95
    },
    {
      type: 'prioritize-tasks',
      patterns: [
        /(?:prioritize|organize|sort)\s+(?:my\s+)?tasks/i,
        /(?:what\s+)?(?:should|must)\s+i\s+(?:do\s+)?(?:first|next)/i,
        /(?:which\s+task\s+is\s+)?(?:most\s+)?(?:important|urgent)/i
      ],
      keywords: ['prioritize', 'important', 'urgent', 'first', 'next'],
      entityExtractors: [this.extractPriorityContext],
      confidence: 0.8
    },
    {
      type: 'get-summary',
      patterns: [
        /(?:show|give|tell)\s+me\s+(?:a\s+)?(?:summary|overview)/i,
        /(?:what\s+)?(?:did\s+i|have\s+i)\s+(?:do|accomplish|complete)/i,
        /(?:how\s+am\s+i\s+doing|progress\s+report)/i,
        /(?:daily|weekly|monthly)\s+(?:summary|report)/i
      ],
      keywords: ['summary', 'overview', 'progress', 'report', 'status'],
      entityExtractors: [this.extractTimeframe, this.extractScope],
      confidence: 0.85
    },
    {
      type: 'voice-command',
      patterns: [
        /^(?:hey|hi|hello)\s+(?:assistant|ai)/i,
        /(?:voice\s+)?(?:command|control)/i,
        /(?:listen|activate)/i
      ],
      keywords: ['hey', 'assistant', 'voice', 'listen'],
      entityExtractors: [this.extractVoiceCommand],
      confidence: 0.9
    }
  ];

  public async recognizeIntent(
    text: string,
    context?: IntentContext
  ): Promise<IntentProcessingResult> {
    const startTime = Date.now();

    try {
      // Clean and normalize input text
      const normalizedText = this.normalizeText(text);

      // Score all patterns against the text
      const scores = this.patterns.map(pattern => ({
        pattern,
        score: this.calculateScore(normalizedText, pattern, context)
      }));

      // Find the best match
      const bestMatch = scores.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      // Extract entities using the best pattern's extractors
      const entities = this.extractEntities(text, bestMatch.pattern);

      // Create intent object
      const intent: Intent = {
        type: bestMatch.pattern.type,
        confidence: bestMatch.score,
        confidenceLevel: this.getConfidenceLevel(bestMatch.score),
        entities,
        rawText: text,
        processedAt: new Date(),
        context: context?.currentWorkspace
      };

      // Generate suggested actions
      const suggestedActions = await this.generateSuggestedActions(intent, entities);

      // Determine if clarification is needed
      const needsClarification = this.needsClarification(intent, entities);
      const clarificationQuestions = needsClarification
        ? this.generateClarificationQuestions(intent, entities)
        : [];

      return {
        intent,
        suggestedActions,
        needsClarification,
        clarificationQuestions,
        confidence: bestMatch.score,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Intent recognition error:', error);

      // Fallback intent for errors
      return {
        intent: {
          type: 'general-question',
          confidence: 0.1,
          confidenceLevel: 'low',
          entities: {},
          rawText: text,
          processedAt: new Date()
        },
        suggestedActions: [],
        needsClarification: false,
        clarificationQuestions: [],
        confidence: 0.1,
        processingTime: Date.now() - startTime
      };
    }
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ');
  }

  private calculateScore(
    text: string,
    pattern: IntentPattern,
    context?: IntentContext
  ): number {
    let score = 0;

    // Pattern matching score
    const patternMatches = pattern.patterns.filter(p => p.test(text)).length;
    score += (patternMatches / pattern.patterns.length) * 0.6;

    // Keyword matching score
    const keywordMatches = pattern.keywords.filter(keyword =>
      text.includes(keyword.toLowerCase())
    ).length;
    score += (keywordMatches / pattern.keywords.length) * 0.3;

    // Context bonus
    if (context?.currentWorkspace.activeModule) {
      // Boost score if intent matches current module context
      score += 0.1;
    }

    // Base confidence from pattern
    score *= pattern.confidence;

    return Math.min(score, 1.0);
  }

  private extractEntities(text: string, pattern: IntentPattern): EntityExtraction {
    const entities: EntityExtraction = {};

    pattern.entityExtractors.forEach(extractor => {
      const extracted = extractor(text);
      Object.assign(entities, extracted);
    });

    return entities;
  }

  private getConfidenceLevel(score: number): 'low' | 'medium' | 'high' | 'very-high' {
    if (score >= 0.9) return 'very-high';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  private needsClarification(intent: Intent, entities: EntityExtraction): boolean {
    switch (intent.type) {
      case 'create-task':
        return !entities.title || entities.title.length < 3;
      case 'create-goal':
        return !entities.title;
      case 'complete-task':
        return !entities.title && !entities.taskId;
      default:
        return intent.confidence < 0.6;
    }
  }

  private generateClarificationQuestions(intent: Intent, entities: EntityExtraction): string[] {
    const questions: string[] = [];

    switch (intent.type) {
      case 'create-task':
        if (!entities.title) {
          questions.push("What would you like to call this task?");
        }
        if (!entities.dueDate) {
          questions.push("When would you like to complete this task?");
        }
        if (!entities.priority) {
          questions.push("How important is this task? (low, medium, high, urgent)");
        }
        break;

      case 'create-goal':
        if (!entities.title) {
          questions.push("What is your goal?");
        }
        if (!entities.timeframe) {
          questions.push("What's your target timeframe for this goal?");
        }
        break;
    }

    return questions;
  }

  private async generateSuggestedActions(
    intent: Intent,
    entities: EntityExtraction
  ): Promise<SuggestedAction[]> {
    const actions: SuggestedAction[] = [];

    switch (intent.type) {
      case 'create-task':
        actions.push({
          id: 'create-task-action',
          type: 'create',
          module: 'task-management',
          action: 'createTask',
          parameters: {
            title: entities.title,
            description: entities.description,
            priority: entities.priority || 'medium',
            dueDate: entities.dueDate,
            estimatedTime: entities.estimatedTime
          },
          confidence: intent.confidence,
          description: `Create task: "${entities.title || 'New Task'}"`,
          previewText: `I'll create a ${entities.priority || 'medium'} priority task${entities.dueDate ? ` due ${entities.dueDate}` : ''}`
        });
        break;

      case 'get-summary':
        actions.push({
          id: 'show-summary-action',
          type: 'navigate',
          module: 'productivity-cycle',
          action: 'showSummary',
          parameters: {
            timeframe: entities.timeframe || 'today',
            scope: entities.scope || 'all'
          },
          confidence: intent.confidence,
          description: 'Show productivity summary',
          previewText: `I'll show you a summary of ${entities.timeframe || "today's"} progress`
        });
        break;
    }

    return actions;
  }

  // Entity extraction helper methods
  private extractTaskTitle(text: string): Partial<EntityExtraction> {
    const patterns = [
      /(?:task|todo)(?:\s+(?:to|is|for))?\s+(.+?)(?:\s+(?:by|before|due|on)|\s*$)/i,
      /(?:need\s+to|have\s+to|must)\s+(.+?)(?:\s+(?:by|before|due|on)|\s*$)/i,
      /(?:remind\s+me\s+to)\s+(.+?)(?:\s+(?:by|before|due|on)|\s*$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return { title: match[1].trim() };
      }
    }

    return {};
  }

  private extractPriority(text: string): Partial<EntityExtraction> {
    const urgentWords = ['urgent', 'asap', 'emergency', 'critical'];
    const highWords = ['important', 'high', 'priority'];
    const lowWords = ['low', 'minor', 'when possible'];

    const lowerText = text.toLowerCase();

    if (urgentWords.some(word => lowerText.includes(word))) {
      return { priority: 'urgent' };
    }
    if (highWords.some(word => lowerText.includes(word))) {
      return { priority: 'high' };
    }
    if (lowWords.some(word => lowerText.includes(word))) {
      return { priority: 'low' };
    }

    return {};
  }

  private extractDueDate(text: string): Partial<EntityExtraction> {
    const datePatterns = [
      /(?:by|before|due|on)\s+(today|tomorrow|yesterday)/i,
      /(?:by|before|due|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:by|before|due|on)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
      /(?:by|before|due|on)\s+(next\s+week|this\s+week)/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return { dueDate: match[1] };
      }
    }

    return {};
  }

  private extractTimeEstimate(text: string): Partial<EntityExtraction> {
    const timePatterns = [
      /(\d+)\s*(?:hours?|hrs?|h)/i,
      /(\d+)\s*(?:minutes?|mins?|m)/i,
      /(\d+)\s*(?:days?|d)/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseInt(match[1]);
        return { estimatedTime: value };
      }
    }

    return {};
  }

  private extractGoalTitle(text: string): Partial<EntityExtraction> {
    const patterns = [
      /(?:goal|objective|aim|target)(?:\s+(?:is|to))?\s+(.+?)(?:\s+(?:by|before|within)|\s*$)/i,
      /(?:want\s+to|need\s+to)\s+achieve\s+(.+?)(?:\s+(?:by|before|within)|\s*$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return { title: match[1].trim() };
      }
    }

    return {};
  }

  private extractTimeframe(text: string): Partial<EntityExtraction> {
    const timeframes = ['today', 'week', 'month', 'year', 'daily', 'weekly', 'monthly'];
    const lowerText = text.toLowerCase();

    for (const timeframe of timeframes) {
      if (lowerText.includes(timeframe)) {
        return { timeframe };
      }
    }

    return {};
  }

  private extractMeasurement(text: string): Partial<EntityExtraction> {
    // Extract measurable criteria from goal text
    return {};
  }

  private extractTaskReference(text: string): Partial<EntityExtraction> {
    // Extract task references (by name or ID)
    return {};
  }

  private extractPriorityContext(text: string): Partial<EntityExtraction> {
    // Extract context for prioritization
    return {};
  }

  private extractScope(text: string): Partial<EntityExtraction> {
    // Extract scope for summaries
    return {};
  }

  private extractVoiceCommand(text: string): Partial<EntityExtraction> {
    // Extract voice command specifics
    return {};
  }
}

export const intentRecognitionService = new IntentRecognitionService();