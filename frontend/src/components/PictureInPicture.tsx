import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Minimize2, 
  Maximize2, 
  Lock, 
  Unlock, 
  X, 
  Activity,
  Cpu,
  Eye,
  Keyboard,
  Mouse,
  Zap,
  GripVertical
} from 'lucide-react';
import { useAppStore, SystemState } from '@/store/useAppStore';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { wsService } from '@/services/ws';


const stateColors: Record<SystemState, { bg: string; glow: string; text: string; border: string }> = {
  normal: {
    bg: 'bg-primary/20',
    glow: 'shadow-[0_0_30px_hsl(185,100%,50%,0.4)]',
    text: 'text-primary',
    border: 'border-primary/50',
  },
  alert: {
    bg: 'bg-warning/20',
    glow: 'shadow-[0_0_30px_hsl(38,92%,50%,0.4)]',
    text: 'text-warning',
    border: 'border-warning/50',
  },
  critical: {
    bg: 'bg-destructive/20',
    glow: 'shadow-[0_0_30px_hsl(0,72%,51%,0.4)]',
    text: 'text-destructive',
    border: 'border-destructive/50',
  },
  offline: {
    bg: 'bg-muted/20',
    glow: 'shadow-none',
    text: 'text-muted-foreground',
    border: 'border-muted/50',
  },
};

const activityIcons: Record<string, React.ReactNode> = {
  keyboard: <Keyboard className="h-3 w-3" />,
  mouse: <Mouse className="h-3 w-3" />,
  eye_tracking: <Eye className="h-3 w-3" />,
  inference: <Cpu className="h-3 w-3" />,
  tool: <Zap className="h-3 w-3" />,
  system: <Activity className="h-3 w-3" />,
};

