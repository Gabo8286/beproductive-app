import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckSquare, Repeat, Folder, BookOpen, Sparkles, Users, Workflow } from "lucide-react";

const features = [
  { icon: Target, title: "Goals", description: "Set and track your objectives", color: "text-primary" },
  { icon: CheckSquare, title: "Tasks", description: "Manage daily to-dos", color: "text-secondary" },
  { icon: Repeat, title: "Habits", description: "Build positive routines", color: "text-success" },
  { icon: Folder, title: "Projects", description: "Organize your work", color: "text-warning" },
  { icon: BookOpen, title: "Reflections", description: "Daily journaling", color: "text-primary" },
  { icon: Sparkles, title: "AI Insights", description: "Smart recommendations", color: "text-secondary" },
  { icon: Users, title: "Team Collaboration", description: "Work together", color: "text-success" },
  { icon: Workflow, title: "Process Inventory", description: "Document workflows", color: "text-warning" },
];

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name || "there"}!
        </h1>
        <p className="text-muted-foreground">
          Here's your productivity overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {feature.title}
              </CardTitle>
              <feature.icon className={`h-4 w-4 ${feature.color}`} />
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            These features are currently under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            BeProductive is built with a modular architecture. Additional features will be
            enabled as they become available. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
