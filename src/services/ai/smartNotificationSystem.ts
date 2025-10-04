import { supabase } from "@/integrations/supabase/client";
import { aiServiceManager, AIServiceRequest } from "./aiServiceManager";
import { AIProvider } from "@/types/ai-insights";

export interface UserContext {
  userId: string;
  currentTime: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  preferences: {
    notificationFrequency: 'minimal' | 'moderate' | 'frequent';
    quietHours: { start: string; end: string };
    preferredChannels: ('push' | 'email' | 'sms')[];
    personalityStyle: 'formal' | 'friendly' | 'motivational' | 'direct';
  };
  currentActivity?: {
    type: 'working' | 'meeting' | 'break' | 'personal';
    startTime: string;
    estimatedEnd?: string;
  };
  recentProductivity: {
    mood: number; // 1-10
    energy: number; // 1-10
    focus: number; // 1-10
    stress: number; // 1-10
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    startTime: string;
    type: 'task' | 'meeting' | 'deadline' | 'habit' | 'goal_milestone';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
}

export interface NotificationTrigger {
  id: string;
  type: 'task_reminder' | 'habit_prompt' | 'break_suggestion' | 'goal_check' | 'burnout_prevention' | 'productivity_insight' | 'deadline_warning' | 'motivational_boost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  triggers: Array<{
    condition: string;
    threshold?: number;
    timeWindow?: string;
  }>;
  userSegments: string[]; // e.g., ['high_performer', 'struggling', 'new_user']
  active: boolean;
  metadata?: any;
}

export interface SmartNotification {
  id: string;
  userId: string;
  type: NotificationTrigger['type'];
  title: string;
  message: string;
  actionButtons?: Array<{
    text: string;
    action: string;
    primary?: boolean;
  }>;
  scheduledFor: string;
  channel: 'push' | 'email' | 'sms' | 'in_app';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'reminder' | 'suggestion' | 'warning' | 'insight' | 'motivation';
  personalization: {
    tone: string;
    timing: string;
    context: string;
    relevance: number; // 0-1
  };
  metadata: {
    triggerId: string;
    aiGenerated: boolean;
    confidence: number;
    relatedItems: string[];
    expectedResponse?: string;
  };
  status: 'scheduled' | 'sent' | 'delivered' | 'opened' | 'acted_upon' | 'dismissed';
  createdAt: string;
}

export interface NotificationRequest {
  userId: string;
  userContext: UserContext;
  lookAheadHours?: number;
  includeProactive?: boolean;
  preferredProvider?: AIProvider;
  maxNotifications?: number;
}

export interface NotificationAnalytics {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    actionRate: number;
    dismissalRate: number;
  };
  effectiveness: {
    byType: Record<string, number>;
    byTiming: Record<string, number>;
    byChannel: Record<string, number>;
  };
  userFeedback: {
    helpful: number;
    annoying: number;
    irrelevant: number;
  };
  recommendations: string[];
}

export class SmartNotificationSystem {
  private static instance: SmartNotificationSystem;

  public static getInstance(): SmartNotificationSystem {
    if (!SmartNotificationSystem.instance) {
      SmartNotificationSystem.instance = new SmartNotificationSystem();
    }
    return SmartNotificationSystem.instance;
  }

  public async generateSmartNotifications(request: NotificationRequest): Promise<SmartNotification[]> {
    const { userContext, lookAheadHours = 24, maxNotifications = 5 } = request;

    // Get active notification triggers
    const triggers = await this.getActiveNotificationTriggers(userContext);

    // Evaluate which triggers should fire
    const activeTriggersWithContext = await this.evaluateTriggers(triggers, userContext);

    // Generate AI-personalized notifications
    const notifications: SmartNotification[] = [];
    for (const trigger of activeTriggersWithContext.slice(0, maxNotifications)) {
      try {
        const notification = await this.generatePersonalizedNotification(trigger, userContext, request);
        if (notification) {
          notifications.push(notification);
        }
      } catch (error) {
        console.error(`Failed to generate notification for trigger ${trigger.id}:`, error);
      }
    }

    // Optimize timing and channel selection
    const optimizedNotifications = await this.optimizeNotificationDelivery(notifications, userContext);

    // Remove conflicts and duplicates
    const finalNotifications = this.deduplicateAndResolveConflicts(optimizedNotifications);

    return finalNotifications;
  }

