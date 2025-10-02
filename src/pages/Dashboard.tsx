import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckSquare, Repeat, BookOpen, Sparkles, Users, StickyNote } from "lucide-react";
import { DatabaseTest } from "@/components/DatabaseTest";
import { getWelcomeMessage, getMotivationalMessage } from "@/lib/brand";
import { QuickTodosWidget } from "@/components/quickTodos/QuickTodosWidget";

const journeyFeatures = [
  {
    icon: Target,
    title: "Destinations",
    subtitle: "Goals",
    description: "Set meaningful destinations for your journey",
    color: "text-primary",
    status: "active" as const,
  },
  {
    icon: CheckSquare,
    title: "Next Steps",
    subtitle: "Tasks",
    description: "Organize the steps needed to move forward",
    color: "text-warning",
    status: "active" as const,
  },
  {
    icon: StickyNote,
    title: "Travel Notes",
    subtitle: "Quick To-Dos",
    description: "Capture quick thoughts and reminders",
    color: "text-warning",
    status: "active" as const,
  },
  {
    icon: Repeat,
    title: "Daily Routines",
    subtitle: "Habits",
    description: "Build consistent practices that power progress",
    color: "text-secondary",
    status: "active" as const,
  },
  {
    icon: BookOpen,
    title: "Route Adjustments",
    subtitle: "Reflections",
    description: "Learn from experiences and adjust your path",
    color: "text-success",
    status: "active" as const,
  },
  {
    icon: Sparkles,
    title: "Journey Insights",
    subtitle: "AI Guidance",
    description: "Receive intelligent recommendations for your path",
    color: "text-primary",
    status: "coming_soon" as const,
  },
  {
    icon: Users,
    title: "Shared Journeys",
    subtitle: "Team Collaboration",
    description: "Travel together with your team",
    color: "text-secondary",
    status: "coming_soon" as const,
  },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const welcomeMessage = getWelcomeMessage();
  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="space-y-6">
      {/* Journey Welcome Header */}
      <div className="journey-card p-6 bg-gradient-subtle">
        <h1 className="text-3xl font-bold tracking-tight text-gradient-brand">
          {welcomeMessage}, {profile?.full_name || "Traveler"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {motivationalMessage}
        </p>
      </div>

      {/* Active Journey Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Active Journey</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeyFeatures
            .filter(feature => feature.status === "active")
            .map((feature) => (
              <Card key={feature.title} className="journey-progress apple-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {feature.subtitle}
                    </CardDescription>
                  </div>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Quick Access Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickTodosWidget />
      </div>

      <DatabaseTest />

      {/* Coming Soon Features */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 journey-float" />
            Expanding Your Journey
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            New pathways are being prepared for your productivity journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {journeyFeatures
              .filter(feature => feature.status === "coming_soon")
              .map((feature) => (
                <div key={feature.title} className="flex items-center gap-3 p-3 bg-primary-foreground/10 rounded-lg">
                  <feature.icon className="h-4 w-4 text-primary-foreground/80" />
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-primary-foreground/70">{feature.description}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
