import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FeatureDiscoveryProvider,
  useFeatureDiscovery,
  useContextualSuggestions
} from './FeatureDiscoveryProvider';
import {
  Compass,
  PlayCircle,
  Sparkles,
  Settings,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

// Demo Dashboard Component that shows contextual suggestions
const DashboardWithSuggestions: React.FC = () => {
  const discovery = useFeatureDiscovery();
  const suggestions = useContextualSuggestions('productivity');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Feature Discovery Button */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Welcome to Spark Bloom Flow
            </CardTitle>
            <CardDescription>
              Discover powerful features to boost your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={discovery.openDiscovery} className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Explore All Features
              </Button>
              <Button
                variant="outline"
                onClick={() => discovery.startTour('task-management')}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Quick Tour
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Features Discovered</span>
                <Badge variant="secondary">
                  {discovery.state.userProgress.discoveredFeatures.length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Features Mastered</span>
                <Badge variant="default">
                  {discovery.state.userProgress.completedFeatures.length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bookmarked</span>
                <Badge variant="outline">
                  {discovery.state.userProgress.bookmarkedFeatures.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contextual Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Suggested for You
            </CardTitle>
            <CardDescription>
              Features that might help boost your productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map(feature => (
                <div
                  key={feature.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => discovery.selectFeature(feature)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {feature.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {feature.estimatedTime}min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => discovery.showSpotlight('smart-scheduling')}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs">New Feature</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => discovery.startTour('habit-tracking')}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <PlayCircle className="h-4 w-4" />
              <span className="text-xs">Start Tour</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const recommendations = discovery.getPersonalizedRecommendations();
                if (recommendations.length > 0) {
                  discovery.showSpotlight(recommendations[0].id);
                }
              }}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Recommendations</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                discovery.updateSettings({
                  enableAutoSuggestions: !discovery.state.settings.enableAutoSuggestions
                });
              }}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Panel Component
const DiscoverySettings: React.FC = () => {
  const { state, updateSettings } = useFeatureDiscovery();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discovery Settings</CardTitle>
        <CardDescription>
          Customize your feature discovery experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Auto Suggestions</div>
            <div className="text-sm text-gray-600">
              Show contextual feature suggestions
            </div>
          </div>
          <Button
            variant={state.settings.enableAutoSuggestions ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({
              enableAutoSuggestions: !state.settings.enableAutoSuggestions
            })}
          >
            {state.settings.enableAutoSuggestions ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Feature Spotlights</div>
            <div className="text-sm text-gray-600">
              Show feature spotlight notifications
            </div>
          </div>
          <Button
            variant={state.settings.enableSpotlights ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({
              enableSpotlights: !state.settings.enableSpotlights
            })}
          >
            {state.settings.enableSpotlights ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Progress Tracking</div>
            <div className="text-sm text-gray-600">
              Show progress bars and completion stats
            </div>
          </div>
          <Button
            variant={state.settings.showProgressTracking ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({
              showProgressTracking: !state.settings.showProgressTracking
            })}
          >
            {state.settings.showProgressTracking ? 'On' : 'Off'}
          </Button>
        </div>

        <div>
          <div className="font-medium mb-2">Notification Level</div>
          <div className="flex gap-2">
            {(['all', 'important', 'none'] as const).map(level => (
              <Button
                key={level}
                variant={state.settings.notificationLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => updateSettings({ notificationLevel: level })}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Demo Component
export const FeatureDiscoveryDemo: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <FeatureDiscoveryProvider
      enablePersistence={true}
      initialUserProgress={{
        discoveredFeatures: ['task-management'],
        completedFeatures: [],
        bookmarkedFeatures: ['habit-tracking']
      }}
    >
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Feature Discovery Demo
            </h1>
            <p className="text-gray-600">
              Explore how the feature discovery system works in practice
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showSettings ? 'Hide' : 'Show'} Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardWithSuggestions />
            </div>

            {showSettings && (
              <div className="lg:col-span-1">
                <DiscoverySettings />
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureDiscoveryProvider>
  );
};