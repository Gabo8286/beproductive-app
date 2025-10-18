import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Users,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Rocket,
  Brain,
  Sparkles,
} from "lucide-react";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeadData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  teamSize: string;
  mainChallenge: string;
  urgency: string;
}

const LEAD_QUALIFICATION_QUESTIONS = [
  {
    id: "role",
    question: "What best describes your role?",
    type: "select",
    options: [
      { value: "executive", label: "Executive/C-Level", score: 10 },
      { value: "manager", label: "Manager/Team Lead", score: 8 },
      { value: "individual", label: "Individual Contributor", score: 6 },
      { value: "entrepreneur", label: "Entrepreneur/Founder", score: 9 },
      { value: "consultant", label: "Consultant/Freelancer", score: 7 },
      { value: "student", label: "Student", score: 3 },
      { value: "other", label: "Other", score: 5 },
    ],
  },
  {
    id: "teamSize",
    question: "How large is your team?",
    type: "select",
    options: [
      { value: "solo", label: "Just me", score: 5 },
      { value: "small", label: "2-10 people", score: 7 },
      { value: "medium", label: "11-50 people", score: 9 },
      { value: "large", label: "50+ people", score: 10 },
    ],
  },
  {
    id: "mainChallenge",
    question: "What's your biggest productivity challenge?",
    type: "textarea",
    placeholder: "Describe your main challenge...",
  },
  {
    id: "urgency",
    question: "How urgent is solving this challenge?",
    type: "select",
    options: [
      { value: "critical", label: "Critical - Need solution ASAP", score: 10 },
      { value: "important", label: "Important - Within next month", score: 8 },
      { value: "moderate", label: "Moderate - Next quarter", score: 6 },
      { value: "exploring", label: "Just exploring options", score: 4 },
    ],
  },
];

