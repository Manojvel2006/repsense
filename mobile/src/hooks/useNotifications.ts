import { useEffect, useState } from 'react';
import { notificationService } from '@services/notifications';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    const init = async () => {
      await notificationService.initialize();
      setIsInitialized(true);
      
      const { status } = await notificationService.getPermissions?.() || { status: 'undetermined' as const };
      setPermissionStatus(status as 'granted' | 'denied' | 'undetermined');
    };
    
    init();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  const scheduleWorkoutReminder = async (hour: number, minute: number) => {
    return notificationService.scheduleWorkoutReminder(hour, minute);
  };

  const cancelWorkoutReminder = async (notificationId: string) => {
    await notificationService.cancelWorkoutReminder(notificationId);
  };

  const cancelAllWorkoutReminders = async () => {
    await notificationService.cancelAllWorkoutReminders();
  };

  const sendMilestoneNotification = async (reps: number) => {
    await notificationService.sendMilestoneNotification(reps);
  };

  const sendLowBatteryAlert = async (level: number) => {
    await notificationService.sendLowBatteryAlert(level);
  };

  const sendDisconnectedAlert = async () => {
    await notificationService.sendDisconnectedAlert();
  };

  return {
    isInitialized,
    permissionStatus,
    scheduleWorkoutReminder,
    cancelWorkoutReminder,
    cancelAllWorkoutReminders,
    sendMilestoneNotification,
    sendLowBatteryAlert,
    sendDisconnectedAlert,
  };
};

export const requestNotificationPermissions = async () => {
  const { status } = await notificationService.requestPermissions?.() || { status: 'denied' };
  return status === 'granted';
};