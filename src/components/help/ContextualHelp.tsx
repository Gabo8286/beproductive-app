import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Video,
  ExternalLink,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  X,
  Lightbulb,
  Zap,
  Target,
  Users,
  Settings,
  BarChart3,
  Calendar,
  Check,
  Send,
} from "lucide-react";

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  readTime: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
  videoUrl?: string;
  relatedArticles?: string[];
}

export interface ContextualTip {
  id: string;
  element: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  trigger: "hover" | "click" | "focus" | "auto";
  delay?: number;
  showOnce?: boolean;
  category: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: Date;
  userId: string;
}

interface ContextualHelpProps {
  currentPage?: string;
  userId?: string;
  showTips?: boolean;
  enableSupportTickets?: boolean;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "1",
    title: "Getting Started with Task Management",
    content:
      "Learn how to create, organize, and manage your tasks effectively using our task management system.",
    category: "Getting Started",
    tags: ["tasks", "beginner", "basics"],
    difficulty: "beginner",
    readTime: 5,
    helpful: 45,
    notHelpful: 2,
    lastUpdated: new Date("2024-01-10"),
    videoUrl: "https://example.com/video/task-management",
    relatedArticles: ["2", "3"],
  },
  {
    id: "2",
    title: "Setting Up Habit Tracking",
    content:
      "Discover how to create and track habits to build positive routines and achieve your goals.",
    category: "Habits",
    tags: ["habits", "tracking", "goals"],
    difficulty: "beginner",
    readTime: 7,
    helpful: 38,
    notHelpful: 1,
    lastUpdated: new Date("2024-01-12"),
    relatedArticles: ["1", "4"],
  },
  {
    id: "3",
    title: "Advanced Task Prioritization",
    content:
      "Master advanced techniques for prioritizing tasks using the Eisenhower Matrix and other frameworks.",
    category: "Productivity",
    tags: ["tasks", "prioritization", "advanced"],
    difficulty: "advanced",
    readTime: 12,
    helpful: 28,
    notHelpful: 3,
    lastUpdated: new Date("2024-01-08"),
    relatedArticles: ["1", "5"],
  },
  {
    id: "4",
    title: "Understanding Analytics Dashboard",
    content:
      "Learn how to interpret your productivity analytics and use insights to improve your performance.",
    category: "Analytics",
    tags: ["analytics", "dashboard", "insights"],
    difficulty: "intermediate",
    readTime: 10,
    helpful: 32,
    notHelpful: 2,
    lastUpdated: new Date("2024-01-15"),
    videoUrl: "https://example.com/video/analytics",
    relatedArticles: ["2", "6"],
  },
  {
    id: "5",
    title: "Team Collaboration Features",
    content:
      "Explore how to collaborate with your team, share goals, and track collective progress.",
    category: "Collaboration",
    tags: ["team", "collaboration", "sharing"],
    difficulty: "intermediate",
    readTime: 8,
    helpful: 25,
    notHelpful: 1,
    lastUpdated: new Date("2024-01-14"),
    relatedArticles: ["3", "6"],
  },
];

