import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  getStoredMetrics,
  clearStoredMetrics,
  calculatePerformanceScore,
  PERFORMANCE_BUDGETS,
  PerformanceMetrics,
  PerformanceRating,
} from '@/utils/performance/webVitals';
import { Activity, Zap, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    LCP: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
  });

  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadMetrics = () => {
      const stored = getStoredMetrics();
      setMetrics(stored);
      setScore(calculatePerformanceScore(stored));
    };

    loadMetrics();

    // Refresh metrics every 5 seconds
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: PerformanceRating | null) => {
    if (!rating) return 'bg-muted text-muted-foreground';
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getRatingIcon = (value: number | null, threshold: number) => {
    if (value === null) return <AlertCircle className="h-4 w-4" />;
    if (value <= threshold) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (value <= threshold * 2) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const formatMetric = (value: number | null, unit: string = 'ms') => {
    if (value === null) return 'N/A';
    if (unit === 'ms') return `${Math.round(value)}${unit}`;
    return value.toFixed(3);
  };

  const getMetricRating = (value: number | null, threshold: number): PerformanceRating | null => {
    if (value === null) return null;
    if (value <= threshold) return 'good';
    if (value <= threshold * 2) return 'needs-improvement';
    return 'poor';
  };

  const handleClearMetrics = () => {
    clearStoredMetrics();
    setMetrics({
      LCP: null,
      CLS: null,
      FCP: null,
      TTFB: null,
      INP: null,
    });
    setScore(0);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor Core Web Vitals and application performance metrics
          </p>
        </div>
        <Button onClick={handleClearMetrics} variant="outline">
          Clear Metrics
        </Button>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
          <CardDescription>
            Composite score based on Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{score}</span>
              <Badge className={score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                {score >= 80 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Poor'}
              </Badge>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              LCP - Largest Contentful Paint
            </CardTitle>
            <CardDescription>Loading performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.LCP)}
                </span>
                {getRatingIcon(metrics.LCP, PERFORMANCE_BUDGETS.LCP)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.LCP, PERFORMANCE_BUDGETS.LCP))}>
                {getMetricRating(metrics.LCP, PERFORMANCE_BUDGETS.LCP) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.LCP}ms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              INP - Interaction to Next Paint
            </CardTitle>
            <CardDescription>Responsiveness (replaces FID)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.INP)}
                </span>
                {getRatingIcon(metrics.INP, PERFORMANCE_BUDGETS.INP)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.INP, PERFORMANCE_BUDGETS.INP))}>
                {getMetricRating(metrics.INP, PERFORMANCE_BUDGETS.INP) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.INP}ms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              CLS - Cumulative Layout Shift
            </CardTitle>
            <CardDescription>Visual stability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.CLS, '')}
                </span>
                {getRatingIcon(metrics.CLS, PERFORMANCE_BUDGETS.CLS)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.CLS, PERFORMANCE_BUDGETS.CLS))}>
                {getMetricRating(metrics.CLS, PERFORMANCE_BUDGETS.CLS) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.CLS}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              FCP - First Contentful Paint
            </CardTitle>
            <CardDescription>Initial render</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.FCP)}
                </span>
                {getRatingIcon(metrics.FCP, PERFORMANCE_BUDGETS.FCP)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.FCP, PERFORMANCE_BUDGETS.FCP))}>
                {getMetricRating(metrics.FCP, PERFORMANCE_BUDGETS.FCP) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.FCP}ms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              TTFB - Time to First Byte
            </CardTitle>
            <CardDescription>Server response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.TTFB)}
                </span>
                {getRatingIcon(metrics.TTFB, PERFORMANCE_BUDGETS.TTFB)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.TTFB, PERFORMANCE_BUDGETS.TTFB))}>
                {getMetricRating(metrics.TTFB, PERFORMANCE_BUDGETS.TTFB) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.TTFB}ms
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              INP - Interaction to Next Paint
            </CardTitle>
            <CardDescription>Responsiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {formatMetric(metrics.INP)}
                </span>
                {getRatingIcon(metrics.INP, PERFORMANCE_BUDGETS.INP)}
              </div>
              <Badge className={getRatingColor(getMetricRating(metrics.INP, PERFORMANCE_BUDGETS.INP))}>
                {getMetricRating(metrics.INP, PERFORMANCE_BUDGETS.INP) || 'Not measured'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {PERFORMANCE_BUDGETS.INP}ms
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
