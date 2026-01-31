import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StatusCard } from '@/components/StatusCard';
import { ToolActivity } from '@/components/ToolActivity';
import { RealtimeGraph } from '@/components/RealtimeGraph';
import { ControlCenter } from '@/components/ControlCenter';
import { InferencePanel } from '@/components/InferencePanel';
import { LogsPanel } from '@/components/LogsPanel';
import { SessionPanel } from '@/components/SessionPanel';
import { useAppStore } from '@/store/useAppStore';
import { useSessionStore } from '@/store/useSessionStore';
import { wsService } from '@/services/ws';
import { downloadSessionPDF } from '@/services/pdfReport';
import { toast } from 'sonner';

export default function Dashboard() {
  const { 
    setConnected, 
    addActivity, 
    addLog, 
    setSystemState, 
    setConfidence,
    addInference,
    systemState,
    confidence,
  } = useAppStore();

  const { 
    currentSession, 
    updateSystemState, 
    recordConfidence, 
    recordInference,
    startSession,
  } = useSessionStore();

  const prevStateRef = useRef(systemState);

  // Track state changes for session
  useEffect(() => {
    if (currentSession?.isActive && systemState !== prevStateRef.current) {
      updateSystemState(systemState);
      prevStateRef.current = systemState;
    }
  }, [systemState, currentSession?.isActive, updateSystemState]);

  // Track confidence for session
  useEffect(() => {
    if (currentSession?.isActive) {
      recordConfidence(confidence);
    }
  }, [confidence, currentSession?.isActive, recordConfidence]);

  const handleExportPDF = useCallback(async () => {
    if (!currentSession) {
      toast.error('No active session to export');
      return;
    }
    try {
      await downloadSessionPDF(currentSession);
      toast.success('PDF report downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  }, [currentSession]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    wsService.connect(wsUrl);

    // Start session automatically
    if (!currentSession?.isActive) {
      startSession();
    }

    // Simulate data for demo
    const simulateData = () => {
      setConnected(true);
      setSystemState('normal');
      setConfidence(87.5);

      const demoLogs = [
        { level: 'info' as const, message: 'System initialized', source: 'Core' },
        { level: 'info' as const, message: 'WebSocket connection ready', source: 'Network' },
        { level: 'debug' as const, message: 'Loading AI models...', source: 'ML Engine' },
        { level: 'info' as const, message: 'All models loaded successfully', source: 'ML Engine' },
      ];

      demoLogs.forEach((log, i) => {
        setTimeout(() => addLog({ ...log, timestamp: new Date() }), i * 500);
      });

      const activityTypes = ['keyboard', 'mouse', 'eye_tracking', 'inference', 'tool', 'system'] as const;
      const actions = [
        'Key pressed: Enter',
        'Mouse moved to (420, 380)',
        'Eye focus: center-screen',
        'Running inference pipeline',
        'Executing data transform',
        'Health check passed',
      ];

      let activityIndex = 0;
      const activityInterval = setInterval(() => {
        const type = activityTypes[activityIndex % activityTypes.length];
        addActivity({
          timestamp: new Date(),
          type,
          action: actions[activityIndex % actions.length],
          details: `Event #${activityIndex + 1}`,
        });
        activityIndex++;
      }, 2000);

      const confidenceInterval = setInterval(() => {
        const base = 85;
        const variation = Math.random() * 10 - 5;
        setConfidence(Math.min(100, Math.max(60, base + variation)));
      }, 3000);

      const inferenceInterval = setInterval(() => {
        const decisions = [
          'User intent: Navigation',
          'Action: Focus shift detected',
          'Pattern: Reading mode',
          'State: Active engagement',
        ];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        addInference({
          timestamp: new Date(),
          model: 'CognitiveSense-v2',
          confidence: 80 + Math.random() * 15,
          decision,
          tokens: Math.floor(Math.random() * 500 + 100),
          latency: Math.floor(Math.random() * 100 + 50),
        });
        if (currentSession?.isActive) {
          recordInference(decision);
        }
      }, 8000);

      return () => {
        clearInterval(activityInterval);
        clearInterval(confidenceInterval);
        clearInterval(inferenceInterval);
      };
    };

    const cleanup = simulateData();
    return () => {
      cleanup();
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time AI monitoring and control</p>
      </motion.header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <StatusCard />
          <ControlCenter />
          <SessionPanel onExportPDF={handleExportPDF} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ToolActivity className="h-[380px]" />
          <InferencePanel />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <RealtimeGraph />
          <LogsPanel maxHeight="h-[280px]" />
        </div>
      </div>
    </div>
  );
}
