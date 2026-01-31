import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore, SystemState } from '@/store/useAppStore';
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

const stateConfig: Record<SystemState, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Activity;
  glowClass: string;
}> = {
  normal: {
    label: 'Normal',
    color: 'text-success',
    bgColor: 'bg-success/20',
    icon: CheckCircle,
    glowClass: 'shadow-[0_0_20px_hsl(142_76%_45%/0.4)]',
  },
  alert: {
    label: 'Alert',
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    icon: AlertTriangle,
    glowClass: 'shadow-[0_0_20px_hsl(38_92%_50%/0.4)]',
  },
  critical: {
    label: 'Critical',
    color: 'text-destructive',
    bgColor: 'bg-destructive/20',
    icon: XCircle,
    glowClass: 'shadow-[0_0_20px_hsl(0_72%_51%/0.4)]',
  },
  offline: {
    label: 'Offline',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    icon: Zap,
    glowClass: '',
  },
};

interface StatusCardProps {
  className?: string;
}

export function StatusCard({ className }: StatusCardProps) {
  const { systemState, confidence, isConnected, isAIRunning, isPaused } = useAppStore();
  const config = stateConfig[systemState];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-panel p-6 relative overflow-hidden',
        config.glowClass,
        className
      )}
    >
      {/* Scan line effect */}
      {isAIRunning && !isPaused && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          System Status
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-success animate-pulse' : 'bg-destructive'
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Status */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          animate={{
            scale: systemState !== 'offline' ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: systemState !== 'offline' ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            config.bgColor
          )}
        >
          <Icon className={cn('w-8 h-8', config.color)} />
        </motion.div>

        <div>
          <motion.h2
            key={systemState}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn('text-3xl font-bold', config.color, 'text-glow')}
          >
            {config.label}
          </motion.h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAIRunning ? (isPaused ? 'AI Paused' : 'AI Running') : 'AI Stopped'}
          </p>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Confidence Level</span>
          <motion.span
            key={confidence}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-mono font-bold text-primary"
          >
            {confidence.toFixed(1)}%
          </motion.span>
        </div>

        <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                 style={{ backgroundSize: '200% 100%' }} />
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
        <div className="text-center">
          <p className="text-lg font-mono font-bold text-foreground">
            {isAIRunning ? 'ON' : 'OFF'}
          </p>
          <p className="text-xs text-muted-foreground">Engine</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-mono font-bold text-primary">
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </p>
          <p className="text-xs text-muted-foreground">Mode</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-mono font-bold text-secondary">
            LIVE
          </p>
          <p className="text-xs text-muted-foreground">Feed</p>
        </div>
      </div>
    </motion.div>
  );
}
