import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSettingsStore, NotificationType } from '@/store/useSettingsStore';

type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

interface NotificationOptions {
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  description?: string;
}

export function useNotifications() {
  const { globalNotificationsEnabled, notifications } = useSettingsStore();

  const notify = useCallback(
    ({ type, level, title, description }: NotificationOptions) => {
      if (!globalNotificationsEnabled) return;
      
      const settings = notifications[type];
      if (!settings?.enabled) return;

      const toastOptions = {
        description,
        duration: settings.autoDismiss ? settings.dismissTimeout * 1000 : Infinity,
        style: {
          background: 'hsl(222, 47%, 8%)',
          border: '1px solid hsl(217, 33%, 18%)',
          color: 'hsl(210, 40%, 96%)',
        },
      };

      switch (level) {
        case 'success':
          toast.success(title, toastOptions);
          break;
        case 'warning':
          toast.warning(title, toastOptions);
          break;
        case 'error':
          toast.error(title, toastOptions);
          break;
        case 'info':
        default:
          toast.info(title, toastOptions);
          break;
      }
    },
    [globalNotificationsEnabled, notifications]
  );

  const notifySystemStateChange = useCallback(
    (from: string, to: string) => {
      let level: NotificationLevel = 'info';
      if (to === 'critical') level = 'error';
      else if (to === 'alert') level = 'warning';
      else if (to === 'normal') level = 'success';

      notify({
        type: 'systemStateChange',
        level,
        title: `System State: ${to.charAt(0).toUpperCase() + to.slice(1)}`,
        description: `Changed from ${from}`,
      });
    },
    [notify]
  );

  const notifyCriticalStress = useCallback(
    (confidence: number) => {
      notify({
        type: 'criticalStress',
        level: 'error',
        title: 'Critical Stress Detected',
        description: `Confidence dropped to ${confidence.toFixed(1)}%`,
      });
    },
    [notify]
  );

  const notifyWsDisconnect = useCallback(() => {
    notify({
      type: 'wsDisconnect',
      level: 'warning',
      title: 'Connection Lost',
      description: 'Attempting to reconnect...',
    });
  }, [notify]);

  const notifyWsReconnect = useCallback(() => {
    notify({
      type: 'wsReconnect',
      level: 'success',
      title: 'Connection Restored',
      description: 'WebSocket reconnected successfully',
    });
  }, [notify]);

  const notifyInferenceResult = useCallback(
    (decision: string, confidence: number) => {
      notify({
        type: 'inferenceResult',
        level: 'info',
        title: 'New Inference',
        description: `${decision} (${confidence.toFixed(1)}%)`,
      });
    },
    [notify]
  );

  const notifySessionStart = useCallback(() => {
    notify({
      type: 'sessionStart',
      level: 'success',
      title: 'Session Started',
      description: 'Tracking has begun',
    });
  }, [notify]);

  const notifySessionStop = useCallback(() => {
    notify({
      type: 'sessionStop',
      level: 'info',
      title: 'Session Ended',
      description: 'Session data saved',
    });
  }, [notify]);

  return {
    notify,
    notifySystemStateChange,
    notifyCriticalStress,
    notifyWsDisconnect,
    notifyWsReconnect,
    notifyInferenceResult,
    notifySessionStart,
    notifySessionStop,
  };
}
