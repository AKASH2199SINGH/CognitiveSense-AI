import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Brain, Sparkles, Clock, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface InferencePanelProps {
  className?: string;
}

export function InferencePanel({ className }: InferencePanelProps) {
  const { latestInference, inferences, isStreaming, streamingText } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className={cn('glass-panel p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Inference</h3>
          <p className="text-xs text-muted-foreground">Model outputs & decisions</p>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-primary">Streaming...</span>
          </div>
        )}
      </div>

      {/* Streaming Output */}
      {isStreaming && streamingText && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-primary/20">
          <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
            {streamingText}
            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
          </p>
        </div>
      )}

      {/* Latest Inference */}
      {latestInference ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-primary/10 border border-success/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-success">Latest Decision</span>
              <span className="text-xs text-muted-foreground font-mono">
                {format(latestInference.timestamp, 'HH:mm:ss')}
              </span>
            </div>
            
            <p className="text-lg font-semibold text-foreground mb-3">
              {latestInference.decision}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Model</p>
                <p className="text-sm font-mono text-primary">{latestInference.model}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <p className="text-sm font-mono text-success">
                  {latestInference.confidence.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Latency</p>
                <p className="text-sm font-mono text-secondary">
                  {latestInference.latency ? `${latestInference.latency}ms` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Inferences */}
          {inferences.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recent Inferences</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {inferences.slice(1, 6).map((inference) => (
                  <div
                    key={inference.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Brain className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {inference.decision}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {inference.confidence.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(inference.timestamp, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Brain className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Waiting for inference...</p>
          <p className="text-xs mt-1">AI decisions will appear here</p>
        </div>
      )}
    </motion.div>
  );
}
