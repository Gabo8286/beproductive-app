import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  Users,
  Settings,
  Download,
  Eye,
  Calendar,
  Activity,
  Gauge,
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { RealTimeAnalytics } from "@/components/analytics/RealTimeAnalytics";
import { ExecutiveDashboard } from "@/components/analytics/ExecutiveDashboard";
import { PredictiveAnalytics } from "@/components/analytics/PredictiveAnalytics";
import { DataExport } from "@/components/analytics/DataExport";
import { DashboardBuilder } from "@/components/analytics/DashboardBuilder";

interface AnalyticsModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  component: React.ComponentType<any>;
  features: string[];
  isAdvanced?: boolean;
}

const analyticsModules: AnalyticsModule[] = [
  {
    id: "overview",
    name: "Analytics Overview",
    description: "Comprehensive dashboard with key metrics and insights",
    icon: BarChart3,
    color: "blue",
    component: AnalyticsDashboard,
    features: [
      "Custom dashboards",
      "Widget library",
      "Performance metrics",
      "Goal tracking",
    ],
  },
  {
    id: "realtime",
    name: "Real-Time Analytics",
    description: "Live data streams and real-time performance monitoring",
    icon: Activity,
    color: "green",
    component: RealTimeAnalytics,
    features: [
      "Live data feeds",
      "Real-time alerts",
      "Performance monitoring",
      "Activity streams",
    ],
  },
  {
    id: "executive",
    name: "Executive Dashboard",
    description: "High-level KPIs and strategic insights for leadership",
    icon: Target,
    color: "purple",
    component: ExecutiveDashboard,
    features: [
      "Strategic KPIs",
      "ROI tracking",
      "Performance summaries",
      "Trend analysis",
    ],
    isAdvanced: true,
  },
  {
    id: "predictive",
    name: "Predictive Analytics",
    description: "AI-powered forecasting and predictive insights",
    icon: Brain,
    color: "indigo",
    component: PredictiveAnalytics,
    features: [
      "AI forecasting",
      "Trend prediction",
      "Risk assessment",
      "Scenario planning",
    ],
    isAdvanced: true,
  },
  {
    id: "export",
    name: "Data Export & Reports",
    description: "Export data and generate custom reports",
    icon: Download,
    color: "gray",
    component: DataExport,
    features: [
      "Multiple formats",
      "Scheduled reports",
      "Custom templates",
      "Automated delivery",
    ],
  },
  {
    id: "builder",
    name: "Dashboard Builder",
    description: "Create and customize your own analytics dashboards",
    icon: Settings,
    color: "orange",
    component: DashboardBuilder,
    features: [
      "Drag & drop",
      "Custom widgets",
      "Layout management",
      "Share dashboards",
    ],
    isAdvanced: true,
  },
];

export default function Analytics() {
  const [activeModule, setActiveModule] = useState<string>("overview");

  const currentModule = analyticsModules.find(
    (module) => module.id === activeModule,
  );
  const ActiveComponent = currentModule?.component || AnalyticsDashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics platform with real-time data, predictive
            insights, and custom reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Quick View
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Analytics Modules Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsModules.map((module) => (
          <Card
            key={module.id}
            className={`cursor-pointer transition-all duration-200 ${
              activeModule === module.id
                ? `ring-2 ring-${module.color}-500 bg-${module.color}-50`
                : "hover:shadow-md"
            }`}
            onClick={() => setActiveModule(module.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${module.color}-100 rounded-lg`}>
                    <module.icon
                      className={`h-5 w-5 text-${module.color}-600`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {module.name}
                      {module.isAdvanced && (
                        <Badge variant="secondary" className="text-xs">
                          Advanced
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Features:
                </div>
                <div className="flex flex-wrap gap-1">
                  {module.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Module Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentModule && (
                <>
                  <div
                    className={`p-2 bg-${currentModule.color}-100 rounded-lg`}
                  >
                    <currentModule.icon
                      className={`h-5 w-5 text-${currentModule.color}-600`}
                    />
                  </div>
                  <div>
                    <CardTitle>{currentModule.name}</CardTitle>
                    <CardDescription>
                      {currentModule.description}
                    </CardDescription>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Active Module</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActiveComponent />
        </CardContent>
      </Card>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Data Points
              </p>
              <p className="text-2xl font-bold">24,578</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Dashboards
              </p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Gauge className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Insights Generated
              </p>
              <p className="text-2xl font-bold">156</p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reports Exported
              </p>
              <p className="text-2xl font-bold">89</p>
            </div>
            <Download className="h-8 w-8 text-orange-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
