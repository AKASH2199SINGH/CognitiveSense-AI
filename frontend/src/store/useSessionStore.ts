import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemState } from './useAppStore';

export interface StateTimeEntry {
  state: SystemState;
  startTime: number;
  endTime: number | null;
  duration: number;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime: number | null;
  isActive: boolean;
  
  // Time tracking per state
  stateHistory: StateTimeEntry[];
  currentState: SystemState;
  currentStateStartTime: number;
  
  // Aggregated times (in milliseconds)
  timeInNormal: number;
  timeInAlert: number;
  timeInCritical: number;
  timeInOffline: number;
  
  // Confidence tracking
  confidenceHistory: Array<{ timestamp: number; value: number }>;
  averageConfidence: number;
  minConfidence: number;
  maxConfidence: number;
  
  // Inference tracking
  totalInferences: number;
  inferenceCounts: Record<string, number>;
  
  // Connection events
  disconnectEvents: Array<{ timestamp: number; duration?: number }>;
  reconnectEvents: Array<{ timestamp: number }>;
  
  // Focus/pause tracking
  pausePeriods: Array<{ startTime: number; endTime: number | null }>;
  totalPauseTime: number;
}

interface SessionState {
  currentSession: SessionData | null;
  sessionHistory: SessionData[];
  
  // Actions
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
  
  // State tracking
  updateSystemState: (state: SystemState) => void;
  
  // Confidence tracking
  recordConfidence: (value: number) => void;
  
  // Inference tracking
  recordInference: (decision: string) => void;
  
  // Connection events
  recordDisconnect: () => void;
  recordReconnect: () => void;
  
  // Pause tracking
  recordPauseStart: () => void;
  recordPauseEnd: () => void;
  
  // Computed
  getSessionDuration: () => number;
  getStatePercentages: () => { normal: number; alert: number; critical: number; offline: number };
  getLongestStressInterval: () => number;
}

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createEmptySession = (): SessionData => ({
  id: generateSessionId(),
  startTime: Date.now(),
  endTime: null,
  isActive: true,
  stateHistory: [],
  currentState: 'offline',
  currentStateStartTime: Date.now(),
  timeInNormal: 0,
  timeInAlert: 0,
  timeInCritical: 0,
  timeInOffline: 0,
  confidenceHistory: [],
  averageConfidence: 0,
  minConfidence: 100,
  maxConfidence: 0,
  totalInferences: 0,
  inferenceCounts: {},
  disconnectEvents: [],
  reconnectEvents: [],
  pausePeriods: [],
  totalPauseTime: 0,
});

