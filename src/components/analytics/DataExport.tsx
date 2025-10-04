import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  CalendarIcon
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Calendar as CalendarIconLucide,
  Filter,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Webhook,
  Share,
  Eye,
  Trash2,
  Play,
  Pause,
  Copy,
  FileSpreadsheet,
  FileImage,
  Database,
  Zap,
  BarChart3
} from "lucide-react";
import {
  AnalyticsExport,
  ScheduledReport,
  DeliveryConfig,
  ScheduleConfig,
  AnalyticsTimeframe,
  DataSource
} from "@/types/analytics";
import { useExportData, useCreateReport } from "@/hooks/useAnalytics";

interface ExportJob {
  id: string;
  name: string;
  type: 'dashboard' | 'raw_data' | 'custom_query' | 'scheduled_report';
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize?: string;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

const mockExportJobs: ExportJob[] = [
  {
    id: 'export_1',
    name: 'Q3 Executive Summary',
    type: 'dashboard',
    format: 'pdf',
    status: 'completed',
    progress: 100,
    fileSize: '2.4 MB',
    downloadUrl: '#',
    createdAt: '2024-10-02T14:30:00Z',
    completedAt: '2024-10-02T14:32:15Z',
    expiresAt: '2024-10-09T14:30:00Z'
  },
  {
    id: 'export_2',
    name: 'Raw Productivity Data',
    type: 'raw_data',
    format: 'excel',
    status: 'processing',
    progress: 67,
    createdAt: '2024-10-02T15:45:00Z',
    expiresAt: '2024-10-09T15:45:00Z'
  },
  {
    id: 'export_3',
    name: 'Team Performance Analysis',
    type: 'custom_query',
    format: 'csv',
    status: 'failed',
    progress: 0,
    createdAt: '2024-10-02T13:20:00Z',
    expiresAt: '2024-10-09T13:20:00Z'
  }
];

const mockScheduledReports: ScheduledReport[] = [
  {
    id: 'report_1',
    name: 'Weekly Team Summary',
    description: 'Automated weekly team performance report sent every Monday',
    dashboard_id: 'dashboard_1',
    frequency: 'weekly',
    schedule_config: {
      frequency: 'weekly',
      time_of_day: '09:00',
      day_of_week: 1,
      timezone: 'America/New_York'
    },
    delivery_config: {
      email_recipients: ['team@company.com', 'manager@company.com'],
      slack_channels: ['#team-reports'],
      file_format: 'pdf',
      include_data: true,
      custom_message: 'Weekly team performance summary attached.'
    },
    is_active: true,
    next_run_at: '2024-10-07T09:00:00Z',
    last_run_at: '2024-09-30T09:00:00Z',
    created_at: '2024-09-01T00:00:00Z',
    updated_at: '2024-09-30T09:00:00Z'
  },
  {
    id: 'report_2',
    name: 'Monthly Executive Dashboard',
    description: 'Comprehensive monthly executive summary with KPIs and insights',
    dashboard_id: 'dashboard_2',
    frequency: 'monthly',
    schedule_config: {
      frequency: 'monthly',
      time_of_day: '08:00',
      day_of_month: 1,
      timezone: 'America/New_York'
    },
    delivery_config: {
      email_recipients: ['executives@company.com'],
      file_format: 'pdf',
      include_data: false
    },
    is_active: true,
    next_run_at: '2024-11-01T08:00:00Z',
    last_run_at: '2024-10-01T08:00:00Z',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-10-01T08:00:00Z'
  }
];

const dataSourceOptions: Array<{ value: DataSource; label: string }> = [
  { value: 'tasks', label: 'Tasks & Projects' },
  { value: 'goals', label: 'Goals & Objectives' },
  { value: 'habits', label: 'Habits & Routines' },
  { value: 'integrations', label: 'Integration Data' },
  { value: 'ai_usage', label: 'AI Usage Metrics' },
  { value: 'team', label: 'Team Collaboration' },
  { value: 'processes', label: 'Process Analytics' },
  { value: 'automation', label: 'Automation Metrics' }
];

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Formatted report with charts and tables' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Raw data with formulas and pivot tables' },
  { value: 'csv', label: 'CSV File', icon: Database, description: 'Comma-separated values for data analysis' },
  { value: 'json', label: 'JSON Data', icon: Database, description: 'Structured data for API integration' },
  { value: 'png', label: 'PNG Image', icon: FileImage, description: 'High-resolution chart images' }
];

