import {
  UserIntent,
  AppContext,
  PromptCategory,
  PromptAction,
  ConfidenceLevel,
  IntentRecognitionConfig,
  KeywordMapping,
  PromptLibraryEventData
} from '@/types/promptLibrary';

// Default configuration for intent recognition
const DEFAULT_CONFIG: IntentRecognitionConfig = {
  confidenceThreshold: 0.6,
  enableLearning: true,
  fallbackToGeneral: true,
  multiIntentHandling: 'select_best',
  contextWeight: 0.3,
  keywordWeight: 0.4,
  semanticWeight: 0.3
};

// Keyword mappings for different categories and actions
const CATEGORY_KEYWORDS: Record<PromptCategory, KeywordMapping> = {
  tasks: {
    primary: ['task', 'todo', 'reminder', 'deadline', 'due'],
    synonyms: ['item', 'action', 'job', 'assignment', 'work'],
    multilingual: {
      en: ['task', 'todo', 'reminder'],
      es: ['tarea', 'pendiente', 'recordatorio'],
      fr: ['tâche', 'rappel', 'échéance'],
      de: ['aufgabe', 'erinnerung', 'termin']
    },
    contextVariations: ['add task', 'create todo', 'new reminder'],
    informalVersions: ['stuff to do', 'things', 'need to'],
    technicalTerms: ['deliverable', 'milestone', 'sprint item']
  },

  goals: {
    primary: ['goal', 'objective', 'target', 'aim', 'achievement'],
    synonyms: ['purpose', 'ambition', 'milestone', 'outcome'],
    multilingual: {
      en: ['goal', 'objective', 'target'],
      es: ['meta', 'objetivo', 'propósito'],
      fr: ['objectif', 'but', 'cible'],
      de: ['ziel', 'objektiv', 'zweck']
    },
    contextVariations: ['set goal', 'achieve target', 'reach objective'],
    informalVersions: ['want to', 'hoping to', 'trying to'],
    technicalTerms: ['KPI', 'OKR', 'metric', 'benchmark']
  },

  habits: {
    primary: ['habit', 'routine', 'practice', 'consistency', 'regular'],
    synonyms: ['custom', 'pattern', 'ritual', 'discipline'],
    multilingual: {
      en: ['habit', 'routine', 'practice'],
      es: ['hábito', 'rutina', 'práctica'],
      fr: ['habitude', 'routine', 'pratique'],
      de: ['gewohnheit', 'routine', 'praxis']
    },
    contextVariations: ['build habit', 'daily routine', 'consistent practice'],
    informalVersions: ['do regularly', 'every day', 'keep doing'],
    technicalTerms: ['behavior pattern', 'automation', 'conditioning']
  },

  projects: {
    primary: ['project', 'initiative', 'endeavor', 'undertaking'],
    synonyms: ['work', 'effort', 'campaign', 'program'],
    multilingual: {
      en: ['project', 'initiative', 'work'],
      es: ['proyecto', 'iniciativa', 'trabajo'],
      fr: ['projet', 'initiative', 'travail'],
      de: ['projekt', 'initiative', 'arbeit']
    },
    contextVariations: ['start project', 'manage project', 'project planning'],
    informalVersions: ['big thing', 'major work', 'important stuff'],
    technicalTerms: ['deliverable', 'workstream', 'portfolio']
  },

  analytics: {
    primary: ['analyze', 'report', 'insights', 'data', 'metrics'],
    synonyms: ['review', 'examine', 'study', 'evaluate'],
    multilingual: {
      en: ['analyze', 'report', 'insights'],
      es: ['analizar', 'reporte', 'datos'],
      fr: ['analyser', 'rapport', 'données'],
      de: ['analysieren', 'bericht', 'daten']
    },
    contextVariations: ['show analytics', 'generate report', 'analyze performance'],
    informalVersions: ['how am I doing', 'show me stats', 'what happened'],
    technicalTerms: ['dashboard', 'KPI', 'performance metrics']
  },

  planning: {
    primary: ['plan', 'schedule', 'organize', 'arrange', 'prepare'],
    synonyms: ['strategy', 'agenda', 'timeline', 'roadmap'],
    multilingual: {
      en: ['plan', 'schedule', 'organize'],
      es: ['planear', 'programar', 'organizar'],
      fr: ['planifier', 'programmer', 'organiser'],
      de: ['planen', 'terminieren', 'organisieren']
    },
    contextVariations: ['plan day', 'schedule meeting', 'organize week'],
    informalVersions: ['figure out', 'set up', 'get ready'],
    technicalTerms: ['roadmap', 'timeline', 'sprint planning']
  },

  reflection: {
    primary: ['reflect', 'review', 'journal', 'think', 'consider'],
    synonyms: ['contemplate', 'ponder', 'assess', 'evaluate'],
    multilingual: {
      en: ['reflect', 'review', 'journal'],
      es: ['reflexionar', 'revisar', 'diario'],
      fr: ['réfléchir', 'réviser', 'journal'],
      de: ['reflektieren', 'überprüfen', 'tagebuch']
    },
    contextVariations: ['daily reflection', 'review progress', 'journal entry'],
    informalVersions: ['think about', 'look back', 'what went well'],
    technicalTerms: ['retrospective', 'post-mortem', 'assessment']
  },

  navigation: {
    primary: ['go to', 'open', 'show', 'navigate', 'switch'],
    synonyms: ['display', 'view', 'access', 'visit'],
    multilingual: {
      en: ['go to', 'open', 'show'],
      es: ['ir a', 'abrir', 'mostrar'],
      fr: ['aller à', 'ouvrir', 'montrer'],
      de: ['gehe zu', 'öffnen', 'zeigen']
    },
    contextVariations: ['go to tasks', 'open calendar', 'show analytics'],
    informalVersions: ['take me to', 'let me see', 'where is'],
    technicalTerms: ['route to', 'display view', 'access module']
  },

  settings: {
    primary: ['settings', 'configure', 'setup', 'preferences', 'options'],
    synonyms: ['config', 'adjust', 'customize', 'modify'],
    multilingual: {
      en: ['settings', 'configure', 'preferences'],
      es: ['configuración', 'configurar', 'preferencias'],
      fr: ['paramètres', 'configurer', 'préférences'],
      de: ['einstellungen', 'konfigurieren', 'einstellungen']
    },
    contextVariations: ['change settings', 'configure app', 'user preferences'],
    informalVersions: ['change how', 'make it', 'set up'],
    technicalTerms: ['configuration', 'parameters', 'options']
  },

  general: {
    primary: ['help', 'what', 'how', 'explain', 'tell'],
    synonyms: ['assist', 'guide', 'inform', 'clarify'],
    multilingual: {
      en: ['help', 'what', 'how', 'explain'],
      es: ['ayuda', 'qué', 'cómo', 'explicar'],
      fr: ['aide', 'quoi', 'comment', 'expliquer'],
      de: ['hilfe', 'was', 'wie', 'erklären']
    },
    contextVariations: ['help me', 'what is', 'how to', 'explain this'],
    informalVersions: ['i need', 'can you', 'show me'],
    technicalTerms: ['documentation', 'guidance', 'instructions']
  }
};

