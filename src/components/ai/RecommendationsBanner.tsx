import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Lightbulb,
  CheckCircle,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: "productivity" | "wellness" | "learning" | "optimization";
  confidence: number;
  actionText: string;
  actionUrl?: string;
}

interface RecommendationsBannerProps {
  context?: "tasks" | "goals" | "habits" | "general";
  className?: string;
}

export const RecommendationsBanner: React.FC<RecommendationsBannerProps> = ({
  context = "general",
  className = "",
}) => {
  const [currentRec, setCurrentRec] = useState<SmartRecommendation | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(true);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(
    [],
  );

  useEffect(() => {
    // Context-specific recommendations
    const getContextualRecommendations = (): SmartRecommendation[] => {
      const baseRecommendations: Record<string, SmartRecommendation[]> = {
        tasks: [
          {
            id: "task_1",
            title: "Break down large tasks",
            description:
              "Tasks over 2 hours should be split into smaller chunks for better estimation",
            type: "productivity",
            confidence: 0.85,
            actionText: "Learn how",
            actionUrl: "/ai-insights",
          },
          {
            id: "task_2",
            title: "Schedule during peak hours",
            description:
              "Your productivity peaks at 9-11 AM. Schedule important tasks then.",
            type: "optimization",
            confidence: 0.91,
            actionText: "Time tracking",
            actionUrl: "/time-tracking",
          },
          {
            id: "task_3",
            title: "Discover your productivity style",
            description:
              "Take our assessment to get personalized task management strategies",
            type: "learning",
            confidence: 0.88,
            actionText: "Take quiz",
            actionUrl: "/profile-assessment",
          },
        ],
        goals: [
          {
            id: "goal_1",
            title: "Set weekly check-ins",
            description:
              "Weekly goal reviews increase achievement rates by 40%",
            type: "productivity",
            confidence: 0.78,
            actionText: "Set reminder",
            actionUrl: "/automation",
          },
          {
            id: "goal_2",
            title: "Optimize your goal-setting approach",
            description:
              "Understanding your productivity profile helps you set more achievable goals",
            type: "learning",
            confidence: 0.84,
            actionText: "Take assessment",
            actionUrl: "/profile-assessment",
          },
        ],
        habits: [
          {
            id: "habit_1",
            title: "Stack new habits",
            description:
              "Link new habits to existing routines for better adherence",
            type: "learning",
            confidence: 0.82,
            actionText: "Learn more",
            actionUrl: "/ai-insights",
          },
        ],
        general: [
          {
            id: "gen_1",
            title: "Take a 5-minute break",
            description:
              "You've been focused for 45 minutes. A short break will help maintain productivity.",
            type: "wellness",
            confidence: 0.89,
            actionText: "Start timer",
            actionUrl: "/time-tracking",
          },
        ],
      };

      return baseRecommendations[context] || baseRecommendations.general;
    };

    const recs = getContextualRecommendations();
    setRecommendations(recs);
    if (recs.length > 0) {
      setCurrentRec(recs[0]);
    }

    // Rotate recommendations every 15 seconds
    const interval = setInterval(() => {
      setRecommendations((prev) => {
        if (prev.length > 1) {
          const currentIndex =
            prev.findIndex((r) => r.id === currentRec?.id) || 0;
          const nextIndex = (currentIndex + 1) % prev.length;
          setCurrentRec(prev[nextIndex]);
        }
        return prev;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [context, currentRec?.id]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleAction = () => {
    console.log("Implementing recommendation:", currentRec?.id);
    // Here you would implement the recommendation logic
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "productivity":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "wellness":
        return "bg-green-100 text-green-800 border-green-200";
      case "learning":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "optimization":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isVisible || !currentRec || recommendations.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {currentRec.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTypeColor(currentRec.type)}`}
                    >
                      {currentRec.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(currentRec.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {currentRec.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    {currentRec.actionUrl ? (
                      <Link to={currentRec.actionUrl}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                        >
                          {currentRec.actionText}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={handleAction}
                      >
                        {currentRec.actionText}
                        <CheckCircle className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                    {recommendations.length > 1 && (
                      <span className="text-xs text-gray-500">
                        {recommendations.findIndex(
                          (r) => r.id === currentRec.id,
                        ) + 1}
                        /{recommendations.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Link to="/ai-insights">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
