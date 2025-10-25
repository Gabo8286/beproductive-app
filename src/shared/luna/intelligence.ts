/**
 * Luna AI Framework - Intelligence Module
 * Modularized local intelligence processing with cross-platform compatibility
 * Refactored from original lunaLocalIntelligence.ts with enhanced modularity
 */

import { LunaContext, LunaResult, LunaAlgorithm, LunaCapability } from '@/shared/luna/types';
import { UUID, Score, ConfidenceLevel } from '@/shared/types/core';

// MARK: - Local Intelligence Engine

export class LunaIntelligenceEngine {
  private algorithms: Map<UUID, LunaAlgorithm> = new Map();
  private responseCache: Map<string, LunaResult> = new Map();
  private static instance: LunaIntelligenceEngine;

  static getInstance(): LunaIntelligenceEngine {
    if (!LunaIntelligenceEngine.instance) {
      LunaIntelligenceEngine.instance = new LunaIntelligenceEngine();
      LunaIntelligenceEngine.instance.initializeAlgorithms();
    }
    return LunaIntelligenceEngine.instance;
  }

  private initializeAlgorithms(): void {
    // Register all default algorithms
    this.registerAlgorithm(new TaskPrioritizationAlgorithm());
    this.registerAlgorithm(new TimeAndDateAlgorithm());
    this.registerAlgorithm(new QuickCalculatorAlgorithm());
    this.registerAlgorithm(new ProductivityInsightsAlgorithm());
    this.registerAlgorithm(new TaskCreationAlgorithm());
    this.registerAlgorithm(new NavigationHelperAlgorithm());
    this.registerAlgorithm(new WorkflowOptimizationAlgorithm());
    this.registerAlgorithm(new FocusAssistantAlgorithm());
  }

  registerAlgorithm(algorithm: LunaAlgorithm): void {
    this.algorithms.set(algorithm.id, algorithm);
    console.log(`🧠 Luna Intelligence: Registered algorithm ${algorithm.name}`);
  }

  unregisterAlgorithm(algorithmId: UUID): void {
    const algorithm = this.algorithms.get(algorithmId);
    if (algorithm) {
      this.algorithms.delete(algorithmId);
      console.log(`🗑️ Luna Intelligence: Unregistered algorithm ${algorithm.name}`);
    }
  }