export default function LeadGenerationAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { questions, profiles, calculateProfileScores, getDominantProfiles } = useProductivityProfile();

  // Lead capture state
  const [leadData, setLeadData] = useState<LeadData>({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    role: "",
    teamSize: "",
    mainChallenge: "",
    urgency: "",
  });

  // Assessment state
  const [currentStep, setCurrentStep] = useState<'landing' | 'lead-capture' | 'qualification' | 'assessment' | 'results'>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentResponses, setAssessmentResponses] = useState<Record<string, string>>({});
  const [qualificationResponses, setQualificationResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadScore, setLeadScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const qualificationQuestion = LEAD_QUALIFICATION_QUESTIONS[currentQuestionIndex];
  const canProceed = currentStep === 'assessment'
    ? assessmentResponses[currentQuestion?.id]
    : currentStep === 'qualification'
    ? qualificationResponses[qualificationQuestion?.id]
    : true;

  const progress = currentStep === 'assessment'
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : currentStep === 'qualification'
    ? ((currentQuestionIndex + 1) / LEAD_QUALIFICATION_QUESTIONS.length) * 100
    : 0;

  const calculateLeadScore = () => {
    let score = 0;
    LEAD_QUALIFICATION_QUESTIONS.forEach(q => {
      const response = qualificationResponses[q.id];
      const option = q.options?.find(opt => opt.value === response);
      if (option) {
        score += option.score;
      }
    });
    return score;
  };

  const handleLeadDataChange = (field: keyof LeadData, value: string) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentResponse = (value: string) => {
    setAssessmentResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleQualificationResponse = (value: string) => {
    setQualificationResponses(prev => ({
      ...prev,
      [qualificationQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 'landing') {
      setCurrentStep('lead-capture');
    } else if (currentStep === 'lead-capture') {
      if (!leadData.email || !leadData.firstName || !leadData.lastName) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('qualification');
      setCurrentQuestionIndex(0);
    } else if (currentStep === 'qualification') {
      if (currentQuestionIndex === LEAD_QUALIFICATION_QUESTIONS.length - 1) {
        const score = calculateLeadScore();
        setLeadScore(score);
        setCurrentStep('assessment');
        setCurrentQuestionIndex(0);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else if (currentStep === 'assessment') {
      if (currentQuestionIndex === questions.length - 1) {
        handleSubmit();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) {
      if (currentStep === 'qualification') {
        setCurrentStep('lead-capture');
      } else if (currentStep === 'assessment') {
        setCurrentStep('qualification');
        setCurrentQuestionIndex(LEAD_QUALIFICATION_QUESTIONS.length - 1);
      }
    } else {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate personality scores
      const scores = calculateProfileScores(assessmentResponses);
      const { dominant, secondary } = getDominantProfiles(scores);

      // Save lead and assessment data
      const leadRecord = {
        email: leadData.email,
        first_name: leadData.firstName,
        last_name: leadData.lastName,
        company: leadData.company,
        role: leadData.role,
        team_size: leadData.teamSize,
        main_challenge: leadData.mainChallenge,
        urgency: leadData.urgency,
        lead_score: leadScore,
        dominant_profile: dominant,
        secondary_profile: secondary,
        profile_scores: scores,
        assessment_responses: assessmentResponses,
        qualification_responses: qualificationResponses,
        created_at: new Date().toISOString(),
      };

      const { error } = await (supabase
        .from('leads' as any) as any)
        .insert([leadRecord] as any);

      if (error) throw error;

      setCurrentStep('results');

      toast({
        title: "Assessment Complete!",
        description: "See your personalized productivity insights below.",
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Landing page view
  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                <Clock className="h-4 w-4 mr-2" />
                5-Minute Assessment
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gradient-brand leading-tight">
                Discover Your Productivity Superpower
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Take our science-based assessment to uncover your unique productivity style and get personalized strategies that actually work for <strong>your</strong> brain.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>10,000+ professionals assessed</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>4.9/5 accuracy rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Instant results</span>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center border-2 border-primary/10 hover:border-primary/20 transition-colors">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Identify Your Type</h3>
                <p className="text-sm text-muted-foreground">Discover which of 8 productivity profiles matches your natural working style</p>
              </Card>

              <Card className="p-6 text-center border-2 border-secondary/10 hover:border-secondary/20 transition-colors">
                <Brain className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Get Personalized Strategies</h3>
                <p className="text-sm text-muted-foreground">Receive customized productivity techniques designed for your specific type</p>
              </Card>

              <Card className="p-6 text-center border-2 border-green-500/10 hover:border-green-500/20 transition-colors">
                <Rocket className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Unlock Your Potential</h3>
                <p className="text-sm text-muted-foreground">Access BeProductive's features tailored to overcome your specific blockers</p>
              </Card>
            </div>

            {/* CTA */}
            <div className="pt-8">
              <Button
                size="lg"
                className="text-lg h-14 px-8 shadow-lg hover:shadow-xl"
                onClick={handleNext}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start My Assessment
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Free assessment • No credit card required • Instant results
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lead capture form
  if (currentStep === 'lead-capture') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Let's Get Your Personalized Results</h2>
              <p className="text-muted-foreground">
                We'll send your detailed productivity profile and personalized strategies to your email.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={leadData.firstName}
                      onChange={(e) => handleLeadDataChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={leadData.lastName}
                      onChange={(e) => handleLeadDataChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={leadData.email}
                    onChange={(e) => handleLeadDataChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={leadData.company}
                    onChange={(e) => handleLeadDataChange('company', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('landing')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue to Assessment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Qualification questions
  if (currentStep === 'qualification') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Context Question {currentQuestionIndex + 1} of {LEAD_QUALIFICATION_QUESTIONS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{qualificationQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent>
                {qualificationQuestion.type === 'select' && (
                  <Select
                    value={qualificationResponses[qualificationQuestion.id] || ""}
                    onValueChange={handleQualificationResponse}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationQuestion.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {qualificationQuestion.type === 'textarea' && (
                  <Textarea
                    value={qualificationResponses[qualificationQuestion.id] || ""}
                    onChange={(e) => handleQualificationResponse(e.target.value)}
                    placeholder={qualificationQuestion.placeholder}
                    rows={4}
                  />
                )}

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} disabled={!canProceed}>
                    {currentQuestionIndex === LEAD_QUALIFICATION_QUESTIONS.length - 1 ? (
                      "Start Personality Assessment"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Personality assessment questions
  if (currentStep === 'assessment') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-2 border-primary/10">
              <CardHeader>
                <div className="flex items-center space-x-2 text-primary text-sm font-medium">
                  <Target className="h-4 w-4" />
                  <span>{currentQuestion?.category}</span>
                </div>
                <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={assessmentResponses[currentQuestion?.id] || ""}
                  onValueChange={handleAssessmentResponse}
                  className="space-y-4"
                >
                  {currentQuestion?.options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer text-gray-700 leading-relaxed"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || isSubmitting}
                  >
                    {isSubmitting ? (
                      "Analyzing..."
                    ) : currentQuestionIndex === questions.length - 1 ? (
                      "Get My Results"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Results will be handled by PersonalizedResults component
  if (currentStep === 'results') {
    const scores = calculateProfileScores(assessmentResponses);
    const { dominant } = getDominantProfiles(scores);

    navigate('/assessment/results', {
      state: {
        leadData,
        dominant,
        leadScore,
        assessmentResponses,
        qualificationResponses
      }
    });
  }

  return null;
}