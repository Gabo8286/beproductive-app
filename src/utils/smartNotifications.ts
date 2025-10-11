// Smart Notification System - Privacy-First Context-Aware Notifications
import { productivityStateDetector } from './productivityState';
import type { ProductivityState } from './productivityState';

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'task' | 'reminder' | 'insight' | 'achievement' | 'system' | 'focus';
  timing: 'immediate' | 'next-break' | 'end-of-session' | 'optimal-time';
  contextRequirements?: {
    minFocusLevel?: number;
    maxWorkloadLevel?: number;
    preferredStates?: ProductivityState['currentState'][];
    timeOfDay?: string[];
  };
  actions?: NotificationAction[];
  scheduledFor?: Date;
  createdAt: Date;
  expiresAt?: Date;
  shown: boolean;
  dismissed: boolean;
  interacted: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationConfig {
  respectFocusMode: boolean;
  batchSimilarNotifications: boolean;
  adaptToEnergyLevel: boolean;
  maxNotificationsPerHour: number;
  quietHours: { start: number; end: number };
  priorityThreshold: 'low' | 'medium' | 'high';
  enableSoundInFocus: boolean;
  enableBrowserNotifications: boolean;
}

class SmartNotificationManager {
  private notifications: SmartNotification[] = [];
  private shownNotifications: Set<string> = new Set();
  private lastNotificationTime: Date = new Date(0);
  private config: NotificationConfig;
  private static instance: SmartNotificationManager;

  static getInstance(): SmartNotificationManager {
    if (!SmartNotificationManager.instance) {
      SmartNotificationManager.instance = new SmartNotificationManager();
    }
    return SmartNotificationManager.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
    this.startNotificationProcessor();
    this.setupBrowserNotifications();
  }

  private getDefaultConfig(): NotificationConfig {
    return {
      respectFocusMode: true,
      batchSimilarNotifications: true,
      adaptToEnergyLevel: true,
      maxNotificationsPerHour: 6,
      quietHours: { start: 22, end: 8 }, // 10 PM to 8 AM
      priorityThreshold: 'medium',
      enableSoundInFocus: false,
      enableBrowserNotifications: true
    };
  }

  // Create a smart notification
  createNotification(
    title: string,
    message: string,
    options: Partial<SmartNotification> = {}
  ): string {
    const notification: SmartNotification = {
      id: this.generateId(),
      title: this.sanitizeText(title),
      message: this.sanitizeText(message),
      priority: options.priority || 'medium',
      category: options.category || 'system',
      timing: options.timing || 'immediate',
      contextRequirements: options.contextRequirements,
      actions: options.actions || [],
      scheduledFor: options.scheduledFor,
      createdAt: new Date(),
      expiresAt: options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      shown: false,
      dismissed: false,
      interacted: false,
      ...options
    };

    this.notifications.push(notification);
    console.log('📝 Smart notification created:', notification.id, notification.title);

    // Immediate processing for critical notifications
    if (notification.priority === 'critical') {
      this.processNotification(notification);
    }

    return notification.id;
  }

  // Create contextual notifications with smart timing
  createContextualNotification(
    title: string,
    message: string,
    category: SmartNotification['category'],
    priority: SmartNotification['priority'] = 'medium'
  ): string {
    const contextRequirements = this.getContextRequirementsForCategory(category);

    return this.createNotification(title, message, {
      category,
      priority,
      timing: this.determineOptimalTiming(category, priority),
      contextRequirements
    });
  }

  // Create achievement notifications
  createAchievementNotification(
    achievement: string,
    description: string,
    actions?: NotificationAction[]
  ): string {
    return this.createNotification(
      `🎉 Achievement Unlocked!`,
      `${achievement}: ${description}`,
      {
        category: 'achievement',
        priority: 'medium',
        timing: 'immediate', // Achievements should be shown immediately
        actions: actions || [
          {
            id: 'celebrate',
            label: 'Celebrate!',
            action: () => this.celebrateAchievement(),
            style: 'primary'
          }
        ]
      }
    );
  }