  async processTask(context: LunaContext): Promise<LunaResult> {
    const cacheKey = this.generateCacheKey(context);

    // Check cache first
    if (this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      console.log('⚡ Luna Intelligence: Using cached response');
      return { ...cached, executionTime: 1 };
    }

    const startTime = performance.now();

    // Find the best algorithm to handle this task
    const sortedAlgorithms = Array.from(this.algorithms.values())
      .filter(alg => alg.enabled && alg.canHandle(context))
      .sort((a, b) => b.priority - a.priority);

    for (const algorithm of sortedAlgorithms) {
      try {
        console.log(`🦊 Luna Intelligence: Processing with ${algorithm.name}`);

        const result = await algorithm.execute(context);

        // Update algorithm metrics
        algorithm.metrics.total_executions++;
        algorithm.metrics.success_rate = this.calculateSuccessRate(algorithm);
        algorithm.metrics.average_confidence = this.updateAverageConfidence(algorithm, result.confidence);
        algorithm.metrics.average_execution_time = this.updateAverageExecutionTime(algorithm, result.executionTime);

        // Cache successful results with high confidence
        if (result.type === 'success' && result.confidence > 0.7) {
          this.responseCache.set(cacheKey, result);
        }

        return result;

      } catch (error) {
        console.warn(`Luna Intelligence: Algorithm ${algorithm.name} failed:`, error);
        // Continue to next algorithm
      }
    }

    // No local algorithm can handle this - suggest fallback to AI
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

  canHandleLocally(context: LunaContext): boolean {
    return Array.from(this.algorithms.values())
      .some(alg => alg.enabled && alg.canHandle(context));
  }

  getCapabilities(): LunaCapability[] {
    const capabilities = new Set<LunaCapability>();
    for (const algorithm of this.algorithms.values()) {
      algorithm.capabilities.forEach(cap => capabilities.add(cap));
    }
    return Array.from(capabilities);
  }

  getAlgorithmMetrics(): LunaAlgorithm[] {
    return Array.from(this.algorithms.values());
  }

  clearCache(): void {
    this.responseCache.clear();
    console.log('🧹 Luna Intelligence: Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.responseCache.size,
      algorithms: this.algorithms.size,
      hitRate: this.calculateCacheHitRate()
    };
  }

  // MARK: - Private Helper Methods

  private generateCacheKey(context: LunaContext): string {
    const input = context.userInput.toLowerCase().trim();
    const page = context.currentPage || 'unknown';
    const time = context.timeOfDay || 'unknown';
    return `${input}-${page}-${time}`;
  }

  private calculateSuccessRate(algorithm: LunaAlgorithm): Score {
    // This would be calculated based on actual success/failure tracking
    return algorithm.metrics.success_rate || 0.8;
  }

  private updateAverageConfidence(algorithm: LunaAlgorithm, newConfidence: ConfidenceLevel): ConfidenceLevel {
    const current = algorithm.metrics.average_confidence || 0.8;
    const total = algorithm.metrics.total_executions || 1;
    return (current * (total - 1) + newConfidence) / total;
  }

  private updateAverageExecutionTime(algorithm: LunaAlgorithm, newTime: number): number {
    const current = algorithm.metrics.average_execution_time || 50;
    const total = algorithm.metrics.total_executions || 1;
    return (current * (total - 1) + newTime) / total;
  }

  private calculateCacheHitRate(): Score {
    // This would track actual cache hits vs misses
    return 0.7; // Placeholder
  }
}

// MARK: - Algorithm Implementations

class TaskPrioritizationAlgorithm implements LunaAlgorithm {
  id: UUID = 'task-prioritization-001';
  name = 'Task Prioritization';
  description = 'Analyzes task priority based on keywords and context';
  priority = 8;
  capabilities: LunaCapability[] = ['local_processing', 'task_management'];
  enabled = true;
  metrics = {
    success_rate: 0.9,
    average_confidence: 0.85,
    total_executions: 0,
    average_execution_time: 25
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('priority') || input.includes('urgent') ||
           input.includes('important') || input.includes('sort tasks');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const startTime = performance.now();

    try {
      const priorities = this.analyzeTaskPriority(context.userInput);
      const response = this.generatePriorityResponse(priorities);
      const endTime = performance.now();

      return {
        type: 'success',
        content: response,
        executionTime: endTime - startTime,
        handledLocally: true,
        confidence: 0.8,
        suggestedActions: ['Create high priority task', 'Set deadline', 'Add to today']
      };
    } catch (error) {
      return this.createFallbackResponse(context);
    }
  }

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
      return { level: 'Medium', reasons: ['No specific priority indicators found'] };
    }
  }

  private generatePriorityResponse(priorities: { level: string; reasons: string[] }): string {
    return `Based on your input, I'd suggest a **${priorities.level}** priority level. ${priorities.reasons.join(', ')}.

🎯 **Priority Framework Suggestions:**
• Use the Eisenhower Matrix (Urgent vs Important)
• Set a clear deadline
• Break down into smaller tasks if needed
• Consider your energy levels throughout the day

Would you like me to help you create this task with the right priority setting?`;
  }

  private createFallbackResponse(context: LunaContext): LunaResult {
    return {
      type: 'fallback',
      content: "I need to analyze this more carefully. Let me think about the priority level... 🤔",
      executionTime: 5,
      handledLocally: false,
      confidence: 0.0
    };
  }
}

