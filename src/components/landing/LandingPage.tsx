import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Repeat, BookOpen, CheckCircle } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation - Glass Morphism */}
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="h-6 w-6 text-primary journey-float" />
            <span className="text-xl font-heading font-bold">BeProductive</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="apple-button font-medium" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="apple-button shadow-md hover:shadow-lg font-medium" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Glass Morphism Featured Card */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="glass-hero rounded-3xl p-8 md:p-16 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Trusted by ambitious professionals worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-gradient-brand leading-tight">
              Turn Goals Into Journeys You Actually Complete
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Define your destinations, pack your essentials, build daily routines, and navigate your path to success. BeProductive guides ambitious professionals through proven frameworks that transform aspirations into achievements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="apple-button shadow-lg hover:shadow-xl text-base h-12 px-8 font-medium" asChild>
                <Link to="/signup">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Begin Your Journey Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="apple-button glass-card text-base h-12 px-8 font-medium" asChild>
                <Link to="#features">Explore the Framework</Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-2">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* Journey Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">
            A Complete Framework for Achievement
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every successful journey needs a clear destination, a packed checklist, daily routines, and moments to reflect on progress.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Set Your Destinations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Define ambitious goals with clear milestones. Track progress with visual dashboards that keep your destination in sight, whether advancing your career, building skills, or achieving personal growth.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Plan Your Next Steps</h3>
              <p className="text-muted-foreground leading-relaxed">
                Break down complex projects into actionable tasks. Organize essentials with smart prioritization, deadlines, and subtasks that keep you moving forward every day.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Repeat className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Build Daily Routines</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transform intentions into consistent habits with streak tracking, reminders, and celebration milestones. Small daily commitments create momentum for lasting change.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Make Route Adjustments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pause for thoughtful reflection with guided journaling prompts. Capture lessons, track mood patterns, and adjust your strategy based on real insights from your journey.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Capture Travel Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Quickly jot down thoughts, ideas, and reminders that emerge along your path. Keep mental clarity with a simple capture system for everything that matters.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Track Your Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                View real-time dashboards that map your entire journey. See how goals, tasks, habits, and reflections connect to reveal patterns and celebrate your growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
              Why Ambitious Professionals Choose BeProductive
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Whether you're climbing the career ladder, building new skills, launching a business, or pursuing personal transformation—BeProductive provides the structured framework that turns ambitious plans into completed achievements.
            </p>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-lg font-medium">
                Join thousands who've discovered that commitment + consistency + clear direction = goals you actually complete.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              "Crystal-clear goal tracking with visual milestone progress",
              "Habit streaks that build unstoppable momentum",
              "Reflection tools that turn experience into wisdom",
              "AI-powered insights that optimize your approach",
              "Personalized dashboards that map your entire journey",
              "Mobile-optimized for productivity on the go",
              "Community support from fellow travelers",
              "Non-profit marketplace for proven routines"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="rounded-full bg-success/10 w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:bg-success/20 transition-colors">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <span className="text-base md:text-lg pt-1.5">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="journey-card-featured bg-gradient-primary text-white border-0 overflow-hidden relative shadow-2xl">
            <CardContent className="py-16 px-8 md:px-12 text-center relative z-10">
              <Sparkles className="h-12 w-12 mx-auto mb-6 journey-float opacity-80" />
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
                Join ambitious professionals, students, entrepreneurs, and growth-seekers who've discovered that the right framework turns aspirations into achievements. Your destination awaits.
              </p>
              <Button size="lg" variant="secondary" className="apple-button shadow-xl hover:shadow-2xl text-base h-14 px-10 font-medium" asChild>
                <Link to="/signup">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Your Journey Free
                </Link>
              </Button>
              <p className="text-sm mt-6 opacity-80">
                No credit card required • Free forever plan available
              </p>
            </CardContent>
            
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-2xl" />
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center border-t border-border/50">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary journey-float" />
          <span className="font-heading font-bold text-lg">BeProductive</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Commit to your journey, achieve your goals
        </p>
      </footer>
    </div>
  );
};
