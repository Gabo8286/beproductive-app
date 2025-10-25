// Luna Local Intelligence System - Handle simple tasks without API calls
import { performanceMonitor } from '@/utils/performanceMonitor';

export interface LocalTaskResult {
  type: 'success' | 'fallback' | 'error';
  content: string;
  executionTime: number;
  handledLocally: boolean;
  confidence: number; // 0-1 scale
  suggestedActions?: string[];
}

export interface TaskContext {
  userInput: string;
  currentPage?: string;
  userPreferences?: Record<string, any>;
  recentTasks?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface LocalAlgorithm {
  name: string;
  canHandle: (context: TaskContext) => boolean;
  execute: (context: TaskContext) => Promise<LocalTaskResult>;
  priority: number; // Higher = more priority
}

class LunaLocalIntelligence {
  private algorithms: LocalAlgorithm[] = [];
  private responseCache: Map<string, LocalTaskResult> = new Map();
  private static instance: LunaLocalIntelligence;

  static getInstance(): LunaLocalIntelligence {
    if (!LunaLocalIntelligence.instance) {
      LunaLocalIntelligence.instance = new LunaLocalIntelligence();
      LunaLocalIntelligence.instance.initializeAlgorithms();
    }
    return LunaLocalIntelligence.instance;
  }

  private initializeAlgorithms() {
    // Task Prioritization Algorithm
    this.registerAlgorithm({
      name: 'Task Prioritization',
      priority: 8,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return input.includes('priority') || input.includes('urgent') ||
               input.includes('important') || input.includes('sort tasks');
      },
      execute: async (context) => {
        const tracker = performanceMonitor.trackComponentRender('luna-task-prioritization');
        tracker.onStart();

        try {
          // Simple prioritization based on keywords
          const priorities = this.analyzeTaskPriority(context.userInput);
          const response = this.generatePriorityResponse(priorities);

          tracker.onEnd();

          return {
            type: 'success',
            content: response,
            executionTime: performance.now(),
            handledLocally: true,
            confidence: 0.8,
            suggestedActions: ['Create high priority task', 'Set deadline', 'Add to today']
          };
        } catch (error) {
          tracker.onEnd();
          return this.createFallbackResponse(context);
        }
      }
    });

    // Time and Date Algorithm
    this.registerAlgorithm({
      name: 'Time and Date Helper',
      priority: 9,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return input.includes('time') || input.includes('date') ||
               input.includes('today') || input.includes('tomorrow') ||
               input.includes('calendar');
      },
      execute: async (context) => {
        const now = new Date();
        const timeInfo = this.getTimeInformation(now, context.userInput);

        return {
          type: 'success',
          content: timeInfo,
          executionTime: 5, // Very fast
          handledLocally: true,
          confidence: 0.95,
          suggestedActions: ['Add to calendar', 'Set reminder', 'Create time block']
        };
      }
    });