const ACTION_KEYWORDS: Record<PromptAction, KeywordMapping> = {
  create: {
    primary: ['create', 'add', 'new', 'make', 'build'],
    synonyms: ['generate', 'establish', 'start', 'begin'],
    multilingual: {
      en: ['create', 'add', 'new', 'make'],
      es: ['crear', 'agregar', 'nuevo', 'hacer'],
      fr: ['créer', 'ajouter', 'nouveau', 'faire'],
      de: ['erstellen', 'hinzufügen', 'neu', 'machen']
    },
    contextVariations: ['create new', 'add another', 'make a'],
    informalVersions: ['start', 'begin', 'set up'],
    technicalTerms: ['instantiate', 'initialize', 'provision']
  },

  update: {
    primary: ['update', 'edit', 'modify', 'change', 'revise'],
    synonyms: ['alter', 'adjust', 'amend', 'improve'],
    multilingual: {
      en: ['update', 'edit', 'modify', 'change'],
      es: ['actualizar', 'editar', 'modificar', 'cambiar'],
      fr: ['mettre à jour', 'éditer', 'modifier', 'changer'],
      de: ['aktualisieren', 'bearbeiten', 'ändern', 'modifizieren']
    },
    contextVariations: ['update the', 'edit this', 'change my'],
    informalVersions: ['fix', 'correct', 'redo'],
    technicalTerms: ['patch', 'refresh', 'synchronize']
  },

  delete: {
    primary: ['delete', 'remove', 'cancel', 'clear', 'eliminate'],
    synonyms: ['erase', 'destroy', 'purge', 'discard'],
    multilingual: {
      en: ['delete', 'remove', 'cancel', 'clear'],
      es: ['eliminar', 'quitar', 'cancelar', 'borrar'],
      fr: ['supprimer', 'enlever', 'annuler', 'effacer'],
      de: ['löschen', 'entfernen', 'stornieren', 'löschen']
    },
    contextVariations: ['delete this', 'remove the', 'cancel my'],
    informalVersions: ['get rid of', 'throw away', 'undo'],
    technicalTerms: ['purge', 'deallocate', 'terminate']
  },

  analyze: {
    primary: ['analyze', 'examine', 'review', 'study', 'investigate'],
    synonyms: ['assess', 'evaluate', 'inspect', 'scrutinize'],
    multilingual: {
      en: ['analyze', 'examine', 'review', 'study'],
      es: ['analizar', 'examinar', 'revisar', 'estudiar'],
      fr: ['analyser', 'examiner', 'réviser', 'étudier'],
      de: ['analysieren', 'untersuchen', 'überprüfen', 'studieren']
    },
    contextVariations: ['analyze my', 'review the', 'look at'],
    informalVersions: ['check out', 'see how', 'find out'],
    technicalTerms: ['audit', 'profile', 'benchmark']
  },

  plan: {
    primary: ['plan', 'schedule', 'organize', 'arrange', 'prepare'],
    synonyms: ['strategy', 'coordinate', 'blueprint', 'design'],
    multilingual: {
      en: ['plan', 'schedule', 'organize', 'arrange'],
      es: ['planear', 'programar', 'organizar', 'arreglar'],
      fr: ['planifier', 'programmer', 'organiser', 'arranger'],
      de: ['planen', 'terminieren', 'organisieren', 'arrangieren']
    },
    contextVariations: ['plan my', 'schedule the', 'organize for'],
    informalVersions: ['figure out', 'set up', 'get ready'],
    technicalTerms: ['architect', 'roadmap', 'strategize']
  },

  review: {
    primary: ['review', 'check', 'assess', 'evaluate', 'audit'],
    synonyms: ['examine', 'inspect', 'validate', 'verify'],
    multilingual: {
      en: ['review', 'check', 'assess', 'evaluate'],
      es: ['revisar', 'verificar', 'evaluar', 'auditar'],
      fr: ['réviser', 'vérifier', 'évaluer', 'auditer'],
      de: ['überprüfen', 'kontrollieren', 'bewerten', 'auditieren']
    },
    contextVariations: ['review my', 'check the', 'look over'],
    informalVersions: ['see how', 'check up on', 'look back'],
    technicalTerms: ['audit', 'validate', 'quality check']
  },

  optimize: {
    primary: ['optimize', 'improve', 'enhance', 'better', 'streamline'],
    synonyms: ['refine', 'perfect', 'upgrade', 'boost'],
    multilingual: {
      en: ['optimize', 'improve', 'enhance', 'better'],
      es: ['optimizar', 'mejorar', 'perfeccionar', 'mejor'],
      fr: ['optimiser', 'améliorer', 'perfectionner', 'mieux'],
      de: ['optimieren', 'verbessern', 'perfektionieren', 'besser']
    },
    contextVariations: ['optimize my', 'make better', 'improve the'],
    informalVersions: ['make faster', 'do better', 'work better'],
    technicalTerms: ['fine-tune', 'calibrate', 'maximize']
  },

  navigate: {
    primary: ['go', 'navigate', 'move', 'switch', 'open'],
    synonyms: ['visit', 'access', 'enter', 'display'],
    multilingual: {
      en: ['go', 'navigate', 'move', 'switch'],
      es: ['ir', 'navegar', 'mover', 'cambiar'],
      fr: ['aller', 'naviguer', 'bouger', 'changer'],
      de: ['gehen', 'navigieren', 'bewegen', 'wechseln']
    },
    contextVariations: ['go to', 'switch to', 'open the'],
    informalVersions: ['take me', 'show me', 'let me see'],
    technicalTerms: ['route', 'redirect', 'transition']
  },

  configure: {
    primary: ['configure', 'setup', 'set', 'adjust', 'customize'],
    synonyms: ['tailor', 'personalize', 'calibrate', 'tune'],
    multilingual: {
      en: ['configure', 'setup', 'set', 'adjust'],
      es: ['configurar', 'establecer', 'ajustar', 'personalizar'],
      fr: ['configurer', 'établir', 'ajuster', 'personnaliser'],
      de: ['konfigurieren', 'einrichten', 'einstellen', 'anpassen']
    },
    contextVariations: ['configure my', 'set up', 'adjust the'],
    informalVersions: ['change how', 'make it', 'fix the'],
    technicalTerms: ['parameterize', 'initialize', 'provision']
  },

  explain: {
    primary: ['explain', 'tell', 'describe', 'clarify', 'show'],
    synonyms: ['illustrate', 'demonstrate', 'detail', 'elaborate'],
    multilingual: {
      en: ['explain', 'tell', 'describe', 'show'],
      es: ['explicar', 'decir', 'describir', 'mostrar'],
      fr: ['expliquer', 'dire', 'décrire', 'montrer'],
      de: ['erklären', 'erzählen', 'beschreiben', 'zeigen']
    },
    contextVariations: ['explain how', 'tell me about', 'show me'],
    informalVersions: ['what is', 'how does', 'why'],
    technicalTerms: ['document', 'specify', 'define']
  }
};

