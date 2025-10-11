import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEnergyTracking } from '@/utils/energyTracking';
import type { EnergyLevel, EnergyForecast, EnergyPattern } from '@/utils/energyTracking';
import {
  Battery,
  TrendingUp,
  TrendingDown,
  Brain,
  Heart,
  Zap,
  Clock,
  AlertTriangle,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface EnergyLevelWidgetProps {
  className?: string;
}

const getEnergyColor = (level: number) => {
  if (level >= 70) return 'text-green-600 dark:text-green-400';
  if (level >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getEnergyIcon = (level: number) => {
  if (level >= 70) return <Zap className="h-4 w-4" />;
  if (level >= 40) return <Battery className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
};

const getTrendIcon = (current: number, previous: number) => {
  if (current > previous + 5) return <ArrowUp className="h-3 w-3 text-green-500" />;
  if (current < previous - 5) return <ArrowDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-500" />;
};

export const EnergyLevelWidget: React.FC<EnergyLevelWidgetProps> = ({
  className = ''
}) => {
  const { getCurrentLevel, getForecast, getHistory, getPatterns } = useEnergyTracking();

  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel | null>(null);
  const [forecast, setForecast] = useState<EnergyForecast | null>(null);
  const [patterns, setPatterns] = useState<EnergyPattern[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<EnergyForecast['timeframe']>('next-hour');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEnergyData = async () => {
      setIsLoading(true);

      try {
        const current = getCurrentLevel();
        const nextHourForecast = getForecast(selectedTimeframe);
        const energyPatterns = getPatterns();

        setCurrentEnergy(current);
        setForecast(nextHourForecast);
        setPatterns(energyPatterns);
      } catch (error) {
        console.warn('Failed to load energy data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnergyData();

    // Refresh every 5 minutes
    const interval = setInterval(loadEnergyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeframe, getCurrentLevel, getForecast, getPatterns]);

  const handleTimeframeChange = (timeframe: EnergyForecast['timeframe']) => {
    setSelectedTimeframe(timeframe);
  };

  const getPreviousEnergyLevel = (): number => {
    const history = getHistory(1);
    if (history.length >= 2) {
      return history[history.length - 2].levels.overall;
    }
    return currentEnergy?.overall || 50;
  };

  const getEnergyBreakdown = () => {
    if (!currentEnergy) return null;

    return [
      { label: 'Physical', value: currentEnergy.physical, icon: <Heart className="h-3 w-3" /> },
      { label: 'Mental', value: currentEnergy.mental, icon: <Brain className="h-3 w-3" /> },
      { label: 'Emotional', value: currentEnergy.emotional, icon: <Star className="h-3 w-3" /> }
    ];
  };

  const getNextEnergyEvent = () => {
    const circadianPattern = patterns.find(p => p.type === 'circadian');
    if (!circadianPattern) return null;

    const now = new Date();
    const currentHour = now.getHours();

    // Find next peak or low period
    const allPeriods = [
      ...circadianPattern.peakTimes.map(p => ({ ...p, type: 'peak' })),
      ...circadianPattern.lowTimes.map(p => ({ ...p, type: 'low' }))
    ];

    const nextPeriod = allPeriods.find(period => {
      const periodHour = parseInt(period.start.split(':')[0]);
      return periodHour > currentHour;
    }) || allPeriods[0]; // Wrap to tomorrow

    return nextPeriod;
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Battery className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-card-foreground">Energy Levels</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-muted/50 h-16 rounded-lg animate-pulse" />
          <div className="bg-muted/30 h-4 rounded animate-pulse" />
          <div className="bg-muted/30 h-4 rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (!currentEnergy) {
    return (
      <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-muted rounded-lg">
            <Battery className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-card-foreground">Energy Levels</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No energy data available yet. Keep working and we'll start tracking your patterns!
          </p>
        </div>
      </div>
    );
  }

  const energyBreakdown = getEnergyBreakdown();
  const previousLevel = getPreviousEnergyLevel();
  const nextEvent = getNextEnergyEvent();

  return (
    <div className={`bg-card rounded-2xl p-6 border border-border/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getEnergyIcon(currentEnergy.overall)}
          </div>
          <h3 className="font-medium text-card-foreground">Energy Levels</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(currentEnergy.overall, previousLevel)}
          <Badge variant="secondary" className="text-xs">
            {Math.round(currentEnergy.confidence * 100)}% confidence
          </Badge>
        </div>
      </div>

      {/* Overall Energy Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-card-foreground">Overall Energy</span>
          <span className={`text-lg font-bold ${getEnergyColor(currentEnergy.overall)}`}>
            {Math.round(currentEnergy.overall)}%
          </span>
        </div>
        <Progress
          value={currentEnergy.overall}
          className="h-3"
        />
      </div>

      {/* Energy Breakdown */}
      {energyBreakdown && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-card-foreground mb-3">Energy Breakdown</h4>
          <div className="grid grid-cols-3 gap-3">
            {energyBreakdown.map((item) => (
              <div key={item.label} className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {item.icon}
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <div className={`text-sm font-medium ${getEnergyColor(item.value)}`}>
                  {Math.round(item.value)}%
                </div>
                <Progress value={item.value} className="h-1 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-card-foreground">Energy Forecast</h4>
          <div className="flex space-x-1">
            {(['next-hour', 'next-3-hours', 'tomorrow'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                size="sm"
                variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                onClick={() => handleTimeframeChange(timeframe)}
                className="text-xs h-6 px-2"
              >
                {timeframe === 'next-hour' ? '1H' :
                 timeframe === 'next-3-hours' ? '3H' :
                 'Tomorrow'}
              </Button>
            ))}
          </div>
        </div>

        {forecast && (
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Predicted Level</span>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${getEnergyColor(forecast.predictedLevel)}`}>
                  {forecast.predictedLevel}%
                </span>
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            {forecast.recommendations.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 {forecast.recommendations[0]}
                </p>
              </div>
            )}

            {forecast.optimalTaskTypes.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {forecast.optimalTaskTypes.slice(0, 2).map((taskType, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {taskType}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Energy Event */}
      {nextEvent && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-card-foreground mb-2">Next Energy Event</h4>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {nextEvent.type === 'peak' ? '📈' : '📉'}
              {nextEvent.type === 'peak' ? 'Energy boost' : 'Low energy period'}
              around {nextEvent.start}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: {currentEnergy.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>{patterns.length} patterns detected</span>
        </div>
      </div>
    </div>
  );
};