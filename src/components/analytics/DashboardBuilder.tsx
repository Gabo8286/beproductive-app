import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  LayoutDashboard,
  Plus,
  Settings,
  Save,
  Eye,
  Share,
  Copy,
  Trash2,
  Move,
  Maximize2,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  RefreshCw,
  Filter,
  Palette,
  Grid,
  Monitor,
} from "lucide-react";
import {
  CustomDashboard,
  DashboardWidget,
  WidgetPosition,
  VisualizationType,
  AnalyticsTimeframe,
  DataSource,
} from "@/types/analytics";
import {
  useAnalyticsMetrics,
  useCreateDashboard,
  useUpdateDashboard,
} from "@/hooks/useAnalytics";

interface DashboardBuilderProps {
  dashboard?: CustomDashboard;
  onSave?: (dashboard: CustomDashboard) => void;
  onCancel?: () => void;
}

const widgetTypes: Array<{
  type: VisualizationType;
  icon: any;
  label: string;
  description: string;
}> = [
  {
    type: "metric_card",
    icon: Target,
    label: "Metric Card",
    description: "Display a single key metric",
  },
  {
    type: "line",
    icon: LineChart,
    label: "Line Chart",
    description: "Show trends over time",
  },
  {
    type: "bar",
    icon: BarChart3,
    label: "Bar Chart",
    description: "Compare values across categories",
  },
  {
    type: "pie",
    icon: PieChart,
    label: "Pie Chart",
    description: "Show proportional data",
  },
  {
    type: "area",
    icon: TrendingUp,
    label: "Area Chart",
    description: "Visualize cumulative data",
  },
  {
    type: "gauge",
    icon: Target,
    label: "Gauge",
    description: "Display progress towards goals",
  },
  {
    type: "table",
    icon: Grid,
    label: "Data Table",
    description: "Show detailed tabular data",
  },
];

