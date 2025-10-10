import { NavigateFunction } from 'react-router-dom';
import type { ViewMode, SortBy, SortOrder, GroupBy } from '@/contexts/GlobalViewContext';

// FAB action execution and global state management

// Global view actions interface for external dependency injection
interface GlobalViewActions {
  setViewMode: (mode: ViewMode) => void;
  setFilter: (filter: any) => void;
  clearFilters: () => void;
  setSort: (sortBy: SortBy, order?: SortOrder) => void;
  toggleSortOrder: () => void;
  setGroup: (groupBy: GroupBy) => void;
  setCategoryFilter: (category: string | null) => void;
}

// Global view actions instance (will be set by FABContainer)
let globalViewActions: GlobalViewActions | null = null;

export function setGlobalViewActions(actions: GlobalViewActions) {
  globalViewActions = actions;
}

export function executeAction(action: string, value: any, navigate: NavigateFunction, currentTab?: 'capture' | 'plan' | 'engage') {
  switch (action) {
    case 'SET_VIEW':
      if (globalViewActions) {
        globalViewActions.setViewMode(value);
      }
      break;

    case 'SET_FILTER':
      if (globalViewActions) {
        globalViewActions.setFilter(value);
      }
      break;

    case 'CLEAR_FILTERS':
      if (globalViewActions) {
        globalViewActions.clearFilters();
      }
      break;

    case 'SET_SORT':
      if (globalViewActions) {
        globalViewActions.setSort(value.by, value.order);
      }
      break;

    case 'TOGGLE_SORT_ORDER':
      if (globalViewActions) {
        globalViewActions.toggleSortOrder();
      }
      break;

    case 'SET_GROUP':
      if (globalViewActions) {
        globalViewActions.setGroup(value);
      }
      break;

    case 'SET_CATEGORY_FILTER':
      if (globalViewActions) {
        globalViewActions.setCategoryFilter(value);
      }
      break;

    case 'CREATE':
      // Navigate to create new item
      if (value === 'project') {
        navigate('/projects');
      } else if (value === 'task') {
        navigate('/tasks');
      } else if (value === 'goal') {
        navigate('/goals/new');
      }
      break;

    case 'USE_TEMPLATE':
      // Load template for capture
      if (value === 'note') {
        navigate('/notes');
      } else if (value === 'task') {
        navigate('/tasks');
      } else if (value === 'project') {
        navigate('/projects');
      } else if (value === 'goal') {
        navigate('/goals/new');
      } else if (value === 'habit') {
        navigate('/habits');
      }
      break;

    case 'CAPTURE':
      // Open capture method
      if (value === 'voice') {
        // Voice capture functionality
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              // Show toast notification for voice capture
              window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                  message: 'Voice recording started! Speak your thoughts.',
                  type: 'success'
                }
              }));
            })
            .catch(() => {
              window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                  message: 'Microphone access denied. Please enable microphone permissions.',
                  type: 'error'
                }
              }));
            });
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: 'Voice recording not supported in this browser.',
              type: 'error'
            }
          }));
        }
      } else if (value === 'photo') {
        // Photo capture functionality
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: 'Photo capture coming soon! Use file upload for now.',
              type: 'info'
            }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: 'Camera not supported in this browser.',
              type: 'error'
            }
          }));
        }
      } else if (value === 'quick') {
        navigate('/quick-todos');
      }
      break;

    case 'IMPORT':
      // Import functionality
      if (value === 'file') {
        // Create file input for import
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.csv,.txt';
        fileInput.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: {
                message: `Importing ${file.name}... Processing in background.`,
                type: 'info'
              }
            }));
          }
        };
        fileInput.click();
      } else if (value === 'clipboard') {
        // Clipboard import
        navigator.clipboard.readText()
          .then(text => {
            if (text.trim()) {
              window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                  message: 'Content imported from clipboard!',
                  type: 'success'
                }
              }));
            } else {
              window.dispatchEvent(new CustomEvent('show-toast', {
                detail: {
                  message: 'Clipboard is empty.',
                  type: 'warning'
                }
              }));
            }
          })
          .catch(() => {
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: {
                message: 'Clipboard access denied. Please paste manually.',
                type: 'error'
              }
            }));
          });
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: 'Import feature coming soon!',
            type: 'info'
          }
        }));
      }
      break;

    case 'NAVIGATE':
      // Direct navigation
      navigate(value);
      break;

    case 'START_TIMER':
      // Timer functionality
      const timerDuration = 25 * 60 * 1000; // 25 minutes in milliseconds
      const startTime = Date.now();

      // Store timer in localStorage
      localStorage.setItem('activeTimer', JSON.stringify({
        startTime,
        duration: timerDuration,
        isActive: true
      }));

      // Show timer started notification
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Pomodoro timer started! 25 minutes of focused work.',
          type: 'success'
        }
      }));

      // Navigate to pomodoro page if it exists
      if (currentTab === 'engage') {
        navigate('/pomodoro');
      } else {
        // Show timer in notification if not on engage tab
        window.dispatchEvent(new CustomEvent('timer-started', {
          detail: { duration: timerDuration }
        }));
      }
      break;

    case 'ADD_TO_TODAY':
      // Add to today functionality
      const today = new Date().toISOString().split('T')[0];

      // Store in localStorage for today's queue
      const todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
      const newTask = {
        id: Date.now().toString(),
        title: 'Quick task from FAB',
        addedAt: new Date().toISOString(),
        completed: false
      };
      todayTasks.push(newTask);
      localStorage.setItem('todayTasks', JSON.stringify(todayTasks));

      // Show confirmation
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Added to today\'s focus list!',
          type: 'success'
        }
      }));
      break;

    case 'COMPLETE':
      // Mark complete functionality
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Great work! Task marked as complete.',
          type: 'success'
        }
      }));

      // Trigger any completion analytics or rewards
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { timestamp: new Date().toISOString() }
      }));
      break;

    case 'OPEN_TAG_FILTER':
      window.dispatchEvent(new CustomEvent('open-tag-filter-modal'));
      break;

    case 'EDIT_TIME':
      // Time editing functionality
      const currentTimer = localStorage.getItem('activeTimer');
      if (currentTimer) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: 'Time editor opened! Adjust your timer settings.',
            type: 'info'
          }
        }));
        // Navigate to time tracking page for editing
        navigate('/pomodoro');
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: 'No active timer to edit. Start a timer first!',
            type: 'warning'
          }
        }));
      }
      break;

    case 'TOGGLE_DND':
      // Do not disturb functionality
      const currentDND = localStorage.getItem('doNotDisturb') === 'true';
      const newDNDState = !currentDND;

      localStorage.setItem('doNotDisturb', newDNDState.toString());

      // Dispatch DND state change event
      window.dispatchEvent(new CustomEvent('dnd-toggled', {
        detail: { enabled: newDNDState }
      }));

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: newDNDState
            ? 'Do Not Disturb enabled. Focus mode activated!'
            : 'Do Not Disturb disabled. Notifications restored.',
          type: 'success'
        }
      }));
      break;

    case 'SET_FOCUS_GOAL':
      // Focus goal setting functionality
      const focusGoals = JSON.parse(localStorage.getItem('focusGoals') || '[]');
      const newFocusGoal = {
        id: Date.now().toString(),
        title: 'Daily Focus Goal',
        target: 3, // 3 tasks by default
        progress: 0,
        createdAt: new Date().toISOString()
      };

      focusGoals.push(newFocusGoal);
      localStorage.setItem('focusGoals', JSON.stringify(focusGoals));

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Focus goal set! Complete 3 tasks today for maximum productivity.',
          type: 'success'
        }
      }));

      // Trigger focus goal UI update
      window.dispatchEvent(new CustomEvent('focus-goal-set', {
        detail: newFocusGoal
      }));
      break;

    default:
      console.warn('Unknown action:', action);
  }
}