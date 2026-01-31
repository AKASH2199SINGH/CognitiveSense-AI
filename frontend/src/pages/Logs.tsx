import { motion } from 'framer-motion';
import { LogsPanel } from '@/components/LogsPanel';

export default function Logs() {
  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">
          System Logs
        </h1>
        <p className="text-muted-foreground mt-1">
          Debug console and event history
        </p>
      </motion.header>

      {/* Logs Panel - Full Height */}
      <div className="flex-1 min-h-0">
        <LogsPanel className="h-full" maxHeight="h-full" />
      </div>
    </div>
  );
}
