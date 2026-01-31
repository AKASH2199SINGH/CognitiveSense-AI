import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard,
  MessageSquare,
  Terminal,
  Settings,
  Activity,
  Brain,
  ChevronLeft,
  ChevronRight,
  PictureInPicture2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/logs', label: 'Logs', icon: Terminal },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation();
  const { systemState, isConnected, isPipVisible, togglePipVisible } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-sm">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-foreground text-lg leading-none">
                Cognitive
              </span>
              <span className="text-primary text-sm font-medium">Sense AI</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Status */}
      <div className="p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="relative">
            <Activity className={cn(
              'w-5 h-5',
              isConnected ? 'text-success' : 'text-destructive'
            )} />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">System</span>
              <span className={cn(
                'text-sm font-medium capitalize',
                systemState === 'normal' && 'text-success',
                systemState === 'alert' && 'text-warning',
                systemState === 'critical' && 'text-destructive',
                systemState === 'offline' && 'text-muted-foreground'
              )}>
                {systemState}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                'hover:bg-sidebar-accent',
                isActive && 'bg-sidebar-accent text-sidebar-primary',
                !isActive && 'text-sidebar-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className={cn(
                'w-5 h-5',
                isActive && 'text-sidebar-primary'
              )} />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-5 bg-sidebar-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings, PiP Toggle & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* PiP Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={togglePipVisible}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 h-auto',
                isPipVisible ? 'text-primary bg-primary/10' : 'text-sidebar-foreground',
                'hover:bg-sidebar-accent',
                isCollapsed && 'justify-center'
              )}
            >
              <PictureInPicture2 className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-medium">
                  {isPipVisible ? 'Hide PiP' : 'Show PiP'}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>{isPipVisible ? 'Hide PiP (Ctrl+Shift+P)' : 'Show PiP (Ctrl+Shift+P)'}</p>
            </TooltipContent>
          )}
        </Tooltip>

        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
            'text-sidebar-foreground hover:bg-sidebar-accent',
            isCollapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </Link>

        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 h-auto',
            'text-muted-foreground hover:text-foreground',
            isCollapsed && 'justify-center'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
