import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Settings,
  Timer,
  Coffee,
  Target,
  Brain,
  Bell,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  Volume2,
  VolumeX,
  Plus,
  RotateCcw,
  Trophy,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay, isToday, subDays } from 'date-fns';

type TimerPhase = 'focus' | 'shortBreak' | 'longBreak' | 'paused' | 'idle';
type TimerStatus = 'running' | 'paused' | 'stopped';

interface PomodoroSession {
  id: string;
  task?: string;
  startTime: Date;
  endTime: Date;
  phase: TimerPhase;
  duration: number; // in minutes
  completed: boolean;
  notes?: string;
}

interface PomodoroSettings {
  focusTime: number; // in minutes
  shortBreakTime: number;
  longBreakTime: number;
  longBreakInterval: number; // every X sessions
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoal: number; // number of pomodoros
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
  dailyGoal: 8,
};

const PHASE_COLORS = {
  focus: 'bg-red-500',
  shortBreak: 'bg-green-500',
  longBreak: 'bg-blue-500',
  paused: 'bg-yellow-500',
  idle: 'bg-gray-500',
};

const PHASE_LABELS = {
  focus: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  paused: 'Paused',
  idle: 'Ready to Start',
};

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [status, setStatus] = useState<TimerStatus>('stopped');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showStats, setShowStats] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro_settings');
    const savedSessions = localStorage.getItem('pomodoro_sessions');
    const savedSessionCount = localStorage.getItem('pomodoro_session_count');

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
      })));
    }
    if (savedSessionCount) {
      setSessionCount(parseInt(savedSessionCount));
    }

    // Initialize audio
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save data when changed
  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('pomodoro_session_count', sessionCount.toString());
  }, [sessionCount]);

  // Timer logic
  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeLeft]);

  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to system notification sound
        console.log('Audio playback failed');
      });
    }
  }, [settings.soundEnabled]);

  const showNotification = useCallback((title: string, body: string) => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
          }
        });
      }
    }
  }, [settings.notificationsEnabled]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();

    const currentSession: PomodoroSession = {
      id: Date.now().toString(),
      task: currentTask || undefined,
      startTime: new Date(Date.now() - (getPhaseTime(phase) * 60 * 1000 - timeLeft * 1000)),
      endTime: new Date(),
      phase,
      duration: getPhaseTime(phase),
      completed: true,
      notes: sessionNotes,
    };

    setSessions(prev => [...prev, currentSession]);
    setSessionNotes('');

    if (phase === 'focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      showNotification('Focus session completed! 🎉', 'Time for a well-deserved break');
      toast.success('Focus session completed! 🎉');

      // Determine next break type
      const isLongBreakTime = newSessionCount % settings.longBreakInterval === 0;
      const nextPhase = isLongBreakTime ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setTimeLeft(getPhaseTime(nextPhase) * 60);

      if (settings.autoStartBreaks) {
        setStatus('running');
      } else {
        setStatus('stopped');
      }
    } else {
      showNotification('Break time over! 💪', 'Ready for another focus session?');
      toast.success('Break time over! Ready to focus?');

      setPhase('focus');
      setTimeLeft(settings.focusTime * 60);

      if (settings.autoStartPomodoros) {
        setStatus('running');
      } else {
        setStatus('stopped');
      }
    }
  }, [phase, timeLeft, sessionCount, settings, currentTask, sessionNotes, playNotificationSound, showNotification]);

  const getPhaseTime = (phaseType: TimerPhase): number => {
    switch (phaseType) {
      case 'focus': return settings.focusTime;
      case 'shortBreak': return settings.shortBreakTime;
      case 'longBreak': return settings.longBreakTime;
      default: return settings.focusTime;
    }
  };

  const startTimer = () => {
    if (phase === 'idle') {
      setPhase('focus');
      setTimeLeft(settings.focusTime * 60);
    }
    setStatus('running');
  };

  const pauseTimer = () => {
    setStatus('paused');
    setPhase('paused');
  };

  const stopTimer = () => {
    setStatus('stopped');
    setPhase('idle');
    setTimeLeft(settings.focusTime * 60);
    setCurrentTask('');
    setSessionNotes('');
  };

  const skipSession = () => {
    if (phase === 'focus') {
      const isLongBreakTime = (sessionCount + 1) % settings.longBreakInterval === 0;
      const nextPhase = isLongBreakTime ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setTimeLeft(getPhaseTime(nextPhase) * 60);
      setSessionCount(prev => prev + 1);
    } else {
      setPhase('focus');
      setTimeLeft(settings.focusTime * 60);
    }
    setStatus('stopped');
  };

  const resetTimer = () => {
    setTimeLeft(getPhaseTime(phase) * 60);
    setStatus('stopped');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = getPhaseTime(phase) * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getTodaysSessions = (): PomodoroSession[] => {
    return sessions.filter(session => isToday(session.startTime));
  };

  const getTodaysStats = () => {
    const todaySessions = getTodaysSessions();
    const focusSessions = todaySessions.filter(s => s.phase === 'focus');
    const totalFocusTime = focusSessions.reduce((total, session) => total + session.duration, 0);

    return {
      completedSessions: focusSessions.length,
      totalFocusTime: Math.round(totalFocusTime),
      goalProgress: (focusSessions.length / settings.dailyGoal) * 100,
      currentStreak: getCurrentStreak(),
    };
  };

  const getCurrentStreak = (): number => {
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);
      const daySessions = sessions.filter(s =>
        s.phase === 'focus' &&
        s.startTime >= dayStart &&
        s.startTime <= dayEnd
      );

      if (daySessions.length > 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const todaysStats = getTodaysStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
          <p className="text-muted-foreground">
            Stay focused with the proven Pomodoro Technique
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <SettingsDialog
              settings={settings}
              onSave={setSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden">
            <div className={cn(
              'absolute top-0 left-0 h-1 transition-all duration-1000',
              PHASE_COLORS[phase]
            )} style={{ width: `${getProgress()}%` }} />

            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  PHASE_COLORS[phase]
                )} />
                <CardTitle className="text-2xl">
                  {PHASE_LABELS[phase]}
                </CardTitle>
              </div>
              {currentTask && (
                <p className="text-lg text-muted-foreground">
                  Working on: <span className="font-medium">{currentTask}</span>
                </p>
              )}
            </CardHeader>

            <CardContent className="text-center space-y-6">
              {/* Large Timer Display */}
              <motion.div
                className="text-8xl font-mono font-bold"
                animate={{ scale: status === 'running' ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: status === 'running' ? Infinity : 0 }}
              >
                {formatTime(timeLeft)}
              </motion.div>

              {/* Session Counter */}
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Target className="w-4 h-4 mr-2" />
                  Session {sessionCount + 1}
                </Badge>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Coffee className="w-4 h-4 mr-2" />
                  Next: {sessionCount % settings.longBreakInterval === settings.longBreakInterval - 1 ? 'Long Break' : 'Short Break'}
                </Badge>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-4">
                {status === 'running' ? (
                  <Button size="lg" onClick={pauseTimer} className="h-14 px-8">
                    <Pause className="w-6 h-6 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={startTimer} className="h-14 px-8">
                    <Play className="w-6 h-6 mr-2" />
                    {phase === 'idle' ? 'Start Focus' : 'Resume'}
                  </Button>
                )}

                <Button variant="outline" size="lg" onClick={stopTimer} className="h-14 px-8">
                  <Square className="w-6 h-6 mr-2" />
                  Stop
                </Button>

                <Button variant="outline" size="lg" onClick={resetTimer} className="h-14 px-8">
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Reset
                </Button>

                <Button variant="outline" size="lg" onClick={skipSession} className="h-14 px-8">
                  <SkipForward className="w-6 h-6 mr-2" />
                  Skip
                </Button>
              </div>

              {/* Task Input */}
              <div className="max-w-md mx-auto">
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {currentTask ? 'Change Task' : 'Set Task'}
                    </Button>
                  </DialogTrigger>
                  <TaskDialog
                    currentTask={currentTask}
                    onSave={setCurrentTask}
                    onClose={() => setIsTaskDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Session Notes */}
          {(status !== 'stopped' && phase !== 'idle') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this session..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Sessions</span>
                <Badge variant="secondary">
                  {todaysStats.completedSessions} / {settings.dailyGoal}
                </Badge>
              </div>

              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(todaysStats.goalProgress, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{todaysStats.totalFocusTime}m</div>
                  <div className="text-xs text-muted-foreground">Focus Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    {todaysStats.currentStreak}
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">{sessions.filter(s => s.phase === 'focus').length}</div>
                        <div className="text-xs text-muted-foreground">Total Sessions</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {Math.round(sessions.filter(s => s.phase === 'focus').reduce((total, s) => total + s.duration, 0) / 60)}h
                        </div>
                        <div className="text-xs text-muted-foreground">Total Focus</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recent Sessions</div>
                      {getTodaysSessions().slice(-3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between text-sm">
                          <span>{session.task || 'Untitled'}</span>
                          <span className="text-muted-foreground">
                            {format(session.startTime, 'HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setPhase('focus');
                  setTimeLeft(settings.focusTime * 60);
                  setStatus('stopped');
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                Start Focus Session
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setPhase('shortBreak');
                  setTimeLeft(settings.shortBreakTime * 60);
                  setStatus('stopped');
                }}
              >
                <Coffee className="w-4 h-4 mr-2" />
                Take Short Break
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setPhase('longBreak');
                  setTimeLeft(settings.longBreakTime * 60);
                  setStatus('stopped');
                }}
              >
                <Brain className="w-4 h-4 mr-2" />
                Take Long Break
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface SettingsDialogProps {
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onClose: () => void;
}

function SettingsDialog({ settings, onSave, onClose }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
    toast.success('Settings saved successfully');
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Pomodoro Settings</DialogTitle>
        <DialogDescription>
          Customize your Pomodoro timer to fit your workflow
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Timer Durations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Timer Durations</h4>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="focusTime">Focus Time (min)</Label>
              <Input
                id="focusTime"
                type="number"
                min="1"
                max="60"
                value={localSettings.focusTime}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  focusTime: parseInt(e.target.value) || 25
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortBreak">Short Break (min)</Label>
              <Input
                id="shortBreak"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakTime}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  shortBreakTime: parseInt(e.target.value) || 5
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBreak">Long Break (min)</Label>
              <Input
                id="longBreak"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakTime}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  longBreakTime: parseInt(e.target.value) || 15
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longBreakInterval">Long Break Interval</Label>
            <Select
              value={localSettings.longBreakInterval.toString()}
              onValueChange={(value) => setLocalSettings({
                ...localSettings,
                longBreakInterval: parseInt(value)
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Every 2 sessions</SelectItem>
                <SelectItem value="3">Every 3 sessions</SelectItem>
                <SelectItem value="4">Every 4 sessions</SelectItem>
                <SelectItem value="5">Every 5 sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auto-start Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Auto-start</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoStartBreaks">Auto-start breaks</Label>
            <Switch
              id="autoStartBreaks"
              checked={localSettings.autoStartBreaks}
              onCheckedChange={(checked) => setLocalSettings({
                ...localSettings,
                autoStartBreaks: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoStartPomodoros">Auto-start pomodoros</Label>
            <Switch
              id="autoStartPomodoros"
              checked={localSettings.autoStartPomodoros}
              onCheckedChange={(checked) => setLocalSettings({
                ...localSettings,
                autoStartPomodoros: checked
              })}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notifications</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="soundEnabled">Sound notifications</Label>
            <Switch
              id="soundEnabled"
              checked={localSettings.soundEnabled}
              onCheckedChange={(checked) => setLocalSettings({
                ...localSettings,
                soundEnabled: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Browser notifications</Label>
            <Switch
              id="notifications"
              checked={localSettings.notificationsEnabled}
              onCheckedChange={(checked) => setLocalSettings({
                ...localSettings,
                notificationsEnabled: checked
              })}
            />
          </div>
        </div>

        {/* Daily Goal */}
        <div className="space-y-2">
          <Label htmlFor="dailyGoal">Daily Pomodoro Goal</Label>
          <Input
            id="dailyGoal"
            type="number"
            min="1"
            max="20"
            value={localSettings.dailyGoal}
            onChange={(e) => setLocalSettings({
              ...localSettings,
              dailyGoal: parseInt(e.target.value) || 8
            })}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

interface TaskDialogProps {
  currentTask: string;
  onSave: (task: string) => void;
  onClose: () => void;
}

function TaskDialog({ currentTask, onSave, onClose }: TaskDialogProps) {
  const [task, setTask] = useState(currentTask);

  const handleSave = () => {
    onSave(task);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Set Focus Task</DialogTitle>
        <DialogDescription>
          What would you like to focus on during this session?
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task">Task Description</Label>
          <Input
            id="task"
            placeholder="e.g., Write project proposal, Study for exam..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Set Task
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}