const CONTEXTUAL_TIPS: ContextualTip[] = [
  {
    id: "task-list-tip",
    element: '[data-help="task-list"]',
    title: "Task List Management",
    content:
      "You can drag and drop tasks to reorder them by priority. Use the filters to focus on specific categories.",
    position: "right",
    trigger: "hover",
    delay: 1000,
    category: "tasks",
  },
  {
    id: "habit-tracking-tip",
    element: '[data-help="habit-tracker"]',
    title: "Habit Tracking",
    content:
      "Click the checkmark to mark a habit as completed for today. Streaks help maintain consistency!",
    position: "top",
    trigger: "focus",
    category: "habits",
  },
  {
    id: "analytics-insight",
    element: '[data-help="analytics-chart"]',
    title: "Analytics Insights",
    content:
      "This chart shows your productivity trends over time. Look for patterns to optimize your schedule.",
    position: "bottom",
    trigger: "auto",
    delay: 3000,
    showOnce: true,
    category: "analytics",
  },
];

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  currentPage = "dashboard",
  userId = "user-123",
  showTips = true,
  enableSupportTickets = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );
  const [activeTips, setActiveTips] = useState<string[]>([]);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    message: "",
    category: "general",
    priority: "medium" as const,
  });
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  const helpRef = useRef<HTMLDivElement>(null);

  // Filter articles based on search and category
  const filteredArticles = HELP_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get contextual tips for current page
  const contextualTips = CONTEXTUAL_TIPS.filter(
    (tip) => tip.category === currentPage && !dismissedTips.includes(tip.id),
  );

  // Categories for filtering
  const categories = [
    "all",
    ...Array.from(new Set(HELP_ARTICLES.map((article) => article.category))),
  ];

  // Initialize contextual tips
  useEffect(() => {
    if (showTips && contextualTips.length > 0) {
      contextualTips.forEach((tip) => {
        if (tip.trigger === "auto" && tip.delay) {
          setTimeout(() => {
            setActiveTips((prev) => [...prev, tip.id]);
          }, tip.delay);
        }
      });
    }
  }, [currentPage, showTips]);

  const handleArticleRate = (articleId: string, helpful: boolean) => {
    // Handle article rating
    console.log(
      `Rated article ${articleId} as ${helpful ? "helpful" : "not helpful"}`,
    );
  };

  const dismissTip = (tipId: string) => {
    setActiveTips((prev) => prev.filter((id) => id !== tipId));
    setDismissedTips((prev) => [...prev, tipId]);
  };

  const submitSupportTicket = async () => {
    if (!supportTicket.subject || !supportTicket.message) return;

    // Submit support ticket
    console.log("Submitting support ticket:", supportTicket);

    // Reset form
    setSupportTicket({
      subject: "",
      message: "",
      category: "general",
      priority: "medium",
    });
    setIsTicketDialogOpen(false);
  };

  const getDifficultyColor = (difficulty: HelpArticle["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "getting started":
        return <Target className="h-4 w-4" />;
      case "tasks":
      case "productivity":
        return <Zap className="h-4 w-4" />;
      case "habits":
        return <Calendar className="h-4 w-4" />;
      case "analytics":
        return <BarChart3 className="h-4 w-4" />;
      case "collaboration":
        return <Users className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Help Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Popover open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <PopoverTrigger asChild>
            <Button className="rounded-full w-14 h-14 shadow-lg" size="lg">
              <HelpCircle className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-96 p-0"
            sideOffset={10}
          >
            <div className="max-h-96 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Help & Support
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHelpOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 max-h-80 overflow-y-auto">
                {selectedArticle ? (
                  /* Article View */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArticle(null)}
                      >
                        ← Back
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-2">
                        {selectedArticle.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          className={getDifficultyColor(
                            selectedArticle.difficulty,
                          )}
                        >
                          {selectedArticle.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {selectedArticle.readTime} min read
                        </span>
                        {selectedArticle.videoUrl && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Video className="h-3 w-3" />
                            Video
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4">
                        {selectedArticle.content}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-600">
                          Was this helpful?
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArticleRate(selectedArticle.id, true)
                            }
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArticleRate(selectedArticle.id, false)
                            }
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Article List */
                  <div className="space-y-4">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        onClick={() => setSelectedArticle(HELP_ARTICLES[0])}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Quick Start
                      </Button>
                      <Dialog
                        open={isTicketDialogOpen}
                        onOpenChange={setIsTicketDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            disabled={!enableSupportTickets}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact Support
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contact Support</DialogTitle>
                            <DialogDescription>
                              Describe your issue and we'll help you resolve it.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Subject
                              </label>
                              <Input
                                value={supportTicket.subject}
                                onChange={(e) =>
                                  setSupportTicket((prev) => ({
                                    ...prev,
                                    subject: e.target.value,
                                  }))
                                }
                                placeholder="Brief description of your issue"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Message
                              </label>
                              <Textarea
                                value={supportTicket.message}
                                onChange={(e) =>
                                  setSupportTicket((prev) => ({
                                    ...prev,
                                    message: e.target.value,
                                  }))
                                }
                                placeholder="Detailed description of your issue"
                                rows={4}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Category
                                </label>
                                <select
                                  value={supportTicket.category}
                                  onChange={(e) =>
                                    setSupportTicket((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="general">General</option>
                                  <option value="technical">
                                    Technical Issue
                                  </option>
                                  <option value="billing">Billing</option>
                                  <option value="feature">
                                    Feature Request
                                  </option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Priority
                                </label>
                                <select
                                  value={supportTicket.priority}
                                  onChange={(e) =>
                                    setSupportTicket((prev) => ({
                                      ...prev,
                                      priority: e.target.value as any,
                                    }))
                                  }
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsTicketDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={submitSupportTicket}>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Ticket
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="text-xs"
                        >
                          {category === "all" ? "All" : category}
                        </Button>
                      ))}
                    </div>

                    {/* Articles */}
                    <div className="space-y-2">
                      {filteredArticles.slice(0, 5).map((article) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              {getCategoryIcon(article.category)}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm truncate">
                                  {article.title}
                                </h5>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {article.content.substring(0, 80)}...
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    className={getDifficultyColor(
                                      article.difficulty,
                                    )}
                                    variant="secondary"
                                  >
                                    {article.difficulty}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {article.readTime}m
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {filteredArticles.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No articles found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Contextual Tips */}
      <AnimatePresence>
        {activeTips.map((tipId) => {
          const tip = CONTEXTUAL_TIPS.find((t) => t.id === tipId);
          if (!tip) return null;

          return (
            <motion.div
              key={tipId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 pointer-events-none"
              style={{
                // Position would be calculated based on target element
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Card className="max-w-xs shadow-lg border-blue-200 bg-blue-50 pointer-events-auto">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">{tip.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissTip(tipId)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-blue-800">{tip.content}</p>
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={() => dismissTip(tipId)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Got it
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
};