export class IntentRecognitionEngine {
  private config: IntentRecognitionConfig;
  private learningData: Map<string, UserIntent> = new Map();

  constructor(config: Partial<IntentRecognitionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main method to recognize user intent from natural language input
   */
  async recognizeIntent(
    input: string,
    context: AppContext
  ): Promise<UserIntent> {
    const normalizedInput = this.normalizeInput(input);

    // Extract keywords and entities
    const keywords = this.extractKeywords(normalizedInput);
    const entities = this.extractEntities(normalizedInput, context);

    // Score potential categories and actions
    const categoryScores = this.scoreCategoriesFromKeywords(keywords, context);
    const actionScores = this.scoreActionsFromKeywords(keywords, context);

    // Select best category and action
    const bestCategory = this.selectBestOption(categoryScores);
    const bestAction = this.selectBestOption(actionScores);

    // Calculate overall confidence
    const confidence = this.calculateConfidence(
      bestCategory.score,
      bestAction.score,
      context
    );

    // Create intent object
    const intent: UserIntent = {
      id: this.generateIntentId(),
      category: bestCategory.option as PromptCategory,
      action: bestAction.option as PromptAction,
      entities,
      confidence,
      confidenceLevel: this.getConfidenceLevel(confidence),
      promptId: '', // Will be filled by prompt library
      requiresConfirmation: confidence < this.config.confidenceThreshold,
      rawInput: input,
      timestamp: new Date(),
      context
    };

    // Learn from this interaction if enabled
    if (this.config.enableLearning) {
      this.recordLearningData(input, intent);
    }

    // Fallback to general category if confidence is very low
    if (confidence < 0.3 && this.config.fallbackToGeneral) {
      intent.category = 'general';
      intent.action = 'explain';
      intent.requiresConfirmation = false;
    }

    return intent;
  }

  /**
   * Normalize input text for processing
   */
  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Extract relevant keywords from input
   */
  private extractKeywords(input: string): string[] {
    const words = input.split(' ');
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'i', 'me',
      'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours'
    ]);

