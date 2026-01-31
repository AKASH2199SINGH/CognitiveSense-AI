import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Settings2, Navigation, PictureInPicture2, Terminal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shortcut, getShortcutsByCategory } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

const categoryIcons = {
  system: Settings2,
  navigation: Navigation,
  pip: PictureInPicture2,
  logs: Terminal,
  general: Zap,
};

const categoryLabels = {
  system: 'System Control',
  navigation: 'Navigation',
  pip: 'Picture-in-Picture',
  logs: 'Logs',
  general: 'General',
};

function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-mono font-medium bg-muted/50 border border-border rounded-md text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  const categories = getShortcutsByCategory(shortcuts);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-card border-border p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Keyboard Shortcuts
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Quick actions to control CognitiveSense AI
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto p-6 pt-4 space-y-6">
          {Object.entries(categories).map(([category, categoryShortcuts]) => {
            if (categoryShortcuts.length === 0) return null;
            
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const label = categoryLabels[category as keyof typeof categoryLabels];

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {label}
                  </h3>
                </div>

                <div className="glass-panel divide-y divide-border/30">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {shortcut.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shortcut.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, index) => (
                          <span key={index} className="flex items-center gap-1">
                            <ShortcutKey>{key}</ShortcutKey>
                            {index < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/10">
          <p className="text-xs text-muted-foreground text-center">
            Press <ShortcutKey>?</ShortcutKey> anytime to show this modal
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
