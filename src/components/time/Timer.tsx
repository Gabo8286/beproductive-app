import { useEffect, useState } from 'react';
import { useActiveTimer, useStopTimer, useTogglePause } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export function Timer() {
  const { data: activeTimer } = useActiveTimer();
  const stopTimer = useStopTimer();
  const togglePause = useTogglePause();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!activeTimer) {
      setElapsedTime(0);
      return;
    }

    // Calculate initial elapsed time
    const calculateElapsed = () => {
      const startTime = new Date(activeTimer.started_at).getTime();
      const now = Date.now();
      let elapsed = Math.floor((now - startTime) / 1000) - activeTimer.paused_duration;

      // If currently paused, subtract the current pause duration
      if (activeTimer.is_paused && activeTimer.paused_at) {
        const pausedTime = Math.floor((now - new Date(activeTimer.paused_at).getTime()) / 1000);
        elapsed -= pausedTime;
      }

      return Math.max(0, elapsed);
    };

    setElapsedTime(calculateElapsed());

    // Update every second only if not paused
    if (!activeTimer.is_paused) {
      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  if (!activeTimer) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg border-primary/20 bg-card/95 backdrop-blur z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{activeTimer.tasks?.title}</p>
            <p className="text-2xl font-mono font-bold tabular-nums">
              {formatTime(elapsedTime)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => togglePause.mutate()}
            disabled={togglePause.isPending}
          >
            {activeTimer.is_paused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => stopTimer.mutate()}
            disabled={stopTimer.isPending}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
