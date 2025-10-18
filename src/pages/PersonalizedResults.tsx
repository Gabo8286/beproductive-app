import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  Zap,
  Star,
  Rocket,
  Mail,
  Download,
  Share2,
} from "lucide-react";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";

// Mapping of personality types to BeProductive features that solve their blockers
const PERSONALITY_TO_BEPRODUCTIVE_MAPPING = {
  strategist: {
    primaryBlockers: [
      "Over-planning without execution",
      "Analysis paralysis on decisions",
      "Difficulty tracking long-term progress",
      "Missing emotional factors in planning"
    ],
    beproductiveFeatures: [
      {
        icon: Target,
        title: "Strategic Goal Tracking",
        description: "Break down long-term objectives into actionable milestones with visual progress tracking",
        benefit: "Turn your strategic thinking into measurable progress"
      },
      {
        icon: Clock,
        title: "Time-boxed Planning Sessions",
        description: "Built-in timers and deadlines to prevent over-planning and encourage action",
        benefit: "Balance thorough planning with timely execution"
      },
      {
        icon: TrendingUp,
        title: "Analytics Dashboard",
        description: "Data-driven insights showing patterns in your productivity and goal achievement",
        benefit: "See the big picture of your productivity trends"
      }
    ],
    ctaMessage: "Ready to turn your strategic thinking into measurable results?",
    urgencyMessage: "Join 2,000+ strategists who've transformed their planning into action"
  },
  executor: {
    primaryBlockers: [
      "Rushing without proper planning",
      "Burnout from overwork",
      "Missing important details",
      "Not seeking stakeholder input"
    ],
    beproductiveFeatures: [
      {
        icon: Zap,
        title: "Smart Task Management",
        description: "Rapid task capture with automated scheduling and deadline tracking",
        benefit: "Maintain your speed while staying organized"
      },
      {
        icon: CheckCircle,
        title: "Quality Checklists",
        description: "Automated reminders and checklists to catch details without slowing you down",
        benefit: "Execute fast without compromising quality"
      },
      {
        icon: Users,
        title: "Stakeholder Integration",
        description: "Quick collaboration features to gather input without lengthy meetings",
        benefit: "Get the input you need without the process overhead"
      }
    ],
    ctaMessage: "Want to maintain your execution speed while improving quality?",
    urgencyMessage: "3,500+ high-performers use BeProductive to execute smarter, not just faster"
  },
  collaborator: {
    primaryBlockers: [
      "Avoiding difficult conversations",
      "Slower individual work pace",
      "Deferring too much to others",
      "Prioritizing harmony over results"
    ],
    beproductiveFeatures: [
      {
        icon: Users,
        title: "Team Productivity Workflows",
        description: "Shared goals, transparent progress tracking, and structured decision-making tools",
        benefit: "Enhance collaboration while maintaining individual accountability"
      },
      {
        icon: Target,
        title: "Individual Focus Modes",
        description: "Dedicated solo work sessions with progress tracking and motivation",
        benefit: "Boost your individual productivity without losing team connection"
      },
      {
        icon: TrendingUp,
        title: "Assertiveness Analytics",
        description: "Track decision-making patterns and get prompts for assertive communication",
        benefit: "Build confidence in independent decision-making"
      }
    ],
    ctaMessage: "Ready to balance collaboration with personal productivity?",
    urgencyMessage: "1,800+ team players have strengthened both individual and group performance"
  },
  optimizer: {
    primaryBlockers: [
      "Over-optimizing simple tasks",
      "Getting distracted by new tools",
      "Neglecting relationship building",
      "Losing sight of bigger picture"
    ],
    beproductiveFeatures: [
      {
        icon: Zap,
        title: "Smart Automation Engine",
        description: "AI-powered workflow optimization that knows when to automate and when to stay manual",
        benefit: "Channel your optimization skills where they matter most"
      },
      {
        icon: Target,
        title: "Impact-Based Prioritization",
        description: "Automatically rank improvements by potential impact to avoid over-optimizing low-value tasks",
        benefit: "Focus your optimization energy on high-impact areas"
      },
      {
        icon: Users,
        title: "Relationship Reminders",
        description: "Scheduled check-ins and relationship maintenance built into your workflow",
        benefit: "Maintain efficiency while building stronger connections"
      }
    ],
    ctaMessage: "Want to optimize your optimization for maximum impact?",
    urgencyMessage: "2,200+ efficiency experts use BeProductive to optimize what matters"
  },
  explorer: {
    primaryBlockers: [
      "Struggling with routine tasks",
      "Difficulty with follow-through",
      "Resisting structure",
      "Lacking focus"
    ],
    beproductiveFeatures: [
      {
        icon: Star,
        title: "Variety-Driven Scheduling",
        description: "AI that rotates task types and suggests creative approaches to maintain engagement",
        benefit: "Stay engaged while building consistent habits"
      },
      {
        icon: Lightbulb,
        title: "Learning-Integrated Goals",
        description: "Every task connects to a learning objective, making routine work feel like growth",
        benefit: "Transform routine tasks into learning opportunities"
      },
      {
        icon: Target,
        title: "Flexible Focus Frameworks",
        description: "Adaptive time-boxing that adjusts to your energy and interest levels",
        benefit: "Build focus skills without rigid constraints"
      }
    ],
    ctaMessage: "Ready to make productivity feel like an adventure?",
    urgencyMessage: "1,500+ explorers have found sustainable productivity through variety and growth"
  },
  perfectionist: {
    primaryBlockers: [
      "Struggling with deadlines",
      "Decision paralysis",
      "Resisting delegation",
      "Burning out from high standards"
    ],
    beproductiveFeatures: [
      {
        icon: Clock,
        title: "Progressive Quality Gates",
        description: "Built-in 'good enough' thresholds with progressive deadlines to prevent perfectionism paralysis",
        benefit: "Maintain quality while meeting deadlines"
      },
      {
        icon: Users,
        title: "Smart Delegation System",
        description: "AI-suggested delegation opportunities with quality control checkpoints",
        benefit: "Delegate confidently without compromising standards"
      },
      {
        icon: TrendingUp,
        title: "Burnout Prevention Analytics",
        description: "Early warning system for overwork with mandatory recovery time scheduling",
        benefit: "Sustain high performance without burning out"
      }
    ],
    ctaMessage: "Want to maintain excellence while finding balance?",
    urgencyMessage: "1,200+ perfectionists have found sustainable excellence with BeProductive"
  },
  minimalist: {
    primaryBlockers: [
      "Missing valuable opportunities",
      "Being too rigid in approach",
      "Under-collaborating",
      "Oversimplifying complex issues"
    ],
    beproductiveFeatures: [
      {
        icon: Target,
        title: "Essential-Only Interface",
        description: "Clean, distraction-free design that shows only what you need, when you need it",
        benefit: "Maintain simplicity while accessing powerful features"
      },
      {
        icon: Lightbulb,
        title: "Opportunity Radar",
        description: "AI-powered alerts for high-value opportunities that align with your priorities",
        benefit: "Catch important opportunities without information overload"
      },
      {
        icon: Users,
        title: "Collaboration When It Counts",
        description: "Smart suggestions for when collaboration would significantly improve outcomes",
        benefit: "Collaborate strategically without losing focus"
      }
    ],
    ctaMessage: "Ready for productivity that's powerful yet simple?",
    urgencyMessage: "900+ minimalists have enhanced their focus while expanding their impact"
  },
  balancer: {
    primaryBlockers: [
      "Lacking intensity during critical periods",
      "Struggling with urgent demands",
      "Avoiding high-stress opportunities",
      "Spreading efforts too thin"
    ],
    beproductiveFeatures: [
      {
        icon: Zap,
        title: "Surge Capacity Protocols",
        description: "Planned high-intensity periods with automatic recovery scheduling",
        benefit: "Handle crunch times without sacrificing long-term balance"
      },
      {
        icon: Target,
        title: "Energy-Based Scheduling",
        description: "AI that schedules tasks based on your energy patterns and life domains",
        benefit: "Optimize performance across all areas of life"
      },
      {
        icon: TrendingUp,
        title: "Holistic Progress Tracking",
        description: "Track success across work, health, relationships, and personal growth",
        benefit: "See your complete picture of sustainable success"
      }
    ],
    ctaMessage: "Want to achieve more while maintaining life balance?",
    urgencyMessage: "2,800+ balanced achievers have amplified their impact through integrated productivity"
  }
};