  // Create focus-aware reminders
  createFocusAwareReminder(
    task: string,
    dueTime: Date,
    priority: SmartNotification['priority'] = 'medium'
  ): string {
    const now = new Date();
    const timeUntilDue = dueTime.getTime() - now.getTime();
    const minutesUntilDue = Math.floor(timeUntilDue / (1000 * 60));

    let timing: SmartNotification['timing'] = 'optimal-time';
    let contextRequirements: SmartNotification['contextRequirements'] = {};

    if (minutesUntilDue <= 15) {
      timing = 'immediate';
    } else if (minutesUntilDue <= 60) {
      timing = 'next-break';
      contextRequirements = {
        maxWorkloadLevel: 70, // Don't interrupt heavy work
        preferredStates: ['planning', 'energized']
      };
    }

    return this.createNotification(
      `⏰ Upcoming: ${task}`,
      `Due in ${minutesUntilDue} minutes`,
      {
        category: 'reminder',
        priority,
        timing,
        contextRequirements,
        scheduledFor: new Date(dueTime.getTime() - 15 * 60 * 1000), // 15 min before
        actions: [
          {
            id: 'start-now',
            label: 'Start Now',
            action: () => this.handleStartTask(task),
            style: 'primary'
          },
          {
            id: 'snooze',
            label: 'Remind in 5 min',
            action: () => this.snoozeNotification(5),
            style: 'secondary'
          }
        ]
      }
    );
  }

  // Create productivity insights
  createProductivityInsight(
    insight: string,
    suggestion: string,
    confidence: number
  ): string {
    if (confidence < 0.7) return ''; // Only show high-confidence insights

    return this.createNotification(
      `💡 Productivity Insight`,
      `${insight} ${suggestion}`,
      {
        category: 'insight',
        priority: 'low',
        timing: 'next-break',
        contextRequirements: {
          preferredStates: ['planning', 'energized'],
          timeOfDay: ['afternoon', 'evening']
        }
      }
    );
  }

