import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore, LogLevel } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Terminal, Pause, Play, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';

const levelStyles: Record<LogLevel, { bg: string; text: string; label: string }> = {
  info: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    label: 'INFO',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    label: 'WARN',
  },
  error: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: 'ERR',
  },
  debug: {
    bg: 'bg-muted/10',
    text: 'text-muted-foreground',
    label: 'DBG',
  },
};

interface LogsPanelProps {
  className?: string;
  maxHeight?: string;
}

export function LogsPanel({ className, maxHeight = 'h-[400px]' }: LogsPanelProps) {
  const { logs, isLogsPaused, toggleLogsPaused, clearLogs } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!isLogsPaused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, isLogsPaused]);

  const handleExport = () => {
    const logText = logs
      .map(
        (log) =>
          `[${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}] [${log.level.toUpperCase()}]${
            log.source ? ` [${log.source}]` : ''
          } ${log.message}`
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('glass-panel flex flex-col', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Debug Console</h3>
            <p className="text-xs text-muted-foreground">
              {logs.length} entries {isLogsPaused && '(paused)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLogsPaused}
            className={cn(
              'h-8 w-8',
              isLogsPaused && 'text-warning'
            )}
          >
            {isLogsPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="h-8 w-8"
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLogs}
            className="h-8 w-8 text-destructive hover:text-destructive"
            disabled={logs.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className={cn('flex-1 overflow-y-auto p-2 font-mono text-xs', maxHeight)}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Terminal className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No logs yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              const style = levelStyles[log.level];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors',
                    style.bg
                  )}
                >
                  <span className="text-muted-foreground shrink-0">
                    {format(log.timestamp, 'HH:mm:ss.SSS')}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 w-10 text-center font-semibold',
                      style.text
                    )}
                  >
                    {style.label}
                  </span>
                  {log.source && (
                    <span className="shrink-0 text-secondary">
                      [{log.source}]
                    </span>
                  )}
                  <span className="text-foreground break-all">{log.message}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pause indicator */}
      {isLogsPaused && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="px-3 py-1 bg-warning/20 text-warning text-xs rounded-full border border-warning/30">
            Auto-scroll paused
          </div>
        </div>
      )}
    </motion.div>
  );
}
