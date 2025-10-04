import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSyncTime: number | null;
}

interface OfflineSyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  syncInterval?: number;
  enableAutoSync?: boolean;
}

export function useOfflineSync({
  maxRetries = 3,
  retryDelay = 1000,
  syncInterval = 30000,
  enableAutoSync = true,
}: OfflineSyncOptions = {}) {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingActions: [],
    syncInProgress: false,
    lastSyncTime: null,
  });

  const { toast } = useToast();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const dbRef = useRef<IDBDatabase | null>(null);

  // Initialize IndexedDB for offline storage
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open('offlineSync', 1);

        request.onerror = () => {
          console.error('Failed to open IndexedDB');
        };

        request.onsuccess = () => {
          dbRef.current = request.result;
          loadPendingActions();
        };

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('actions')) {
            const store = db.createObjectStore('actions', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('resource', 'resource', { unique: false });
          }
        };
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  // Load pending actions from IndexedDB
  const loadPendingActions = useCallback(async () => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const request = store.getAll();

      request.onsuccess = () => {
        const actions = request.result || [];
        setState(prev => ({
          ...prev,
          pendingActions: actions.sort((a, b) => a.timestamp - b.timestamp),
        }));
      };
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }, []);

  // Save action to IndexedDB
  const saveActionToDB = useCallback(async (action: OfflineAction) => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      await store.put(action);
    } catch (error) {
      console.error('Failed to save action to DB:', error);
    }
  }, []);

  // Remove action from IndexedDB
  const removeActionFromDB = useCallback(async (actionId: string) => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      await store.delete(actionId);
    } catch (error) {
      console.error('Failed to remove action from DB:', error);
    }
  }, []);

  // Queue offline action
  const queueAction = useCallback(
    async (type: OfflineAction['type'], resource: string, data: any) => {
      const action: OfflineAction = {
        id: `${type}_${resource}_${Date.now()}_${Math.random()}`,
        type,
        resource,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries,
      };

      await saveActionToDB(action);

      setState(prev => ({
        ...prev,
        pendingActions: [...prev.pendingActions, action],
      }));

      if (state.isOnline && enableAutoSync) {
        syncPendingActions();
      }

      return action.id;
    },
    [maxRetries, saveActionToDB, state.isOnline, enableAutoSync]
  );

  // Sync pending actions to server
  const syncPendingActions = useCallback(async () => {
    if (state.syncInProgress || !state.isOnline || state.pendingActions.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, syncInProgress: true }));

    const actionsToSync = [...state.pendingActions];
    const succeededActions: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of actionsToSync) {
      try {
        // Simulate API call - replace with actual API logic
        const success = await syncActionToServer(action);

        if (success) {
          succeededActions.push(action.id);
          await removeActionFromDB(action.id);
        } else {
          const updatedAction = {
            ...action,
            retryCount: action.retryCount + 1,
          };

          if (updatedAction.retryCount <= action.maxRetries) {
            failedActions.push(updatedAction);
            await saveActionToDB(updatedAction);
          } else {
            // Max retries reached, remove action
            await removeActionFromDB(action.id);
            toast({
              title: "Sync Failed",
              description: `Failed to sync ${action.type} action for ${action.resource} after ${action.maxRetries} retries.`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Sync error:', error);
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
        };

        if (updatedAction.retryCount <= action.maxRetries) {
          failedActions.push(updatedAction);
          await saveActionToDB(updatedAction);
        } else {
          await removeActionFromDB(action.id);
        }
      }

      // Add delay between requests to avoid overwhelming the server
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay / 10));
      }
    }

    setState(prev => ({
      ...prev,
      pendingActions: failedActions,
      syncInProgress: false,
      lastSyncTime: Date.now(),
    }));

    if (succeededActions.length > 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${succeededActions.length} action(s).`,
      });
    }

    if (failedActions.length > 0 && enableAutoSync) {
      // Schedule retry
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingActions();
      }, retryDelay);
    }
  }, [
    state.syncInProgress,
    state.isOnline,
    state.pendingActions,
    removeActionFromDB,
    saveActionToDB,
    retryDelay,
    enableAutoSync,
    toast,
  ]);

  // Simulate server sync - replace with actual API calls
  const syncActionToServer = async (action: OfflineAction): Promise<boolean> => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate 90% success rate
    return Math.random() > 0.1;
  };

  // Clear all pending actions
  const clearPendingActions = useCallback(async () => {
    if (!dbRef.current) return;

    try {
      const transaction = dbRef.current.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      await store.clear();

      setState(prev => ({
        ...prev,
        pendingActions: [],
      }));

      toast({
        title: "Actions Cleared",
        description: "All pending offline actions have been cleared.",
      });
    } catch (error) {
      console.error('Failed to clear actions:', error);
    }
  }, [toast]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (enableAutoSync) {
        syncPendingActions();
      }
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing pending changes...",
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Offline Mode",
        description: "You're now offline. Changes will be synced when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [enableAutoSync, syncPendingActions, toast]);

  // Auto-sync interval
  useEffect(() => {
    if (!enableAutoSync || !state.isOnline) return;

    const interval = setInterval(() => {
      if (state.pendingActions.length > 0) {
        syncPendingActions();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [enableAutoSync, state.isOnline, state.pendingActions.length, syncInterval, syncPendingActions]);

  return {
    isOnline: state.isOnline,
    pendingActions: state.pendingActions,
    syncInProgress: state.syncInProgress,
    lastSyncTime: state.lastSyncTime,
    queueAction,
    syncPendingActions,
    clearPendingActions,
    pendingCount: state.pendingActions.length,
  };
}

// Higher-order hook for specific resource types
export function useOfflineTaskSync() {
  const sync = useOfflineSync();

  const createTask = useCallback(
    async (taskData: any) => {
      return sync.queueAction('CREATE', 'tasks', taskData);
    },
    [sync]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: any) => {
      return sync.queueAction('UPDATE', 'tasks', { id: taskId, ...updates });
    },
    [sync]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      return sync.queueAction('DELETE', 'tasks', { id: taskId });
    },
    [sync]
  );

  return {
    ...sync,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useOfflineGoalSync() {
  const sync = useOfflineSync();

  const createGoal = useCallback(
    async (goalData: any) => {
      return sync.queueAction('CREATE', 'goals', goalData);
    },
    [sync]
  );

  const updateGoal = useCallback(
    async (goalId: string, updates: any) => {
      return sync.queueAction('UPDATE', 'goals', { id: goalId, ...updates });
    },
    [sync]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      return sync.queueAction('DELETE', 'goals', { id: goalId });
    },
    [sync]
  );

  return {
    ...sync,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}