const timeframeOptions: Array<{ value: AnalyticsTimeframe; label: string }> = [
  { value: "1d", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

const colorSchemes = [
  {
    name: "Default",
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
  },
  {
    name: "Ocean",
    colors: ["#0EA5E9", "#06B6D4", "#10B981", "#34D399", "#60A5FA"],
  },
  {
    name: "Sunset",
    colors: ["#F97316", "#EF4444", "#F59E0B", "#FBBF24", "#FCD34D"],
  },
  {
    name: "Purple",
    colors: ["#8B5CF6", "#A855F7", "#C084FC", "#DDD6FE", "#EDE9FE"],
  },
  {
    name: "Monochrome",
    colors: ["#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6"],
  },
];

export function DashboardBuilder({
  dashboard,
  onSave,
  onCancel,
}: DashboardBuilderProps) {
  const [editingDashboard, setEditingDashboard] = useState<CustomDashboard>(
    dashboard || {
      id: "",
      name: "New Dashboard",
      description: "",
      user_id: "current_user",
      is_public: false,
      is_template: false,
      layout: {
        columns: 12,
        rows: 8,
        gap: 16,
        responsive_breakpoints: { mobile: 768, tablet: 1024, desktop: 1440 },
      },
      widgets: [],
      filters: [],
      refresh_interval: 300,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shared_with: [],
      tags: [],
    },
  );

  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(
    null,
  );
  const [widgetConfigOpen, setWidgetConfigOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("layout");

  const { data: metricsResponse } = useAnalyticsMetrics();
  const createDashboard = useCreateDashboard();
  const updateDashboard = useUpdateDashboard();

  const metrics = metricsResponse?.data || [];

  const handleAddWidget = (type: VisualizationType) => {
    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      position: {
        x: 0,
        y: 0,
        width: type === "metric_card" ? 3 : 6,
        height: type === "metric_card" ? 2 : 4,
      },
      data_config: {
        metric_ids: [],
        timeframe: "30d",
        aggregation: "avg",
      },
      display_config: {
        colors: colorSchemes[0].colors,
        show_legend: true,
        show_grid: true,
        show_axes: true,
        show_values: true,
        show_trend: false,
        decimal_places: 2,
        theme: "light",
        font_size: "medium",
      },
      filters: [],
      is_real_time: false,
    };

    // Find available position
    const usedPositions = editingDashboard.widgets.map((w) => w.position);
    let x = 0,
      y = 0;
    let positionFound = false;

    for (
      let row = 0;
      row < editingDashboard.layout.rows && !positionFound;
      row++
    ) {
      for (
        let col = 0;
        col <= editingDashboard.layout.columns - newWidget.position.width;
        col++
      ) {
        const position = {
          x: col,
          y: row,
          width: newWidget.position.width,
          height: newWidget.position.height,
        };
        const overlaps = usedPositions.some(
          (pos) =>
            position.x < pos.x + pos.width &&
            position.x + position.width > pos.x &&
            position.y < pos.y + pos.height &&
            position.y + position.height > pos.y,
        );

        if (!overlaps) {
          x = col;
          y = row;
          positionFound = true;
          break;
        }
      }
    }

    newWidget.position.x = x;
    newWidget.position.y = y;

    setEditingDashboard((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    setSelectedWidget(newWidget);
    setWidgetConfigOpen(true);
  };

  const handleWidgetUpdate = (updatedWidget: DashboardWidget) => {
    setEditingDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w,
      ),
    }));
    setSelectedWidget(updatedWidget);
  };

  const handleWidgetDelete = (widgetId: string) => {
    setEditingDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
    }));
    setSelectedWidget(null);
    setWidgetConfigOpen(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const widgets = Array.from(editingDashboard.widgets);
    const [reorderedWidget] = widgets.splice(result.source.index, 1);
    widgets.splice(result.destination.index, 0, reorderedWidget);

    setEditingDashboard((prev) => ({ ...prev, widgets }));
  };

  const handleSave = async () => {
    try {
      if (dashboard?.id) {
        await updateDashboard.mutateAsync({
          id: dashboard.id,
          updates: {
            ...editingDashboard,
            updated_at: new Date().toISOString(),
          },
        });
      } else {
        const { id, created_at, updated_at, ...dashboardData } =
          editingDashboard;
        await createDashboard.mutateAsync(dashboardData);
      }
      onSave?.(editingDashboard);
    } catch (error) {
      console.error("Failed to save dashboard:", error);
    }
  };

  const GridLayout = () => (
    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-96">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${editingDashboard.layout.columns}, 1fr)`,
          gridTemplateRows: `repeat(${editingDashboard.layout.rows}, minmax(60px, 1fr))`,
        }}
      >
        {editingDashboard.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`
              border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
              ${
                selectedWidget?.id === widget.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
            style={{
              gridColumn: `${widget.position.x + 1} / span ${widget.position.width}`,
              gridRow: `${widget.position.y + 1} / span ${widget.position.height}`,
            }}
            onClick={() => {
              setSelectedWidget(widget);
              setWidgetConfigOpen(true);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm truncate">{widget.title}</h4>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {widget.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWidgetDelete(widget.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {widget.data_config.metric_ids.length > 0
                ? `${widget.data_config.metric_ids.length} metrics`
                : "No metrics configured"}
            </div>

            {/* Widget Type Icon */}
            <div className="flex items-center justify-center h-16 text-gray-400">
              {widgetTypes.find((wt) => wt.type === widget.type)?.icon && (
                <div className="text-2xl">
                  {(() => {
                    const IconComponent = widgetTypes.find(
                      (wt) => wt.type === widget.type,
                    )?.icon;
                    return IconComponent ? (
                      <IconComponent className="h-8 w-8" />
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}

        {editingDashboard.widgets.length === 0 && (
          <div className="col-span-full row-span-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Add widgets to start building your dashboard
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            Dashboard Builder
          </h2>
          <p className="text-muted-foreground">
            Create custom analytics dashboards with drag-and-drop widgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createDashboard.isPending || updateDashboard.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createDashboard.isPending || updateDashboard.isPending
              ? "Saving..."
              : "Save Dashboard"}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="layout">Layout & Widgets</TabsTrigger>
            <TabsTrigger value="settings">Dashboard Settings</TabsTrigger>
            <TabsTrigger value="sharing">Sharing & Access</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Widget Palette */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Widget Library</CardTitle>
                    <CardDescription>
                      Drag widgets to add them to your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {widgetTypes.map((widgetType) => (
                        <Button
                          key={widgetType.type}
                          variant="outline"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => handleAddWidget(widgetType.type)}
                        >
                          <div className="flex items-center gap-3">
                            <widgetType.icon className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">
                                {widgetType.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {widgetType.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard Grid */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Dashboard Layout
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Grid className="h-4 w-4" />
                        {editingDashboard.layout.columns} ×{" "}
                        {editingDashboard.layout.rows}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GridLayout />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Configuration</CardTitle>
                <CardDescription>
                  Configure dashboard properties and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dashboard-name">Dashboard Name</Label>
                    <Input
                      id="dashboard-name"
                      value={editingDashboard.name}
                      onChange={(e) =>
                        setEditingDashboard((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="refresh-interval">
                      Refresh Interval (seconds)
                    </Label>
                    <Select
                      value={editingDashboard.refresh_interval.toString()}
                      onValueChange={(value) =>
                        setEditingDashboard((prev) => ({
                          ...prev,
                          refresh_interval: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                        <SelectItem value="1800">30 minutes</SelectItem>
                        <SelectItem value="3600">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dashboard-description">Description</Label>
                  <Textarea
                    id="dashboard-description"
                    value={editingDashboard.description}
                    onChange={(e) =>
                      setEditingDashboard((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Grid Layout</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="grid-columns">Columns</Label>
                      <Input
                        id="grid-columns"
                        type="number"
                        min="6"
                        max="24"
                        value={editingDashboard.layout.columns}
                        onChange={(e) =>
                          setEditingDashboard((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              columns: parseInt(e.target.value) || 12,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="grid-rows">Rows</Label>
                      <Input
                        id="grid-rows"
                        type="number"
                        min="4"
                        max="20"
                        value={editingDashboard.layout.rows}
                        onChange={(e) =>
                          setEditingDashboard((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              rows: parseInt(e.target.value) || 8,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="grid-gap">Gap (px)</Label>
                      <Input
                        id="grid-gap"
                        type="number"
                        min="8"
                        max="32"
                        value={editingDashboard.layout.gap}
                        onChange={(e) =>
                          setEditingDashboard((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              gap: parseInt(e.target.value) || 16,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sharing & Access Control</CardTitle>
                <CardDescription>
                  Manage who can view and edit this dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Share className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Sharing Configuration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Dashboard sharing and access control features will be
                    implemented here
                  </p>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Configure Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {editingDashboard.name} - Preview
            </CardTitle>
            <CardDescription>
              This is how your dashboard will appear to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GridLayout />
          </CardContent>
        </Card>
      )}

      {/* Widget Configuration Dialog */}
      <Dialog open={widgetConfigOpen} onOpenChange={setWidgetConfigOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedWidget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configure Widget: {selectedWidget.title}
                </DialogTitle>
                <DialogDescription>
                  Customize the widget's data sources, appearance, and behavior
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="data" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="display">Display</TabsTrigger>
                  <TabsTrigger value="position">Position</TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="space-y-4">
                  <div>
                    <Label>Widget Title</Label>
                    <Input
                      value={selectedWidget.title}
                      onChange={(e) =>
                        handleWidgetUpdate({
                          ...selectedWidget,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Metrics</Label>
                    <Select
                      value={selectedWidget.data_config.metric_ids[0] || ""}
                      onValueChange={(value) =>
                        handleWidgetUpdate({
                          ...selectedWidget,
                          data_config: {
                            ...selectedWidget.data_config,
                            metric_ids: [value],
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {metrics.map((metric) => (
                          <SelectItem key={metric.id} value={metric.id}>
                            {metric.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Timeframe</Label>
                    <Select
                      value={selectedWidget.data_config.timeframe}
                      onValueChange={(value: AnalyticsTimeframe) =>
                        handleWidgetUpdate({
                          ...selectedWidget,
                          data_config: {
                            ...selectedWidget.data_config,
                            timeframe: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeframeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="display" className="space-y-4">
                  <div>
                    <Label>Color Scheme</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {colorSchemes.map((scheme) => (
                        <Button
                          key={scheme.name}
                          variant="outline"
                          className="justify-start h-auto p-3"
                          onClick={() =>
                            handleWidgetUpdate({
                              ...selectedWidget,
                              display_config: {
                                ...selectedWidget.display_config,
                                colors: scheme.colors,
                              },
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {scheme.colors.slice(0, 5).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span>{scheme.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Decimal Places</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={selectedWidget.display_config.decimal_places}
                        onChange={(e) =>
                          handleWidgetUpdate({
                            ...selectedWidget,
                            display_config: {
                              ...selectedWidget.display_config,
                              decimal_places: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <Select
                        value={selectedWidget.display_config.font_size}
                        onValueChange={(value: "small" | "medium" | "large") =>
                          handleWidgetUpdate({
                            ...selectedWidget,
                            display_config: {
                              ...selectedWidget.display_config,
                              font_size: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="position" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (grid units)</Label>
                      <Input
                        type="number"
                        min="1"
                        max={editingDashboard.layout.columns}
                        value={selectedWidget.position.width}
                        onChange={(e) =>
                          handleWidgetUpdate({
                            ...selectedWidget,
                            position: {
                              ...selectedWidget.position,
                              width: Math.min(
                                parseInt(e.target.value) || 1,
                                editingDashboard.layout.columns,
                              ),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (grid units)</Label>
                      <Input
                        type="number"
                        min="1"
                        max={editingDashboard.layout.rows}
                        value={selectedWidget.position.height}
                        onChange={(e) =>
                          handleWidgetUpdate({
                            ...selectedWidget,
                            position: {
                              ...selectedWidget.position,
                              height: Math.min(
                                parseInt(e.target.value) || 1,
                                editingDashboard.layout.rows,
                              ),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWidgetConfigOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleWidgetDelete(selectedWidget.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Widget
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