export default function PersonalizedResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profiles } = useProductivityProfile();
  const [isSharing, setIsSharing] = useState(false);

  const {
    leadData,
    dominant,
    leadScore,
    assessmentResponses,
    qualificationResponses
  } = location.state || {};

  useEffect(() => {
    if (!dominant || !leadData) {
      navigate('/assessment');
    }
  }, [dominant, leadData, navigate]);

  if (!dominant || !leadData) {
    return null;
  }

  const profile = profiles[dominant];
  const mapping = PERSONALITY_TO_BEPRODUCTIVE_MAPPING[dominant];
  const isHighValueLead = leadScore >= 25;

  const handleStartTrial = () => {
    // Track conversion event
    (window as any).gtag?.('event', 'start_trial_from_assessment', {
      personality_type: dominant,
      lead_score: leadScore,
      urgency: qualificationResponses.urgency,
    });

    navigate('/signup', {
      state: {
        source: 'assessment',
        personalityType: dominant,
        leadScore,
        prefillEmail: leadData.email,
        prefillName: `${leadData.firstName} ${leadData.lastName}`,
      }
    });
  };

  const handleShareResults = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I'm a ${profile.name}! Discover your productivity type`,
          text: `I just discovered I'm a ${profile.name} - ${profile.description}. Take the assessment to find your productivity superpower!`,
          url: window.location.origin + '/assessment'
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `I just discovered I'm a ${profile.name} - ${profile.description}. Take the assessment to find your productivity superpower! ${window.location.origin}/assessment`
        );
        // Show toast notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header with Personality Type */}
          <div className="text-center space-y-4">
            <Badge className="px-4 py-2 text-sm bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              Assessment Complete
            </Badge>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  You're a <span className="text-gradient-brand">{profile.name}</span>!
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {profile.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={handleShareResults} disabled={isSharing}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share My Results
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Personality Profile Overview */}
          <Card className="border-2 border-primary/10">
            <CardHeader style={{ backgroundColor: `${profile.color}10` }}>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.icon === 'target' && <Target className="h-8 w-8" />}
                  {profile.icon === 'zap' && <Zap className="h-8 w-8" />}
                  {profile.icon === 'users' && <Users className="h-8 w-8" />}
                  {profile.icon === 'settings' && <Target className="h-8 w-8" />}
                  {profile.icon === 'compass' && <Target className="h-8 w-8" />}
                  {profile.icon === 'star' && <Star className="h-8 w-8" />}
                  {profile.icon === 'minus-circle' && <Target className="h-8 w-8" />}
                  {profile.icon === 'scale' && <Target className="h-8 w-8" />}
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{profile.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {profile.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-700 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {profile.growthAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized BeProductive Solution */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
            <CardHeader>
              <div className="text-center space-y-4">
                <Rocket className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <CardTitle className="text-2xl mb-2">
                    How BeProductive Solves Your Specific Challenges
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Based on your {profile.name} profile, here's how BeProductive addresses your unique productivity blockers:
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Blockers */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">Your Current Productivity Blockers:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {mapping.primaryBlockers.map((blocker, index) => (
                    <div key={index} className="flex items-center text-sm text-red-700">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                      {blocker}
                    </div>
                  ))}
                </div>
              </div>

              {/* BeProductive Solutions */}
              <div>
                <h4 className="font-semibold text-green-800 mb-4">BeProductive Features Designed For You:</h4>
                <div className="grid gap-4">
                  {mapping.beproductiveFeatures.map((feature, index) => (
                    <div key={index} className="bg-white border border-green-200 rounded-lg p-4 flex items-start space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <feature.icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-800 mb-1">{feature.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <p className="text-sm font-medium text-green-700">✓ {feature.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-2">{mapping.ctaMessage}</h3>
                <p className="mb-4 opacity-90">{mapping.urgencyMessage}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100 font-semibold"
                    onClick={handleStartTrial}
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Start My Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    asChild
                  >
                    <Link to="/demo">
                      See Features Demo
                    </Link>
                  </Button>
                </div>

                <p className="text-sm mt-3 opacity-80">
                  {isHighValueLead
                    ? "🎯 High-impact user detected! Get priority onboarding support."
                    : "Free 14-day trial • No credit card required"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Proof & Next Steps */}
          <div className="text-center space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Join Other {profile.name}s Who've Transformed Their Productivity</h3>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>2,000+ {profile.name}s using BeProductive</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>40% productivity increase average</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.8/5 satisfaction rating</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/assessment">
                  Take Assessment Again
                </Link>
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email My Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}