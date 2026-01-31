// import { create } from 'zustand';

// export type SystemState = 'normal' | 'alert' | 'critical' | 'offline';
// export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

// export interface LogEntry {
//   id: string;
//   timestamp: Date;
//   level: LogLevel;
//   message: string;
//   source?: string;
// }

// export interface ActivityEvent {
//   id: string;
//   timestamp: Date;
//   type: 'keyboard' | 'mouse' | 'eye_tracking' | 'inference' | 'tool' | 'system';
//   action: string;
//   details?: string;
// }

// export interface InferenceResult {
//   id: string;
//   timestamp: Date;
//   model: string;
//   confidence: number;
//   decision: string;
//   tokens?: number;
//   latency?: number;
// }

// export interface MetricDataPoint {
//   timestamp: number;
//   value: number;
// }

// interface PipPosition {
//   x: number;
//   y: number;
// }

// interface AppState {
//   // Connection
//   isConnected: boolean;
//   setConnected: (connected: boolean) => void;

//   // System State
//   systemState: SystemState;
//   confidence: number;
//   setSystemState: (state: SystemState) => void;
//   setConfidence: (confidence: number) => void;

//   // AI Control
//   isAIRunning: boolean;
//   isPaused: boolean;
//   startAI: () => void;
//   stopAI: () => void;
//   pauseAI: () => void;
//   resumeAI: () => void;

//   // Activity
//   activities: ActivityEvent[];
//   addActivity: (activity: Omit<ActivityEvent, 'id'>) => void;
//   clearActivities: () => void;

//   // Logs
//   logs: LogEntry[];
//   addLog: (log: Omit<LogEntry, 'id'>) => void;
//   clearLogs: () => void;
//   isLogsPaused: boolean;
//   toggleLogsPaused: () => void;

//   // Inference
//   inferences: InferenceResult[];
//   addInference: (inference: Omit<InferenceResult, 'id'>) => void;
//   latestInference: InferenceResult | null;

//   // Metrics
//   confidenceHistory: MetricDataPoint[];
//   activityFrequency: MetricDataPoint[];
//   addConfidenceMetric: (value: number) => void;
//   addActivityMetric: (value: number) => void;

//   // Streaming
//   streamingText: string;
//   isStreaming: boolean;
//   appendStreamingText: (text: string) => void;
//   clearStreamingText: () => void;
//   setStreaming: (streaming: boolean) => void;

//   // Picture-in-Picture
//   isPipVisible: boolean;
//   isPipMinimized: boolean;
//   isPipLocked: boolean;
//   pipPosition: PipPosition;
//   togglePipVisible: () => void;
//   togglePipMinimized: () => void;
//   togglePipLocked: () => void;
//   setPipPosition: (position: PipPosition) => void;
// }

// const generateId = () => Math.random().toString(36).substring(2, 11);

// export const useAppStore = create<AppState>((set, get) => ({
//   // Connection
//   isConnected: false,
//   setConnected: (connected) => set({ isConnected: connected }),

//   // System State
//   systemState: 'offline',
//   confidence: 0,
//   setSystemState: (state) => set({ systemState: state }),
//   setConfidence: (confidence) => {
//     set({ confidence });
//     get().addConfidenceMetric(confidence);
//   },

//   // AI Control
//   isAIRunning: false,
//   isPaused: false,
//   startAI: () => set({ isAIRunning: true, isPaused: false, systemState: 'normal' }),
//   stopAI: () => set({ isAIRunning: false, isPaused: false, systemState: 'offline' }),
//   pauseAI: () => set({ isPaused: true }),
//   resumeAI: () => set({ isPaused: false }),

//   // Activity
//   activities: [],
//   addActivity: (activity) =>
//     set((state) => ({
//       activities: [
//         { ...activity, id: generateId() },
//         ...state.activities,
//       ].slice(0, 100),
//     })),
//   clearActivities: () => set({ activities: [] }),

//   // Logs
//   logs: [],
//   addLog: (log) =>
//     set((state) => {
//       if (state.isLogsPaused) return state;
//       return {
//         logs: [
//           { ...log, id: generateId() },
//           ...state.logs,
//         ].slice(0, 500),
//       };
//     }),
//   clearLogs: () => set({ logs: [] }),
//   isLogsPaused: false,
//   toggleLogsPaused: () => set((state) => ({ isLogsPaused: !state.isLogsPaused })),

//   // Inference
//   inferences: [],
//   latestInference: null,
//   addInference: (inference) =>
//     set((state) => {
//       const newInference = { ...inference, id: generateId() };
//       return {
//         inferences: [newInference, ...state.inferences].slice(0, 50),
//         latestInference: newInference,
//       };
//     }),

//   // Metrics
//   confidenceHistory: [],
//   activityFrequency: [],
//   addConfidenceMetric: (value) =>
//     set((state) => ({
//       confidenceHistory: [
//         ...state.confidenceHistory,
//         { timestamp: Date.now(), value },
//       ].slice(-60),
//     })),
//   addActivityMetric: (value) =>
//     set((state) => ({
//       activityFrequency: [
//         ...state.activityFrequency,
//         { timestamp: Date.now(), value },
//       ].slice(-60),
//     })),

//   // Streaming
//   streamingText: '',
//   isStreaming: false,
//   appendStreamingText: (text) =>
//     set((state) => ({ streamingText: state.streamingText + text })),
//   clearStreamingText: () => set({ streamingText: '' }),
//   setStreaming: (streaming) => set({ isStreaming: streaming }),

