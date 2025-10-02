import { Card } from "@/components/ui/card";
import { Zap, Brain, Sparkles } from "lucide-react";

export function BuildStory() {
  const tools = [
    {
      name: "Lovable",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      description: "Powered the rapid development"
    },
    {
      name: "Claude",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      description: "Provided intelligent assistance"
    },
    {
      name: "Grok",
      icon: Sparkles,
      color: "from-orange-500 to-red-500",
      description: "Enhanced creativity and insights"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Built with Passion & Innovation
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            This productivity platform was crafted using cutting-edge AI tools, 
            combining the power of modern development with intelligent automation 
            to create something truly special for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.name}
                className="relative group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card/50 backdrop-blur-sm"
              >
                <div className="p-6 space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{tool.name}</h3>
                    <p className="text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </Card>
            );
          })}
        </div>

        <div className="text-center space-y-4 pt-8 border-t border-border/50">
          <p className="text-lg text-muted-foreground italic">
            "Every line of code, every feature, every pixel was designed 
            with one goal in mind: to help you achieve more, stress less, 
            and unlock your full potential."
          </p>
          <p className="text-sm text-muted-foreground/70">
            Built with ❤️ using AI-powered development tools
          </p>
        </div>
      </div>
    </section>
  );
}
