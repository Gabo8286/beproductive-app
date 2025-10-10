import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Square,
  Timer,
  Target,
  Coffee,
  CheckCircle,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  duration: number; // in minutes
  type: 'work' | 'break';
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
}

interface FocusModeSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export const OrganizedExecutionView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [productivityScore, setProductivityScore] = useState(85);
  const [distractionCount, setDistractionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const [settings, setSettings] = useState<FocusModeSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
    autoStartWork: false,
  });

  // Mock tasks for today - in real app, this would come from the daily goals
  const [todayTasks, setTodayTasks] = useState([
    { id: '1', title: 'Review project proposal', completed: false, estimated: 30 },
    { id: '2', title: 'Update documentation', completed: false, estimated: 45 },
    { id: '3', title: 'Team meeting preparation', completed: true, estimated: 20 },
    { id: '4', title: 'Code review', completed: false, estimated: 25 },
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('1');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            handleSessionComplete();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextSessionType = (): 'work' | 'break' => {
    if (!currentSession) return 'work';
    if (currentSession.type === 'work') {
      return sessionCount > 0 && sessionCount % settings.longBreakInterval === 0 ? 'break' : 'break';
    }
    return 'work';
  };

  const getNextSessionDuration = (): number => {
    const nextType = getNextSessionType();
    if (nextType === 'work') return settings.workDuration;

    const isLongBreak = sessionCount > 0 && sessionCount % settings.longBreakInterval === 0;
    return isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
  };

  const startSession = (taskId?: string) => {
    const selectedTask = todayTasks.find(t => t.id === (taskId || selectedTaskId));
    const sessionType = getNextSessionType();
    const duration = getNextSessionDuration();

    const newSession: FocusSession = {
      id: Date.now().toString(),
      taskId: sessionType === 'work' ? (taskId || selectedTaskId) : undefined,
      taskTitle: sessionType === 'work' ? (selectedTask?.title || 'Focus Session') : 'Break Time',
      duration,
      type: sessionType,
      startTime: new Date(),
      completed: false,
    };

    setCurrentSession(newSession);
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsPaused(false);

    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
    }
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession(null);
    setTimeLeft(settings.workDuration * 60);
  };

  const handleSessionComplete = () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
      };

      // Update productivity metrics
      if (currentSession.type === 'work') {
        setCompletedPomodoros(prev => prev + 1);

        // Update productivity score based on session completion
        setProductivityScore(prev => Math.min(100, prev + 2));
      }

      // In real app, save session to history
      console.log('Session completed:', completedSession);

      if (settings.soundEnabled) {
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // Ignore errors if audio fails
      }

      // Auto-start next session if enabled
      const nextType = getNextSessionType();
      const shouldAutoStart =
        (nextType === 'break' && settings.autoStartBreaks) ||
        (nextType === 'work' && settings.autoStartWork);

      if (shouldAutoStart) {
        setTimeout(() => startSession(), 1000);
      } else {
        setIsActive(false);
        setCurrentSession(null);
        setTimeLeft(getNextSessionDuration() * 60);
      }
    }
  };

  const toggleTask = (taskId: string) => {
    setTodayTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    const totalSeconds = currentSession.duration * 60;
    const elapsedSeconds = totalSeconds - timeLeft;
    return Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  };

  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalTasks = todayTasks.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white z-50 flex flex-col items-center justify-center">
        {/* Minimize Button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Minimize className="h-5 w-5" />
        </button>

        {/* Fullscreen Timer */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge
              variant="secondary"
              className={cn(
                "text-lg px-4 py-2",
                currentSession?.type === 'work' ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300"
              )}
            >
              {currentSession?.type === 'work' ? '🎯 Focus Session' : '☕ Break Time'}
            </Badge>
            <h1 className="text-6xl md:text-8xl font-mono font-bold tracking-tight">
              {formatTime(timeLeft)}
            </h1>
            <p className="text-xl text-gray-300">{currentSession?.taskTitle}</p>
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845a15.9155,15.9155 0 0,1 0,31.831a15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <path
                d="m18,2.0845a15.9155,15.9155 0 0,1 0,31.831a15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${getProgressPercentage()}, 100`}
                className="text-white"
              />
            </svg>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={pauseSession}
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
            <Button
              onClick={stopSession}
              variant="outline"
              size="lg"
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              <Square className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Organized Execution</h1>
        <p className="text-muted-foreground">
          Efficient 25-minute blocks with progress monitoring
        </p>
      </div>

      {/* Enhanced Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pomodoros</p>
                <p className="text-2xl font-bold">{completedPomodoros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Productivity</p>
                <p className="text-2xl font-bold">{productivityScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Focus Time</p>
                <p className="text-2xl font-bold">{Math.round((completedPomodoros * settings.workDuration) / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Distractions</p>
                <p className="text-2xl font-bold">{distractionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <Card className={cn(
            "transition-all duration-500",
            isActive && !isPaused ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200" : ""
          )}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {currentSession?.type === 'work' ? (
                  <Target className="h-6 w-6 text-blue-600" />
                ) : (
                  <Coffee className="h-6 w-6 text-green-600" />
                )}
                <CardTitle className="text-2xl">
                  {currentSession ? currentSession.taskTitle : 'Ready to Focus'}
                </CardTitle>
              </div>
              {currentSession && (
                <Badge
                  variant={currentSession.type === 'work' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {currentSession.type === 'work' ? 'Focus Session' : 'Break Time'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold mb-4 text-primary">
                  {formatTime(timeLeft)}
                </div>
                {currentSession && (
                  <Progress value={getProgressPercentage()} className="h-3 mb-4" />
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <Button
                    onClick={() => startSession()}
                    size="lg"
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Start Focus Session
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={pauseSession}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      onClick={stopSession}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      <Square className="h-5 w-5" />
                      Stop
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => setIsFullscreen(true)}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Maximize className="h-5 w-5" />
                  Fullscreen
                </Button>
              </div>

              {/* Distraction Counter (only show during active work sessions) */}
              {isActive && currentSession?.type === 'work' && (
                <div className="text-center">
                  <Button
                    onClick={() => {
                      setDistractionCount(prev => prev + 1);
                      setProductivityScore(prev => Math.max(0, prev - 3));
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Mark Distraction
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click if you got distracted during this session
                  </p>
                </div>
              )}

              {/* Next Session Info */}
              {!isActive && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Next: {getNextSessionType() === 'work' ? '🎯 Focus' : '☕ Break'} for {getNextSessionDuration()} minutes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Selection & Progress */}
        <div className="space-y-6">
          {/* Task Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedTaskId === task.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                    task.completed && "opacity-60"
                  )}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className={cn(
                          "w-4 h-4 rounded border-2 transition-colors",
                          task.completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <span className={cn(
                        "text-sm",
                        task.completed && "line-through"
                      )}>
                        {task.title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.estimated}m
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Duration</label>
                <div className="flex gap-2">
                  {[15, 25, 45, 60].map((duration) => (
                    <Button
                      key={duration}
                      variant={settings.workDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, workDuration: duration }))}
                    >
                      {duration}m
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Sound Notifications</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                >
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};