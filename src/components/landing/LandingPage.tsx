import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Repeat, BookOpen, CheckCircle, Code, Zap, Brain, Calendar, Users, Rocket } from "lucide-react";
import { InteractiveJourneyBuilder } from "./InteractiveJourneyBuilder";
import { BuildStory } from "./BuildStory";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import { ConversionEventType } from "@/types/conversion";
import { useState, useEffect } from "react";

export const LandingPage = () => {
  const { trackEvent, trackBehavior } = useConversionTracking();

  const handleCTAClick = (location: string) => {
    trackEvent(ConversionEventType.CTA_CLICK, { location }, 5);
    trackBehavior("click", `cta-${location}`);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

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
            <Button
              variant="ghost"
              className="apple-button font-medium"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              className="apple-button shadow-md hover:shadow-lg font-medium"
              asChild
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Non-Developer Success Story */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="glass-hero rounded-3xl p-8 md:p-16 space-y-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Non-Developer Success Story
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient-brand leading-tight text-left">
                  I Built This Full-Stack App as a Complete Non-Developer. Here's How.
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
                  Using <strong>Lovable.dev</strong>, <strong>Claude AI</strong>, and <strong>Grok</strong> - Zero coding experience required.
                  This productivity platform with enterprise AI monitoring proves that anyone can build sophisticated applications using AI tools.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    className="apple-button shadow-lg hover:shadow-xl text-base h-12 px-8 font-medium"
                    onClick={() => {
                      scrollToSection("build-journey");
                      handleCTAClick("hero-story");
                    }}
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    See How I Did It
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="apple-button glass-card text-base h-12 px-8 font-medium"
                    onClick={() => scrollToSection("demo")}
                  >
                    Try The App I Built
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Built in 3 weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI Agents added in 30 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Zero breaking changes</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-heading font-bold">From Idea to Enterprise App</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-medium">Lovable.dev</span>
                        <p className="text-xs text-muted-foreground mt-1">Visual Development</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-medium">Claude AI</span>
                        <p className="text-xs text-muted-foreground mt-1">Code Generation</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-medium">Grok AI</span>
                        <p className="text-xs text-muted-foreground mt-1">Problem Solving</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary">🎯 Result:</span>
                        <p className="text-muted-foreground">Full productivity platform with enterprise AI monitoring</p>
                      </div>
                      <div>
                        <span className="font-medium text-success">✨ Proof:</span>
                        <p className="text-muted-foreground">Working app you can try right now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Journey Timeline Section */}
      <section id="build-journey" className="container mx-auto px-4 py-24">
        <BuildStory />
      </section>

      {/* Interactive Demo Experience Section */}
      <section id="demo" className="container mx-auto px-4 py-24">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">⚡ Built by a Non-Developer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold">
            See It In Action: A Real Working App
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Every feature you interact with was created through conversation with AI tools.
            This isn't a mockup—it's a fully functional productivity platform with enterprise monitoring.
          </p>
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full glass-card mt-4">
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              100% AI-Generated
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Enterprise Features
            </Badge>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
              Zero Coding Required
            </Badge>
          </div>
        </div>
        <div className="relative">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-semibold text-xl mb-2">Ready to Experience BeProductive?</h3>
              <p className="text-muted-foreground mb-6">
                Sign up now to access the full productivity platform with enterprise monitoring.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="apple-button shadow-lg hover:shadow-xl"
                  asChild
                >
                  <Link to="/signup">Create Free Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="apple-button glass-card"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Builder Section */}
      <section id="interactive-builder" className="container mx-auto px-4 py-24 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              Try Building Something Yourself
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              This interactive widget? I built it with a simple prompt. Try it yourself and see how AI can help you create.
            </p>
          </div>
          <InteractiveJourneyBuilder />
        </div>
      </section>

      {/* Core Features Section - Condensed */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold">
            What This App Can Do
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A quick overview of the productivity platform I built using AI tools.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">
                Set Your Destinations
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Define ambitious goals with clear milestones. Track progress
                with visual dashboards that keep your destination in sight.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Repeat className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">
                Build Daily Routines
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Transform intentions into consistent habits with streak
                tracking, reminders, and celebration milestones.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card elevated-card group">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="rounded-2xl bg-gradient-to-br from-success/10 to-success/5 w-14 h-14 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">
                Track Your Progress
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                View real-time dashboards with AI monitoring that reveals patterns
                and celebrates your growth.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lessons Learned & CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              What I Learned (And What You Can Do)
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              My honest insights from building a full-stack app as a complete non-developer using AI tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h3 className="text-2xl font-heading font-bold">Key Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">AI tools are conversation partners</h4>
                    <p className="text-muted-foreground">The key is learning how to describe what you want clearly, not learning to code.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-success/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start simple, iterate quickly</h4>
                    <p className="text-muted-foreground">Build basic functionality first, then enhance. AI makes iteration incredibly fast.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-secondary/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Multiple AI tools are better than one</h4>
                    <p className="text-muted-foreground">Lovable for building, Claude for logic, Grok for debugging - each has strengths.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-heading font-bold">Honest Challenges</h3>
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold mb-2">Learning AI prompting takes practice</h4>
                  <p className="text-sm text-muted-foreground">First few attempts were frustrating. Learning to be specific and provide context was crucial.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold mb-2">Integration complexity was surprising</h4>
                  <p className="text-sm text-muted-foreground">Adding enterprise features required careful planning to avoid breaking existing functionality.</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <h4 className="font-semibold mb-2">Documentation becomes essential</h4>
                  <p className="text-sm text-muted-foreground">Keeping track of what you built and how becomes critical for maintenance.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="journey-card-featured bg-gradient-to-r from-primary to-blue-600 text-white border-0 overflow-hidden relative shadow-2xl">
            <CardContent className="py-16 px-8 md:px-12 text-center relative z-10">
              <Rocket className="h-12 w-12 mx-auto mb-6 journey-float opacity-80" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 leading-tight">
                Want to Build Your Own App?
              </h2>
              <p className="text-lg md:text-xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
                If I can build this as a complete non-developer, you can too. Start with these resources that helped me succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="apple-button shadow-xl hover:shadow-2xl text-base h-12 px-8 font-medium"
                  asChild
                >
                  <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer">
                    <Zap className="h-5 w-5 mr-2" />
                    Start with Lovable.dev
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="apple-button glass-card text-base h-12 px-8 font-medium border-white/20 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/signup">
                    Try My App
                  </Link>
                </Button>
              </div>
              <p className="text-sm mt-6 opacity-80">
                No credit card required • Start building immediately
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
          Built with ❤️ and 🤖 AI tools - proving anyone can create amazing apps
        </p>
      </footer>
    </div>
  );
};