//   // Picture-in-Picture
//   isPipVisible: true,
//   isPipMinimized: false,
//   isPipLocked: false,
//   pipPosition: { x: 20, y: 100 },
//   togglePipVisible: () => set((state) => ({ isPipVisible: !state.isPipVisible })),
//   togglePipMinimized: () => set((state) => ({ isPipMinimized: !state.isPipMinimized })),
//   togglePipLocked: () => set((state) => ({ isPipLocked: !state.isPipLocked })),
//   setPipPosition: (position) => set({ pipPosition: position }),
// }));

import { create } from 'zustand';

export type SystemState = 'normal' | 'alert' | 'critical' | 'offline';
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';
export type EngineState = 'RUNNING' | 'STOPPED';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'keyboard' | 'mouse' | 'eye_tracking' | 'inference' | 'tool' | 'system';
  action: string;
  details?: string;
}

export interface InferenceResult {
  id: string;
  timestamp: Date;
  model: string;
  confidence: number;
  decision: string;
  tokens?: number;
  latency?: number;
}

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

interface PipPosition {
  x: number;
  y: number;
}

interface AppState {
  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // ✅ Engine / AI State (SINGLE SOURCE OF TRUTH)
  engineState: EngineState;
  setEngineState: (state: EngineState) => void;

  // System State
  systemState: SystemState;
  confidence: number;
  setSystemState: (state: SystemState) => void;
  setConfidence: (confidence: number) => void;

  // AI Control (kept for UI buttons, but synced)
  isAIRunning: boolean;
  isPaused: boolean;
  startAI: () => void;
  stopAI: () => void;
  pauseAI: () => void;
  resumeAI: () => void;

  // Activity
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, 'id'>) => void;
  clearActivities: () => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  clearLogs: () => void;
  isLogsPaused: boolean;
  toggleLogsPaused: () => void;

  // Inference
  inferences: InferenceResult[];
  addInference: (inference: Omit<InferenceResult, 'id'>) => void;
  latestInference: InferenceResult | null;

  // Metrics
  confidenceHistory: MetricDataPoint[];
  activityFrequency: MetricDataPoint[];
  addConfidenceMetric: (value: number) => void;
  addActivityMetric: (value: number) => void;

  // Streaming
  streamingText: string;
  isStreaming: boolean;
  appendStreamingText: (text: string) => void;
  clearStreamingText: () => void;
  setStreaming: (streaming: boolean) => void;

  // Picture-in-Picture
  isPipVisible: boolean;
  isPipMinimized: boolean;
  isPipLocked: boolean;
  pipPosition: PipPosition;
  togglePipVisible: () => void;
  togglePipMinimized: () => void;
  togglePipLocked: () => void;
  setPipPosition: (position: PipPosition) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<AppState>((set, get) => ({
  // Connection
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // ✅ Engine State (authoritative)
  engineState: 'STOPPED',
  setEngineState: (state) =>
    set({
      engineState: state,
      isAIRunning: state === 'RUNNING',
      systemState: state === 'RUNNING' ? 'normal' : 'offline',
    }),

  // System State
  systemState: 'offline',
  confidence: 0,
  setSystemState: (state) => set({ systemState: state }),
  setConfidence: (confidence) => {
    set({ confidence });
    get().addConfidenceMetric(confidence);
  },

  // AI Control (UI-level, synced with engineState)
  isAIRunning: false,
  isPaused: false,

  startAI: () =>
    set({
      engineState: 'RUNNING',
      isAIRunning: true,
      isPaused: false,
      systemState: 'normal',
    }),

  stopAI: () =>
    set({
      engineState: 'STOPPED',
      isAIRunning: false,
      isPaused: false,
      systemState: 'offline',
    }),

  pauseAI: () => set({ isPaused: true }),
  resumeAI: () => set({ isPaused: false }),

  // Activity
  activities: [],
  addActivity: (activity) =>
    set((state) => ({
      activities: [
        { ...activity, id: generateId() },
        ...state.activities,
      ].slice(0, 100),
    })),
  clearActivities: () => set({ activities: [] }),

  // Logs
  logs: [],
  addLog: (log) =>
    set((state) => {
      if (state.isLogsPaused) return state;
      return {
        logs: [
          { ...log, id: generateId() },
          ...state.logs,
        ].slice(0, 500),
      };
    }),
  clearLogs: () => set({ logs: [] }),
  isLogsPaused: false,
  toggleLogsPaused: () =>
    set((state) => ({ isLogsPaused: !state.isLogsPaused })),

  // Inference
  inferences: [],
  latestInference: null,
  addInference: (inference) =>
    set((state) => {
      const newInference = { ...inference, id: generateId() };
      return {
        inferences: [newInference, ...state.inferences].slice(0, 50),
        latestInference: newInference,
      };
    }),

  // Metrics
  confidenceHistory: [],
  activityFrequency: [],
  addConfidenceMetric: (value) =>
    set((state) => ({
      confidenceHistory: [
        ...state.confidenceHistory,
        { timestamp: Date.now(), value },
      ].slice(-60),
    })),
  addActivityMetric: (value) =>
    set((state) => ({
      activityFrequency: [
        ...state.activityFrequency,
        { timestamp: Date.now(), value },
      ].slice(-60),
    })),

  // Streaming
  streamingText: '',
  isStreaming: false,
  appendStreamingText: (text) =>
    set((state) => ({ streamingText: state.streamingText + text })),
  clearStreamingText: () => set({ streamingText: '' }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  // Picture-in-Picture
  isPipVisible: true,
  isPipMinimized: false,
  isPipLocked: false,
  pipPosition: { x: 20, y: 100 },
  togglePipVisible: () =>
    set((state) => ({ isPipVisible: !state.isPipVisible })),
  togglePipMinimized: () =>
    set((state) => ({ isPipMinimized: !state.isPipMinimized })),
  togglePipLocked: () =>
    set((state) => ({ isPipLocked: !state.isPipLocked })),
  setPipPosition: (position) => set({ pipPosition: position }),
}));
