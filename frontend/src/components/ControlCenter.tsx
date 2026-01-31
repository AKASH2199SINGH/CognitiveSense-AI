import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Play, Pause, Square, RefreshCw, Zap, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface ControlCenterProps {
  className?: string;
}

type ActionType = 'start' | 'stop' | 'pause' | 'resume' | null;

export function ControlCenter({ className }: ControlCenterProps) {
  const { isAIRunning, isPaused, startAI, stopAI, pauseAI, resumeAI, addLog } = useAppStore();
  const [pendingAction, setPendingAction] = useState<ActionType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: ActionType) => {
    if (!action) return;
    
    setIsLoading(true);
    setPendingAction(null);

    try {
      let result;
      
      switch (action) {
        case 'start':
          result = await api.startAI();
          if (result.success) {
            startAI();
            toast.success('AI System Started');
            addLog({
              timestamp: new Date(),
              level: 'info',
              message: 'AI system started successfully',
              source: 'Control Center',
            });
          }
          break;
        case 'stop':
          result = await api.stopAI();
          if (result.success) {
            stopAI();
            toast.success('AI System Stopped');
            addLog({
              timestamp: new Date(),
              level: 'warning',
              message: 'AI system stopped',
              source: 'Control Center',
            });
          }
          break;
        case 'pause':
          result = await api.pauseAI();
          if (result.success) {
            pauseAI();
            toast.success('AI System Paused');
            addLog({
              timestamp: new Date(),
              level: 'info',
              message: 'AI system paused',
              source: 'Control Center',
            });
          }
          break;
        case 'resume':
          result = await api.resumeAI();
          if (result.success) {
            resumeAI();
            toast.success('AI System Resumed');
            addLog({
              timestamp: new Date(),
              level: 'info',
              message: 'AI system resumed',
              source: 'Control Center',
            });
          }
          break;
      }

      if (result && !result.success) {
        toast.error(`Failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const actionConfigs: Record<Exclude<ActionType, null>, { 
    title: string; 
    description: string; 
    confirmLabel: string;
    variant: 'default' | 'destructive';
  }> = {
    start: {
      title: 'Start AI System',
      description: 'This will initialize and start the AI processing engine. All sensors will begin capturing data.',
      confirmLabel: 'Start System',
      variant: 'default',
    },
    stop: {
      title: 'Stop AI System',
      description: 'This will completely stop the AI system. All processing will halt and data capture will stop.',
      confirmLabel: 'Stop System',
      variant: 'destructive',
    },
    pause: {
      title: 'Pause AI System',
      description: 'This will temporarily pause AI processing. Data capture will continue but processing will be suspended.',
      confirmLabel: 'Pause System',
      variant: 'default',
    },
    resume: {
      title: 'Resume AI System',
      description: 'This will resume AI processing from the paused state.',
      confirmLabel: 'Resume System',
      variant: 'default',
    },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={cn('glass-panel p-6', className)}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Control Center</h3>
            <p className="text-xs text-muted-foreground">AI system management</p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!isAIRunning ? (
            <Button
              onClick={() => setPendingAction('start')}
              disabled={isLoading}
              className="h-16 bg-success/20 hover:bg-success/30 text-success border border-success/30 hover:border-success/50 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => setPendingAction('stop')}
              disabled={isLoading}
              className="h-16 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 hover:border-destructive/50 transition-all"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          )}

          {isAIRunning && !isPaused ? (
            <Button
              onClick={() => setPendingAction('pause')}
              disabled={isLoading}
              className="h-16 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 hover:border-warning/50 transition-all"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          ) : isAIRunning && isPaused ? (
            <Button
              onClick={() => setPendingAction('resume')}
              disabled={isLoading}
              className="h-16 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 transition-all"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Resume
            </Button>
          ) : (
            <Button
              disabled
              className="h-16 bg-muted/20 text-muted-foreground border border-muted/30 cursor-not-allowed"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">Quick Actions</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                api.triggerAction('calibrate');
                toast.info('Calibration triggered');
              }}
            >
              <Zap className="w-3 h-3 mr-1" />
              Calibrate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                api.triggerAction('reset_metrics');
                toast.info('Metrics reset');
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent className="bg-card border-border">
          {pendingAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  {actionConfigs[pendingAction].title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  {actionConfigs[pendingAction].description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-muted/20 border-border text-foreground hover:bg-muted/30">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction(pendingAction)}
                  className={cn(
                    actionConfigs[pendingAction].variant === 'destructive'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {actionConfigs[pendingAction].confirmLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
