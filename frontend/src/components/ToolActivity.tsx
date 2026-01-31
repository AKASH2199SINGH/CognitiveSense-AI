import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore, ActivityEvent } from '@/store/useAppStore';
import { Keyboard, Mouse, Eye, Brain, Wrench, Settings, Radio } from 'lucide-react';
import { format } from 'date-fns';

const typeIcons: Record<ActivityEvent['type'], typeof Keyboard> = {
  keyboard: Keyboard,
  mouse: Mouse,
  eye_tracking: Eye,
  inference: Brain,
  tool: Wrench,
  system: Settings,
};

const typeColors: Record<ActivityEvent['type'], string> = {
  keyboard: 'text-primary',
  mouse: 'text-secondary',
  eye_tracking: 'text-accent',
  inference: 'text-success',
  tool: 'text-warning',
  system: 'text-muted-foreground',
};

interface ToolActivityProps {
  className?: string;
}

export function ToolActivity({ className }: ToolActivityProps) {
  const { activities, isConnected } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn('glass-panel p-6 flex flex-col', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Live Activity</h3>
            <p className="text-xs text-muted-foreground">Real-time event stream</p>
          </div>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs text-primary font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Radio className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for activity...</p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {activities.map((activity, index) => {
                const Icon = typeIcons[activity.type];
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      'bg-muted/50 group-hover:bg-muted'
                    )}>
                      <Icon className={cn('w-4 h-4', typeColors[activity.type])} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {activity.action}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {format(activity.timestamp, 'HH:mm:ss')}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