    // Quick Calculations Algorithm
    this.registerAlgorithm({
      name: 'Quick Calculator',
      priority: 7,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return /\d+\s*[+\-*/]\s*\d+/.test(input) ||
               input.includes('calculate') || input.includes('math');
      },
      execute: async (context) => {
        try {
          const calculation = this.parseCalculation(context.userInput);
          const result = this.performCalculation(calculation);

          return {
            type: 'success',
            content: `The result is ${result}. 🧮`,
            executionTime: 3,
            handledLocally: true,
            confidence: 0.9,
            suggestedActions: ['Save result', 'Add to notes', 'Use in task']
          };
        } catch (error) {
          return this.createFallbackResponse(context);
        }
      }
    });

    // Productivity Insights Algorithm
    this.registerAlgorithm({
      name: 'Productivity Insights',
      priority: 6,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return input.includes('productivity') || input.includes('focus') ||
               input.includes('energy') || input.includes('suggestion');
      },
      execute: async (context) => {
        const insights = this.generateProductivityInsights(context);

        return {
          type: 'success',
          content: insights,
          executionTime: 15,
          handledLocally: true,
          confidence: 0.7,
          suggestedActions: ['Apply suggestion', 'Set focus timer', 'Block distractions']
        };
      }
    });

    // Task Creation Algorithm
    this.registerAlgorithm({
      name: 'Quick Task Creator',
      priority: 8,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return input.includes('create task') || input.includes('add task') ||
               input.includes('new task') || input.includes('remind me');
      },
      execute: async (context) => {
        const taskDetails = this.parseTaskFromInput(context.userInput);

        return {
          type: 'success',
          content: `I'll help you create a task: "${taskDetails.title}". ${taskDetails.description}`,
          executionTime: 8,
          handledLocally: true,
          confidence: 0.85,
          suggestedActions: ['Create task now', 'Set due date', 'Add to project']
        };
      }
    });

    // Navigation Helper Algorithm
    this.registerAlgorithm({
      name: 'Navigation Helper',
      priority: 9,
      canHandle: (context) => {
        const input = context.userInput.toLowerCase();
        return input.includes('go to') || input.includes('navigate') ||
               input.includes('open') || input.includes('show me');
      },
      execute: async (context) => {
        const destination = this.parseNavigationRequest(context.userInput);

        return {
          type: 'success',
          content: `I can take you to ${destination}. ${this.getNavigationTip(destination)}`,
          executionTime: 5,
          handledLocally: true,
          confidence: 0.9,
          suggestedActions: ['Navigate now', 'Add to bookmarks', 'Set as homepage']
        };
      }
    });
  }

  registerAlgorithm(algorithm: LocalAlgorithm) {
    this.algorithms.push(algorithm);
    this.algorithms.sort((a, b) => b.priority - a.priority);
  }

  async processTask(context: TaskContext): Promise<LocalTaskResult> {
    const cacheKey = this.generateCacheKey(context);

    // Check cache first
    if (this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      console.log('🎯 Luna Local: Using cached response');
      return { ...cached, executionTime: 1 }; // Cached responses are instant
    }

    const startTime = performance.now();

    // Find the best algorithm to handle this task
    for (const algorithm of this.algorithms) {
      if (algorithm.canHandle(context)) {
        try {
          console.log(`🦊 Luna Local: Handling "${context.userInput}" with ${algorithm.name}`);
          const result = await algorithm.execute(context);

          // Cache successful results
          if (result.type === 'success' && result.confidence > 0.7) {
            this.responseCache.set(cacheKey, result);
          }

          return result;
        } catch (error) {
          console.warn(`Luna Local: Algorithm ${algorithm.name} failed:`, error);
          continue;
        }
      }
    }

    // No local algorithm can handle this - suggest fallback to API
    const endTime = performance.now();
    return {
      type: 'fallback',
      content: "This looks like a complex request that needs my full AI capabilities. Let me process this with my advanced systems... 🤔",
      executionTime: endTime - startTime,
      handledLocally: false,
      confidence: 0.0,
      suggestedActions: ['Use AI processing', 'Simplify request', 'Try different wording']
    };
  }

  private generateCacheKey(context: TaskContext): string {
    return `${context.userInput.toLowerCase()}-${context.currentPage || 'unknown'}`;
  }

  private createFallbackResponse(context: TaskContext): LocalTaskResult {
    return {
      type: 'fallback',
      content: "I need to use my advanced processing for this request. Please wait while I think... 🧠",
      executionTime: 2,
      handledLocally: false,
      confidence: 0.0
    };
  }

  // Algorithm Implementation Methods

  private analyzeTaskPriority(input: string): { level: string; reasons: string[] } {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const importantKeywords = ['important', 'crucial', 'vital', 'significant', 'key'];

    const hasUrgent = urgentKeywords.some(keyword => input.toLowerCase().includes(keyword));
    const hasImportant = importantKeywords.some(keyword => input.toLowerCase().includes(keyword));

    if (hasUrgent && hasImportant) {
      return { level: 'Critical', reasons: ['Contains urgent and important indicators'] };
    } else if (hasUrgent) {
      return { level: 'High', reasons: ['Contains urgency indicators'] };
    } else if (hasImportant) {
      return { level: 'Medium-High', reasons: ['Contains importance indicators'] };
    } else {
      return { level: 'Medium', reasons: ['No priority indicators found'] };
    }
  }

  private generatePriorityResponse(priorities: { level: string; reasons: string[] }): string {
    return `Based on your input, I'd suggest a ${priorities.level} priority level. ${priorities.reasons.join(', ')}.

Here's how you can organize this:
• Use the Eisenhower Matrix (Urgent vs Important)
• Set a clear deadline
• Break down into smaller tasks if needed
• Consider your energy levels throughout the day

Would you like me to help you create this task with the right priority setting? 🎯`;
  }

  private getTimeInformation(date: Date, input: string): string {
    const now = date;
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    if (input.includes('time')) {
      return `It's currently ${timeStr} on ${dayOfWeek}, ${dateStr}.

⏰ Time insights:
• Morning is great for creative work (9-11 AM)
• Afternoon is perfect for meetings (1-3 PM)
• Evening is ideal for planning tomorrow (6-8 PM)

What would you like to schedule? 📅`;
    }

    if (input.includes('today')) {
      return `Today is ${dayOfWeek}, ${dateStr}.

📋 Today's focus suggestions:
• Review your morning priorities
• Block time for deep work
• Plan 3 key tasks maximum
• Schedule breaks every 90 minutes

How can I help you make today productive? ✨`;
    }

    return `Current time: ${timeStr} | Date: ${dateStr} | Day: ${dayOfWeek}`;
  }

  private parseCalculation(input: string): { expression: string; numbers: number[] } {
    const matches = input.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
    if (!matches) throw new Error('Cannot parse calculation');

    return {
      expression: matches[0],
      numbers: [parseFloat(matches[1]), parseFloat(matches[3])]
    };
  }

  private performCalculation(calc: { expression: string; numbers: number[] }): number {
    const operator = calc.expression.match(/[+\-*/]/)?.[0];
    const [a, b] = calc.numbers;

    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: throw new Error('Unknown operator');
    }
  }

  private generateProductivityInsights(context: TaskContext): string {
    const timeOfDay = this.getTimeOfDay();
    const insights = [
      "🧠 Your brain works best in 90-minute focused blocks",
      "🍅 Try the Pomodoro Technique: 25 min work + 5 min break",
      "🌱 Start with your hardest task when energy is highest",
      "📱 Consider turning off notifications during deep work",
      "💧 Stay hydrated - dehydration reduces focus by 15%"
    ];

    const timeSpecificInsights = {
      morning: "Morning energy is perfect for creative and analytical tasks",
      afternoon: "Afternoon is great for meetings and collaborative work",
      evening: "Evening is ideal for planning and administrative tasks",
      night: "Night mode: Focus on light tasks and tomorrow's planning"
    };

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    const timeInsight = timeSpecificInsights[timeOfDay];

    return `Here's a personalized productivity insight:

${randomInsight}

⏰ Time-specific tip: ${timeInsight}

🎯 Quick wins for right now:
• Clear your workspace
• Set a 25-minute timer
• Choose ONE priority task
• Close unnecessary tabs

Ready to boost your productivity? 🚀`;
  }

  private parseTaskFromInput(input: string): { title: string; description: string } {
    const title = input.replace(/create task|add task|new task|remind me/gi, '').trim();

    return {
      title: title || 'New Task',
      description: title ?
        'I will set this up with smart defaults based on your preferences.' :
        'Let me help you create a well-structured task.'
    };
  }

  private parseNavigationRequest(input: string): string {
    const destinations = {
      'tasks': 'your tasks page',
      'goals': 'your goals dashboard',
      'calendar': 'your calendar view',
      'notes': 'your notes section',
      'dashboard': 'your main dashboard',
      'settings': 'your settings panel'
    };

    for (const [key, value] of Object.entries(destinations)) {
      if (input.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'the requested section';
  }

  private getNavigationTip(destination: string): string {
    const tips = {
      'tasks': 'Tip: Use filters to focus on today\'s priorities',
      'goals': 'Tip: Review your weekly and monthly progress',
      'calendar': 'Tip: Time-block your most important tasks',
      'notes': 'Tip: Use tags to organize your thoughts',
      'dashboard': 'Tip: Check your productivity metrics',
      'settings': 'Tip: Customize your workflow preferences'
    };

    return Object.entries(tips).find(([key]) => destination.includes(key))?.[1] ||
           'Tip: Bookmark frequently used pages';
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  // Performance and Cache Management
  clearCache() {
    this.responseCache.clear();
    console.log('🧹 Luna Local: Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.responseCache.size,
      algorithms: this.algorithms.length,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }

  getCapabilities(): string[] {
    return this.algorithms.map(alg => alg.name);
  }
}

// Export singleton instance
export const lunaLocalIntelligence = LunaLocalIntelligence.getInstance();

// Utility function to check if a task can be handled locally
export function canHandleLocally(userInput: string): boolean {
  const context: TaskContext = { userInput };
  return lunaLocalIntelligence['algorithms'].some(alg => alg.canHandle(context));
}

// Main processing function
export async function processWithLocalIntelligence(
  userInput: string,
  context?: Partial<TaskContext>
): Promise<LocalTaskResult> {
  const fullContext: TaskContext = {
    userInput,
    currentPage: window.location.pathname,
    timeOfDay: getTimeOfDay(),
    ...context
  };

  return await lunaLocalIntelligence.processTask(fullContext);
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}