  private async getActiveNotificationTriggers(userContext: UserContext): Promise<NotificationTrigger[]> {
    // Get user's notification preferences and active triggers
    const { data: userTriggers } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userContext.userId)
      .eq('active', true);

    // Default triggers if none configured
    const defaultTriggers: NotificationTrigger[] = [
      {
        id: 'task_due_soon',
        type: 'task_reminder',
        priority: 'high',
        triggers: [
          { condition: 'task_due_in_hours', threshold: 2 },
          { condition: 'task_overdue', threshold: 0 }
        ],
        userSegments: ['all'],
        active: true
      },
      {
        id: 'habit_streak_motivation',
        type: 'habit_prompt',
        priority: 'medium',
        triggers: [
          { condition: 'habit_not_completed_today', timeWindow: 'evening' },
          { condition: 'habit_streak_at_risk' }
        ],
        userSegments: ['habit_builders'],
        active: true
      },
      {
        id: 'break_suggestion',
        type: 'break_suggestion',
        priority: 'medium',
        triggers: [
          { condition: 'continuous_work_time', threshold: 90 },
          { condition: 'focus_declining' }
        ],
        userSegments: ['all'],
        active: true
      },
      {
        id: 'burnout_early_warning',
        type: 'burnout_prevention',
        priority: 'urgent',
        triggers: [
          { condition: 'stress_level_high', threshold: 8 },
          { condition: 'working_hours_excessive', threshold: 10 }
        ],
        userSegments: ['at_risk'],
        active: true
      }
    ];

