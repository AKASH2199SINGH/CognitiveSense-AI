import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

export interface Shortcut {
  id: string;
  keys: string[];
  label: string;
  description: string;
  category: 'system' | 'navigation' | 'pip' | 'logs' | 'general';
  action: () => void;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    isAIRunning,
    isPaused,
    startAI,
    stopAI,
    pauseAI,
    resumeAI,
    isPipVisible,
    isPipMinimized,
    isPipLocked,
    togglePipVisible,
    togglePipMinimized,
    togglePipLocked,
    toggleLogsPaused,
  } = useAppStore();

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const shortcuts: Shortcut[] = [
    // System Control
    {
      id: 'toggle-ai',
      keys: ['Ctrl', 'S'],
      label: 'Start/Stop AI',
      description: 'Toggle AI engine on/off',
      category: 'system',
      action: () => {
        if (isAIRunning) {
          stopAI();
        } else {
          startAI();
        }
      },
    },
    {
      id: 'toggle-pause',
      keys: ['Ctrl', 'P'],
      label: 'Pause/Resume',
      description: 'Pause or resume AI processing',
      category: 'system',
      action: () => {
        if (isAIRunning) {
          if (isPaused) {
            resumeAI();
          } else {
            pauseAI();
          }
        }
      },
    },
    
    // Navigation
    {
      id: 'goto-dashboard',
      keys: ['Ctrl', '1'],
      label: 'Dashboard',
      description: 'Navigate to Dashboard',
      category: 'navigation',
      action: () => navigate('/'),
    },
    {
      id: 'goto-chat',
      keys: ['Ctrl', '2'],
      label: 'Chat',
      description: 'Navigate to Chat',
      category: 'navigation',
      action: () => navigate('/chat'),
    },
    {
      id: 'goto-logs',
      keys: ['Ctrl', '3'],
      label: 'Logs',
      description: 'Navigate to Logs',
      category: 'navigation',
      action: () => navigate('/logs'),
    },
    {
      id: 'goto-settings',
      keys: ['Ctrl', ','],
      label: 'Settings',
      description: 'Navigate to Settings',
      category: 'navigation',
      action: () => navigate('/settings'),
    },
    
    // PiP
    {
      id: 'toggle-pip',
      keys: ['Ctrl', 'Shift', 'P'],
      label: 'Toggle PiP',
      description: 'Show/hide Picture-in-Picture',
      category: 'pip',
      action: togglePipVisible,
    },
    {
      id: 'lock-pip',
      keys: ['Ctrl', 'Shift', 'L'],
      label: 'Lock/Unlock PiP',
      description: 'Lock or unlock PiP position',
      category: 'pip',
      action: togglePipLocked,
    },
    {
      id: 'minimize-pip',
      keys: ['Escape'],
      label: 'Collapse PiP',
      description: 'Minimize the PiP window',
      category: 'pip',
      action: () => {
        if (isPipVisible && !isPipMinimized) {
          togglePipMinimized();
        }
      },
    },
    
    // Logs
    {
      id: 'focus-logs',
      keys: ['Ctrl', 'L'],
      label: 'Focus Logs',
      description: 'Navigate to and focus logs panel',
      category: 'logs',
      action: () => {
        navigate('/logs');
      },
    },
    {
      id: 'toggle-logs-pause',
      keys: ['Ctrl', 'Shift', 'K'],
      label: 'Pause Logs',
      description: 'Pause/resume log auto-scroll',
      category: 'logs',
      action: toggleLogsPaused,
    },
    
    // General
    {
      id: 'show-shortcuts',
      keys: ['?'],
      label: 'Show Shortcuts',
      description: 'Open keyboard shortcuts modal',
      category: 'general',
      action: openModal,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow '?' shortcut even in inputs
        if (e.key !== '?') return;
      }

      // Check for matching shortcut
      for (const shortcut of shortcuts) {
        const keysMatch = shortcut.keys.every((key) => {
          switch (key) {
            case 'Ctrl':
              return e.ctrlKey || e.metaKey;
            case 'Shift':
              return e.shiftKey;
            case 'Alt':
              return e.altKey;
            case 'Escape':
              return e.key === 'Escape';
            case '?':
              return e.key === '?' || (e.shiftKey && e.key === '/');
            default:
              return e.key.toLowerCase() === key.toLowerCase() || e.code === `Key${key.toUpperCase()}`;
          }
        });

        // Ensure we don't match when extra modifier keys are pressed
        const expectedCtrl = shortcut.keys.includes('Ctrl');
        const expectedShift = shortcut.keys.includes('Shift');
        const expectedAlt = shortcut.keys.includes('Alt');
        
        const modifiersMatch = 
          (expectedCtrl === (e.ctrlKey || e.metaKey)) &&
          (expectedShift === e.shiftKey || shortcut.keys.includes('?')) &&
          (expectedAlt === e.altKey);

        if (keysMatch && modifiersMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return {
    shortcuts,
    isModalOpen,
    openModal,
    closeModal,
  };
}

export function getShortcutsByCategory(shortcuts: Shortcut[]) {
  const categories = {
    system: [] as Shortcut[],
    navigation: [] as Shortcut[],
    pip: [] as Shortcut[],
    logs: [] as Shortcut[],
    general: [] as Shortcut[],
  };

  shortcuts.forEach((shortcut) => {
    categories[shortcut.category].push(shortcut);
  });

  return categories;
}
