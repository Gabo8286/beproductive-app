import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Sparkles, Clock, CheckCircle, AlertTriangle, Lightbulb, Code, Database, Palette, Shield } from "lucide-react";

export function BuildStory() {
  const timelineEvents = [
    {
      phase: "Phase 1",
      title: "Foundation Setup",
      duration: "Week 1",
      tool: "Lovable.dev",
      toolIcon: Zap,
      toolColor: "from-purple-500 to-pink-500",
      description: "Started with a simple idea: build a productivity app without knowing how to code",
      achievements: [
        "Created initial app structure using Lovable's visual interface",
        "Set up basic user authentication and database",
        "Built core productivity widgets (tasks, goals, habits)",
        "Implemented responsive design with 7-language support"
      ],
      challenge: "Learning how to communicate ideas to AI tools effectively",
      solution: "Practiced being specific and descriptive in my requests"
    },
    {
      phase: "Phase 2",
      title: "Feature Enhancement",
      duration: "Week 2-3",
      tool: "Claude AI",
      toolIcon: Brain,
      toolColor: "from-blue-500 to-cyan-500",
      description: "Enhanced the app with advanced features and AI-powered functionality",
      achievements: [
        "Added AI assistant for natural language task creation",
        "Implemented predictive insights and analytics",
        "Created drag-and-drop widget system",
        "Built comprehensive accessibility features (WCAG AAA)"
      ],
      challenge: "Integrating complex AI features without breaking existing functionality",
      solution: "Used Claude to help plan integration strategy and write modular code"
    },
    {
      phase: "Phase 3",
      title: "Enterprise AI Agents",
      duration: "30 Minutes",
      tool: "Claude Code + Grok",
      toolIcon: Sparkles,
      toolColor: "from-orange-500 to-red-500",
      description: "Added enterprise-grade monitoring system to prove scalability",
      achievements: [
        "Built complete AI agents system (monitoring, security, backup)",
        "Created professional admin dashboard",
        "Implemented real-time system health tracking",
        "Added 3,994 lines of production-ready code"
      ],
      challenge: "Adding sophisticated features in minimal time without breaking changes",
      solution: "AI-assisted modular architecture with isolated agent system"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            From Idea to Enterprise App: My AI-Assisted Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Here's the complete timeline of how I built a full-stack productivity platform with enterprise monitoring
            using only AI tools - no traditional coding required.
          </p>
        </div>

        <div className="space-y-12">
          {timelineEvents.map((event, index) => {
            const ToolIcon = event.toolIcon;
            return (
              <div key={index} className="relative">
                {/* Timeline Line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-32 bg-gradient-to-b from-primary/50 to-transparent"></div>
                )}

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Timeline Marker & Tool */}
                  <div className="lg:col-span-3 flex flex-col items-center lg:items-start space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">{event.phase}</Badge>
                        <p className="text-sm text-muted-foreground">{event.duration}</p>
                      </div>
                    </div>

                    <Card className="w-full bg-card/50 backdrop-blur-sm border-2 hover:border-primary/30 transition-all">
                      <div className="p-4 text-center space-y-3">
                        <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${event.toolColor} flex items-center justify-center`}>
                          <ToolIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold">{event.tool}</h4>
                          <p className="text-xs text-muted-foreground">Primary Tool</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-9 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Achievements */}
                      <Card className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-success" />
                          <h4 className="font-semibold">What I Built</h4>
                        </div>
                        <ul className="space-y-2">
                          {event.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* Visual Proof Placeholder */}
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="glass-card p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">💡 Example Prompt I Used:</p>
                            <p className="text-xs font-mono bg-background/50 p-2 rounded border border-border/30">
                              "Create a task management system with drag-and-drop, categories, and priority levels"
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Challenge & Solution */}
                      <Card className="glass-card p-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              <h5 className="font-semibold text-sm">Challenge</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.challenge}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              <h5 className="font-semibold text-sm">Solution</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.solution}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Results */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Final Result: Enterprise-Grade Application</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From zero coding knowledge to a production-ready app with monitoring, security, and AI features.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="glass-card p-6 text-center">
              <Code className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold">49,000+</div>
              <div className="text-sm text-muted-foreground">Lines of Code</div>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Database className="h-8 w-8 mx-auto mb-3 text-success" />
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm text-muted-foreground">Database Tables</div>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Palette className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <div className="text-2xl font-bold">259</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </Card>
            <Card className="glass-card p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-warning" />
              <div className="text-2xl font-bold">83%</div>
              <div className="text-sm text-muted-foreground">Test Coverage</div>
            </Card>
          </div>

          <div className="text-center mt-8 space-y-4">
            <p className="text-lg text-muted-foreground italic">
              "The future of development is here - where human creativity meets AI capability to build
              sophisticated applications in hours, not months."
            </p>
            <p className="text-sm text-muted-foreground/70">
              Built with ❤️ using AI-powered development tools • Proving non-developers can create enterprise software
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