class TimeAndDateAlgorithm implements LunaAlgorithm {
  id: UUID = 'time-date-helper-001';
  name = 'Time and Date Helper';
  description = 'Provides time-related information and scheduling assistance';
  priority = 9;
  capabilities: LunaCapability[] = ['local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.95,
    average_confidence: 0.95,
    total_executions: 0,
    average_execution_time: 5
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('time') || input.includes('date') ||
           input.includes('today') || input.includes('tomorrow') ||
           input.includes('calendar') || input.includes('schedule');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const now = new Date();
    const timeInfo = this.getTimeInformation(now, context.userInput, context);

    return {
      type: 'success',
      content: timeInfo,
      executionTime: 5,
      handledLocally: true,
      confidence: 0.95,
      suggestedActions: ['Add to calendar', 'Set reminder', 'Create time block']
    };
  }

  private getTimeInformation(date: Date, input: string, context: LunaContext): string {
    const timeStr = date.toLocaleTimeString();
    const dateStr = date.toLocaleDateString();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (input.includes('time')) {
      return this.getTimeResponse(timeStr, dayOfWeek, dateStr, context);
    }

    if (input.includes('today')) {
      return this.getTodayResponse(dayOfWeek, dateStr, context);
    }

    if (input.includes('tomorrow')) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return this.getTomorrowResponse(tomorrow, context);
    }

