import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Check, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export function InteractiveJourneyBuilder() {
  const [goalTitle, setGoalTitle] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;

    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        title: newMilestone,
        completed: false,
      },
    ]);
    setNewMilestone("");
  };

  const toggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m,
      ),
    );
  };

  const handleCreateGoal = () => {
    if (!goalTitle.trim()) return;
    setIsCreated(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const progress =
    milestones.length > 0
      ? (milestones.filter((m) => m.completed).length / milestones.length) * 100
      : 0;

  const handleReset = () => {
    setGoalTitle("");
    setMilestones([]);
    setNewMilestone("");
    setIsCreated(false);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="glass-hero rounded-3xl p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
              <h3 className="text-3xl font-heading font-bold text-gradient-brand mb-2">
                Journey Created!
              </h3>
              <p className="text-lg text-muted-foreground">
                Your destination awaits 🎉
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-card elevated-card">
        <CardContent className="pt-8 pb-8 px-8">
          {!isCreated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Try It Yourself</span>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">
                  Create Your First Journey
                </h3>
                <p className="text-muted-foreground">
                  Experience how BeProductive helps you achieve your goals
                </p>
              </div>

              {/* Goal Input */}
              <div className="space-y-2">
                <Label htmlFor="goal-title" className="text-base font-medium">
                  What's your destination?
                </Label>
                <Input
                  id="goal-title"
                  placeholder="E.g., Launch my side project, Learn Spanish, Run a marathon..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="text-base h-12 glass-card border-2 focus:border-primary"
                />
              </div>

              {/* Milestone Input */}
              <div className="space-y-2">
                <Label htmlFor="milestone" className="text-base font-medium">
                  Add milestones (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="milestone"
                    placeholder="E.g., Complete research phase, Build MVP..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddMilestone()
                    }
                    className="text-base glass-card"
                  />
                  <Button
                    onClick={handleAddMilestone}
                    variant="outline"
                    className="apple-button glass-card"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Milestones List */}
              {milestones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => toggleMilestone(milestone.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg glass-card cursor-pointer hover:bg-primary/5 transition-colors",
                        milestone.completed && "opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          milestone.completed
                            ? "bg-success border-success"
                            : "border-muted-foreground",
                        )}
                      >
                        {milestone.completed && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "flex-1",
                          milestone.completed && "line-through",
                        )}
                      >
                        {milestone.title}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Milestone {index + 1}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreateGoal}
                disabled={!goalTitle.trim()}
                className="w-full h-12 text-base apple-button shadow-lg hover:shadow-xl font-medium"
                size="lg"
              >
                <Target className="h-5 w-5 mr-2" />
                Create My Journey
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-success/20 mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">
                  {goalTitle}
                </h3>
                <p className="text-muted-foreground">Your journey is mapped!</p>
              </div>

              {/* Progress Section */}
              {milestones.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">
                        {milestones.filter((m) => m.completed).length} of{" "}
                        {milestones.length} milestones
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-3 p-3 rounded-lg glass-card"
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            milestone.completed
                              ? "bg-success border-success"
                              : "border-muted-foreground",
                          )}
                        >
                          {milestone.completed && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "flex-1",
                            milestone.completed && "line-through opacity-60",
                          )}
                        >
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full apple-button glass-card"
                >
                  Create Another Journey
                </Button>
                <Button
                  className="w-full apple-button shadow-lg font-medium"
                  asChild
                >
                  <a href="/signup">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start For Real - Sign Up Free
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
