import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Zap,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Maximize2,
  Eye,
  EyeOff,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  AnalyticsDataset,
  AnalyticsTimeframe,
  DataPoint
} from "@/types/analytics";
import { useRealTimeMetrics, useMetricData } from "@/hooks/useAnalytics";

interface RealTimeAnalyticsProps {
  metricIds?: string[];
  defaultRefreshInterval?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

const generateMockRealTimeData = (previousData: DataPoint[] = []) => {
  const now = new Date();
  const newDataPoint: DataPoint = {
    timestamp: now.toISOString(),
    value: Math.random() * 100 + Math.sin(Date.now() / 10000) * 20 + 50,
    metadata: { source: 'real_time' }
  };

  // Keep only last 50 points for performance
  const updatedData = [...previousData, newDataPoint].slice(-50);
  return updatedData;
};

export function RealTimeAnalytics({
  metricIds = ['metric_1', 'metric_2', 'metric_3'],
  defaultRefreshInterval = 5000
}: RealTimeAnalyticsProps) {
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(defaultRefreshInterval);
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>('1d');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [realTimeData, setRealTimeData] = useState<Record<string, DataPoint[]>>({});
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>(
    metricIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
  );

  // Real-time data hook
  const { data: liveMetrics } = useRealTimeMetrics(
    metricIds,
    isLive ? refreshInterval : undefined
  );

  // Static data for comparison
  const { data: metric1Data } = useMetricData('metric_1', selectedTimeframe);
  const { data: metric2Data } = useMetricData('metric_2', selectedTimeframe);
  const { data: metric3Data } = useMetricData('metric_3', selectedTimeframe);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setRealTimeData(prevData => {
        const newData = { ...prevData };
        metricIds.forEach(metricId => {
          newData[metricId] = generateMockRealTimeData(prevData[metricId] || []);
        });
        return newData;
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval, metricIds]);

  const toggleMetricVisibility = (metricId: string) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentValue = (metricId: string) => {
    const data = realTimeData[metricId];
    return data && data.length > 0 ? data[data.length - 1].value : 0;
  };

  const getTrend = (metricId: string) => {
    const data = realTimeData[metricId];
    if (!data || data.length < 2) return 'stable';

    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    const change = ((current - previous) / previous) * 100;

    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const getChangePercentage = (metricId: string) => {
    const data = realTimeData[metricId];
    if (!data || data.length < 2) return 0;

    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return ((current - previous) / previous) * 100;
  };

  // Prepare combined chart data
  const combinedChartData = realTimeData[metricIds[0]]?.map((_, index) => {
    const dataPoint: any = {
      time: formatTimestamp(realTimeData[metricIds[0]][index].timestamp)
    };

    metricIds.forEach(metricId => {
      if (realTimeData[metricId] && realTimeData[metricId][index]) {
        dataPoint[metricId] = realTimeData[metricId][index].value.toFixed(2);
      }
    });

    return dataPoint;
  }) || [];

  // Prepare pie chart data
  const pieChartData = metricIds.map((metricId, index) => ({
    name: `Metric ${index + 1}`,
    value: getCurrentValue(metricId),
    color: COLORS[index % COLORS.length]
  }));

  const MetricCard = ({ metricId, index }: { metricId: string; index: number }) => {
    const currentValue = getCurrentValue(metricId);
    const trend = getTrend(metricId);
    const changePercentage = getChangePercentage(metricId);
    const isVisible = visibleMetrics[metricId];

    return (
      <Card className={`transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-50'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Metric {index + 1}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMetricVisibility(metricId)}
              className="h-6 w-6 p-0"
            >
              {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <div className={`h-4 w-4 ${
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
               trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
               <Minus className="h-4 w-4" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentValue.toFixed(1)}</div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={`text-xs ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}
            >
              {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs previous</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChart = () => {
    if (combinedChartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for real-time data...</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: combinedChartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metricIds.map((metricId, index) =>
                visibleMetrics[metricId] && (
                  <Area
                    key={metricId}
                    type="monotone"
                    dataKey={metricId}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                  />
                )
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metricIds.map((metricId, index) =>
                visibleMetrics[metricId] && (
                  <Bar
                    key={metricId}
                    dataKey={metricId}
                    fill={COLORS[index % COLORS.length]}
                  />
                )
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metricIds.map((metricId, index) =>
                visibleMetrics[metricId] && (
                  <Line
                    key={metricId}
                    type="monotone"
                    dataKey={metricId}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-600" />
            Real-Time Analytics
          </h2>
          <p className="text-muted-foreground">
            Live data visualization and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Line
                </div>
              </SelectItem>
              <SelectItem value="area">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Area
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Bar
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 second</SelectItem>
              <SelectItem value="5000">5 seconds</SelectItem>
              <SelectItem value="10000">10 seconds</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
              <SelectItem value="60000">1 minute</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={isLive ? "default" : "outline"}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {isLive ? 'Live' : 'Paused'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Refresh every {refreshInterval / 1000}s
        </div>
        <div className="text-sm text-muted-foreground">
          {combinedChartData.length} data points
        </div>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricIds.map((metricId, index) => (
          <MetricCard key={metricId} metricId={metricId} index={index} />
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="time-series" className="space-y-6">
        <TabsList>
          <TabsTrigger value="time-series">Time Series</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="time-series">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Real-Time Data Stream</CardTitle>
                  <CardDescription>
                    Live metrics visualization with {refreshInterval / 1000} second updates
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Current Values Distribution</CardTitle>
              <CardDescription>
                Proportional breakdown of current metric values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time vs Historical</CardTitle>
                <CardDescription>
                  Compare live data with historical trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="metric_1"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ReferenceLine
                      y={metric1Data?.data.aggregated_value}
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      label="Historical Avg"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time analytics performance stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Update Rate</span>
                    </div>
                    <span className="font-semibold">{1000 / refreshInterval} Hz</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Active Metrics</span>
                    </div>
                    <span className="font-semibold">
                      {Object.values(visibleMetrics).filter(Boolean).length}/{metricIds.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Data Retention</span>
                    </div>
                    <span className="font-semibold">50 points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Latency</span>
                    </div>
                    <span className="font-semibold">&lt; 100ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}