    return `📅 **Current Information:**
• Time: ${timeStr}
• Date: ${dateStr}
• Day: ${dayOfWeek}

How can I help you with your schedule?`;
  }

  private getTimeResponse(timeStr: string, dayOfWeek: string, dateStr: string, context: LunaContext): string {
    const timeOfDay = context.timeOfDay || this.getTimeOfDay();

    return `⏰ **Current Time:** ${timeStr} on ${dayOfWeek}, ${dateStr}

🧠 **${this.capitalizeFirst(timeOfDay)} Productivity Tips:**
${this.getTimeSpecificTips(timeOfDay)}

What would you like to schedule?`;
  }

  private getTodayResponse(dayOfWeek: string, dateStr: string, context: LunaContext): string {
    return `📋 **Today is ${dayOfWeek}, ${dateStr}**

✨ **Today's Focus Suggestions:**
• Review your morning priorities
• Block time for deep work (ideal: 90-minute blocks)
• Plan maximum 3 key tasks
• Schedule breaks every 90 minutes
• Set tomorrow's top 3 during evening review

How can I help you make today productive?`;
  }

  private getTomorrowResponse(tomorrow: Date, context: LunaContext): string {
    const tomorrowStr = tomorrow.toLocaleDateString();
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

    return `🌅 **Tomorrow is ${tomorrowDay}, ${tomorrowStr}**

🎯 **Planning Tips:**
• Set your top 3 priorities tonight
• Time-block your most important work
• Prepare materials needed for key tasks
• Review your energy patterns for optimal scheduling

Would you like help planning tomorrow's schedule?`;
  }

  private getTimeSpecificTips(timeOfDay: string): string {
    const tips = {
      morning: "• Perfect for creative and analytical work (9-11 AM peak)\n• Tackle your most challenging task first\n• Avoid meetings until after 10 AM if possible",
      afternoon: "• Great for meetings and collaborative work (1-3 PM)\n• Handle administrative tasks\n• Take a proper lunch break for afternoon energy",
      evening: "• Ideal for planning and reflection (6-8 PM)\n• Review today's accomplishments\n• Set tomorrow's priorities",
      night: "• Focus on light tasks and planning\n• Avoid screens 1 hour before bed\n• Prepare for tomorrow's success"
    };
    return tips[timeOfDay as keyof typeof tips] || tips.morning;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

class QuickCalculatorAlgorithm implements LunaAlgorithm {
  id: UUID = 'quick-calculator-001';
  name = 'Quick Calculator';
  description = 'Performs simple mathematical calculations locally';
  priority = 7;
  capabilities: LunaCapability[] = ['local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.9,
    average_confidence: 0.9,
    total_executions: 0,
    average_execution_time: 3
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return /\d+\s*[+\-*/]\s*\d+/.test(input) ||
           input.includes('calculate') || input.includes('math');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    try {
      const calculation = this.parseCalculation(context.userInput);
      const result = this.performCalculation(calculation);

      return {
        type: 'success',
        content: `🧮 **Calculation Result:** ${calculation.expression} = **${result}**

${this.getCalculationTips()}`,
        executionTime: 3,
        handledLocally: true,
        confidence: 0.9,
        suggestedActions: ['Save result', 'Add to notes', 'Use in task', 'Copy to clipboard']
      };
    } catch (error) {
      return {
        type: 'error',
        content: "I couldn't parse that calculation. Please try a format like '25 + 30' or '100 / 4'.",
        executionTime: 2,
        handledLocally: true,
        confidence: 0.1
      };
    }
  }

  private parseCalculation(input: string): { expression: string; numbers: number[]; operator: string } {
    const matches = input.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
    if (!matches) throw new Error('Cannot parse calculation');

    return {
      expression: matches[0],
      numbers: [parseFloat(matches[1]), parseFloat(matches[3])],
      operator: matches[2]
    };
  }

  private performCalculation(calc: { expression: string; numbers: number[]; operator: string }): number {
    const [a, b] = calc.numbers;

    switch (calc.operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: throw new Error('Unknown operator');
    }
  }

  private getCalculationTips(): string {
    const tips = [
      "💡 **Tip:** Try voice input for hands-free calculations",
      "📊 **Tip:** Use calculations for time tracking (hours * rate)",
      "📈 **Tip:** Calculate productivity metrics (tasks / hours)",
      "⏱️ **Tip:** Figure out break intervals (work time / 4)",
      "🎯 **Tip:** Calculate completion percentages (done / total * 100)"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
}

class ProductivityInsightsAlgorithm implements LunaAlgorithm {
  id: UUID = 'productivity-insights-001';
  name = 'Productivity Insights';
  description = 'Generates personalized productivity recommendations';
  priority = 6;
  capabilities: LunaCapability[] = ['productivity_insights', 'local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.8,
    average_confidence: 0.75,
    total_executions: 0,
    average_execution_time: 15
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('productivity') || input.includes('focus') ||
           input.includes('energy') || input.includes('suggestion') ||
           input.includes('improve') || input.includes('better');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const insights = this.generateProductivityInsights(context);

    return {
      type: 'success',
      content: insights,
      executionTime: 15,
      handledLocally: true,
      confidence: 0.75,
      suggestedActions: ['Apply suggestion', 'Set focus timer', 'Block distractions', 'Track progress']
    };
  }

  private generateProductivityInsights(context: LunaContext): string {
    const timeOfDay = context.timeOfDay || this.getTimeOfDay();
    const generalInsights = [
      "🧠 Your brain works best in 90-minute focused blocks",
      "🍅 Try the Pomodoro Technique: 25 min work + 5 min break",
      "🌱 Start with your hardest task when energy is highest",
      "📱 Consider turning off notifications during deep work",
      "💧 Stay hydrated - dehydration reduces focus by 15%",
      "🚶 Take walking breaks to boost creativity by 60%",
      "🎵 White noise or nature sounds can improve concentration",
      "📝 Write down distracting thoughts to deal with later"
    ];

    const timeSpecificInsights = {
      morning: "Morning energy is perfect for creative and analytical tasks. This is your golden hour!",
      afternoon: "Afternoon is great for meetings and collaborative work. Energy dips are normal around 2-3 PM.",
      evening: "Evening is ideal for planning and administrative tasks. Perfect time to review the day.",
      night: "Night mode: Focus on light tasks and tomorrow's planning. Avoid heavy cognitive work."
    };

    const randomInsight = generalInsights[Math.floor(Math.random() * generalInsights.length)];
    const timeInsight = timeSpecificInsights[timeOfDay as keyof typeof timeSpecificInsights];

    return `💡 **Personalized Productivity Insight:**

${randomInsight}

⏰ **Time-Specific Tip:** ${timeInsight}

🎯 **Quick Wins for Right Now:**
• Clear your workspace of distractions
• Set a 25-minute focus timer
• Choose ONE priority task to complete
• Close unnecessary browser tabs/apps
• Put phone in another room or drawer

Ready to boost your productivity? 🚀`;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
}

// Additional algorithms would be implemented similarly...
class TaskCreationAlgorithm implements LunaAlgorithm {
  id: UUID = 'task-creation-001';
  name = 'Quick Task Creator';
  description = 'Helps create and structure new tasks';
  priority = 8;
  capabilities: LunaCapability[] = ['task_management', 'local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.85,
    average_confidence: 0.85,
    total_executions: 0,
    average_execution_time: 8
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('create task') || input.includes('add task') ||
           input.includes('new task') || input.includes('remind me') ||
           input.includes('todo');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const taskDetails = this.parseTaskFromInput(context.userInput);

    return {
      type: 'success',
      content: `📋 **Task Creation Assistant**

**Suggested Task:** "${taskDetails.title}"
${taskDetails.description}

🎯 **Smart Suggestions:**
• Estimated time: ${taskDetails.estimatedTime}
• Best time to do: ${taskDetails.bestTime}
• Priority level: ${taskDetails.priority}
• Category: ${taskDetails.category}

Ready to create this task?`,
      executionTime: 8,
      handledLocally: true,
      confidence: 0.85,
      suggestedActions: ['Create task now', 'Set due date', 'Add to project', 'Schedule time block']
    };
  }

  private parseTaskFromInput(input: string): {
    title: string;
    description: string;
    estimatedTime: string;
    bestTime: string;
    priority: string;
    category: string;
  } {
    const cleanInput = input.replace(/create task|add task|new task|remind me|todo/gi, '').trim();
    const title = cleanInput || 'New Task';

    // Simple heuristics for task analysis
    const isQuick = title.length < 20 || cleanInput.includes('quick');
    const isImportant = cleanInput.includes('important') || cleanInput.includes('urgent');
    const isCreative = cleanInput.includes('design') || cleanInput.includes('write') || cleanInput.includes('plan');

    return {
      title,
      description: title ? 'I\'ll set this up with smart defaults based on your preferences.' : 'Let me help you create a well-structured task.',
      estimatedTime: isQuick ? '15-30 minutes' : isCreative ? '1-2 hours' : '30-60 minutes',
      bestTime: isCreative ? 'Morning (9-11 AM)' : isImportant ? 'When energy is highest' : 'Afternoon',
      priority: isImportant ? 'High' : 'Medium',
      category: isCreative ? 'Creative Work' : isImportant ? 'Important' : 'General'
    };
  }
}

class NavigationHelperAlgorithm implements LunaAlgorithm {
  id: UUID = 'navigation-helper-001';
  name = 'Navigation Helper';
  description = 'Provides navigation assistance and shortcuts';
  priority = 9;
  capabilities: LunaCapability[] = ['navigation', 'local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.9,
    average_confidence: 0.9,
    total_executions: 0,
    average_execution_time: 5
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('go to') || input.includes('navigate') ||
           input.includes('open') || input.includes('show me');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const destination = this.parseNavigationRequest(context.userInput);
    const tip = this.getNavigationTip(destination);

    return {
      type: 'success',
      content: `🧭 **Navigation Assistant**

I can take you to **${destination}**.

💡 ${tip}

🚀 **Quick Navigation Tips:**
• Use keyboard shortcuts for faster access
• Bookmark frequently used pages
• Try voice commands: "Show me tasks"`,
      executionTime: 5,
      handledLocally: true,
      confidence: 0.9,
      suggestedActions: ['Navigate now', 'Add to bookmarks', 'Learn shortcuts', 'Set as homepage']
    };
  }

  private parseNavigationRequest(input: string): string {
    const destinations = {
      'tasks': 'your tasks dashboard',
      'goals': 'your goals overview',
      'calendar': 'your calendar view',
      'notes': 'your notes collection',
      'dashboard': 'your main dashboard',
      'settings': 'your settings panel',
      'analytics': 'your productivity analytics',
      'projects': 'your projects workspace',
      'habits': 'your habit tracker'
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
      'tasks': 'Use filters to focus on today\'s priorities and batch similar tasks together.',
      'goals': 'Review weekly and monthly progress. Break large goals into smaller milestones.',
      'calendar': 'Time-block your most important tasks. Color-code by energy level needed.',
      'notes': 'Use tags and folders to organize thoughts. Try the Cornell note-taking method.',
      'dashboard': 'Check your productivity metrics and identify patterns in your peak hours.',
      'settings': 'Customize notifications and workflows to match your productivity style.',
      'analytics': 'Look for patterns in your most productive days and times.',
      'projects': 'Use project templates and break work into phases with clear deliverables.',
      'habits': 'Start small with 2-minute habits. Track consistency over perfection.'
    };

    for (const [key, tip] of Object.entries(tips)) {
      if (destination.includes(key)) {
        return tip;
      }
    }

    return 'Bookmark frequently used pages for quick access.';
  }
}

class WorkflowOptimizationAlgorithm implements LunaAlgorithm {
  id: UUID = 'workflow-optimization-001';
  name = 'Workflow Optimizer';
  description = 'Analyzes and suggests workflow improvements';
  priority = 7;
  capabilities: LunaCapability[] = ['workflow_optimization', 'productivity_insights'];
  enabled = true;
  metrics = {
    success_rate: 0.75,
    average_confidence: 0.8,
    total_executions: 0,
    average_execution_time: 20
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('workflow') || input.includes('optimize') ||
           input.includes('efficient') || input.includes('process') ||
           input.includes('automate');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const optimization = this.generateWorkflowOptimization(context);

    return {
      type: 'success',
      content: optimization,
      executionTime: 20,
      handledLocally: true,
      confidence: 0.8,
      suggestedActions: ['Implement suggestion', 'Create template', 'Set automation', 'Track metrics']
    };
  }

  private generateWorkflowOptimization(context: LunaContext): string {
    const optimizations = [
      {
        area: 'Task Management',
        suggestion: 'Batch similar tasks together to reduce context switching',
        impact: 'Save 15-25 minutes per day'
      },
      {
        area: 'Communication',
        suggestion: 'Set specific times for checking email (e.g., 9 AM, 1 PM, 4 PM)',
        impact: 'Reduce interruptions by 40%'
      },
      {
        area: 'Planning',
        suggestion: 'Use time-blocking with 25% buffer time for unexpected tasks',
        impact: 'Increase schedule reliability by 60%'
      },
      {
        area: 'Focus',
        suggestion: 'Create a "deep work" environment with no-notification periods',
        impact: 'Boost productivity by 30-50%'
      }
    ];

    const selectedOptimization = optimizations[Math.floor(Math.random() * optimizations.length)];

    return `⚡ **Workflow Optimization Suggestion**

**Area:** ${selectedOptimization.area}
**Suggestion:** ${selectedOptimization.suggestion}
**Expected Impact:** ${selectedOptimization.impact}

🔧 **Implementation Steps:**
1. Identify current bottlenecks in your workflow
2. Implement the suggested change gradually
3. Measure the impact over one week
4. Adjust based on results

🎯 **Additional Quick Wins:**
• Use templates for recurring tasks
• Set up keyboard shortcuts for common actions
• Create checklists for complex processes
• Eliminate or delegate low-value activities

Ready to optimize your workflow?`;
  }
}

class FocusAssistantAlgorithm implements LunaAlgorithm {
  id: UUID = 'focus-assistant-001';
  name = 'Focus Assistant';
  description = 'Helps maintain focus and manage distractions';
  priority = 8;
  capabilities: LunaCapability[] = ['productivity_insights', 'local_processing'];
  enabled = true;
  metrics = {
    success_rate: 0.85,
    average_confidence: 0.8,
    total_executions: 0,
    average_execution_time: 10
  };

  canHandle(context: LunaContext): boolean {
    const input = context.userInput.toLowerCase();
    return input.includes('focus') || input.includes('concentration') ||
           input.includes('distracted') || input.includes('attention') ||
           input.includes('deep work');
  }

  async execute(context: LunaContext): Promise<LunaResult> {
    const focusStrategy = this.generateFocusStrategy(context);

    return {
      type: 'success',
      content: focusStrategy,
      executionTime: 10,
      handledLocally: true,
      confidence: 0.8,
      suggestedActions: ['Start focus session', 'Block distractions', 'Set timer', 'Use white noise']
    };
  }

  private generateFocusStrategy(context: LunaContext): string {
    const timeOfDay = context.timeOfDay || this.getTimeOfDay();

    const strategies = {
      morning: {
        title: 'Morning Focus Strategy',
        techniques: [
          'Start with your most challenging task (highest mental energy)',
          'Use the 90-minute work blocks (natural ultradian rhythm)',
          'Avoid checking email for the first hour'
        ],
        environment: 'Bright lighting, minimal noise, fresh air'
      },
      afternoon: {
        title: 'Afternoon Focus Strategy',
        techniques: [
          'Use shorter 25-45 minute focus blocks',
          'Take active breaks (walk, stretch)',
          'Switch to collaborative or administrative tasks'
        ],
        environment: 'Moderate lighting, background music okay'
      },
      evening: {
        title: 'Evening Focus Strategy',
        techniques: [
          'Focus on planning and light cognitive tasks',
          'Use dim lighting to prepare for rest',
          'Review and organize for tomorrow'
        ],
        environment: 'Warm lighting, quiet atmosphere'
      },
      night: {
        title: 'Night Focus Strategy',
        techniques: [
          'Avoid heavy cognitive work',
          'Focus on reading or light planning',
          'Prepare for quality sleep'
        ],
        environment: 'Minimal blue light, very quiet'
      }
    };

    const strategy = strategies[timeOfDay as keyof typeof strategies] || strategies.morning;

    return `🎯 **${strategy.title}**

**Optimal Techniques for Now:**
${strategy.techniques.map(technique => `• ${technique}`).join('\n')}

**Environment Setup:**
${strategy.environment}

🧠 **Universal Focus Boosters:**
• Remove phone from immediate vicinity
• Close unnecessary browser tabs and apps
• Use website blockers for social media
• Try the "2-minute rule" for quick distractions
• Practice single-tasking (one thing at a time)

🍅 **Pomodoro Technique:**
25 minutes focused work → 5 minute break → Repeat
After 4 cycles, take a 15-30 minute break

Ready to enter focus mode?`;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
}

// MARK: - Export Functions

export const lunaIntelligence = LunaIntelligenceEngine.getInstance();

export async function processWithLocalIntelligence(
  userInput: string,
  context?: Partial<LunaContext>
): Promise<LunaResult> {
  const fullContext: LunaContext = {
    userInput,
    currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
    timeOfDay: getTimeOfDay(),
    ...context
  };

  return await lunaIntelligence.processTask(fullContext);
}

export function canHandleLocally(userInput: string): boolean {
  const context: LunaContext = {
    userInput,
    timeOfDay: getTimeOfDay()
  };
  return lunaIntelligence.canHandleLocally(context);
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}