    return words.filter(word =>
      word.length > 2 && !stopWords.has(word)
    );
  }

  /**
   * Extract entities (dates, numbers, names) from input
   */
  private extractEntities(input: string, context: AppContext): Record<string, any> {
    const entities: Record<string, any> = {};

    // Time-based entities
    const timePatterns = {
      today: /\b(today|now)\b/i,
      tomorrow: /\b(tomorrow|next day)\b/i,
      thisWeek: /\b(this week|current week)\b/i,
      nextWeek: /\b(next week|following week)\b/i,
      thisMonth: /\b(this month|current month)\b/i,
      specificTime: /\b(\d{1,2}:\d{2})\b/i,
      duration: /\b(\d+)\s*(minute|hour|day|week|month)s?\b/i
    };

    Object.entries(timePatterns).forEach(([key, pattern]) => {
      const match = input.match(pattern);
      if (match) {
        entities[key] = match[0];
      }
    });

    // Number entities
    const numbers = input.match(/\b\d+\b/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseInt(n));
    }

    // Priority indicators
    const priorityPatterns = {
      high: /\b(urgent|important|critical|high priority|asap)\b/i,
      medium: /\b(medium|normal|standard)\b/i,
      low: /\b(low|minor|when possible)\b/i
    };

    Object.entries(priorityPatterns).forEach(([level, pattern]) => {
      if (pattern.test(input)) {
        entities.priority = level;
      }
    });

    return entities;
  }

  /**
   * Score categories based on keyword matching
   */
  private scoreCategoriesFromKeywords(
    keywords: string[],
    context: AppContext
  ): Array<{ option: string; score: number }> {
    const scores: Array<{ option: string; score: number }> = [];

    Object.entries(CATEGORY_KEYWORDS).forEach(([category, mapping]) => {
      let score = 0;

      // Check all keyword types
      keywords.forEach(keyword => {
        if (mapping.primary.includes(keyword)) score += 1.0;
        if (mapping.synonyms.includes(keyword)) score += 0.8;
        if (mapping.contextVariations.some(cv => cv.includes(keyword))) score += 0.9;
        if (mapping.informalVersions.some(iv => iv.includes(keyword))) score += 0.7;
        if (mapping.technicalTerms.includes(keyword)) score += 0.9;

        // Multilingual support
        Object.values(mapping.multilingual).forEach(langWords => {
          if (langWords.includes(keyword)) score += 1.0;
        });
      });

      // Context boost
      if (context.currentRoute.includes(category)) {
        score += this.config.contextWeight;
      }

      // Recent activity boost
      const recentCategory = context.sessionContext.recentIntents
        .filter(intent => intent.category === category).length;
      score += recentCategory * 0.1;

      scores.push({ option: category, score });
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Score actions based on keyword matching
   */
  private scoreActionsFromKeywords(
    keywords: string[],
    context: AppContext
  ): Array<{ option: string; score: number }> {
    const scores: Array<{ option: string; score: number }> = [];

    Object.entries(ACTION_KEYWORDS).forEach(([action, mapping]) => {
      let score = 0;

      keywords.forEach(keyword => {
        if (mapping.primary.includes(keyword)) score += 1.0;
        if (mapping.synonyms.includes(keyword)) score += 0.8;
        if (mapping.contextVariations.some(cv => cv.includes(keyword))) score += 0.9;
        if (mapping.informalVersions.some(iv => iv.includes(keyword))) score += 0.7;
        if (mapping.technicalTerms.includes(keyword)) score += 0.9;

        Object.values(mapping.multilingual).forEach(langWords => {
          if (langWords.includes(keyword)) score += 1.0;
        });
      });

      scores.push({ option: action, score });
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Select the best option from scored results
   */
  private selectBestOption(scores: Array<{ option: string; score: number }>): { option: string; score: number } {
    if (scores.length === 0) {
      return { option: 'general', score: 0 };
    }
    return scores[0];
  }

  /**
   * Calculate overall confidence based on category and action scores
   */
  private calculateConfidence(
    categoryScore: number,
    actionScore: number,
    context: AppContext
  ): number {
    const baseConfidence = (categoryScore + actionScore) / 2;

    // Context boost
    const contextBoost = context.currentRoute !== '/' ? 0.1 : 0;

    // Session consistency boost
    const sessionBoost = context.sessionContext.recentIntents.length > 0 ? 0.1 : 0;

    return Math.min(1.0, baseConfidence + contextBoost + sessionBoost);
  }

  /**
   * Convert numeric confidence to level
   */
  private getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= 0.9) return 'certain';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate unique intent ID
   */
  private generateIntentId(): string {
    return `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record learning data for future improvements
   */
  private recordLearningData(input: string, intent: UserIntent): void {
    this.learningData.set(input, intent);

    // Keep only recent learning data (last 1000 entries)
    if (this.learningData.size > 1000) {
      const entries = Array.from(this.learningData.entries());
      const recentEntries = entries.slice(-1000);
      this.learningData.clear();
      recentEntries.forEach(([key, value]) => {
        this.learningData.set(key, value);
      });
    }
  }

  /**
   * Train the engine with user feedback
   */
  async trainFromFeedback(
    input: string,
    correctIntent: UserIntent,
    wasCorrect: boolean
  ): Promise<void> {
    if (wasCorrect) {
      // Reinforce correct recognition
      this.learningData.set(input, correctIntent);
    } else {
      // Learn from correction
      this.learningData.set(input, correctIntent);

      // Could implement more sophisticated learning here
      console.log('Learning from correction:', { input, correctIntent });
    }
  }

  /**
   * Get recognition statistics
   */
  getStats(): {
    totalRecognitions: number;
    averageConfidence: number;
    categoryDistribution: Record<string, number>;
    actionDistribution: Record<string, number>;
  } {
    const intents = Array.from(this.learningData.values());

    const categoryDistribution: Record<string, number> = {};
    const actionDistribution: Record<string, number> = {};
    let totalConfidence = 0;

    intents.forEach(intent => {
      categoryDistribution[intent.category] = (categoryDistribution[intent.category] || 0) + 1;
      actionDistribution[intent.action] = (actionDistribution[intent.action] || 0) + 1;
      totalConfidence += intent.confidence;
    });

    return {
      totalRecognitions: intents.length,
      averageConfidence: intents.length > 0 ? totalConfidence / intents.length : 0,
      categoryDistribution,
      actionDistribution
    };
  }
}