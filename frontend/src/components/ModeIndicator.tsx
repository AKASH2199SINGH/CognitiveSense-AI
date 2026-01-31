import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore, AppMode } from '@/store/useSettingsStore';
import { Eye, Zap, AlertTriangle, Shield } from 'lucide-react';

const modeConfig: Record<AppMode, {
  icon: typeof Eye;
  label: string;
  color: string;
  bgColor: string;
}> = {
  normal: {
    icon: Eye,
    label: 'Normal Mode',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
  },
  focus: {
    icon: Zap,
    label: 'Focus Mode',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  alert: {
    icon: AlertTriangle,
    label: 'Alert Mode',
    color: 'text-warning',
    bgColor: 'bg-warning/20',
  },
  safe: {
    icon: Shield,
    label: 'Safe Mode',
    color: 'text-success',
    bgColor: 'bg-success/20',
  },
};

interface ModeIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function ModeIndicator({ className, compact = false }: ModeIndicatorProps) {
  const { appMode } = useSettingsStore();
  
  // Don't show for normal mode in compact view
  if (compact && appMode === 'normal') return null;

  const config = modeConfig[appMode];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={appMode}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border',
          config.bgColor,
          config.color,
          'border-current/30',
          className
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {!compact && (
          <span className="text-xs font-medium">{config.label}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