const updateStateTime = (session: SessionData): SessionData => {
  const now = Date.now();
  const elapsed = now - session.currentStateStartTime;
  
  const timeKey = `timeIn${session.currentState.charAt(0).toUpperCase()}${session.currentState.slice(1)}` as 
    'timeInNormal' | 'timeInAlert' | 'timeInCritical' | 'timeInOffline';
  
  return {
    ...session,
    [timeKey]: session[timeKey] + elapsed,
    currentStateStartTime: now,
  };
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessionHistory: [],

      startSession: () => {
        const existingSession = get().currentSession;
        if (existingSession?.isActive) {
          // End existing session first
          get().endSession();
        }
        
        set({ currentSession: createEmptySession() });
      },

      endSession: () => {
        const session = get().currentSession;
        if (!session) return;

        const updatedSession = updateStateTime(session);
        updatedSession.endTime = Date.now();
        updatedSession.isActive = false;
        
        // Close any open state entry
        if (updatedSession.stateHistory.length > 0) {
          const lastEntry = updatedSession.stateHistory[updatedSession.stateHistory.length - 1];
          if (lastEntry.endTime === null) {
            lastEntry.endTime = Date.now();
            lastEntry.duration = lastEntry.endTime - lastEntry.startTime;
          }
        }
        
        // Close any open pause period
        const openPause = updatedSession.pausePeriods.find(p => p.endTime === null);
        if (openPause) {
          openPause.endTime = Date.now();
          updatedSession.totalPauseTime += openPause.endTime - openPause.startTime;
        }

        set((state) => ({
          currentSession: null,
          sessionHistory: [updatedSession, ...state.sessionHistory].slice(0, 50),
        }));
      },

      resetSession: () => {
        set({ currentSession: createEmptySession() });
      },

      updateSystemState: (state: SystemState) => {
        set((store) => {
          if (!store.currentSession) return store;

          const now = Date.now();
          const session = updateStateTime(store.currentSession);
          
          // Close previous state entry
          if (session.stateHistory.length > 0) {
            const lastEntry = session.stateHistory[session.stateHistory.length - 1];
            if (lastEntry.endTime === null) {
              lastEntry.endTime = now;
              lastEntry.duration = now - lastEntry.startTime;
            }
          }
          
          // Add new state entry
          session.stateHistory.push({
            state,
            startTime: now,
            endTime: null,
            duration: 0,
          });
          
          session.currentState = state;
          session.currentStateStartTime = now;

          return { currentSession: session };
        });
      },

      recordConfidence: (value: number) => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          session.confidenceHistory.push({ timestamp: Date.now(), value });
          
          // Keep last 500 entries
          if (session.confidenceHistory.length > 500) {
            session.confidenceHistory = session.confidenceHistory.slice(-500);
          }
          
          // Update stats
          session.minConfidence = Math.min(session.minConfidence, value);
          session.maxConfidence = Math.max(session.maxConfidence, value);
          
          const sum = session.confidenceHistory.reduce((acc, c) => acc + c.value, 0);
          session.averageConfidence = sum / session.confidenceHistory.length;

          return { currentSession: session };
        });
      },

      recordInference: (decision: string) => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          session.totalInferences += 1;
          session.inferenceCounts[decision] = (session.inferenceCounts[decision] || 0) + 1;

          return { currentSession: session };
        });
      },

      recordDisconnect: () => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          session.disconnectEvents.push({ timestamp: Date.now() });

          return { currentSession: session };
        });
      },

      recordReconnect: () => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          session.reconnectEvents.push({ timestamp: Date.now() });
          
          // Calculate disconnect duration for the last disconnect event
          const lastDisconnect = session.disconnectEvents[session.disconnectEvents.length - 1];
          if (lastDisconnect && !lastDisconnect.duration) {
            lastDisconnect.duration = Date.now() - lastDisconnect.timestamp;
          }

          return { currentSession: session };
        });
      },

      recordPauseStart: () => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          session.pausePeriods.push({ startTime: Date.now(), endTime: null });

          return { currentSession: session };
        });
      },

      recordPauseEnd: () => {
        set((store) => {
          if (!store.currentSession) return store;

          const session = { ...store.currentSession };
          const openPause = session.pausePeriods.find(p => p.endTime === null);
          if (openPause) {
            openPause.endTime = Date.now();
            session.totalPauseTime += openPause.endTime - openPause.startTime;
          }

          return { currentSession: session };
        });
      },

      getSessionDuration: () => {
        const session = get().currentSession;
        if (!session) return 0;
        return (session.endTime || Date.now()) - session.startTime;
      },

      getStatePercentages: () => {
        const session = get().currentSession;
        if (!session) return { normal: 0, alert: 0, critical: 0, offline: 100 };

        const updatedSession = updateStateTime(session);
        const total = updatedSession.timeInNormal + updatedSession.timeInAlert + 
                     updatedSession.timeInCritical + updatedSession.timeInOffline;

        if (total === 0) return { normal: 0, alert: 0, critical: 0, offline: 100 };

        return {
          normal: (updatedSession.timeInNormal / total) * 100,
          alert: (updatedSession.timeInAlert / total) * 100,
          critical: (updatedSession.timeInCritical / total) * 100,
          offline: (updatedSession.timeInOffline / total) * 100,
        };
      },

      getLongestStressInterval: () => {
        const session = get().currentSession;
        if (!session) return 0;

        const stressEntries = session.stateHistory.filter(
          entry => entry.state === 'critical' || entry.state === 'alert'
        );

        if (stressEntries.length === 0) return 0;

        return Math.max(...stressEntries.map(entry => 
          entry.duration || (Date.now() - entry.startTime)
        ));
      },
    }),
    {
      name: 'cognitivesense-session',
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
      }),
    }
  )
);
