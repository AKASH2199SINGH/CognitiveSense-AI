import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface RealtimeGraphProps {
  className?: string;
}

export function RealtimeGraph({ className }: RealtimeGraphProps) {
  const { confidenceHistory, activityFrequency } = useAppStore();

  const confidenceData = useMemo(() => {
    return confidenceHistory.map((point) => ({
      time: format(point.timestamp, 'HH:mm:ss'),
      value: point.value,
    }));
  }, [confidenceHistory]);

  const activityData = useMemo(() => {
    // Aggregate activity by 5-second intervals
    const aggregated: Record<string, number> = {};
    
    activityFrequency.forEach((point) => {
      const timeKey = Math.floor(point.timestamp / 5000) * 5000;
      aggregated[timeKey] = (aggregated[timeKey] || 0) + point.value;
    });

    return Object.entries(aggregated)
      .map(([timestamp, count]) => ({
        time: format(Number(timestamp), 'HH:mm:ss'),
        value: count,
      }))
      .slice(-20);
  }, [activityFrequency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn('glass-panel p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Analytics</h3>
          <p className="text-xs text-muted-foreground">Real-time metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Confidence Over Time</span>
            <span className="text-xs font-mono text-primary">
              {confidenceData.length > 0 
                ? `${confidenceData[confidenceData.length - 1]?.value.toFixed(1)}%`
                : '—'
              }
            </span>
          </div>
          
          <div className="h-[160px] w-full">
            {confidenceData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={confidenceData}>
                  <defs>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
                    itemStyle={{ color: 'hsl(185, 100%, 50%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(185, 100%, 50%)"
                    strokeWidth={2}
                    fill="url(#confidenceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Collecting data...
              </div>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Activity Frequency</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-secondary" />
              <span className="text-xs font-mono text-secondary">
                {activityData.length > 0 
                  ? activityData[activityData.length - 1]?.value
                  : 0
                } events
              </span>
            </div>
          </div>
          
          <div className="h-[160px] w-full">
            {activityData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
                    itemStyle={{ color: 'hsl(270, 80%, 60%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(270, 80%, 60%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(270, 80%, 60%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Collecting data...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
