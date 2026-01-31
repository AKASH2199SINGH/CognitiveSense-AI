import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 
  | 'systemStateChange'
  | 'criticalStress'
  | 'wsDisconnect'
  | 'wsReconnect'
  | 'inferenceResult'
  | 'sessionStart'
  | 'sessionStop';

export type AppMode = 'normal' | 'focus' | 'alert' | 'safe';

interface NotificationSettings {
  enabled: boolean;
  autoDismiss: boolean;
  dismissTimeout: number; // in seconds
}

interface SettingsState {
  // Connection
  wsUrl: string;
  reconnectEnabled: boolean;
  connectionTimeout: number; // in seconds
  setWsUrl: (url: string) => void;
  setReconnectEnabled: (enabled: boolean) => void;
  setConnectionTimeout: (timeout: number) => void;

  // Appearance
  accentColor: 'cyan' | 'purple' | 'blue' | 'green';
  motionReduced: boolean;
  setAccentColor: (color: 'cyan' | 'purple' | 'blue' | 'green') => void;
  setMotionReduced: (reduced: boolean) => void;

  // Notifications
  notifications: Record<NotificationType, NotificationSettings>;
  updateNotification: (type: NotificationType, settings: Partial<NotificationSettings>) => void;
  globalNotificationsEnabled: boolean;
  setGlobalNotificationsEnabled: (enabled: boolean) => void;

  // Logs
  logRetentionDays: number;
  maxLogEntries: number;
  autoClearEnabled: boolean;
  setLogRetentionDays: (days: number) => void;
  setMaxLogEntries: (entries: number) => void;
  setAutoClearEnabled: (enabled: boolean) => void;

  // Behavior
  autoPauseOnStress: boolean;
  stressThreshold: number; // confidence below this triggers stress
  autoExpandPipOnCritical: boolean;
  sessionAutoResetHours: number;
  setAutoPauseOnStress: (enabled: boolean) => void;
  setStressThreshold: (threshold: number) => void;
  setAutoExpandPipOnCritical: (enabled: boolean) => void;
  setSessionAutoResetHours: (hours: number) => void;

  // Application Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  autoDismiss: true,
  dismissTimeout: 5,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Connection
      wsUrl: 'ws://localhost:8000/ws',
      reconnectEnabled: true,
      connectionTimeout: 30,
      setWsUrl: (url) => set({ wsUrl: url }),
      setReconnectEnabled: (enabled) => set({ reconnectEnabled: enabled }),
      setConnectionTimeout: (timeout) => set({ connectionTimeout: timeout }),

      // Appearance
      accentColor: 'cyan',
      motionReduced: false,
      setAccentColor: (color) => set({ accentColor: color }),
      setMotionReduced: (reduced) => set({ motionReduced: reduced }),

      // Notifications
      globalNotificationsEnabled: true,
      notifications: {
        systemStateChange: { ...defaultNotificationSettings },
        criticalStress: { ...defaultNotificationSettings, autoDismiss: false },
        wsDisconnect: { ...defaultNotificationSettings },
        wsReconnect: { ...defaultNotificationSettings },
        inferenceResult: { ...defaultNotificationSettings, enabled: false },
        sessionStart: { ...defaultNotificationSettings },
        sessionStop: { ...defaultNotificationSettings },
      },
      updateNotification: (type, settings) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [type]: { ...state.notifications[type], ...settings },
          },
        })),
      setGlobalNotificationsEnabled: (enabled) => set({ globalNotificationsEnabled: enabled }),

      // Logs
      logRetentionDays: 7,
      maxLogEntries: 500,
      autoClearEnabled: false,
      setLogRetentionDays: (days) => set({ logRetentionDays: days }),
      setMaxLogEntries: (entries) => set({ maxLogEntries: entries }),
      setAutoClearEnabled: (enabled) => set({ autoClearEnabled: enabled }),

      // Behavior
      autoPauseOnStress: false,
      stressThreshold: 40,
      autoExpandPipOnCritical: true,
      sessionAutoResetHours: 24,
      setAutoPauseOnStress: (enabled) => set({ autoPauseOnStress: enabled }),
      setStressThreshold: (threshold) => set({ stressThreshold: threshold }),
      setAutoExpandPipOnCritical: (enabled) => set({ autoExpandPipOnCritical: enabled }),
      setSessionAutoResetHours: (hours) => set({ sessionAutoResetHours: hours }),

      // Application Mode
      appMode: 'normal',
      setAppMode: (mode) => set({ appMode: mode }),
    }),
    {
      name: 'cognitivesense-settings',
    }
  )
);