export const PictureInPicture = () => {
  const {
    isPipVisible,
    isPipMinimized,
    isPipLocked,
    pipPosition,
    togglePipVisible,
    togglePipMinimized,
    togglePipLocked,
    setPipPosition,
    systemState,
    confidence,
    isConnected,
    activities,
    latestInference,
    confidenceHistory,
    isAIRunning,
    isPaused,
  } = useAppStore();

  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get latest activity
  const latestActivity = activities[0];
  
  // Get recent confidence data for mini chart (last 20 points)
  const miniChartData = confidenceHistory.slice(-20).map((point, index) => ({
    index,
    value: point.value,
  }));

  // Calculate pulse speed based on confidence
  const pulseSpeed = Math.max(0.5, 2 - (confidence / 100) * 1.5);

  const colors = stateColors[systemState];

  useEffect(() => {
  // Electron PiP ek alag renderer hai
  // isliye isko apna WS connection chahiye
  if (!wsService.isConnected) {
    wsService.connect('ws://127.0.0.1:8000/ws/live');
  }
}, []);

  // Initialize position on mount - top-right corner
  useEffect(() => {
    
    if (typeof window !== 'undefined' && pipPosition.x === 20 && pipPosition.y === 100) {
      // Set initial position to top-right (accounting for PiP width)
      const newX = Math.max(20, window.innerWidth - 360);
      const newY = 80;
      setPipPosition({ x: newX, y: newY });
    }
  }, [pipPosition.x, pipPosition.y, setPipPosition]);

  // Handle drag end to save position
  const handleDragEnd = useCallback(
    (event: any, info: any) => {
      if (!isPipLocked) {
        setPipPosition({
          x: pipPosition.x + info.offset.x,
          y: pipPosition.y + info.offset.y,
        });
      }
    },
    [isPipLocked, pipPosition, setPipPosition]
  );

  // Handle keyboard shortcut to toggle PiP
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        togglePipVisible();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePipVisible]);

  if (!isPipVisible) return null;

  return (
    <>
      {/* Constraints container - full viewport */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ padding: '16px' }}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key="pip-window"
          drag={!isPipLocked}
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={{ 
            opacity: 0, 
            scale: 0.8,
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            transition: { duration: 0.2 }
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            right: 20,
            top: 80,
            background: 'linear-gradient(180deg, hsl(222 47% 8% / 0.95) 0%, hsl(222 47% 5% / 0.98) 100%)',
            width: isPipMinimized ? '200px' : '320px',
          }}
          className={cn(
            'fixed z-[9999] pointer-events-auto',
            'rounded-2xl overflow-hidden',
            'backdrop-blur-2xl',
            'border',
            colors.border,
            'transition-shadow duration-500',
            isHovered ? colors.glow : 'shadow-xl shadow-black/50',
            isPipLocked && 'cursor-default',
            !isPipLocked && 'cursor-grab active:cursor-grabbing'
          )}
        >
          {/* Animated border glow effect */}
          <div 
            className={cn(
              'absolute inset-0 rounded-2xl opacity-50',
              'bg-gradient-to-r from-transparent via-primary/20 to-transparent',
              'animate-data-flow'
            )}
            style={{ pointerEvents: 'none' }}
          />

          {/* Header */}
          <motion.div 
            className="relative flex items-center justify-between px-3 py-2 border-b border-border/50"
            layout
          >
            {/* Drag handle */}
            {!isPipLocked && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-0 opacity-30 hover:opacity-60 transition-opacity cursor-grab"
                whileHover={{ scale: 1.1 }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              {/* Status pulse indicator */}
              <div className="relative">
                <motion.div
                  className={cn('h-2.5 w-2.5 rounded-full', colors.bg)}
                  animate={{
                    scale: systemState !== 'offline' ? [1, 1.3, 1] : 1,
                    opacity: systemState !== 'offline' ? [1, 0.6, 1] : 0.5,
                  }}
                  transition={{
                    duration: pulseSpeed,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className={cn(
                  'absolute inset-0 rounded-full',
                  colors.bg,
                  'blur-sm'
                )} />
              </div>
              <span className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
                CognitiveSense
              </span>
            </div>

            {/* Controls */}
            <AnimatePresence>
              <motion.div 
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0.3 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePipLocked}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    isPipLocked ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  title={isPipLocked ? 'Unlock position' : 'Lock position'}
                >
                  {isPipLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePipMinimized}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  title={isPipMinimized ? 'Expand' : 'Minimize'}
                >
                  {isPipMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePipVisible}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-colors"
                  title="Close PiP"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="relative p-3"
            layout
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Minimized view */}
            {isPipMinimized ? (
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('text-lg font-bold mono-text', colors.text)}>
                    {confidence.toFixed(0)}%
                  </span>
                  <span className={cn('text-xs uppercase font-medium', colors.text)}>
                    {systemState}
                  </span>
                </div>
                {isAIRunning && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Cpu className={cn('h-4 w-4', colors.text)} />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Expanded view */
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* System State & Confidence */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className={cn(
                          'text-2xl font-bold mono-text tabular-nums',
                          colors.text
                        )}
                        key={confidence}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {confidence.toFixed(1)}%
                      </motion.span>
                      <span className="text-xs text-muted-foreground">confidence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className={cn(
                          'text-xs font-semibold uppercase px-2 py-0.5 rounded-full',
                          colors.bg,
                          colors.text
                        )}
                        layout
                      >
                        {systemState}
                      </motion.span>
                      {!isConnected && (
                        <span className="text-xs text-destructive">disconnected</span>
                      )}
                    </div>
                  </div>

                  {/* AI Status indicator */}
                  <div className="flex flex-col items-end gap-1">
                    <motion.div
                      className={cn(
                        'px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wide',
                        isAIRunning 
                          ? isPaused 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-success/20 text-success'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                      animate={isAIRunning && !isPaused ? { 
                        boxShadow: ['0 0 0px hsl(142 76% 45% / 0)', '0 0 10px hsl(142 76% 45% / 0.3)', '0 0 0px hsl(142 76% 45% / 0)'] 
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {isAIRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                    </motion.div>
                  </div>
                </div>

                {/* Mini confidence chart */}
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={miniChartData}>
                      <defs>
                        <linearGradient id="pipChartGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(185 100% 50%)" stopOpacity={0.3} />
                          <stop offset="50%" stopColor="hsl(185 100% 50%)" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(270 80% 60%)" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={[0, 100]} hide />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="url(#pipChartGradient)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Divider */}
                <div className="neon-line" />

                {/* Latest Activity */}
                {latestActivity && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Latest Activity
                    </span>
                    <motion.div 
                      className="flex items-center gap-2 text-xs"
                      key={latestActivity.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-primary">
                        {activityIcons[latestActivity.type] || <Activity className="h-3 w-3" />}
                      </span>
                      <span className="text-foreground/90 truncate flex-1">
                        {latestActivity.action}
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Latest Inference */}
                {latestInference && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Current Inference
                    </span>
                    <motion.div 
                      className="flex items-center justify-between text-xs"
                      key={latestInference.id}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <span className="text-secondary truncate max-w-[150px]">
                        {latestInference.decision}
                      </span>
                      <span className="text-muted-foreground mono-text text-[10px]">
                        {latestInference.latency}ms
                      </span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Bottom scan line effect */}
          <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
            <motion.div
              className="h-full w-20 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PictureInPicture;
