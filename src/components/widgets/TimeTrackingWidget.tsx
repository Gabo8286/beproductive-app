import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Play,
  Pause,
  Square,
  Timer,
  TrendingUp,
  Target,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/ai/LoadingSkeleton';

interface TimeSession {
  id: string;
  description: string;
  startTime: Date;
  duration: number;
  isActive: boolean;
  category: string;
  productivity_score?: number;
}

export const TimeTrackingWidget: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [todayStats, setTodayStats] = useState({
    totalTime: 25200000, // 7 hours in ms
    productivity: 8.2,
    sessionsCount: 5,
    focusTime: 18000000 // 5 hours in ms
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current session
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate an active session
        const mockSession: TimeSession = {
          id: 'session_1',
          description: 'Frontend development',
          startTime: new Date(Date.now() - 3600000), // 1 hour ago
          duration: 3600000,
          isActive: true,
          category: 'deep_work',
          productivity_score: 8.5
        };
        setCurrentSession(mockSession);
      } catch (err) {
        setError('Failed to load time tracking data');
        console.error('Error loading time tracking data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSession?.isActive) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - currentSession.startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentSession]);

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const toggleTimer = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        isActive: !currentSession.isActive
      });
    }
  };

  const stopSession = () => {
    setCurrentSession(null);
    setElapsedTime(0);
  };

  const productivityPercentage = (todayStats.productivity / 10) * 100;
  const focusTimePercentage = (todayStats.focusTime / todayStats.totalTime) * 100;

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton type="widget" />;
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Time Tracking</CardTitle>
        </div>
        <Link to="/time-tracking">
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Session */}
        {currentSession ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{currentSession.description}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {currentSession.category.replace('_', ' ')}
                </div>
              </div>
              {currentSession.isActive && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-2 w-2 bg-red-500 rounded-full"
                />
              )}
            </div>

            <div className="text-2xl font-mono font-bold text-center">
              {formatDuration(elapsedTime)}
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                size="sm"
                variant={currentSession.isActive ? "outline" : "default"}
                onClick={toggleTimer}
              >
                {currentSession.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button size="sm" variant="destructive" onClick={stopSession}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active session</p>
            <Link to="/time-tracking">
              <Button size="sm" className="mt-2">
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            </Link>
          </div>
        )}

        {/* Today's Stats */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Progress</span>
            <Badge variant="outline">{formatDuration(todayStats.totalTime)}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>Productivity</span>
              </div>
              <span className="font-medium">{todayStats.productivity}/10</span>
            </div>
            <Progress value={productivityPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3 text-blue-600" />
                <span>Focus Time</span>
              </div>
              <span className="font-medium">{Math.round(focusTimePercentage)}%</span>
            </div>
            <Progress value={focusTimePercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div>
              <div className="font-medium">{todayStats.sessionsCount}</div>
              <div className="text-muted-foreground text-xs">Sessions</div>
            </div>
            <div>
              <div className="font-medium">{formatDuration(todayStats.focusTime)}</div>
              <div className="text-muted-foreground text-xs">Deep Work</div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <Link to="/time-tracking">
          <Button variant="outline" size="sm" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};