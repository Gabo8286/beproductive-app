import {
  PromptTemplate,
  UserIntent,
  AppContext,
  PromptLibraryEventData
} from '@/types/promptLibrary';

/**
 * PromptEnhancer class - Enhances prompt templates with contextual information
 * and user-specific data to create highly personalized and effective prompts
 */
export class PromptEnhancer {
  /**
   * Main method to enhance a prompt template with user context and intent
   */
  async enhancePrompt(
    template: PromptTemplate,
    intent: UserIntent,
    context: AppContext,
    additionalData?: Record<string, any>
  ): Promise<string> {
    // Start with the base system prompt
    let enhancedPrompt = template.systemPrompt;

    // Add contextual layers
    enhancedPrompt += this.addContextualAwareness(context);
    enhancedPrompt += this.addUserPersonalization(context);
    enhancedPrompt += this.addTemporalContext(context);
    enhancedPrompt += this.addStateAwareness(context);

    // Inject current data into user prompt template
    const userPrompt = this.injectContextualData(
      template.userPromptTemplate,
      intent,
      context,
      additionalData
    );

    // Apply template constraints and instructions
    enhancedPrompt += this.addConstraintsAndInstructions(template);

    // Add final formatting instructions
    enhancedPrompt += this.addFormattingInstructions(template);

    // Combine system prompt with user prompt
    const finalPrompt = `${enhancedPrompt}\n\n---\n\nUser Request:\n${userPrompt}`;

    // Log enhancement for analytics
    this.logPromptEnhancement(template.id, intent.id, enhancedPrompt.length);

    return finalPrompt;
  }

  /**
   * Add contextual awareness based on current app state
   */
  private addContextualAwareness(context: AppContext): string {
    const currentModule = this.extractModuleFromRoute(context.currentRoute);
    const timeOfDay = context.timeContext.timeOfDay;

    return `\n\nCONTEXTUAL AWARENESS:
- Current Location: User is currently in the ${currentModule} section
- Time Context: It's ${timeOfDay} on ${context.timeContext.dayOfWeek}
- Current Focus: ${this.inferCurrentFocus(context)}
- Recent Activity: ${this.summarizeRecentActivity(context)}
- User State: ${this.assessUserState(context)}`;
  }

  /**
   * Add user personalization based on preferences and patterns
   */
  private addUserPersonalization(context: AppContext): string {
    const communicationStyle = context.userPreferences.communicationStyle;
    const workingHours = context.userPreferences.workingHours;

    return `\n\nUSER PERSONALIZATION:
- Communication Style: ${communicationStyle} responses preferred
- Working Hours: ${workingHours.start} to ${workingHours.end}
- Language: ${context.userPreferences.language}
- Timezone: ${context.userPreferences.timezone}
- Productivity Patterns: ${this.analyzeProductivityPatterns(context)}
- Preferred Approach: ${this.inferPreferredApproach(context)}`;
  }

  /**
   * Add temporal context for time-sensitive responses
   */
  private addTemporalContext(context: AppContext): string {
    const currentDate = context.timeContext.currentDate;
    const timeOfDay = context.timeContext.timeOfDay;
    const dayOfWeek = context.timeContext.dayOfWeek;

    return `\n\nTEMPORAL CONTEXT:
- Current Date: ${currentDate.toLocaleDateString()}
- Time of Day: ${timeOfDay} (${this.getTimeBasedRecommendations(timeOfDay)})
- Day of Week: ${dayOfWeek} (${this.getDayBasedContext(dayOfWeek)})
- Energy Level: ${this.inferEnergyLevel(context)}
- Optimal Activities: ${this.suggestOptimalActivities(context)}`;
  }

  /**
   * Add current state awareness for relevant recommendations
   */
  private addStateAwareness(context: AppContext): string {
    const taskCount = context.userState.tasks.length;
    const activeGoals = context.userState.goals.filter(g => g.status === 'active').length;
    const recentHabits = context.userState.habits.filter(h => h.lastCompleted).length;

    return `\n\nCURRENT STATE AWARENESS:
- Active Tasks: ${taskCount} tasks in pipeline
- Active Goals: ${activeGoals} goals being pursued
- Recent Habits: ${recentHabits} habits tracked recently
- Workload Assessment: ${this.assessWorkload(context)}
- Stress Indicators: ${this.detectStressIndicators(context)}
- Capacity Availability: ${this.assessAvailableCapacity(context)}`;
  }

