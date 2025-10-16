import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Target,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Crown,
} from "lucide-react";
import { useProductivityProfile } from "@/hooks/useProductivityProfile";

export default function ProfileAssessment() {
  const navigate = useNavigate();
  const {
    currentAssessment,
    isLoading,
    isSubmitting,
    submitAssessment,
    retakeAssessment,
    questions,
    profiles,
  } = useProductivityProfile();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = responses[currentQuestion?.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleResponseChange = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      await submitAssessment(responses);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  };

  const handleRetake = () => {
    retakeAssessment();
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowResults(false);
  };

  const handleStartProfessionalTrial = () => {
    // Navigate to signup with professional trial parameters
    navigate("/signup?plan=professional&trial=14&source=assessment");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show results if assessment is completed and we're not retaking
  if (
    currentAssessment &&
    !showResults &&
    Object.keys(responses).length === 0
  ) {
    const dominantProfile = profiles[currentAssessment.dominant_profile];
    const secondaryProfile = currentAssessment.secondary_profile
      ? profiles[currentAssessment.secondary_profile]
      : null;

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Productivity Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Understanding your unique productivity style
            </p>
          </div>
          <Button onClick={handleRetake} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retake Assessment
          </Button>
        </div>

        {/* Main Profile Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: dominantProfile.color }}
              >
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {dominantProfile.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {dominantProfile.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-green-700 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {(currentAssessment.strengths as string[]).map(
                    (strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Growth Areas */}
              <div>
                <h3 className="font-semibold text-orange-700 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Growth Opportunities
                </h3>
                <ul className="space-y-2">
                  {(currentAssessment.growth_areas as string[]).map(
                    (area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            {secondaryProfile && (
              <div className="mt-6 pt-6 border-t border-blue-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  Secondary Profile
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge
                    style={{
                      backgroundColor: secondaryProfile.color,
                      color: "white",
                    }}
                    className="px-3 py-1"
                  >
                    {secondaryProfile.name}
                  </Badge>
                  <span className="text-gray-600">
                    {secondaryProfile.description}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>Personalized Strategies</span>
            </CardTitle>
            <CardDescription>
              Based on your profile, here are strategies to enhance your
              productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(currentAssessment.recommended_strategies as string[]).map(
                (strategy, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="text-gray-700">{strategy}</p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Characteristics */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Characteristics</CardTitle>
            <CardDescription>
              Key traits of {dominantProfile.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dominantProfile.characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{characteristic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Trial CTA */}
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Unlock Your Full Potential
                </h3>
                <p className="text-white/90 text-lg">
                  Get personalized strategies, advanced analytics, and premium tools to maximize your {dominantProfile.name} productivity style.
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>14 Days Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Advanced AI Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Unlimited Projects</span>
                </div>
              </div>

              <Button
                onClick={handleStartProfessionalTrial}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-xl"
              >
                Start 14-Day Professional Trial
              </Button>

              <p className="text-xs text-white/70">
                No credit card required • Cancel anytime • Upgrade based on your assessment results
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show assessment questions
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Productivity Profile Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            Discover your unique productivity style and get personalized
            insights
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <div className="flex items-center space-x-2 text-blue-600 text-sm font-medium">
              <Target className="h-4 w-4" />
              <span>{currentQuestion?.category}</span>
            </div>
            <CardTitle className="text-xl">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={responses[currentQuestion?.id] || ""}
              onValueChange={handleResponseChange}
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
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : isLastQuestion ? (
              <span>Complete Assessment</span>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Assessment Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  About This Assessment
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  This assessment helps identify your natural productivity style
                  among 8 different profiles. Your results will unlock
                  personalized strategies and insights to enhance your
                  productivity journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
