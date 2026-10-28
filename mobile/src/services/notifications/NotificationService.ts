import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from '@services/api';
import type * as NotificationsTypes from 'expo-notifications';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

type NotificationsModule = typeof import('expo-notifications');
type Subscription = { remove(): void };

// Remote push was removed from Expo Go in SDK 53, and merely importing
// expo-notifications on Android in Expo Go throws at module-evaluation time
// (via DevicePushTokenAutoRegistration). So the module is loaded lazily and
// never touched when running inside Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let notificationsModule: NotificationsModule | null = null;
let notificationsUnavailable = isExpoGo;
let warnedExpoGo = false;

function warnExpoGo(): void {
  if (!warnedExpoGo) {
    warnedExpoGo = true;
    console.warn('Notifications are disabled in Expo Go (push removed in SDK 53+). Use a dev build for notifications.');
  }
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (notificationsUnavailable) {
    return null;
  }
  try {
    if (!notificationsModule) {
      notificationsModule = await import('expo-notifications');
      try {
        notificationsModule.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      } catch (e) {
        console.warn('setNotificationHandler failed (non-fatal):', e);
      }
    }
    return notificationsModule;
  } catch (e) {
    notificationsUnavailable = true;
    console.warn('expo-notifications unavailable (non-fatal):', e);
    return null;
  }
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Subscription | null = null;
  private responseListener: Subscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (isExpoGo) {
        warnExpoGo();
        return;
      }
      const Notifications = await loadNotifications();
      if (!Notifications) {
        return;
      }

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
          });

          await Notifications.setNotificationChannelAsync('workout-reminders', {
            name: 'Workout Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
          });

          await Notifications.setNotificationChannelAsync('milestones', {
            name: 'Milestones',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#10B981',
          });

          await Notifications.setNotificationChannelAsync('device-alerts', {
            name: 'Device Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F59E0B',
          });
        } catch (e) {
          console.warn('Notification channel setup failed (non-fatal):', e);
        }
      }

      let finalStatus: string;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync() as { status: string };
        finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync() as { status: string };
          finalStatus = status;
        }
      } catch (e) {
        console.warn('Notification permission check failed (non-fatal):', e);
        return;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      if (Device.isDevice) {
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (!projectId) {
            // Expo Go without EAS projectId: push tokens are unavailable.
            // Local/scheduled notifications still work, so just skip.
            console.warn('No EAS projectId configured, skipping push token.');
          } else {
            const token = await Notifications.getExpoPushTokenAsync({ projectId });
            this.expoPushToken = token.data;
            await this.sendTokenToBackend(token.data);
          }
        } catch (error) {
          console.error('Failed to get push token:', error);
        }
      } else {
        console.warn('Must use physical device for push notifications');
      }

      try {
        this.setupListeners(Notifications);
      } catch (e) {
        console.warn('Notification listeners failed (non-fatal):', e);
      }
    } catch (e) {
      // Never let notifications crash app startup (would surface as
      // "main has not been registered").
      console.warn('NotificationService.initialize failed (non-fatal):', e);
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiService.updateProfile({ pushToken: token } as any);
    } catch (error) {
      console.error('Failed to send push token to backend:', error);
    }
  }

  private setupListeners(Notifications: NotificationsModule): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    }) as unknown as Subscription;

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    }) as unknown as Subscription;
  }

  private handleNotificationResponse(response: NotificationsTypes.NotificationResponse): void {
    const data = response.notification.request.content.data;

    if (data?.screen) {
      // Navigation will be handled by the app navigator
      console.log('Navigate to:', data.screen, data.params);
    }
  }

  async scheduleWorkoutReminder(hour: number, minute: number): Promise<string | null> {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      if (isExpoGo) warnExpoGo();
      return null;
    }
    const trigger: NotificationsTypes.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    };

    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your workout! 💪',
        body: 'Your daily workout reminder. Ready to crush it?',
        sound: 'default',
        data: { screen: 'Workout', type: 'workout-reminder' },
      },
      trigger,
      // channelId is handled via Android channel configuration
    });
  }

  async cancelWorkoutReminder(notificationId: string): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllWorkoutReminders(): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.trigger && typeof notification.trigger === 'object' &&
          'hour' in notification.trigger) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async sendMilestoneNotification(reps: number): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Milestone Achieved!',
        body: `Great job! ${reps} reps completed!`,
        sound: 'default',
        data: { screen: 'History', type: 'milestone', reps },
      },
      trigger: null,
    });
  }

  async sendFormFeedbackNotification(form: string): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    const messages: Record<string, string> = {
      PARTIAL_CURL: 'Complete the full movement.',
      FAST_CURL: 'Slow down and control your movement.',
      INCORRECT_FORM: 'Incorrect form detected.',
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Form Feedback',
        body: messages[form] || 'Check your form!',
        sound: 'default',
        data: { type: 'form-feedback', form },
      },
      trigger: null,
    });
  }

  async sendDeviceAlert(title: string, body: string): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { screen: 'Profile', type: 'device-alert' },
      },
      trigger: null,
    });
  }

  async sendLowBatteryAlert(level: number): Promise<void> {
    await this.sendDeviceAlert(
      'Low Battery ⚠️',
      `RepSense Band battery is at ${level}%. Please charge soon.`
    );
  }

  async sendDisconnectedAlert(): Promise<void> {
    await this.sendDeviceAlert(
      'Device Disconnected',
      'RepSense Band disconnected. Reconnect to continue tracking.'
    );
  }

  async sendInactivityReminder(): Promise<void> {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Missed you! 👋',
        body: "Haven't seen you in a while. Ready for a session?",
        sound: 'default',
        data: { screen: 'Workout', type: 'inactivity-reminder' },
      },
      trigger: null,
    });
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  async cleanup(): Promise<void> {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  async getPermissions(): Promise<{ status: string }> {
    const Notifications = await loadNotifications();
    if (!Notifications) return { status: 'denied' };
    return Notifications.getPermissionsAsync() as Promise<{ status: string }>;
  }

  async requestPermissions(): Promise<{ status: string }> {
    const Notifications = await loadNotifications();
    if (!Notifications) return { status: 'denied' };
    return Notifications.requestPermissionsAsync() as Promise<{ status: string }>;
  }
}

export const notificationService = NotificationService.getInstance();
