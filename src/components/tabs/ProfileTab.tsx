import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, RefreshCw, FileText, Target, Lightbulb, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

export default function ProfileTab() {
  const { currentAssessment, profiles, isLoading } = useProductivityProfile();
  const { buttonPress } = useHapticFeedback();

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto pb-safe bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Empty state - no assessment taken
  if (!currentAssessment) {
    return (
      <div className="flex-1 overflow-y-auto pb-safe bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Discover Your Productivity Style</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock personalized insights and strategies tailored to how you work best
            </p>
          </div>

          {/* 8 Profile Types Grid */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center">8 Productivity Profiles</CardTitle>
              <CardDescription className="text-center">
                Each profile has unique strengths, characteristics, and recommended strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(profiles).map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col items-center p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mb-2"
                      style={{ backgroundColor: profile.color }}
                    >
                      {profile.name.split(" ").map((word) => word[0]).join("")}
                    </div>
                    <span className="text-xs font-medium text-center">{profile.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/profile-assessment" className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={buttonPress}
              >
                Take Assessment
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2">Personalized Strategies</h3>
                <p className="text-sm text-muted-foreground">
                  Get tailored productivity techniques that match your natural working style
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Target className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Identify Strengths</h3>
                <p className="text-sm text-muted-foreground">
                  Understand your unique capabilities and how to leverage them effectively
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">Growth Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Discover areas for development and actionable steps to improve
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Has assessment - show full profile
  const dominantProfile = profiles[currentAssessment.dominant_profile];
  const secondaryProfile = currentAssessment.secondary_profile
    ? profiles[currentAssessment.secondary_profile]
    : null;

  const completedDate = new Date(currentAssessment.completed_at);
  const daysSinceAssessment = Math.floor(
    (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex-1 overflow-y-auto pb-safe bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="border-2 overflow-hidden">
          <div
            className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"
            style={{
              background: `linear-gradient(135deg, ${dominantProfile.color}15, ${dominantProfile.color}05)`,
            }}
          />
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Profile Avatar */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-background"
                style={{ backgroundColor: dominantProfile.color }}
              >
                {dominantProfile.name.split(" ").map((word) => word[0]).join("")}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {dominantProfile.name}
                </h1>
                <p className="text-muted-foreground mb-3">
                  {dominantProfile.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {secondaryProfile && (
                    <>
                      <span className="text-sm text-muted-foreground">Secondary:</span>
                      <Badge
                        style={{
                          backgroundColor: secondaryProfile.color,
                          color: "white",
                        }}
                      >
                        {secondaryProfile.name}
                      </Badge>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    • Assessed {format(completedDate, "MMM d, yyyy")}
                    {daysSinceAssessment > 0 && ` (${daysSinceAssessment}d ago)`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/profile-assessment" className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              onClick={buttonPress}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
          </Link>
          <Link to="/profile-assessment" className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              onClick={buttonPress}
            >
              <FileText className="h-4 w-4 mr-2" />
              Detailed Analysis
            </Button>
          </Link>
        </div>

        {/* Characteristics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Characteristics</CardTitle>
            </div>
            <CardDescription>How you naturally approach work and productivity</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dominantProfile.characteristics.map((characteristic, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: dominantProfile.color }}
                  />
                  <span>{characteristic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Strengths</CardTitle>
            </div>
            <CardDescription>Your natural capabilities and advantages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {dominantProfile.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle>Growth Opportunities</CardTitle>
            </div>
            <CardDescription>Areas where you can develop and improve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dominantProfile.growthAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
                >
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Strategies */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>Recommended Strategies</CardTitle>
            </div>
            <CardDescription>
              Personalized productivity techniques for your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(currentAssessment.recommended_strategies as string[]).map((strategy, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: dominantProfile.color }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm">{strategy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold mb-1">Want to update your profile?</h3>
                <p className="text-sm text-muted-foreground">
                  Retake the assessment to see if your style has evolved
                </p>
              </div>
              <Link to="/profile-assessment">
                <Button onClick={buttonPress}>
                  Retake Assessment
                  <RefreshCw className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
