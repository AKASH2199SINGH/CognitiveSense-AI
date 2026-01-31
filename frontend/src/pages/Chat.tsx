import { motion } from 'framer-motion';
import { ChatPanel } from '@/components/ChatPanel';

export default function Chat() {
  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">
          AI Chat
        </h1>
        <p className="text-muted-foreground mt-1">
          Interact with the CognitiveSense AI system
        </p>
      </motion.header>

      {/* Chat Panel - Full Height */}
      <div className="flex-1 min-h-0">
        <ChatPanel className="h-full" />
      </div>
    </div>
  );
}
