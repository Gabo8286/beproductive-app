import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ArrowRight, Lightbulb, Target } from "lucide-react";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductivityProfileWidget() {
  const { currentAssessment, profiles, isLoading } = useProductivityProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Productivity Profile</CardTitle>
          </div>
          <CardDescription>Your personal productivity insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!currentAssessment) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Discover Your Productivity Style</CardTitle>
          </div>
          <CardDescription>
            Take our assessment to unlock personalized insights and strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Learn about your unique productivity style among 8 different
              profiles:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                The Strategist
              </span>
              <span className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                The Executor
              </span>
              <span className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                The Collaborator
              </span>
              <span className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                The Optimizer
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200">
            <Link to="/profile-assessment" className="block">
              <Button className="w-full" size="sm">
                Take Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dominantProfile = profiles[currentAssessment.dominant_profile];
  const secondaryProfile = currentAssessment.secondary_profile
    ? profiles[currentAssessment.secondary_profile]
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Your Productivity Profile</CardTitle>
          </div>
          <Link to="/profile-assessment">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>Personalized insights for your style</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Profile */}
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: dominantProfile.color }}
          >
            {dominantProfile.name
              .split(" ")
              .map((word) => word[0])
              .join("")}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {dominantProfile.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {dominantProfile.description}
            </p>
          </div>
        </div>

        {/* Secondary Profile */}
        {secondaryProfile && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Secondary:</span>
              <Badge
                style={{
                  backgroundColor: secondaryProfile.color,
                  color: "white",
                }}
                className="text-xs"
              >
                {secondaryProfile.name}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Strategies */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
            Key Strategies
          </h4>
          <div className="space-y-1">
            {(currentAssessment.recommended_strategies as string[])
              .slice(0, 2)
              .map((strategy, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 pl-4 border-l-2 border-blue-200"
                >
                  {strategy}
                </div>
              ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link to="/profile-assessment" className="block">
            <Button variant="outline" className="w-full" size="sm">
              View Full Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