  /**
   * Inject contextual data into the user prompt template
   */
  private injectContextualData(
    template: string,
    intent: UserIntent,
    context: AppContext,
    additionalData?: Record<string, any>
  ): string {
    // Define all available template variables
    const templateVars: Record<string, string> = {
      // User input
      userInput: intent.rawInput,
      userGoal: intent.entities.goal || '',
      userQuestion: intent.rawInput,
      userChallenges: JSON.stringify(intent.entities.challenges || []),

      // Current context
      currentTime: new Date().toLocaleTimeString(),
      currentDate: context.timeContext.currentDate.toLocaleDateString(),
      currentRoute: context.currentRoute,
      currentModule: this.extractModuleFromRoute(context.currentRoute),

      // User state
      activeTasks: JSON.stringify(context.userState.tasks.slice(0, 10)), // Limit for prompt size
      existingGoals: JSON.stringify(context.userState.goals.slice(0, 5)),
      recentActivity: JSON.stringify(context.userState.recentActivity.slice(0, 5)),
      pendingTasks: this.formatTasksForPrompt(context.userState.tasks),

      // Preferences and patterns
      userPreferences: JSON.stringify(context.userPreferences),
      workStyle: this.inferWorkStyle(context),
      productivityHours: this.identifyProductivityHours(context),
      energyLevel: this.inferEnergyLevel(context),
      currentMood: this.inferCurrentMood(context),

      // Analytics data
      completionPatterns: this.analyzeCompletionPatterns(context),
      timeData: this.summarizeTimeData(context),
      productivityContext: this.generateProductivityContext(context),
      energyPatterns: this.analyzeEnergyPatterns(context),

      // External factors
      timeline: intent.entities.timeline || 'flexible',
      priority: intent.entities.priority || 'medium',
      resources: this.assessAvailableResources(context),
      constraints: this.identifyConstraints(context),
      externalFactors: this.gatherExternalFactors(context),

      // Session context
      conversationHistory: JSON.stringify(context.sessionContext.conversationHistory.slice(-3)),
      recentIntents: JSON.stringify(context.sessionContext.recentIntents.slice(-3)),
      currentFocus: context.sessionContext.currentFocus || 'general productivity',

      // Time allocations
      availableTime: this.calculateAvailableTime(context),
      timeCommitment: intent.entities.timeCommitment || 'flexible',
      breakPreferences: this.inferBreakPreferences(context),

      // Additional injected data
      ...additionalData
    };

    // Replace all template variables
    let injectedTemplate = template;
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      injectedTemplate = injectedTemplate.replace(regex, value);
    });

    return injectedTemplate;
  }

  /**
   * Add template constraints and instructions
   */
  private addConstraintsAndInstructions(template: PromptTemplate): string {
    let instructions = '\n\nSPECIFIC INSTRUCTIONS:';

    // Add context instructions
    if (template.contextInstructions.length > 0) {
      instructions += '\nContext Considerations:';
      template.contextInstructions.forEach(instruction => {
        instructions += `\n- ${instruction}`;
      });
    }

    // Add constraints
    if (template.constraints.length > 0) {
      instructions += '\nConstraints:';
      template.constraints.forEach(constraint => {
        instructions += `\n- ${constraint}`;
      });
    }

    return instructions;
  }

  /**
   * Add formatting instructions based on expected response type
   */
  private addFormattingInstructions(template: PromptTemplate): string {
    let formatting = '\n\nRESPONSE FORMATTING:';

    switch (template.expectedResponse) {
      case 'structured':
        formatting += '\n- Provide response in the specified JSON format';
        formatting += '\n- Include both structured data and conversational explanation';
        formatting += '\n- Ensure all required fields are present and valid';
        break;

      case 'conversational':
        formatting += '\n- Use natural, engaging conversational tone';
        formatting += '\n- Structure with clear sections and bullet points';
        formatting += '\n- Include specific examples and actionable advice';
        break;

      case 'action':
        formatting += '\n- Focus on immediate, actionable steps';
        formatting += '\n- Prioritize actions by impact and feasibility';
        formatting += '\n- Include timeline and resource requirements';
        break;

      case 'navigation':
        formatting += '\n- Provide clear navigation instructions';
        formatting += '\n- Explain what the user will find at the destination';
        formatting += '\n- Offer alternative routes if applicable';
        break;

      case 'confirmation':
        formatting += '\n- Clearly state what action will be taken';
        formatting += '\n- Ask for explicit confirmation';
        formatting += '\n- Explain consequences or next steps';
        break;
    }

    if (template.outputFormat) {
      formatting += '\n- Follow the exact JSON schema provided';
      formatting += '\n- Validate all data types and required fields';
    }

    if (template.maxTokens) {
      formatting += `\n- Keep response under ${template.maxTokens} tokens`;
    }

    return formatting;
  }

  // Helper methods for context analysis and data extraction

  private extractModuleFromRoute(route: string): string {
    const segments = route.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }

  private inferCurrentFocus(context: AppContext): string {
    return context.sessionContext.currentFocus ||
           this.extractModuleFromRoute(context.currentRoute) ||
           'general productivity';
  }

  private summarizeRecentActivity(context: AppContext): string {
    const activities = context.userState.recentActivity.slice(0, 3);
    return activities.length > 0
      ? activities.map(a => a.description || a.type).join(', ')
      : 'No recent activity';
  }

  private assessUserState(context: AppContext): string {
    const taskCount = context.userState.tasks.length;
    const timeOfDay = context.timeContext.timeOfDay;

    if (taskCount > 20) return 'High workload';
    if (taskCount > 10) return 'Moderate workload';
    if (timeOfDay === 'morning') return 'Starting day';
    if (timeOfDay === 'evening') return 'Winding down';
    return 'Balanced state';
  }

  private analyzeProductivityPatterns(context: AppContext): string {
    // Analyze recent task completion patterns
    const recentTasks = context.userState.tasks.filter(t => t.completedAt);
    const morningTasks = recentTasks.filter(t => {
      const hour = new Date(t.completedAt).getHours();
      return hour >= 6 && hour < 12;
    });

    if (morningTasks.length > recentTasks.length * 0.6) {
      return 'Morning productivity peak';
    }
    return 'Distributed productivity pattern';
  }

  private inferPreferredApproach(context: AppContext): string {
    const style = context.userPreferences.communicationStyle;
    switch (style) {
      case 'brief': return 'Quick, actionable guidance';
      case 'detailed': return 'Comprehensive analysis and explanation';
      case 'conversational': return 'Engaging discussion and exploration';
      default: return 'Balanced approach';
    }
  }

  private getTimeBasedRecommendations(timeOfDay: string): string {
    switch (timeOfDay) {
      case 'morning': return 'optimal for planning and high-focus work';
      case 'afternoon': return 'good for meetings and collaborative work';
      case 'evening': return 'ideal for reflection and preparation';
      case 'night': return 'time for rest and light planning';
      default: return 'flexible timing';
    }
  }

  private getDayBasedContext(dayOfWeek: string): string {
    switch (dayOfWeek.toLowerCase()) {
      case 'monday': return 'week planning and fresh starts';
      case 'friday': return 'week wrap-up and preparation';
      case 'saturday':
      case 'sunday': return 'personal time and reflection';
      default: return 'regular work day';
    }
  }

  private inferEnergyLevel(context: AppContext): string {
    const timeOfDay = context.timeContext.timeOfDay;
    const taskCount = context.userState.tasks.length;

    if (timeOfDay === 'morning' && taskCount < 10) return 'High energy';
    if (timeOfDay === 'afternoon' && taskCount < 15) return 'Moderate energy';
    if (taskCount > 20) return 'Potentially depleted';
    return 'Stable energy';
  }

  private suggestOptimalActivities(context: AppContext): string {
    const timeOfDay = context.timeContext.timeOfDay;
    const energy = this.inferEnergyLevel(context);

    if (timeOfDay === 'morning' && energy === 'High energy') {
      return 'Complex tasks, creative work, important decisions';
    }
    if (timeOfDay === 'afternoon') {
      return 'Meetings, communications, routine tasks';
    }
    return 'Planning, review, light administrative work';
  }

  private assessWorkload(context: AppContext): string {
    const taskCount = context.userState.tasks.length;
    const activeGoals = context.userState.goals.filter(g => g.status === 'active').length;

    const totalLoad = taskCount + (activeGoals * 3); // Weight goals more heavily

    if (totalLoad > 50) return 'Heavy workload - consider delegation';
    if (totalLoad > 25) return 'Moderate workload - manageable with planning';
    if (totalLoad > 10) return 'Light workload - room for new initiatives';
    return 'Minimal workload - opportunity for growth';
  }

  private detectStressIndicators(context: AppContext): string {
    const indicators = [];

    if (context.userState.tasks.length > 25) indicators.push('task overload');
    if (context.sessionContext.recentIntents.length > 10) indicators.push('high activity');

    // Check for urgent/overdue items
    const urgentTasks = context.userState.tasks.filter(t =>
      t.priority === 'high' || (t.dueDate && new Date(t.dueDate) < new Date())
    );
    if (urgentTasks.length > 5) indicators.push('urgent items');

    return indicators.length > 0 ? indicators.join(', ') : 'No significant stress indicators';
  }

  private assessAvailableCapacity(context: AppContext): string {
    const workload = this.assessWorkload(context);
    const timeOfDay = context.timeContext.timeOfDay;

    if (workload.includes('Heavy')) return 'Limited capacity - focus on essentials';
    if (timeOfDay === 'evening') return 'Reduced capacity - lighter tasks recommended';
    return 'Good capacity available';
  }

  // Additional helper methods for data formatting and analysis

  private formatTasksForPrompt(tasks: any[]): string {
    return tasks.slice(0, 10).map(task =>
      `- ${task.title} (${task.priority || 'medium'} priority, ${task.estimatedTime || 'unestimated'})`
    ).join('\n');
  }

  private inferWorkStyle(context: AppContext): string {
    // Analyze patterns to infer work style
    const communicationStyle = context.userPreferences.communicationStyle;
    if (communicationStyle === 'brief') return 'Efficient and focused';
    if (communicationStyle === 'detailed') return 'Thorough and analytical';
    return 'Balanced and adaptable';
  }

  private identifyProductivityHours(context: AppContext): string {
    // This would ideally analyze historical data
    const workingHours = context.userPreferences.workingHours;
    return `${workingHours.start} - ${workingHours.end}`;
  }

  private inferCurrentMood(context: AppContext): string {
    // Basic mood inference based on recent activity and time
    const recentActivity = context.userState.recentActivity.length;
    const timeOfDay = context.timeContext.timeOfDay;

    if (recentActivity > 10) return 'Active and engaged';
    if (timeOfDay === 'morning') return 'Fresh and ready';
    if (timeOfDay === 'evening') return 'Reflective';
    return 'Steady and focused';
  }

  private analyzeCompletionPatterns(context: AppContext): string {
    const completedTasks = context.userState.tasks.filter(t => t.completedAt);
    const completionRate = completedTasks.length / Math.max(context.userState.tasks.length, 1) * 100;
    return `${Math.round(completionRate)}% completion rate`;
  }

  private summarizeTimeData(context: AppContext): string {
    // This would analyze time tracking data if available
    return 'Time allocation patterns available';
  }

  private generateProductivityContext(context: AppContext): string {
    const taskCount = context.userState.tasks.length;
    const goalCount = context.userState.goals.length;
    return `${taskCount} active tasks, ${goalCount} goals tracked`;
  }

  private analyzeEnergyPatterns(context: AppContext): string {
    const timeOfDay = context.timeContext.timeOfDay;
    return `Current: ${timeOfDay} - ${this.getTimeBasedRecommendations(timeOfDay)}`;
  }

  private assessAvailableResources(context: AppContext): string {
    return 'Standard productivity tools and time allocation available';
  }

  private identifyConstraints(context: AppContext): string {
    const constraints = [];

    if (context.userState.tasks.length > 20) constraints.push('high task load');

    const workingHours = context.userPreferences.workingHours;
    const currentHour = new Date().getHours();
    if (currentHour < parseInt(workingHours.start) || currentHour > parseInt(workingHours.end)) {
      constraints.push('outside working hours');
    }

    return constraints.length > 0 ? constraints.join(', ') : 'No significant constraints';
  }

  private gatherExternalFactors(context: AppContext): string {
    const dayOfWeek = context.timeContext.dayOfWeek;
    const factors = [];

    if (dayOfWeek === 'Monday') factors.push('week start momentum');
    if (dayOfWeek === 'Friday') factors.push('week-end transition');
    if (['Saturday', 'Sunday'].includes(dayOfWeek)) factors.push('weekend context');

    return factors.join(', ') || 'Standard working conditions';
  }

  private calculateAvailableTime(context: AppContext): string {
    const workingHours = context.userPreferences.workingHours;
    const start = parseInt(workingHours.start);
    const end = parseInt(workingHours.end);
    const currentHour = new Date().getHours();

    if (currentHour < start) {
      return `${start - currentHour} hours until work day starts`;
    }
    if (currentHour < end) {
      return `${end - currentHour} hours remaining in work day`;
    }
    return 'Outside normal working hours';
  }

  private inferBreakPreferences(context: AppContext): string {
    // This would ideally be based on user data/preferences
    return '15-minute breaks every 90 minutes';
  }

  /**
   * Log prompt enhancement for analytics
   */
  private logPromptEnhancement(promptId: string, intentId: string, promptLength: number): void {
    const eventData: PromptLibraryEventData = {
      eventType: 'prompt_used',
      userId: 'current-user', // This would come from auth context
      promptId,
      intentId,
      metadata: {
        promptLength,
        enhancementApplied: true,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    // This would integrate with the analytics system
    console.debug('Prompt enhancement logged:', eventData);
  }
}