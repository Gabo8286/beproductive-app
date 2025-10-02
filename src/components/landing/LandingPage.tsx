import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Repeat, BookOpen, CheckCircle } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-primary journey-float" />
          <span className="text-xl font-bold">BeProductive</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="apple-button" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-brand">
          Turn Goals Into Journeys You Actually Complete
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Define your destinations, pack your essentials, build daily routines, and navigate your path to success. BeProductive guides ambitious professionals through proven frameworks that transform aspirations into achievements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="apple-button" asChild>
            <Link to="/signup">Begin Your Journey Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="apple-button" asChild>
            <Link to="#features">Explore the Framework</Link>
          </Button>
        </div>
      </section>

      {/* Journey Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          A Complete Framework for Achievement
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Every successful journey needs a clear destination, a packed checklist, daily routines, and moments to reflect on progress.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Set Your Destinations</h3>
              <p className="text-muted-foreground">
                Define ambitious goals with clear milestones. Track progress with visual dashboards that keep your destination in sight, whether advancing your career, building skills, or achieving personal growth.
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-success/10 w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Plan Your Next Steps</h3>
              <p className="text-muted-foreground">
                Break down complex projects into actionable tasks. Organize essentials with smart prioritization, deadlines, and subtasks that keep you moving forward every day.
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Repeat className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Build Daily Routines</h3>
              <p className="text-muted-foreground">
                Transform intentions into consistent habits with streak tracking, reminders, and celebration milestones. Small daily commitments create momentum for lasting change.
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Make Route Adjustments</h3>
              <p className="text-muted-foreground">
                Pause for thoughtful reflection with guided journaling prompts. Capture lessons, track mood patterns, and adjust your strategy based on real insights from your journey.
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-success/10 w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Capture Travel Notes</h3>
              <p className="text-muted-foreground">
                Quickly jot down thoughts, ideas, and reminders that emerge along your path. Keep mental clarity with a simple capture system for everything that matters.
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-muted-foreground">
                View real-time dashboards that map your entire journey. See how goals, tasks, habits, and reflections connect to reveal patterns and celebrate your growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Ambitious Professionals Choose BeProductive
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Whether you're climbing the career ladder, building new skills, launching a business, or pursuing personal transformation—BeProductive provides the structured framework that turns ambitious plans into completed achievements.
            </p>
            <p className="text-lg text-muted-foreground">
              Join thousands who've discovered that commitment + consistency + clear direction = goals you actually complete.
            </p>
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
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-primary text-white border-0 apple-hover">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join ambitious professionals, students, entrepreneurs, and growth-seekers who've discovered that the right framework turns aspirations into achievements. Your destination awaits.
            </p>
            <Button size="lg" variant="secondary" className="apple-button" asChild>
              <Link to="/signup">Start Your Journey Free</Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              No credit card required • Free forever plan available
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary journey-float" />
          <span className="font-semibold">BeProductive</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Commit to your journey, achieve your goals
        </p>
      </footer>
    </div>
  );
};