export function DataExport() {
  const [activeTab, setActiveTab] = useState("export");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(mockExportJobs);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(mockScheduledReports);

  // Export form state
  const [exportForm, setExportForm] = useState({
    name: '',
    type: 'dashboard' as AnalyticsExport['type'],
    format: 'pdf' as AnalyticsExport['format'],
    timeframe: '30d' as AnalyticsTimeframe,
    dataSources: [] as DataSource[],
    includeCharts: true,
    includeRawData: false,
    customDateRange: {
      start: null as Date | null,
      end: null as Date | null
    }
  });

  // Report form state
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    dashboardId: '',
    frequency: 'weekly' as ScheduledReport['frequency'],
    timeOfDay: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    timezone: 'America/New_York',
    emailRecipients: [] as string[],
    slackChannels: [] as string[],
    fileFormat: 'pdf' as DeliveryConfig['file_format'],
    includeData: true,
    customMessage: ''
  });

  const exportData = useExportData();
  const createReport = useCreateReport();

  const handleCreateExport = async () => {
    try {
      const exportConfig = {
        name: exportForm.name,
        type: exportForm.type,
        format: exportForm.format,
        timeframe: exportForm.timeframe,
        custom_timeframe: exportForm.customDateRange.start && exportForm.customDateRange.end ? {
          start_date: exportForm.customDateRange.start.toISOString(),
          end_date: exportForm.customDateRange.end.toISOString()
        } : undefined,
        filters: {},
        requested_by: 'current_user',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await exportData.mutateAsync(exportConfig);

      // Add to export jobs list
      const newJob: ExportJob = {
        id: result.id,
        name: exportForm.name,
        type: exportForm.type,
        format: exportForm.format,
        status: 'processing',
        progress: 0,
        createdAt: result.created_at,
        expiresAt: result.expires_at
      };

      setExportJobs(prev => [newJob, ...prev]);
      setExportDialogOpen(false);

      // Reset form
      setExportForm({
        name: '',
        type: 'dashboard',
        format: 'pdf',
        timeframe: '30d',
        dataSources: [],
        includeCharts: true,
        includeRawData: false,
        customDateRange: { start: null, end: null }
      });
    } catch (error) {
      console.error('Failed to create export:', error);
    }
  };

  const handleCreateReport = async () => {
    try {
      const reportConfig = {
        name: reportForm.name,
        description: reportForm.description,
        dashboard_id: reportForm.dashboardId,
        frequency: reportForm.frequency,
        schedule_config: {
          frequency: reportForm.frequency,
          time_of_day: reportForm.timeOfDay,
          day_of_week: reportForm.dayOfWeek,
          day_of_month: reportForm.dayOfMonth,
          timezone: reportForm.timezone
        },
        delivery_config: {
          email_recipients: reportForm.emailRecipients,
          slack_channels: reportForm.slackChannels,
          file_format: reportForm.fileFormat,
          include_data: reportForm.includeData,
          custom_message: reportForm.customMessage
        },
        is_active: true,
        next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      await createReport.mutateAsync(reportConfig);
      setReportDialogOpen(false);

      // Reset form
      setReportForm({
        name: '',
        description: '',
        dashboardId: '',
        frequency: 'weekly',
        timeOfDay: '09:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        timezone: 'America/New_York',
        emailRecipients: [],
        slackChannels: [],
        fileFormat: 'pdf',
        includeData: true,
        customMessage: ''
      });
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    const formatOption = formatOptions.find(f => f.value === format);
    return formatOption ? formatOption.icon : FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Download className="h-6 w-6 text-blue-600" />
            Data Export & Report Generation
          </h2>
          <p className="text-muted-foreground">
            Export analytics data and create automated reports for stakeholders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            New Export
          </Button>
          <Button variant="outline" onClick={() => setReportDialogOpen(true)}>
            <CalendarIconLucide className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Data Exports</TabsTrigger>
          <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Export Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {/* Export Jobs */}
          <div className="space-y-4">
            {exportJobs.map((job) => {
              const FormatIcon = getFormatIcon(job.format);
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FormatIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{job.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {job.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="uppercase">
                              {job.format}
                            </Badge>
                            {job.fileSize && (
                              <span className="text-xs text-muted-foreground">{job.fileSize}</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusIcon(job.status)}
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      {job.status === 'processing' && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Processing...</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">{new Date(job.createdAt).toLocaleString()}</p>
                        </div>
                        {job.completedAt && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <p className="font-medium">{new Date(job.completedAt).toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Expires:</span>
                          <p className="font-medium">{new Date(job.expiresAt).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        {job.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {exportJobs.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Download className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No export jobs</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    Create your first data export to download analytics reports and raw data
                  </p>
                  <Button onClick={() => setExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Create Export
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Scheduled Reports */}
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <CalendarIconLucide className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.is_active ? "secondary" : "outline"}>
                        {report.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {report.frequency}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Schedule Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Next Run:</span>
                        <p className="font-medium">{new Date(report.next_run_at).toLocaleString()}</p>
                      </div>
                      {report.last_run_at && (
                        <div>
                          <span className="text-muted-foreground">Last Run:</span>
                          <p className="font-medium">{new Date(report.last_run_at).toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <p className="font-medium uppercase">{report.delivery_config.file_format}</p>
                      </div>
                    </div>

                    {/* Delivery Configuration */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">Delivery</h5>
                      <div className="flex flex-wrap gap-2">
                        {report.delivery_config.email_recipients.map((email) => (
                          <Badge key={email} variant="outline" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {email}
                          </Badge>
                        ))}
                        {report.delivery_config.slack_channels?.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            <Share className="h-3 w-3 mr-1" />
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        {report.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {scheduledReports.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIconLucide className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No scheduled reports</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    Set up automated reports to deliver analytics insights to your team regularly
                  </p>
                  <Button onClick={() => setReportDialogOpen(true)}>
                    <CalendarIconLucide className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Export Templates</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Pre-configured export templates for common reporting needs
              </p>
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Data Export</DialogTitle>
            <DialogDescription>
              Configure and generate custom analytics exports
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="export-name">Export Name</Label>
              <Input
                id="export-name"
                placeholder="Q3 2024 Analytics Report"
                value={exportForm.name}
                onChange={(e) => setExportForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Export Type</Label>
                <Select value={exportForm.type} onValueChange={(value: any) => setExportForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard Export</SelectItem>
                    <SelectItem value="raw_data">Raw Data</SelectItem>
                    <SelectItem value="custom_query">Custom Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>File Format</Label>
                <Select value={exportForm.format} onValueChange={(value: any) => setExportForm(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <format.icon className="h-4 w-4" />
                          {format.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Time Range</Label>
              <Select value={exportForm.timeframe} onValueChange={(value: any) => setExportForm(prev => ({ ...prev, timeframe: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Sources</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dataSourceOptions.map((source) => (
                  <div key={source.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source.value}`}
                      checked={exportForm.dataSources.includes(source.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExportForm(prev => ({
                            ...prev,
                            dataSources: [...prev.dataSources, source.value]
                          }));
                        } else {
                          setExportForm(prev => ({
                            ...prev,
                            dataSources: prev.dataSources.filter(ds => ds !== source.value)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`source-${source.value}`} className="text-sm">
                      {source.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={exportForm.includeCharts}
                  onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeCharts: checked as boolean }))}
                />
                <Label htmlFor="include-charts">Include Charts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-raw-data"
                  checked={exportForm.includeRawData}
                  onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeRawData: checked as boolean }))}
                />
                <Label htmlFor="include-raw-data">Include Raw Data</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExport} disabled={!exportForm.name || exportData.isPending}>
              {exportData.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Automated Report</DialogTitle>
            <DialogDescription>
              Set up recurring report delivery to stakeholders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Weekly Team Summary"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="report-frequency">Frequency</Label>
                <Select value={reportForm.frequency} onValueChange={(value: any) => setReportForm(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Describe what this report contains..."
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Time of Day</Label>
                <Input
                  type="time"
                  value={reportForm.timeOfDay}
                  onChange={(e) => setReportForm(prev => ({ ...prev, timeOfDay: e.target.value }))}
                />
              </div>
              {reportForm.frequency === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={reportForm.dayOfWeek.toString()} onValueChange={(value) => setReportForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {reportForm.frequency === 'monthly' && (
                <div>
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={reportForm.dayOfMonth}
                    onChange={(e) => setReportForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                  />
                </div>
              )}
              <div>
                <Label>File Format</Label>
                <Select value={reportForm.fileFormat} onValueChange={(value: any) => setReportForm(prev => ({ ...prev, fileFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Email Recipients</Label>
              <Input
                placeholder="user1@company.com, user2@company.com"
                value={reportForm.emailRecipients.join(', ')}
                onChange={(e) => setReportForm(prev => ({
                  ...prev,
                  emailRecipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                }))}
              />
            </div>

            <div>
              <Label htmlFor="custom-message">Custom Message (Optional)</Label>
              <Textarea
                id="custom-message"
                placeholder="Add a custom message to include with the report..."
                value={reportForm.customMessage}
                onChange={(e) => setReportForm(prev => ({ ...prev, customMessage: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-data"
                checked={reportForm.includeData}
                onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, includeData: checked as boolean }))}
              />
              <Label htmlFor="include-data">Include raw data in export</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={!reportForm.name || createReport.isPending}>
              {createReport.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CalendarIconLucide className="h-4 w-4 mr-2" />
                  Schedule Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}