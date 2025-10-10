import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Brain,
  ArrowLeft,
  Settings,
  Target,
  Calendar,
  BarChart3,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LunaCommandCenter from '@/components/luna/features/LunaCommandCenter';
import LunaProactiveGuidance from '@/components/luna/features/LunaProactiveGuidance';
import { useLunaFramework } from '@/components/luna/context/LunaFrameworkContext';

export default function LunaCommandCenterPage() {
  const navigate = useNavigate();
  const { productivityProfile } = useLunaFramework();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Luna AI Assistant</h1>
                <Badge variant="outline">Framework-Enhanced</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">
                {productivityProfile.currentStage} Stage
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Command Center */}
          <div className="lg:col-span-2">
            <LunaCommandCenter />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proactive Guidance */}
            <LunaProactiveGuidance />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Framework Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stage Progress */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Current Stage</span>
                    <Badge variant="outline">
                      Week {productivityProfile.weekInStage}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-purple-700 capitalize">
                    {productivityProfile.currentStage}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {productivityProfile.completedPrinciples.length}/5 principles mastered
                  </div>
                </div>

                {/* Well-being Score */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {productivityProfile.wellBeingScore}
                    </div>
                    <div className="text-xs text-gray-600">Well-being</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {productivityProfile.systemHealthScore}
                    </div>
                    <div className="text-xs text-gray-600">System Health</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/goals')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Review Goals
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/calendar')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate('/team')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Team Collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Framework Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Framework Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">
                      Capture Everything
                    </div>
                    <div className="text-blue-700">
                      Use "Capture this: [idea]" to quickly log thoughts and tasks
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">
                      Energy Optimization
                    </div>
                    <div className="text-green-700">
                      Ask "What should I work on now?" for context-aware suggestions
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-800 mb-1">
                      Recovery Support
                    </div>
                    <div className="text-purple-700">
                      Say "I'm feeling overwhelmed" for guided recovery assistance
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Powered by the BeProductive Unified Framework • Luna AI Assistant v3.0
            </p>
            <p className="mt-1">
              Framework-guided productivity coaching for sustainable success
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}