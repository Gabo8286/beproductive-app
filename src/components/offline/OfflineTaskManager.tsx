import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  WifiOff,
  Plus,
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  Sync,
  Clock,
  AlertCircle,
  CheckSquare,
  Upload
} from 'lucide-react';
import { useOfflineTaskSync } from '@/hooks/useOfflineSync';
import { useMobile } from '@/hooks/useMobile';
import { TouchOptimizedButton, TouchOptimizedCard } from '@/components/mobile/TouchOptimizedButton';
import { useToast } from '@/hooks/use-toast';

interface OfflineTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export function OfflineTaskManager() {
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OfflineTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const
  });

  const { isMobile } = useMobile();
  const { toast } = useToast();
  const {
    isOnline,
    pendingCount,
    syncInProgress,
    createTask,
    updateTask,
    deleteTask,
    syncPendingActions,
    lastSyncTime
  } = useOfflineTaskSync();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('offlineTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage when tasks change
  useEffect(() => {
    localStorage.setItem('offlineTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    const task: OfflineTask = {
      id: `task_${Date.now()}_${Math.random()}`,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    };

    setTasks(prev => [task, ...prev]);

    // Queue for sync
    await createTask(task);

    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsAddDialogOpen(false);

    toast({
      title: "Task Created",
      description: isOnline ? "Task will be synced shortly" : "Task saved locally. Will sync when online.",
    });
  };

  const handleToggleComplete = async (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          updatedAt: Date.now(),
          syncStatus: 'pending' as const
        };

        // Queue for sync
        updateTask(taskId, { completed: updatedTask.completed });

        return updatedTask;
      }
      return task;
    }));
  };

  const handleEditTask = async (task: OfflineTask) => {
    if (!editingTask) return;

    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        const updatedTask = {
          ...t,
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          updatedAt: Date.now(),
          syncStatus: 'pending' as const
        };

        // Queue for sync
        updateTask(task.id, {
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority
        });

        return updatedTask;
      }
      return t;
    }));

    setEditingTask(null);
    toast({
      title: "Task Updated",
      description: isOnline ? "Changes will be synced shortly" : "Changes saved locally. Will sync when online.",
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    await deleteTask(taskId);

    toast({
      title: "Task Deleted",
      description: isOnline ? "Deletion will be synced shortly" : "Deletion saved locally. Will sync when online.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-600" />;
      default: return null;
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
            {!isOnline && <WifiOff className="h-4 w-4 text-red-600" />}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isOnline ? 'Connected' : 'Offline mode'} • {tasks.length} total tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <TouchOptimizedButton
              variant="outline"
              size="sm"
              onClick={syncPendingActions}
              disabled={syncInProgress || !isOnline}
            >
              <Sync className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
              {pendingCount}
            </TouchOptimizedButton>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <TouchOptimizedButton size="sm">
                <Plus className="h-4 w-4" />
                Add
              </TouchOptimizedButton>
            </DialogTrigger>
            <DialogContent className={isMobile ? "w-[90vw]" : ""}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your list. It will be saved locally and synced when online.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sync Status */}
      {(!isOnline || pendingCount > 0) && (
        <Card className={`${!isOnline ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isOnline ? (
                  <WifiOff className="h-4 w-4 text-red-600" />
                ) : (
                  <Upload className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">
                  {!isOnline ? 'Offline Mode' : `${pendingCount} changes pending sync`}
                </span>
              </div>
              {isOnline && pendingCount > 0 && (
                <TouchOptimizedButton
                  variant="outline"
                  size="sm"
                  onClick={syncPendingActions}
                  disabled={syncInProgress}
                >
                  <Sync className={`h-3 w-3 ${syncInProgress ? 'animate-spin' : ''}`} />
                  Sync Now
                </TouchOptimizedButton>
              )}
            </div>
            {lastSyncTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Tasks ({pendingTasks.length})</h2>
          {pendingTasks.map((task) => (
            <TouchOptimizedCard
              key={task.id}
              className="p-4 border rounded-lg"
              onPress={() => handleToggleComplete(task.id)}
              onLongPress={() => setEditingTask(task)}
            >
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getSyncStatusIcon(task.syncStatus)}
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <TouchOptimizedButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </TouchOptimizedButton>
                      <TouchOptimizedButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </TouchOptimizedButton>
                    </div>
                  </div>
                </div>
              </div>
            </TouchOptimizedCard>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Completed Tasks ({completedTasks.length})</h2>
          {completedTasks.map((task) => (
            <TouchOptimizedCard
              key={task.id}
              className="p-4 border rounded-lg bg-gray-50"
              onPress={() => handleToggleComplete(task.id)}
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm leading-tight line-through text-muted-foreground">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getSyncStatusIcon(task.syncStatus)}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Completed {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </TouchOptimizedCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first task to get started with your productivity journey
            </p>
            <TouchOptimizedButton onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </TouchOptimizedButton>
          </CardContent>
        </Card>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className={isMobile ? "w-[90vw]" : ""}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task. Changes will be synced when online.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Task description (optional)"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingTask && handleEditTask(editingTask)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}