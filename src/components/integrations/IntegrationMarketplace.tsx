import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  Star,
  Download,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  Code,
  Settings,
  Play,
  ExternalLink,
  Building,
  Heart,
  Filter,
  Tag
} from "lucide-react";
import { IntegrationTemplate, IntegrationProvider } from "@/types/integrations";

const mockTemplates: IntegrationTemplate[] = [
  {
    id: "template_1",
    name: "Slack Team Productivity Bot",
    description: "Automated productivity tracking and notifications for Slack teams with goal celebrations and daily summaries",
    provider_id: "slack",
    category: "Team Productivity",
    use_case: "Team collaboration and productivity tracking with automated notifications",
    popularity_score: 95,
    configuration_template: {
      enabled_features: ["task_notifications", "goal_celebrations", "daily_summaries"],
      field_mappings: [
        { source_field: "task.title", target_field: "slack_message.title", required: true, transformation: "truncate" },
        { source_field: "user.name", target_field: "slack_message.author", required: true }
      ],
      notification_settings: {
        success_notifications: true,
        error_notifications: true,
        daily_summary: true,
        email_notifications: true
      }
    },
    required_features: ["webhooks", "real_time_sync"],
    setup_instructions: [
      "Install the Slack app in your workspace",
      "Configure webhook URLs for real-time notifications",
      "Map channels for different notification types",
      "Set up automated daily summary schedule"
    ],
    estimated_setup_time_minutes: 15,
    created_by: "system",
    is_verified: true,
    tags: ["productivity", "notifications", "automation", "team"]
  },
  {
    id: "template_2",
    name: "Microsoft Teams Meeting Insights",
    description: "Comprehensive meeting analytics and productivity insights for Microsoft Teams",
    provider_id: "microsoft_teams",
    category: "Meeting Analytics",
    use_case: "Track meeting effectiveness and generate productivity insights",
    popularity_score: 87,
    configuration_template: {
      enabled_features: ["meeting_tracking", "productivity_analytics", "calendar_sync"],
      field_mappings: [
        { source_field: "meeting.duration", target_field: "analytics.meeting_time", required: true },
        { source_field: "meeting.participants", target_field: "analytics.attendee_count", required: true }
      ],
      notification_settings: {
        success_notifications: false,
        error_notifications: true,
        daily_summary: true,
        email_notifications: false
      }
    },
    required_features: ["calendar_sync", "analytics"],
    setup_instructions: [
      "Connect to Microsoft Teams via OAuth",
      "Grant calendar and meeting permissions",
      "Configure analytics dashboard preferences",
      "Set up automated reporting schedule"
    ],
    estimated_setup_time_minutes: 20,
    created_by: "system",
    is_verified: true,
    tags: ["meetings", "analytics", "calendar", "insights"]
  },
  {
    id: "template_3",
    name: "Google Workspace Document Collaboration",
    description: "Track document collaboration patterns and productivity across Google Workspace",
    provider_id: "google_workspace",
    category: "Document Management",
    use_case: "Monitor document collaboration and sharing patterns for productivity insights",
    popularity_score: 78,
    configuration_template: {
      enabled_features: ["document_tracking", "collaboration_analytics", "sharing_insights"],
      field_mappings: [
        { source_field: "doc.edit_count", target_field: "analytics.collaboration_score", required: true },
        { source_field: "doc.share_count", target_field: "analytics.sharing_activity", required: true }
      ],
      notification_settings: {
        success_notifications: true,
        error_notifications: true,
        daily_summary: false,
        email_notifications: true
      }
    },
    required_features: ["document_sync", "collaboration_tracking"],
    setup_instructions: [
      "Authenticate with Google Workspace",
      "Grant document and Drive permissions",
      "Configure collaboration tracking settings",
      "Set up privacy and sharing preferences"
    ],
    estimated_setup_time_minutes: 25,
    created_by: "community",
    is_verified: true,
    tags: ["documents", "collaboration", "google", "productivity"]
  },
  {
    id: "template_4",
    name: "Jira Issue Tracking Integration",
    description: "Comprehensive Jira integration for project management and issue tracking",
    provider_id: "jira",
    category: "Project Management",
    use_case: "Sync Jira issues with productivity tracking for complete project visibility",
    popularity_score: 82,
    configuration_template: {
      enabled_features: ["issue_sync", "project_tracking", "sprint_analytics"],
      field_mappings: [
        { source_field: "issue.status", target_field: "task.status", required: true },
        { source_field: "issue.assignee", target_field: "task.assignee", required: true }
      ],
      notification_settings: {
        success_notifications: true,
        error_notifications: true,
        daily_summary: true,
        email_notifications: true
      }
    },
    required_features: ["bi_directional_sync", "webhooks"],
    setup_instructions: [
      "Generate Jira API token",
      "Configure project and issue type mappings",
      "Set up webhook endpoints for real-time sync",
      "Test bidirectional synchronization"
    ],
    estimated_setup_time_minutes: 30,
    created_by: "system",
    is_verified: true,
    tags: ["jira", "project-management", "issues", "development"]
  },
  {
    id: "template_5",
    name: "GitHub Development Metrics",
    description: "Track development productivity and code contribution metrics from GitHub",
    provider_id: "github",
    category: "Development Tools",
    use_case: "Monitor development team productivity and code quality metrics",
    popularity_score: 91,
    configuration_template: {
      enabled_features: ["commit_tracking", "pr_analytics", "code_quality_metrics"],
      field_mappings: [
        { source_field: "commit.author", target_field: "developer.name", required: true },
        { source_field: "pr.review_count", target_field: "quality.reviews", required: true }
      ],
      notification_settings: {
        success_notifications: false,
        error_notifications: true,
        daily_summary: true,
        email_notifications: false
      }
    },
    required_features: ["real_time_sync", "analytics"],
    setup_instructions: [
      "Install GitHub App or configure personal access token",
      "Select repositories to track",
      "Configure development metrics dashboard",
      "Set up automated reporting preferences"
    ],
    estimated_setup_time_minutes: 18,
    created_by: "community",
    is_verified: true,
    tags: ["github", "development", "metrics", "code-quality"]
  },
  {
    id: "template_6",
    name: "Custom API Productivity Tracker",
    description: "Template for integrating custom APIs with productivity tracking features",
    provider_id: "custom_api",
    category: "Custom Integration",
    use_case: "Connect proprietary tools and systems with productivity tracking",
    popularity_score: 65,
    configuration_template: {
      enabled_features: ["custom_webhook", "data_transformation", "flexible_mapping"],
      field_mappings: [],
      notification_settings: {
        success_notifications: true,
        error_notifications: true,
        daily_summary: false,
        email_notifications: true
      }
    },
    required_features: ["custom_endpoints", "data_transformation"],
    setup_instructions: [
      "Define custom API endpoints and authentication",
      "Configure data transformation rules",
      "Set up field mappings for your data structure",
      "Test API connection and data flow"
    ],
    estimated_setup_time_minutes: 45,
    created_by: "enterprise",
    is_verified: false,
    tags: ["custom", "api", "enterprise", "flexible"]
  }
];

