/**
 * Browser notification utilities for period and fertility reminders
 * @module notifications
 */

const NOTIFICATION_KEY = 'ancure_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  periodReminder: boolean;
  fertileReminder: boolean;
  scheduledNotifications: ScheduledNotification[];
}

export interface ScheduledNotification {
  id: string;
  type: 'period' | 'fertile';
  date: string;
  message: string;
}

/**
 * Retrieves notification settings from localStorage
 * @returns Current notification settings or defaults
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Silently fail - will return defaults
  }
  return {
    enabled: false,
    periodReminder: true,
    fertileReminder: true,
    scheduledNotifications: [],
  };
}

/**
 * Saves notification settings to localStorage
 * @param settings - The settings to save
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail - storage might be full or disabled
  }
}

/**
 * Requests browser notification permission from the user
 * @returns Promise resolving to true if permission granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
}

export function scheduleReminders(
  nextPeriodDate: Date,
  fertileWindowStart: Date,
  goal?: string
): ScheduledNotification[] {
  const notifications: ScheduledNotification[] = [];
  const now = new Date();

  // Period reminder (1 day before)
  const periodReminderDate = new Date(nextPeriodDate);
  periodReminderDate.setDate(periodReminderDate.getDate() - 1);
  
  if (periodReminderDate > now) {
    notifications.push({
      id: `period-${periodReminderDate.toISOString()}`,
      type: 'period',
      date: periodReminderDate.toISOString(),
      message: 'Your period is expected tomorrow. Stay prepared! 🌸',
    });
  }

  // Fertile window reminder (if goal is to conceive)
  if (goal === 'try_to_conceive' && fertileWindowStart > now) {
    notifications.push({
      id: `fertile-${fertileWindowStart.toISOString()}`,
      type: 'fertile',
      date: fertileWindowStart.toISOString(),
      message: 'Your fertile window starts today! ✨',
    });
  }

  // Avoid pregnancy - fertile window warning
  if (goal === 'avoid_pregnancy' && fertileWindowStart > now) {
    const warningDate = new Date(fertileWindowStart);
    warningDate.setDate(warningDate.getDate() - 2);
    
    if (warningDate > now) {
      notifications.push({
        id: `fertile-warning-${warningDate.toISOString()}`,
        type: 'fertile',
        date: warningDate.toISOString(),
        message: 'Your fertile window is approaching in 2 days. Take precautions. 💕',
      });
    }
  }

  return notifications;
}

// Check and show due notifications
export function checkDueNotifications(): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const dueNotifications = settings.scheduledNotifications.filter(n => {
    const notifDate = new Date(n.date);
    return notifDate <= now && notifDate > new Date(now.getTime() - 24 * 60 * 60 * 1000);
  });

  dueNotifications.forEach(notification => {
    if (notification.type === 'period' && settings.periodReminder) {
      showNotification('Ancure Period Reminder', { body: notification.message });
    }
    if (notification.type === 'fertile' && settings.fertileReminder) {
      showNotification('Ancure Fertility Reminder', { body: notification.message });
    }
  });

  // Remove shown notifications
  const remaining = settings.scheduledNotifications.filter(
    n => !dueNotifications.some(d => d.id === n.id)
  );
  
  saveNotificationSettings({ ...settings, scheduledNotifications: remaining });
}