  // Process notifications based on current context
  private async startNotificationProcessor() {
    setInterval(async () => {
      await this.processQueuedNotifications();
    }, 30000); // Check every 30 seconds

    // Clean up expired notifications
    setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 300000); // Every 5 minutes
  }

  private async processQueuedNotifications() {
    const currentState = await productivityStateDetector.getCurrentState();
    const now = new Date();

    const pendingNotifications = this.notifications.filter(n =>
      !n.shown &&
      !n.dismissed &&
      (!n.scheduledFor || n.scheduledFor <= now) &&
      (!n.expiresAt || n.expiresAt > now)
    );

    if (pendingNotifications.length === 0) return;

    // Sort by priority and timing preferences
    pendingNotifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const notification of pendingNotifications) {
      if (await this.shouldShowNotification(notification, currentState)) {
        await this.processNotification(notification);
        break; // Show one at a time
      }
    }
  }

  private async shouldShowNotification(
    notification: SmartNotification,
    currentState: ProductivityState
  ): Promise<boolean> {
    // Critical notifications always show
    if (notification.priority === 'critical') return true;

    // Check rate limiting
    if (!this.checkRateLimit()) return false;

    // Check quiet hours
    if (this.isQuietHours() && notification.priority !== 'high') return false;

    // Check focus mode respect
    if (this.config.respectFocusMode && this.isInFocusMode(currentState)) {
      return notification.priority === 'high' || notification.category === 'focus';
    }

    // Check context requirements
    if (notification.contextRequirements) {
      if (!this.meetsContextRequirements(notification.contextRequirements, currentState)) {
        return false;
      }
    }

    // Check if similar notifications should be batched
    if (this.config.batchSimilarNotifications && this.hasSimilarRecentNotification(notification)) {
      return false;
    }

    return true;
  }

  private async processNotification(notification: SmartNotification) {
    try {
      notification.shown = true;
      notification.scheduledFor = new Date();
      this.shownNotifications.add(notification.id);
      this.lastNotificationTime = new Date();

      // Show in-app notification
      this.showInAppNotification(notification);

      // Show browser notification if enabled
      if (this.config.enableBrowserNotifications && this.hasBrowserPermission()) {
        this.showBrowserNotification(notification);
      }

      // Track notification shown
      productivityStateDetector.trackUserAction('notification-shown', notification.category);

      console.log('📢 Smart notification shown:', notification.id, notification.title);

    } catch (error) {
      console.error('Failed to process notification:', error);
    }
  }

  private showInAppNotification(notification: SmartNotification) {
    // Dispatch custom event for UI components to handle
    const event = new CustomEvent('smart-notification', {
      detail: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        category: notification.category,
        actions: notification.actions,
        onDismiss: () => this.dismissNotification(notification.id),
        onInteract: (actionId: string) => this.handleNotificationInteraction(notification.id, actionId)
      }
    });

    document.dispatchEvent(event);
  }

  private showBrowserNotification(notification: SmartNotification) {
    if (!this.hasBrowserPermission()) return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/icon-192.png', // App icon
      badge: '/icon-72.png',
      tag: notification.category, // Group similar notifications
      requireInteraction: notification.priority === 'critical',
      silent: this.config.enableSoundInFocus ? false : this.isInFocusMode()
    };

    const browserNotif = new Notification(notification.title, options);

    browserNotif.onclick = () => {
      window.focus();
      this.handleNotificationInteraction(notification.id, 'click');
      browserNotif.close();
    };

    // Auto-close after 5 seconds for non-critical notifications
    if (notification.priority !== 'critical') {
      setTimeout(() => browserNotif.close(), 5000);
    }
  }

  // Context checking methods
  private meetsContextRequirements(
    requirements: NonNullable<SmartNotification['contextRequirements']>,
    state: ProductivityState
  ): boolean {
    if (requirements.minFocusLevel && state.focusLevel < requirements.minFocusLevel) {
      return false;
    }

    if (requirements.maxWorkloadLevel && state.workloadLevel > requirements.maxWorkloadLevel) {
      return false;
    }

    if (requirements.preferredStates && !requirements.preferredStates.includes(state.currentState)) {
      return false;
    }

    if (requirements.timeOfDay && !requirements.timeOfDay.includes(state.timeOfDay)) {
      return false;
    }

    return true;
  }

  private checkRateLimit(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotifications = this.notifications.filter(n =>
      n.shown && n.scheduledFor && n.scheduledFor > oneHourAgo
    );

    return recentNotifications.length < this.config.maxNotificationsPerHour;
  }

  private isQuietHours(): boolean {
    const hour = new Date().getHours();
    const { start, end } = this.config.quietHours;

    if (start > end) { // Overnight quiet hours (e.g., 22 to 8)
      return hour >= start || hour < end;
    } else { // Same day quiet hours
      return hour >= start && hour < end;
    }
  }

  private isInFocusMode(currentState?: ProductivityState): boolean {
    if (currentState) {
      return ['focused', 'deep-work'].includes(currentState.currentState);
    }

    // Check if focus mode is set via UI
    return document.body.hasAttribute('data-focus-mode');
  }

  private hasSimilarRecentNotification(notification: SmartNotification): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.notifications.some(n =>
      n.shown &&
      n.category === notification.category &&
      n.scheduledFor &&
      n.scheduledFor > fiveMinutesAgo
    );
  }

  // Helper methods
  private getContextRequirementsForCategory(category: SmartNotification['category']) {
    const requirements: Record<string, SmartNotification['contextRequirements']> = {
      task: {
        preferredStates: ['planning', 'energized'],
        maxWorkloadLevel: 80
      },
      reminder: {
        preferredStates: ['planning', 'energized', 'focused'],
        maxWorkloadLevel: 70
      },
      insight: {
        preferredStates: ['planning'],
        timeOfDay: ['afternoon', 'evening'],
        maxWorkloadLevel: 60
      },
      achievement: {}, // Achievements can show anytime
      focus: {
        preferredStates: ['distracted', 'overwhelmed']
      }
    };

    return requirements[category] || {};
  }

  private determineOptimalTiming(
    category: SmartNotification['category'],
    priority: SmartNotification['priority']
  ): SmartNotification['timing'] {
    if (priority === 'critical') return 'immediate';
    if (category === 'achievement') return 'immediate';
    if (category === 'insight') return 'next-break';
    if (category === 'focus') return 'immediate';

    return 'optimal-time';
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeText(text: string): string {
    // Remove any potential PII or sensitive information
    return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
               .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[phone]')
               .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[name]');
  }

  private cleanupExpiredNotifications() {
    const now = new Date();
    this.notifications = this.notifications.filter(n =>
      !n.expiresAt || n.expiresAt > now || !n.shown
    );
  }

  // Notification interaction handlers
  private handleNotificationInteraction(notificationId: string, actionId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    notification.interacted = true;

    if (actionId === 'dismiss') {
      this.dismissNotification(notificationId);
      return;
    }

    const action = notification.actions?.find(a => a.id === actionId);
    if (action) {
      try {
        action.action();
        productivityStateDetector.trackUserAction('notification-action', `${notification.category}-${actionId}`);
      } catch (error) {
        console.error('Failed to execute notification action:', error);
      }
    }
  }

  private dismissNotification(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      productivityStateDetector.trackUserAction('notification-dismissed', notification.category);
    }
  }

  private snoozeNotification(minutes: number) {
    // Implementation for snoozing notifications
    console.log(`Notification snoozed for ${minutes} minutes`);
  }

  private handleStartTask(task: string) {
    // Implementation for starting a task
    console.log(`Starting task: ${task}`);
  }

  private celebrateAchievement() {
    // Implementation for achievement celebration
    console.log('🎉 Achievement celebrated!');
  }

  // Browser notifications setup
  private setupBrowserNotifications() {
    if ('Notification' in window && this.config.enableBrowserNotifications) {
      if (Notification.permission === 'default') {
        this.requestBrowserPermission();
      }
    }
  }

  private async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return false;
    }
  }

  private hasBrowserPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Public API
  updateConfig(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  getNotifications(filter?: {
    category?: SmartNotification['category'];
    shown?: boolean;
    dismissed?: boolean;
  }) {
    let filtered = [...this.notifications];

    if (filter?.category) {
      filtered = filtered.filter(n => n.category === filter.category);
    }

    if (filter?.shown !== undefined) {
      filtered = filtered.filter(n => n.shown === filter.shown);
    }

    if (filter?.dismissed !== undefined) {
      filtered = filtered.filter(n => n.dismissed === filter.dismissed);
    }

    return filtered;
  }

  clearAllNotifications() {
    this.notifications = [];
    this.shownNotifications.clear();
  }

  getStats() {
    const total = this.notifications.length;
    const shown = this.notifications.filter(n => n.shown).length;
    const dismissed = this.notifications.filter(n => n.dismissed).length;
    const interacted = this.notifications.filter(n => n.interacted).length;

    return {
      total,
      shown,
      dismissed,
      interacted,
      interactionRate: shown > 0 ? (interacted / shown) * 100 : 0
    };
  }
}

// Export singleton instance and utilities
export const smartNotificationManager = SmartNotificationManager.getInstance();

export const useSmartNotifications = () => {
  return {
    createNotification: smartNotificationManager.createNotification.bind(smartNotificationManager),
    createContextualNotification: smartNotificationManager.createContextualNotification.bind(smartNotificationManager),
    createAchievementNotification: smartNotificationManager.createAchievementNotification.bind(smartNotificationManager),
    createFocusAwareReminder: smartNotificationManager.createFocusAwareReminder.bind(smartNotificationManager),
    createProductivityInsight: smartNotificationManager.createProductivityInsight.bind(smartNotificationManager),
    getNotifications: smartNotificationManager.getNotifications.bind(smartNotificationManager),
    updateConfig: smartNotificationManager.updateConfig.bind(smartNotificationManager),
    getStats: smartNotificationManager.getStats.bind(smartNotificationManager)
  };
};