const categories = [
  "All Categories",
  "Team Productivity",
  "Meeting Analytics",
  "Document Management",
  "Project Management",
  "Development Tools",
  "Custom Integration"
];

const popularityColors = {
  high: "text-green-600",
  medium: "text-yellow-600",
  low: "text-gray-600"
};

export function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");

  const filteredTemplates = mockTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "popularity") return b.popularity_score - a.popularity_score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "setup_time") return a.estimated_setup_time_minutes - b.estimated_setup_time_minutes;
      return 0;
    });

  const getPopularityLevel = (score: number) => {
    if (score >= 85) return { level: "High", color: popularityColors.high };
    if (score >= 70) return { level: "Medium", color: popularityColors.medium };
    return { level: "Low", color: popularityColors.low };
  };

  const handleUseTemplate = (template: IntegrationTemplate) => {
    // Implementation would create integration from template
    console.log("Using template:", template.name);
  };

  const handleViewDetails = (template: IntegrationTemplate) => {
    setSelectedTemplate(template);
    setTemplateDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Integration Marketplace
          </h2>
          <p className="text-muted-foreground">
            Discover and install pre-configured integration templates
          </p>
        </div>
        <Button variant="outline">
          <Code className="h-4 w-4 mr-2" />
          Submit Template
        </Button>
      </div>

      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Templates</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to install
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Templates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTemplates.filter(t => t.popularity_score >= 85).length}</div>
            <p className="text-xs text-muted-foreground">
              High popularity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Templates</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTemplates.filter(t => t.is_verified).length}</div>
            <p className="text-xs text-muted-foreground">
              Enterprise verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Setup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTemplates.filter(t => t.estimated_setup_time_minutes <= 20).length}</div>
            <p className="text-xs text-muted-foreground">
              Under 20 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates, providers, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Sort by Popularity</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="setup_time">Sort by Setup Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const popularity = getPopularityLevel(template.popularity_score);
          return (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {template.provider_id.replace('_', ' ')}
                    </Badge>
                    {template.is_verified && (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{template.popularity_score}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Template Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{template.estimated_setup_time_minutes} min setup</span>
                    </div>
                    <div className={`flex items-center gap-1 ${popularity.color}`}>
                      <TrendingUp className="h-3 w-3" />
                      <span>{popularity.level} popularity</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Required Features */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Required Features</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.required_features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(template)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Details Dialog */}
      <Dialog open={templateDetailsOpen} onOpenChange={setTemplateDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTemplate.name}
                  {selectedTemplate.is_verified && (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Provider</Label>
                      <p className="capitalize">{selectedTemplate.provider_id.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p>{selectedTemplate.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Setup Time</Label>
                      <p>{selectedTemplate.estimated_setup_time_minutes} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Popularity</Label>
                      <p>{selectedTemplate.popularity_score}/100</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Use Case</Label>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.use_case}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Required Features</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.required_features.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="setup" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Setup Instructions</Label>
                    <div className="space-y-2">
                      {selectedTemplate.setup_instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <p className="text-sm">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="configuration" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Enabled Features</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.configuration_template.enabled_features.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedTemplate.configuration_template.field_mappings.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Field Mappings</Label>
                      <div className="space-y-2">
                        {selectedTemplate.configuration_template.field_mappings.map((mapping, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded">{mapping.source_field}</code>
                            <span>→</span>
                            <code className="bg-gray-100 px-2 py-1 rounded">{mapping.target_field}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Notification Settings</Label>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedTemplate.configuration_template.notification_settings || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}</span>
                          <Badge variant={value ? "secondary" : "outline"}>
                            {value ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setTemplateDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setTemplateDetailsOpen(false);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}