// =====================================================
// NOTIFICATION UTILITIES
// Browser notification API integration
// =====================================================

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// =====================================================
// PERMISSION MANAGEMENT
// =====================================================

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

// =====================================================
// NOTIFICATION DELIVERY
// =====================================================

/**
 * Send a browser notification
 */
export async function sendNotification(
  options: NotificationOptions,
): Promise<Notification | null> {
  if (!canSendNotifications()) {
    console.warn("Cannot send notification: permission not granted");
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/favicon.ico",
      badge: options.badge,
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
    });

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

/**
 * Send a habit reminder notification
 */
export async function sendHabitReminder(
  habitTitle: string,
  message?: string,
  habitId?: string,
): Promise<Notification | null> {
  return sendNotification({
    title: `🔔 ${habitTitle}`,
    body: message || "Time to complete this habit!",
    icon: "/favicon.ico",
    tag: `habit-${habitId}`,
    data: { habitId, type: "habit-reminder" },
    requireInteraction: true,
    actions: [
      { action: "complete", title: "✓ Complete" },
      { action: "snooze", title: "⏰ Snooze" },
      { action: "skip", title: "Skip" },
    ],
  });
}

/**
 * Send a streak milestone notification
 */
export async function sendStreakMilestone(
  habitTitle: string,
  streakLength: number,
): Promise<Notification | null> {
  return sendNotification({
    title: `🔥 ${streakLength} Day Streak!`,
    body: `Amazing! You've completed "${habitTitle}" for ${streakLength} days straight!`,
    icon: "/favicon.ico",
    requireInteraction: false,
  });
}

/**
 * Send a completion celebration notification
 */
export async function sendCompletionCelebration(
  habitTitle: string,
  completionRate?: number,
): Promise<Notification | null> {
  const rateText = completionRate
    ? ` (${Math.round(completionRate * 100)}% this week)`
    : "";

  return sendNotification({
    title: `✅ Great Job!`,
    body: `You completed "${habitTitle}"${rateText}`,
    icon: "/favicon.ico",
    requireInteraction: false,
  });
}

// =====================================================
// NOTIFICATION SCHEDULING
// =====================================================

export interface ScheduledNotification {
  id: string;
  habitId: string;
  time: Date;
  message: string;
  habitTitle: string;
  timeoutId?: number;
}

const scheduledNotifications = new Map<string, ScheduledNotification>();

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
  id: string,
  habitId: string,
  habitTitle: string,
  time: Date,
  message?: string,
): void {
  // Cancel existing notification with same ID
  cancelScheduledNotification(id);

  const now = Date.now();
  const scheduledTime = time.getTime();
  const delay = scheduledTime - now;

  if (delay < 0) {
    console.warn("Cannot schedule notification in the past");
    return;
  }

  const timeoutId = window.setTimeout(() => {
    sendHabitReminder(habitTitle, message, habitId);
    scheduledNotifications.delete(id);
  }, delay);

  scheduledNotifications.set(id, {
    id,
    habitId,
    time,
    message: message || "Time to complete this habit!",
    habitTitle,
    timeoutId,
  });
}

/**
 * Cancel a scheduled notification
 */
export function cancelScheduledNotification(id: string): void {
  const notification = scheduledNotifications.get(id);
  if (notification && notification.timeoutId) {
    clearTimeout(notification.timeoutId);
    scheduledNotifications.delete(id);
  }
}

/**
 * Cancel all scheduled notifications
 */
export function cancelAllScheduledNotifications(): void {
  scheduledNotifications.forEach((notification) => {
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
  });
  scheduledNotifications.clear();
}

/**
 * Get all scheduled notifications
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  return Array.from(scheduledNotifications.values());
}

// =====================================================
// NOTIFICATION SETTINGS
// =====================================================

export interface NotificationSettings {
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const SETTINGS_KEY = "notification-settings";

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load notification settings:", error);
  }

  // Default settings
  return {
    enabled: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    soundEnabled: true,
    vibrationEnabled: true,
  };
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
}

/**
 * Check if notifications should be shown based on quiet hours
 */
export function isInQuietHours(): boolean {
  const settings = getNotificationSettings();

  if (!settings.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const start = settings.quietHoursStart;
  const end = settings.quietHoursEnd;

  // Handle quiet hours that span midnight
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }

  return currentTime >= start && currentTime <= end;
}

/**
 * Check if notification should be sent based on settings
 */
export function shouldSendNotification(): boolean {
  const settings = getNotificationSettings();
  return settings.enabled && !isInQuietHours() && canSendNotifications();
}
