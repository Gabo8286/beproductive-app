import natural from "natural";
import chrono from "chrono-node";
import sentiment from "sentiment";
import keyword from "keyword-extractor";

export interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  category?: string;
  confidence: number;
}

export interface TextAnalysis {
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
  keywords: string[];
  entities: {
    dates: Date[];
    times: string[];
    people: string[];
    locations: string[];
  };
  intent: {
    action: string;
    confidence: number;
  };
}

class NLPProcessor {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof natural.PorterStemmer;
  private sentimentAnalyzer: any;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.sentimentAnalyzer = new sentiment();
  }

  /**
   * Parse natural language text into structured task data
   */
  parseTaskFromText(text: string): ParsedTask {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const stems = tokens.map((token) => this.stemmer.stem(token));

    // Extract title (remove command words)
    const commandWords = [
      "remind",
      "create",
      "add",
      "make",
      "schedule",
      "set",
      "plan",
    ];
    const titleTokens = tokens.filter(
      (token) => !commandWords.includes(token) && token.length > 2,
    );

    const title = this.extractTitle(text, titleTokens);

    // Extract due date
    const dueDate = this.extractDate(text);

    // Extract priority
    const priority = this.extractPriority(text, tokens);

    // Extract category
    const category = this.extractCategory(text, tokens);

    // Calculate confidence based on extracted information
    let confidence = 0.3; // Base confidence
    if (title.length > 3) confidence += 0.2;
    if (dueDate) confidence += 0.2;
    if (priority) confidence += 0.15;
    if (category) confidence += 0.15;

    return {
      title,
      dueDate,
      priority,
      category,
      confidence: Math.min(confidence, 1.0),
    };
  }

  /**
   * Analyze text for sentiment, keywords, and entities
   */
  analyzeText(text: string): TextAnalysis {
    const sentimentResult = this.sentimentAnalyzer.analyze(text);
    const keywords = this.extractKeywords(text);
    const entities = this.extractEntities(text);
    const intent = this.detectIntent(text);

    return {
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative,
      },
      keywords,
      entities,
      intent,
    };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return keyword.extract(text, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true,
    });
  }

  /**
   * Extract various entities from text
   */
  private extractEntities(text: string): TextAnalysis["entities"] {
    // Extract dates using chrono
    const dateResults = chrono.parse(text);
    const dates = dateResults.map((result) => result.start.date());

    // Extract times (simple regex)
    const timePattern = /\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9](?:\s*[ap]m)?\b/gi;
    const times = text.match(timePattern) || [];

    // Extract people (capitalized names)
    const peoplePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const people = text.match(peoplePattern) || [];

    // Extract locations (basic pattern)
    const locationPattern = /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const locationMatches = [...text.matchAll(locationPattern)];
    const locations = locationMatches.map((match) => match[1]);

    return {
      dates,
      times,
      people,
      locations,
    };
  }

  /**
   * Detect user intent from text
   */
  private detectIntent(text: string): { action: string; confidence: number } {
    const intents = [
      {
        action: "create_task",
        patterns: [
          "remind",
          "create",
          "add",
          "make",
          "schedule",
          "set up",
          "plan",
        ],
        confidence: 0.8,
      },
      {
        action: "get_insights",
        patterns: [
          "how am i",
          "insights",
          "analysis",
          "show me",
          "what are my",
        ],
        confidence: 0.7,
      },
      {
        action: "get_suggestions",
        patterns: ["what should i", "recommend", "suggest", "help me"],
        confidence: 0.6,
      },
      {
        action: "query_data",
        patterns: ["how many", "when did i", "what is my", "find", "search"],
        confidence: 0.6,
      },
    ];

    const lowerText = text.toLowerCase();

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        if (lowerText.includes(pattern)) {
          return {
            action: intent.action,
            confidence: intent.confidence,
          };
        }
      }
    }

    return {
      action: "chat",
      confidence: 0.3,
    };
  }

  /**
   * Extract title from task text
   */
  private extractTitle(text: string, tokens: string[]): string {
    // Remove common task creation phrases
    let cleanText = text;
    const prefixes = [
      "remind me to ",
      "create a task to ",
      "add task to ",
      "schedule to ",
      "plan to ",
      "set reminder to ",
      "i need to ",
      "don't forget to ",
    ];

    for (const prefix of prefixes) {
      if (cleanText.toLowerCase().startsWith(prefix)) {
        cleanText = cleanText.substring(prefix.length);
        break;
      }
    }

    // Remove time expressions from title
    const timeExpressions = chrono.parse(cleanText);
    if (timeExpressions.length > 0) {
      for (const expr of timeExpressions) {
        cleanText = cleanText.replace(expr.text, "").trim();
      }
    }

    // Capitalize first letter
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string): Date | undefined {
    const results = chrono.parse(text);
    return results.length > 0 ? results[0].start.date() : undefined;
  }

  /**
   * Extract priority from text
   */
  private extractPriority(
    text: string,
    tokens: string[],
  ): "low" | "medium" | "high" | undefined {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("urgent") ||
      lowerText.includes("asap") ||
      lowerText.includes("immediately") ||
      lowerText.includes("high priority")
    ) {
      return "high";
    }

    if (
      lowerText.includes("low priority") ||
      lowerText.includes("when possible") ||
      lowerText.includes("eventually")
    ) {
      return "low";
    }

    if (lowerText.includes("important") || lowerText.includes("priority")) {
      return "medium";
    }

    return undefined;
  }

  /**
   * Extract category from text
   */
  private extractCategory(text: string, tokens: string[]): string | undefined {
    const categories = {
      meeting: ["meeting", "call", "conference", "discussion"],
      work: ["work", "project", "client", "business"],
      personal: ["personal", "home", "family", "friend"],
      health: ["exercise", "doctor", "gym", "health"],
      learning: ["learn", "study", "course", "training"],
      finance: ["bank", "money", "payment", "finance"],
      travel: ["travel", "flight", "trip", "vacation"],
    };

    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return category;
      }
    }

    return undefined;
  }

  /**
   * Extract action items from longer text
   */
  extractActionItems(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const actionItems: string[] = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      // Look for imperative sentences or action-oriented phrases
      if (this.isActionSentence(trimmed)) {
        actionItems.push(trimmed);
      }
    }

    return actionItems;
  }

  /**
   * Check if a sentence contains actionable content
   */
  private isActionSentence(sentence: string): boolean {
    const actionVerbs = [
      "call",
      "email",
      "send",
      "write",
      "review",
      "complete",
      "finish",
      "start",
      "begin",
      "schedule",
      "plan",
      "organize",
      "prepare",
      "contact",
      "follow up",
      "update",
      "create",
      "build",
      "develop",
    ];

    const lowerSentence = sentence.toLowerCase();
    return actionVerbs.some((verb) => lowerSentence.includes(verb));
  }
}

export const nlpProcessor = new NLPProcessor();
export default nlpProcessor;
