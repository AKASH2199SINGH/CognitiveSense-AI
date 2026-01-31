import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore, NotificationType, AppMode } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Settings as SettingsIcon,
  Wifi,
  Palette,
  Bell,
  Terminal,
  Zap,
  Save,
  RotateCcw,
  Shield,
  Eye,
  AlertTriangle,
  Keyboard,
} from 'lucide-react';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';

const notificationLabels: Record<NotificationType, { label: string; description: string }> = {
  systemStateChange: { label: 'System State Changes', description: 'When system transitions between states' },
  criticalStress: { label: 'Critical Stress', description: 'When stress levels become critical' },
  wsDisconnect: { label: 'Connection Lost', description: 'When WebSocket disconnects' },
  wsReconnect: { label: 'Connection Restored', description: 'When WebSocket reconnects' },
  inferenceResult: { label: 'Inference Results', description: 'New AI inference notifications' },
  sessionStart: { label: 'Session Start', description: 'When a new session begins' },
  sessionStop: { label: 'Session End', description: 'When a session is completed' },
};

const accentColors = [
  { value: 'cyan', label: 'Cyan', color: 'bg-primary' },
  { value: 'purple', label: 'Purple', color: 'bg-secondary' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-success' },
] as const;

const appModes: Array<{ value: AppMode; label: string; description: string; icon: typeof Eye }> = [
  { value: 'normal', label: 'Normal', description: 'Full dashboard experience', icon: Eye },
  { value: 'focus', label: 'Focus', description: 'Minimal UI, PiP prioritized', icon: Zap },
  { value: 'alert', label: 'Alert', description: 'Subtle dim with PiP highlight', icon: AlertTriangle },
  { value: 'safe', label: 'Safe', description: 'Auto-pause on excessive stress', icon: Shield },
];

export default function Settings() {
  const settings = useSettingsStore();
  const { shortcuts, isModalOpen, openModal, closeModal } = useKeyboardShortcuts();
  
  const [localWsUrl, setLocalWsUrl] = useState(settings.wsUrl);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSaveWsUrl = () => {
    settings.setWsUrl(localWsUrl);
    toast.success('WebSocket URL updated');
  };

  const handleResetSettings = () => {
    // Reset to defaults
    settings.setWsUrl('ws://localhost:8000/ws');
    settings.setReconnectEnabled(true);
    settings.setConnectionTimeout(30);
    settings.setAccentColor('cyan');
    settings.setMotionReduced(false);
    settings.setGlobalNotificationsEnabled(true);
    settings.setLogRetentionDays(7);
    settings.setMaxLogEntries(500);
    settings.setAutoClearEnabled(false);
    settings.setAutoPauseOnStress(false);
    settings.setStressThreshold(40);
    settings.setAutoExpandPipOnCritical(true);
    settings.setSessionAutoResetHours(24);
    settings.setAppMode('normal');
    setLocalWsUrl('ws://localhost:8000/ws');
    setShowResetDialog(false);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure CognitiveSense AI preferences
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="w-full justify-start border-b border-border/50 bg-transparent rounded-none p-0 h-auto">
            {[
              { value: 'connection', icon: Wifi, label: 'Connection' },
              { value: 'appearance', icon: Palette, label: 'Appearance' },
              { value: 'notifications', icon: Bell, label: 'Notifications' },
              { value: 'logs', icon: Terminal, label: 'Logs' },
              { value: 'behavior', icon: Zap, label: 'Behavior' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 px-6 py-4 border-b-2 border-transparent data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Connection Settings */}
          <TabsContent value="connection" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-url">WebSocket URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="ws-url"
                    value={localWsUrl}
                    onChange={(e) => setLocalWsUrl(e.target.value)}
                    placeholder="ws://localhost:8000/ws"
                    className="flex-1 bg-muted/30 border-border/50"
                  />
                  <Button onClick={handleSaveWsUrl} className="bg-primary text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The WebSocket endpoint for real-time data streaming
                </p>
              </div>

              <div className="neon-line" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Reconnect</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically attempt to reconnect on disconnect
                  </p>
                </div>
                <Switch
                  checked={settings.reconnectEnabled}
                  onCheckedChange={settings.setReconnectEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Connection Timeout: {settings.connectionTimeout}s</Label>
                <Slider
                  value={[settings.connectionTimeout]}
                  onValueChange={([v]) => settings.setConnectionTimeout(v)}
                  min={5}
                  max={120}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum time to wait for connection before timing out
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Accent Color</Label>
                <div className="flex gap-3">
                  {accentColors.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => settings.setAccentColor(value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                        settings.accentColor === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-border'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-full', color)} />
                      <span className="text-xs text-foreground">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="neon-line" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduce Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations for accessibility
                  </p>
                </div>
                <Switch
                  checked={settings.motionReduced}
                  onCheckedChange={settings.setMotionReduced}
                />
              </div>

              <div className="neon-line" />

              <div className="space-y-3">
                <Label>Application Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  {appModes.map(({ value, label, description, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => settings.setAppMode(value)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                        settings.appMode === value
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-border'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 mt-0.5',
                        settings.appMode === value ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <div>
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 glass-panel">
              <div>
                <Label className="text-base">Global Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable all notifications
                </p>
              </div>
              <Switch
                checked={settings.globalNotificationsEnabled}
                onCheckedChange={settings.setGlobalNotificationsEnabled}
              />
            </div>

            <div className="space-y-3">
              {(Object.entries(notificationLabels) as [NotificationType, { label: string; description: string }][]).map(
                ([type, { label, description }]) => {
                  const notifSettings = settings.notifications[type];
                  return (
                    <div
                      key={type}
                      className={cn(
                        'p-4 rounded-lg border border-border/50 transition-opacity',
                        !settings.globalNotificationsEnabled && 'opacity-50 pointer-events-none'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <Switch
                          checked={notifSettings.enabled}
                          onCheckedChange={(enabled) =>
                            settings.updateNotification(type, { enabled })
                          }
                        />
                      </div>
                      
                      {notifSettings.enabled && (
                        <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={notifSettings.autoDismiss}
                              onCheckedChange={(autoDismiss) =>
                                settings.updateNotification(type, { autoDismiss })
                              }
                              className="scale-75"
                            />
                            <span className="text-xs text-muted-foreground">Auto-dismiss</span>
                          </div>
                          {notifSettings.autoDismiss && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">After:</span>
                              <Input
                                type="number"
                                value={notifSettings.dismissTimeout}
                                onChange={(e) =>
                                  settings.updateNotification(type, {
                                    dismissTimeout: parseInt(e.target.value) || 5,
                                  })
                                }
                                className="w-16 h-7 text-xs bg-muted/30 border-border/50"
                                min={1}
                                max={60}
                              />
                              <span className="text-xs text-muted-foreground">seconds</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Logs Settings */}
          <TabsContent value="logs" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Log Retention: {settings.logRetentionDays} days</Label>
                <Slider
                  value={[settings.logRetentionDays]}
                  onValueChange={([v]) => settings.setLogRetentionDays(v)}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How long to keep historical log data
                </p>
              </div>

              <div className="neon-line" />

              <div className="space-y-2">
                <Label>Maximum Log Entries: {settings.maxLogEntries}</Label>
                <Slider
                  value={[settings.maxLogEntries]}
                  onValueChange={([v]) => settings.setMaxLogEntries(v)}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of log entries to keep in memory
                </p>
              </div>

              <div className="neon-line" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Clear Logs</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically clear old logs based on retention policy
                  </p>
                </div>
                <Switch
                  checked={settings.autoClearEnabled}
                  onCheckedChange={settings.setAutoClearEnabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Behavior Settings */}
          <TabsContent value="behavior" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Pause on Stress</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically pause AI when stress threshold is exceeded
                  </p>
                </div>
                <Switch
                  checked={settings.autoPauseOnStress}
                  onCheckedChange={settings.setAutoPauseOnStress}
                />
              </div>

              {settings.autoPauseOnStress && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <Label>Stress Threshold: {settings.stressThreshold}%</Label>
                  <Slider
                    value={[settings.stressThreshold]}
                    onValueChange={([v]) => settings.setStressThreshold(v)}
                    min={10}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Confidence below this level triggers stress detection
                  </p>
                </div>
              )}

              <div className="neon-line" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Expand PiP on Critical</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically expand PiP when critical state is detected
                  </p>
                </div>
                <Switch
                  checked={settings.autoExpandPipOnCritical}
                  onCheckedChange={settings.setAutoExpandPipOnCritical}
                />
              </div>

              <div className="neon-line" />

              <div className="space-y-2">
                <Label>Session Auto-Reset: {settings.sessionAutoResetHours} hours</Label>
                <Slider
                  value={[settings.sessionAutoResetHours]}
                  onValueChange={([v]) => settings.setSessionAutoResetHours(v)}
                  min={1}
                  max={72}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically start a new session after this duration
                </p>
              </div>

              <div className="neon-line" />

              <Button
                variant="outline"
                onClick={openModal}
                className="w-full border-border/50 hover:bg-muted/30"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                View Keyboard Shortcuts
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => setShowResetDialog(true)}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Reset Settings?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will reset all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted/20 border-border text-foreground hover:bg-muted/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetSettings}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        shortcuts={shortcuts}
      />
    </div>
  );
}
