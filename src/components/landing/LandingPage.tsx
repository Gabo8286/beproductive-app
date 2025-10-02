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
          Commit to Your Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Transform your productivity with a system that grows with you. Set destinations, build routines, and reflect on your progress.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="apple-button" asChild>
            <Link to="/signup">Start Your Journey</Link>
          </Button>
          <Button size="lg" variant="outline" className="apple-button" asChild>
            <Link to="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Journey Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Your Productivity Journey
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Set Your Destinations</h3>
              <p className="text-muted-foreground">
                Define meaningful goals that guide your journey forward
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Repeat className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Build Your Routines</h3>
              <p className="text-muted-foreground">
                Create consistent habits that power your daily progress
              </p>
            </CardContent>
          </Card>

          <Card className="journey-progress apple-hover">
            <CardContent className="pt-6">
              <div className="rounded-full bg-success/10 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reflect & Adjust</h3>
              <p className="text-muted-foreground">
                Learn from your experiences and optimize your path
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Seamless Journey to Success
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              BeProductive brings together everything you need for a productive life in one integrated platform. Track your progress, build better habits, and grow continuously.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Clear goal tracking with milestone management",
              "Daily habit building with streak analytics",
              "Thoughtful reflection and journaling tools",
              "Integrated progress insights",
              "Personal workspace organization",
              "Seamless mobile experience"
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
              Your Journey Starts Today
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of people who are already transforming their lives with BeProductive
            </p>
            <Button size="lg" variant="secondary" className="apple-button" asChild>
              <Link to="/signup">Begin Your Journey</Link>
            </Button>
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
