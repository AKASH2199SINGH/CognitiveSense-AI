import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/store/useSessionStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Square,
  Clock,
  Activity,
  Brain,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';

interface SessionPanelProps {
  className?: string;
  onExportPDF?: () => void;
}

export function SessionPanel({ className, onExportPDF }: SessionPanelProps) {
  const {
    currentSession,
    startSession,
    endSession,
    getSessionDuration,
    getStatePercentages,
    getLongestStressInterval,
  } = useSessionStore();
  
  const { notifySessionStart, notifySessionStop } = useNotifications();
  const [duration, setDuration] = useState('00:00:00');
  const [statePercentages, setStatePercentages] = useState({ normal: 0, alert: 0, critical: 0, offline: 100 });

  // Update duration every second
  useEffect(() => {
    if (!currentSession?.isActive) return;

    const interval = setInterval(() => {
      const ms = getSessionDuration();
      const dur = intervalToDuration({ start: 0, end: ms });
      setDuration(
        formatDuration(dur, { format: ['hours', 'minutes', 'seconds'], zero: true, delimiter: ':' })
          .replace(/ hours?/, 'h')
          .replace(/ minutes?/, 'm')
          .replace(/ seconds?/, 's')
          .replace(/(\d+)h:?(\d+)m:?(\d+)s?/, (_, h, m, s) => 
            `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
          ) || '00:00:00'
      );
      setStatePercentages(getStatePercentages());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession?.isActive, getSessionDuration, getStatePercentages]);

  const handleStartSession = useCallback(() => {
    startSession();
    notifySessionStart();
  }, [startSession, notifySessionStart]);

  const handleEndSession = useCallback(() => {
    endSession();
    notifySessionStop();
  }, [endSession, notifySessionStop]);

  const longestStressMs = getLongestStressInterval();
  const longestStressDuration = intervalToDuration({ start: 0, end: longestStressMs });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn('glass-panel p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Session Intelligence</h3>
            <p className="text-xs text-muted-foreground">
              {currentSession?.isActive ? 'Active session' : 'No active session'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!currentSession?.isActive ? (
            <Button
              onClick={handleStartSession}
              size="sm"
              className="bg-success/20 hover:bg-success/30 text-success border border-success/30"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handleEndSession}
              size="sm"
              className="bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
            >
              <Square className="w-4 h-4 mr-1" />
              End
            </Button>
          )}
          
          {onExportPDF && (
            <Button
              onClick={onExportPDF}
              size="sm"
              variant="outline"
              className="border-border/50"
              disabled={!currentSession}
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          )}
        </div>
      </div>

      {currentSession ? (
        <div className="space-y-4">
          {/* Duration */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <span className="text-xl font-mono font-bold text-primary">
              {duration}
            </span>
          </div>

          {/* State Distribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                State Distribution
              </span>
            </div>
            
            <div className="h-3 bg-muted/20 rounded-full overflow-hidden flex">
              <motion.div
                className="bg-success"
                initial={{ width: 0 }}
                animate={{ width: `${statePercentages.normal}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="bg-warning"
                initial={{ width: 0 }}
                animate={{ width: `${statePercentages.alert}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="bg-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${statePercentages.critical}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="bg-muted"
                initial={{ width: 0 }}
                animate={{ width: `${statePercentages.offline}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-success" />
                <span className="text-muted-foreground">Normal</span>
                <span className="font-mono text-success">{statePercentages.normal.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <span className="text-muted-foreground">Alert</span>
                <span className="font-mono text-warning">{statePercentages.alert.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                <span className="text-muted-foreground">Critical</span>
                <span className="font-mono text-destructive">{statePercentages.critical.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="neon-line" />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Avg Confidence</span>
              </div>
              <span className="text-lg font-mono font-bold text-primary">
                {currentSession.averageConfidence.toFixed(1)}%
              </span>
            </div>
            
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Inferences</span>
              </div>
              <span className="text-lg font-mono font-bold text-secondary">
                {currentSession.totalInferences}
              </span>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Longest Stress</span>
              </div>
              <span className={cn(
                'text-lg font-mono font-bold',
                longestStressMs > 60000 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {longestStressMs > 0 
                  ? `${longestStressDuration.minutes || 0}m ${longestStressDuration.seconds || 0}s`
                  : '—'
                }
              </span>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pause Time</span>
              </div>
              <span className="text-lg font-mono font-bold text-muted-foreground">
                {Math.floor(currentSession.totalPauseTime / 60000)}m
              </span>
            </div>
          </div>

          {/* Session ID */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span>Session ID</span>
            <span className="font-mono truncate max-w-[150px]">{currentSession.id}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No active session</p>
          <p className="text-xs mt-1">Start a session to begin tracking</p>
        </div>
      )}
    </motion.div>
  );
}