    return userTriggers || defaultTriggers;
  }

  private async evaluateTriggers(
    triggers: NotificationTrigger[],
    userContext: UserContext
  ): Promise<NotificationTrigger[]> {
    const activeTriggers: NotificationTrigger[] = [];

    for (const trigger of triggers) {
      let shouldTrigger = false;

      for (const condition of trigger.triggers) {
        if (await this.evaluateCondition(condition, userContext)) {
          shouldTrigger = true;
          break; // OR logic - any condition can trigger
        }
      }

      // Check user segments
      const userSegment = await this.getUserSegment(userContext);
      if (shouldTrigger && (trigger.userSegments.includes('all') || trigger.userSegments.includes(userSegment))) {
        activeTriggers.push(trigger);
      }
    }

    // Sort by priority
    return activeTriggers.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async evaluateCondition(
    condition: { condition: string; threshold?: number; timeWindow?: string },
    userContext: UserContext
  ): Promise<boolean> {
    const { condition: conditionType, threshold, timeWindow } = condition;

    switch (conditionType) {
      case 'task_due_in_hours':
        return this.hasTasksDueInHours(userContext, threshold || 2);

      case 'task_overdue':
        return this.hasOverdueTasks(userContext);

      case 'habit_not_completed_today':
        return await this.hasIncompleteHabitsToday(userContext);

      case 'continuous_work_time':
        return this.hasContinuousWorkTime(userContext, threshold || 90);

      case 'stress_level_high':
        return userContext.recentProductivity.stress >= (threshold || 8);

      case 'working_hours_excessive':
        return await this.hasExcessiveWorkingHours(userContext, threshold || 10);

      case 'focus_declining':
        return userContext.recentProductivity.focus <= 4;

      default:
        return false;
    }
  }

  private async generatePersonalizedNotification(
    trigger: NotificationTrigger,
    userContext: UserContext,
    request: NotificationRequest
  ): Promise<SmartNotification | null> {
    const prompt = this.buildNotificationPrompt(trigger, userContext);

    const aiRequest: AIServiceRequest = {
      provider: request.preferredProvider || 'lovable',
      prompt,
      userId: userContext.userId,
      requestType: 'smart_notification',
      maxTokens: 300,
      temperature: 0.7,
      metadata: { triggerId: trigger.id, notificationType: trigger.type }
    };

    const response = await aiServiceManager.makeRequest(aiRequest);

    if (response.success) {
      try {
        const aiNotification = JSON.parse(response.content);
        return this.createNotificationFromAI(aiNotification, trigger, userContext);
      } catch (error) {
        console.error('Failed to parse AI notification response:', error);
      }
    }

    // Fallback to template-based notification
    return this.createTemplateNotification(trigger, userContext);
  }

  private buildNotificationPrompt(trigger: NotificationTrigger, userContext: UserContext): string {
    const timeContext = this.getTimeContext(userContext.currentTime);
    const productivityContext = this.getProductivityContext(userContext.recentProductivity);

    return `Create a personalized notification for a productivity app user.

NOTIFICATION TRIGGER: ${trigger.type}
USER CONTEXT:
- Current Time: ${userContext.currentTime} (${timeContext})
- Mood: ${userContext.recentProductivity.mood}/10
- Energy: ${userContext.recentProductivity.energy}/10
- Focus: ${userContext.recentProductivity.focus}/10
- Stress: ${userContext.recentProductivity.stress}/10
- Current Activity: ${userContext.currentActivity?.type || 'unknown'}
- Notification Style: ${userContext.preferences.personalityStyle}

UPCOMING EVENTS: ${userContext.upcomingEvents.slice(0, 3).map(e => `${e.title} at ${e.startTime}`).join(', ')}

REQUIREMENTS:
1. Match the user's preferred communication style: ${userContext.preferences.personalityStyle}
2. Consider their current productivity state (${productivityContext})
3. Be contextually relevant to the current time (${timeContext})
4. Provide actionable guidance, not just information
5. Keep the message concise but engaging
6. Include appropriate urgency based on the trigger type

Generate a notification with:
- Title (max 50 characters)
- Message (max 150 characters)
- Suggested actions (2-3 options)
- Timing optimization (best time to send)
- Relevance score (0-1)

Format as JSON:
{
  "title": "string",
  "message": "string",
  "actions": [
    {"text": "Action 1", "action": "action_id", "primary": true},
    {"text": "Action 2", "action": "action_id"}
  ],
  "timing": "immediate|in_5_min|in_15_min|at_break|custom_time",
  "relevance": 0.9,
  "tone": "motivational|supportive|urgent|informative"
}`;
  }

  private createNotificationFromAI(
    aiNotification: any,
    trigger: NotificationTrigger,
    userContext: UserContext
  ): SmartNotification {
    const scheduledTime = this.calculateScheduledTime(aiNotification.timing, userContext);

    return {
      id: crypto.randomUUID(),
      userId: userContext.userId,
      type: trigger.type,
      title: aiNotification.title,
      message: aiNotification.message,
      actionButtons: aiNotification.actions || [],
      scheduledFor: scheduledTime,
      channel: this.selectOptimalChannel(userContext, trigger.priority),
      priority: trigger.priority,
      category: this.getCategoryFromType(trigger.type),
      personalization: {
        tone: aiNotification.tone || userContext.preferences.personalityStyle,
        timing: aiNotification.timing || 'immediate',
        context: userContext.currentActivity?.type || 'general',
        relevance: aiNotification.relevance || 0.7
      },
      metadata: {
        triggerId: trigger.id,
        aiGenerated: true,
        confidence: aiNotification.relevance || 0.7,
        relatedItems: this.extractRelatedItems(trigger, userContext),
        expectedResponse: aiNotification.expectedResponse
      },
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
  }

  private createTemplateNotification(
    trigger: NotificationTrigger,
    userContext: UserContext
  ): SmartNotification {
    const templates = this.getNotificationTemplates();
    const template = templates[trigger.type] || templates.default;

    return {
      id: crypto.randomUUID(),
      userId: userContext.userId,
      type: trigger.type,
      title: this.personalizeTemplate(template.title, userContext),
      message: this.personalizeTemplate(template.message, userContext),
      actionButtons: template.actions,
      scheduledFor: new Date().toISOString(),
      channel: this.selectOptimalChannel(userContext, trigger.priority),
      priority: trigger.priority,
      category: this.getCategoryFromType(trigger.type),
      personalization: {
        tone: userContext.preferences.personalityStyle,
        timing: 'immediate',
        context: userContext.currentActivity?.type || 'general',
        relevance: 0.6
      },
      metadata: {
        triggerId: trigger.id,
        aiGenerated: false,
        confidence: 0.6,
        relatedItems: [],
      },
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
  }

  private async optimizeNotificationDelivery(
    notifications: SmartNotification[],
    userContext: UserContext
  ): Promise<SmartNotification[]> {
    // Get user's notification analytics
    const analytics = await this.getUserNotificationAnalytics(userContext.userId);

    return notifications.map(notification => {
      // Optimize timing based on user's historical engagement
      const optimalTiming = this.getOptimalTiming(notification, userContext, analytics);

      // Optimize channel based on effectiveness
      const optimalChannel = this.getOptimalChannel(notification, analytics);

      return {
        ...notification,
        scheduledFor: optimalTiming,
        channel: optimalChannel
      };
    });
  }

  private deduplicateAndResolveConflicts(notifications: SmartNotification[]): SmartNotification[] {
    // Remove duplicate content
    const unique = notifications.reduce((acc, notification) => {
      const existing = acc.find(n =>
        n.type === notification.type &&
        this.calculateSimilarity(n.message, notification.message) > 0.8
      );

      if (!existing) {
        acc.push(notification);
      } else if (notification.priority === 'urgent' && existing.priority !== 'urgent') {
        // Replace with higher priority
        acc[acc.indexOf(existing)] = notification;
      }

      return acc;
    }, [] as SmartNotification[]);

    // Resolve timing conflicts (max 1 notification per 30 minutes)
    const scheduled = unique.sort((a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );

    const resolved: SmartNotification[] = [];
    let lastScheduledTime = 0;

    for (const notification of scheduled) {
      const scheduledTime = new Date(notification.scheduledFor).getTime();

      if (scheduledTime - lastScheduledTime >= 30 * 60 * 1000 || notification.priority === 'urgent') {
        resolved.push(notification);
        lastScheduledTime = scheduledTime;
      } else {
        // Reschedule to next available slot
        const newTime = new Date(lastScheduledTime + 30 * 60 * 1000);
        resolved.push({
          ...notification,
          scheduledFor: newTime.toISOString()
        });
        lastScheduledTime = newTime.getTime();
      }
    }

    return resolved;
  }

  // Helper methods

  private hasTasksDueInHours(userContext: UserContext, hours: number): boolean {
    const cutoffTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    return userContext.upcomingEvents.some(event =>
      event.type === 'task' && new Date(event.startTime) <= cutoffTime
    );
  }

  private hasOverdueTasks(userContext: UserContext): boolean {
    const now = new Date();
    return userContext.upcomingEvents.some(event =>
      event.type === 'task' && new Date(event.startTime) < now
    );
  }

  private async hasIncompleteHabitsToday(userContext: UserContext): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('habits')
      .select(`
        id,
        habit_completions!left(completed_at)
      `)
      .eq('user_id', userContext.userId)
      .eq('is_active', true);

    return data?.some(habit =>
      !habit.habit_completions.some((completion: any) =>
        completion.completed_at?.startsWith(today)
      )
    ) || false;
  }

  private hasContinuousWorkTime(userContext: UserContext, minutes: number): boolean {
    if (!userContext.currentActivity || userContext.currentActivity.type !== 'working') {
      return false;
    }

    const workStartTime = new Date(userContext.currentActivity.startTime).getTime();
    const now = new Date().getTime();
    const workDuration = (now - workStartTime) / (1000 * 60);

    return workDuration >= minutes;
  }

  private async hasExcessiveWorkingHours(userContext: UserContext, threshold: number): Promise<boolean> {
    // This would typically check actual time tracking data
    // For now, using a simplified check
    return userContext.recentProductivity.stress >= 8 && userContext.recentProductivity.energy <= 3;
  }

  private async getUserSegment(userContext: UserContext): Promise<string> {
    // Simplified user segmentation
    const avgProductivity = (
      userContext.recentProductivity.mood +
      userContext.recentProductivity.energy +
      userContext.recentProductivity.focus
    ) / 3;

    if (avgProductivity >= 8) return 'high_performer';
    if (avgProductivity <= 4) return 'struggling';
    if (userContext.recentProductivity.stress >= 8) return 'at_risk';
    return 'average';
  }

  private getTimeContext(currentTime: string): string {
    const hour = new Date(currentTime).getHours();
    if (hour < 6) return 'late_night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private getProductivityContext(productivity: UserContext['recentProductivity']): string {
    const avg = (productivity.mood + productivity.energy + productivity.focus) / 3;
    if (avg >= 8) return 'high_productivity';
    if (avg >= 6) return 'moderate_productivity';
    if (avg >= 4) return 'low_productivity';
    return 'struggling';
  }

  private calculateScheduledTime(timing: string, userContext: UserContext): string {
    const now = new Date();

    switch (timing) {
      case 'immediate':
        return now.toISOString();
      case 'in_5_min':
        return new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      case 'in_15_min':
        return new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      case 'at_break':
        // Schedule for next natural break time
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      default:
        return now.toISOString();
    }
  }

  private selectOptimalChannel(userContext: UserContext, priority: string): 'push' | 'email' | 'sms' | 'in_app' {
    if (priority === 'urgent') return 'push';

    const preferredChannels = userContext.preferences.preferredChannels;
    if (preferredChannels.includes('push')) return 'push';
    if (preferredChannels.includes('in_app')) return 'in_app';
    return preferredChannels[0] || 'push';
  }

  private getCategoryFromType(type: NotificationTrigger['type']): SmartNotification['category'] {
    const mapping: Record<NotificationTrigger['type'], SmartNotification['category']> = {
      'task_reminder': 'reminder',
      'habit_prompt': 'reminder',
      'break_suggestion': 'suggestion',
      'goal_check': 'reminder',
      'burnout_prevention': 'warning',
      'productivity_insight': 'insight',
      'deadline_warning': 'warning',
      'motivational_boost': 'motivation'
    };
    return mapping[type] || 'reminder';
  }

  private extractRelatedItems(trigger: NotificationTrigger, userContext: UserContext): string[] {
    // Extract relevant task/habit/goal IDs based on trigger type
    switch (trigger.type) {
      case 'task_reminder':
        return userContext.upcomingEvents
          .filter(e => e.type === 'task')
          .map(e => e.id);
      case 'habit_prompt':
        return userContext.upcomingEvents
          .filter(e => e.type === 'habit')
          .map(e => e.id);
      default:
        return [];
    }
  }

  private getNotificationTemplates(): Record<string, any> {
    return {
      'task_reminder': {
        title: '📋 Task Due Soon',
        message: 'You have a task due in the next 2 hours. Would you like to start working on it?',
        actions: [
          { text: 'Start Now', action: 'open_task', primary: true },
          { text: 'Remind Later', action: 'snooze_30min' }
        ]
      },
      'habit_prompt': {
        title: '🎯 Keep Your Streak!',
        message: 'Don\'t break your habit streak! You haven\'t completed your daily habit yet.',
        actions: [
          { text: 'Mark Done', action: 'complete_habit', primary: true },
          { text: 'Skip Today', action: 'skip_habit' }
        ]
      },
      'break_suggestion': {
        title: '☕ Time for a Break',
        message: 'You\'ve been working for 90+ minutes. A short break will help your focus.',
        actions: [
          { text: 'Take Break', action: 'start_break', primary: true },
          { text: '15 More Minutes', action: 'extend_work' }
        ]
      },
      'default': {
        title: '📱 Productivity Update',
        message: 'We have an update for you.',
        actions: [
          { text: 'View', action: 'open_app', primary: true }
        ]
      }
    };
  }

  private personalizeTemplate(template: string, userContext: UserContext): string {
    // Simple template personalization
    return template.replace('{{mood}}', userContext.recentProductivity.mood.toString());
  }

  private async getUserNotificationAnalytics(userId: string): Promise<NotificationAnalytics | null> {
    // Get user's notification effectiveness data
    const { data } = await supabase
      .from('notification_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    return data?.[0] || null;
  }

  private getOptimalTiming(
    notification: SmartNotification,
    userContext: UserContext,
    analytics: NotificationAnalytics | null
  ): string {
    // Use analytics to optimize timing, fallback to current logic
    return notification.scheduledFor;
  }

  private getOptimalChannel(
    notification: SmartNotification,
    analytics: NotificationAnalytics | null
  ): SmartNotification['channel'] {
    // Use analytics to optimize channel, fallback to current logic
    return notification.channel;
  }

  private calculateSimilarity(message1: string, message2: string): number {
    // Simple similarity calculation
    const words1 = message1.toLowerCase().split(' ');
    const words2 = message2.toLowerCase().split(' ');
    const common = words1.filter(word => words2.includes(word));

    return common.length / Math.max(words1.length, words2.length);
  }

  public async saveNotifications(notifications: SmartNotification[]): Promise<void> {
    for (const notification of notifications) {
      await supabase
        .from('notifications')
        .insert({
          id: notification.id,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          scheduled_for: notification.scheduledFor,
          channel: notification.channel,
          priority: notification.priority,
          category: notification.category,
          metadata: {
            ...notification.metadata,
            personalization: notification.personalization,
            actionButtons: notification.actionButtons
          },
          status: notification.status
        });
    }
  }

  public async scheduleNotifications(userId: string): Promise<SmartNotification[]> {
    // Get user context
    const userContext = await this.getUserContext(userId);

    if (!userContext) {
      throw new Error('Unable to get user context for notifications');
    }

    // Generate notifications
    const notifications = await this.generateSmartNotifications({
      userId,
      userContext,
      lookAheadHours: 24,
      includeProactive: true,
      maxNotifications: 5
    });

    // Save to database
    await this.saveNotifications(notifications);

    return notifications;
  }

  private async getUserContext(userId: string): Promise<UserContext | null> {
    // Get user data from various sources
    const [userPrefs, recentReflection, upcomingTasks] = await Promise.all([
      supabase.from('ai_user_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('reflections').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
      supabase.from('tasks').select('*').eq('user_id', userId).gte('due_date', new Date().toISOString()).limit(10)
    ]);

    if (!userPrefs.data) return null;

    const reflection = recentReflection.data?.[0];

    return {
      userId,
      currentTime: new Date().toISOString(),
      timezone: 'UTC', // Would get from user preferences
      workingHours: { start: '09:00', end: '17:00' },
      preferences: {
        notificationFrequency: 'moderate',
        quietHours: { start: '22:00', end: '08:00' },
        preferredChannels: ['push'],
        personalityStyle: userPrefs.data.coaching_style || 'friendly'
      },
      recentProductivity: {
        mood: reflection?.mood || 7,
        energy: reflection?.energy || 7,
        focus: reflection?.focus_score || 7,
        stress: reflection?.stress || 3
      },
      upcomingEvents: upcomingTasks.data?.map(task => ({
        id: task.id,
        title: task.title,
        startTime: task.due_date || new Date().toISOString(),
        type: 'task' as const,
        priority: task.priority || 'medium'
      })) || []
    };
  }
}

export const smartNotificationSystem = SmartNotificationSystem.getInstance();