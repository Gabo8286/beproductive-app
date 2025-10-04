import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Wand2,
  Code,
  Play,
  Edit,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NaturalLanguageRule } from "@/types/ai-automation";

export function NaturalLanguageRuleBuilder() {
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRule, setCurrentRule] = useState<NaturalLanguageRule | null>(
    null,
  );
  const [showExamples, setShowExamples] = useState(false);

  // Mock natural language rules
  const mockRules: NaturalLanguageRule[] = [
    {
      id: "1",
      user_input:
        'When I create a task with "urgent" in the title, automatically set it to high priority and add a red flag tag',
      parsed_intent: {
        action: "modify_task",
        conditions: { title_contains: "urgent" },
        parameters: { priority: "high", add_tags: ["urgent", "red-flag"] },
        confidence: 0.92,
      },
      generated_rule: {
        name: "Urgent Task Auto-Priority",
        ai_type: "intelligent_tagging",
        smart_triggers: [
          {
            type: "pattern_based",
            conditions: { title_keywords: ["urgent"] },
            confidence_threshold: 0.8,
          },
        ],
        smart_actions: [
          {
            type: "modify_task",
            parameters: { priority: "high", add_tags: ["urgent", "red-flag"] },
          },
        ],
      },
      status: "active",
      clarifications_needed: [],
      examples: [
        'Task: "Urgent: Fix server issue" → Priority: High, Tags: urgent, red-flag',
        'Task: "Urgent client meeting" → Priority: High, Tags: urgent, red-flag',
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_input:
        'If I complete 3 tasks in the "exercise" category, mark my fitness habit as completed for today',
      parsed_intent: {
        action: "update_habit",
        conditions: { completed_tasks_with_category: "exercise", count: 3 },
        parameters: { habit_name: "fitness", mark_completed: true },
        confidence: 0.88,
      },
      generated_rule: {
        name: "Exercise Tasks to Habit Sync",
        ai_type: "cross_module_chain",
        smart_triggers: [
          {
            type: "event_based",
            conditions: {
              event: "task_completed",
              category: "exercise",
              daily_count: 3,
            },
          },
        ],
        smart_actions: [
          {
            type: "update_habit",
            parameters: { habit_category: "fitness", mark_completed: true },
          },
        ],
      },
      status: "active",
      clarifications_needed: [],
      examples: [
        'Complete "Morning run" + "Gym session" + "Yoga" → Fitness habit marked complete',
        "Complete 3 exercise tasks → Daily fitness goal achieved",
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      user_input:
        "When it's Friday afternoon, automatically suggest I review my weekly goals",
      parsed_intent: {
        action: "send_notification",
        conditions: { day: "friday", time: "afternoon" },
        parameters: {
          notification_type: "goal_review_reminder",
          message: "Time for weekly goal review",
        },
        confidence: 0.85,
      },
      generated_rule: {
        name: "Weekly Goal Review Reminder",
        ai_type: "predictive_scheduling",
        smart_triggers: [
          {
            type: "time_based",
            conditions: { day_of_week: 5, hour_range: [13, 17] },
          },
        ],
        smart_actions: [
          {
            type: "send_notification",
            parameters: { type: "goal_review", include_progress: true },
          },
        ],
      },
      status: "active",
      clarifications_needed: [],
      examples: [
        'Friday 3 PM → "Time to review your weekly goals!"',
        "Friday afternoon → Goal review notification sent",
      ],
      created_at: new Date().toISOString(),
    },
  ];

  const exampleInputs = [
    "When I mark a task as complete, automatically update the progress on its related goal",
    "If I haven't completed any tasks for 2 hours during work time, send me a gentle reminder",
    "When I create a task with a deadline less than 24 hours away, automatically set it as high priority",
    "If I complete all my daily habits, add 50 points to my gamification score",
    "When someone assigns me a task in team collaboration, automatically add it to my personal task list",
    "If I complete a task that's part of a process, automatically move to the next process step",
    "When I finish writing a note, suggest related goals or tasks based on the content",
    "If my productivity score drops below 70%, automatically suggest a break or schedule easier tasks",
  ];

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock parsed rule
    const mockParsedRule: NaturalLanguageRule = {
      id: Date.now().toString(),
      user_input: userInput,
      parsed_intent: {
        action: "modify_task",
        conditions: { parsed_from_input: true },
        parameters: { ai_generated: true },
        confidence: 0.85,
      },
      generated_rule: {
        name: "AI Generated Rule",
        ai_type: "natural_language_rule",
        smart_triggers: [
          {
            type: "natural_language",
            conditions: { user_input: userInput },
          },
        ],
        smart_actions: [
          {
            type: "ai_suggestion",
            parameters: { generated_from_nl: true },
          },
        ],
      },
      status: "confirmed",
      clarifications_needed: [],
      examples: [`Based on: "${userInput}"`],
      created_at: new Date().toISOString(),
    };

    setCurrentRule(mockParsedRule);
    setIsProcessing(false);
  };

  const handleUseExample = (example: string) => {
    setUserInput(example);
  };

  const getStatusIcon = (status: NaturalLanguageRule["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "parsing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirmed":
        return <Brain className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: NaturalLanguageRule["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "parsing":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            Natural Language Rule Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Create automation rules using plain English descriptions
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowExamples(true)}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Examples
        </Button>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Describe Your Automation
          </CardTitle>
          <CardDescription>
            Describe what you want to automate in plain English, and our AI will
            create the rule for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="automation-input">
                What would you like to automate?
              </Label>
              <Textarea
                id="automation-input"
                placeholder="e.g., When I create a task with 'urgent' in the title, automatically set it to high priority..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Rule
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setUserInput("")}>
                Clear
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 animate-pulse" />
                  AI is analyzing your request...
                </div>
                <Progress value={85} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Rule Preview */}
      {currentRule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Generated Rule Preview
            </CardTitle>
            <CardDescription>
              Review the AI-generated automation rule before activating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-2">Original Request</h5>
                <p className="text-sm text-muted-foreground italic">
                  "{currentRule.user_input}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Parsed Intent</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Action:</span>{" "}
                      {currentRule.parsed_intent.action}
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span>{" "}
                      <Badge variant="outline">
                        {Math.round(currentRule.parsed_intent.confidence * 100)}
                        %
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Generated Rule</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {currentRule.generated_rule.name}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      <Badge variant="secondary">
                        {currentRule.generated_rule.ai_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Activate Rule
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Modify
                </Button>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Natural Language Rules</h3>
        <div className="grid gap-4">
          {mockRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(rule.status)}
                        <h4 className="font-medium">
                          {rule.generated_rule.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(rule.status)}
                        >
                          {rule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic mb-2">
                        "{rule.user_input}"
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">
                        Confidence Score
                      </h5>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={rule.parsed_intent.confidence * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-sm">
                          {Math.round(rule.parsed_intent.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Type</h5>
                      <Badge variant="secondary">
                        {rule.generated_rule.ai_type}
                      </Badge>
                    </div>
                  </div>

                  {rule.examples.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-1">Examples</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rule.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Examples Dialog */}
      <Dialog open={showExamples} onOpenChange={setShowExamples}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Natural Language Automation Examples</DialogTitle>
            <DialogDescription>
              Click on any example to use it as a starting point for your own
              automation rule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {exampleInputs.map((example, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{example}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleUseExample(example);
                        setShowExamples(false);
                      }}
                    >
                      Use This
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamples(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
