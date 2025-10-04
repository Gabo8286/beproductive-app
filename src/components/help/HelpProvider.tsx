import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ContextualHelp,
  HelpArticle,
  ContextualTip,
  SupportTicket,
} from "./ContextualHelp";

export interface HelpContextValue {
  // Articles
  articles: HelpArticle[];
  searchArticles: (query: string, category?: string) => HelpArticle[];
  getArticle: (id: string) => HelpArticle | undefined;
  rateArticle: (articleId: string, helpful: boolean) => void;

  // Tips
  tips: ContextualTip[];
  showTip: (tipId: string) => void;
  dismissTip: (tipId: string) => void;
  dismissedTips: string[];

  // Support
  submitTicket: (
    ticket: Omit<SupportTicket, "id" | "createdAt" | "status">,
  ) => Promise<string>;
  getTickets: () => SupportTicket[];

  // Settings
  helpSettings: {
    showTips: boolean;
    enableKeyboardShortcuts: boolean;
    autoShowTips: boolean;
    tipDelay: number;
  };
  updateHelpSettings: (
    settings: Partial<HelpContextValue["helpSettings"]>,
  ) => void;

  // State
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isHelpVisible: boolean;
  toggleHelp: () => void;
}

const HelpContext = createContext<HelpContextValue | null>(null);

interface HelpProviderProps {
  children: ReactNode;
  userId?: string;
  initialPage?: string;
}

const DEFAULT_ARTICLES: HelpArticle[] = [
  {
    id: "getting-started",
    title: "Getting Started with Spark Bloom Flow",
    content: `
      Welcome to Spark Bloom Flow! This guide will help you get started with the basics.

      ## Creating Your First Task
      1. Click the "+" button in the task list
      2. Enter a descriptive title
      3. Set a priority level
      4. Add a due date if needed
      5. Click "Create Task"

      ## Setting Up Habits
      Habits are recurring activities you want to track:
      1. Go to the Habits section
      2. Click "Add Habit"
      3. Choose a frequency (daily, weekly, etc.)
      4. Set your target
      5. Start tracking!

      ## Understanding Your Dashboard
      Your dashboard shows:
      - Today's tasks and habits
      - Progress overview
      - Quick actions
      - Recent activity

      Need more help? Check out our video tutorials or contact support.
    `,
    category: "Getting Started",
    tags: ["basics", "tutorial", "beginner"],
    difficulty: "beginner",
    readTime: 8,
    helpful: 125,
    notHelpful: 3,
    lastUpdated: new Date("2024-01-15"),
    videoUrl: "https://example.com/getting-started",
    relatedArticles: ["task-management-basics", "habit-tracking-101"],
  },
  {
    id: "task-management-basics",
    title: "Task Management Basics",
    content: `
      Master the fundamentals of task management in Spark Bloom Flow.

      ## Task Priorities
      - **High**: Urgent and important tasks
      - **Medium**: Important but not urgent
      - **Low**: Nice-to-have tasks

      ## Task Status
      - **Pending**: Not yet started
      - **In Progress**: Currently working on
      - **Completed**: Finished
      - **Cancelled**: No longer needed

      ## Organizing Tasks
      - Use tags to categorize tasks
      - Create projects to group related tasks
      - Set due dates to stay on track
      - Use filters to focus on what matters

      ## Pro Tips
      - Review your tasks weekly
      - Break large tasks into smaller ones
      - Use the Eisenhower Matrix for prioritization
      - Celebrate completed tasks!
    `,
    category: "Tasks",
    tags: ["tasks", "organization", "productivity"],
    difficulty: "beginner",
    readTime: 6,
    helpful: 89,
    notHelpful: 2,
    lastUpdated: new Date("2024-01-12"),
    relatedArticles: ["getting-started", "advanced-task-features"],
  },
  {
    id: "habit-tracking-101",
    title: "Habit Tracking 101",
    content: `
      Build lasting habits with our comprehensive tracking system.

      ## Creating Effective Habits
      1. Start small and specific
      2. Choose a consistent time
      3. Link to existing routines
      4. Track consistently
      5. Celebrate milestones

      ## Habit Types
      - **Daily**: Every day habits
      - **Weekly**: Once or more per week
      - **Monthly**: Monthly goals
      - **Custom**: Your own schedule

      ## Tracking Strategies
      - Use the streak counter for motivation
      - Set realistic targets
      - Track multiple related habits
      - Review progress regularly

      ## Common Mistakes to Avoid
      - Starting too many habits at once
      - Setting unrealistic targets
      - Skipping tracking when you miss a day
      - Not celebrating progress
    `,
    category: "Habits",
    tags: ["habits", "tracking", "behavior"],
    difficulty: "beginner",
    readTime: 7,
    helpful: 156,
    notHelpful: 4,
    lastUpdated: new Date("2024-01-10"),
    relatedArticles: ["getting-started", "advanced-habit-features"],
  },
  {
    id: "analytics-overview",
    title: "Understanding Your Analytics",
    content: `
      Get insights into your productivity patterns and progress.

      ## Key Metrics
      - **Completion Rate**: Percentage of tasks completed
      - **Productivity Score**: Overall performance rating
      - **Habit Consistency**: How well you maintain habits
      - **Time Trends**: Patterns in your activity

      ## Reading Charts
      - Line charts show trends over time
      - Bar charts compare different periods
      - Heatmaps show activity patterns
      - Pie charts break down categories

      ## Using Insights
      - Identify your most productive times
      - Spot patterns in completion rates
      - Adjust goals based on data
      - Celebrate improvements

      ## Exporting Data
      You can export your data for further analysis:
      1. Go to Analytics
      2. Click "Export Data"
      3. Choose date range
      4. Select format (CSV, PDF)
      5. Download your report
    `,
    category: "Analytics",
    tags: ["analytics", "data", "insights"],
    difficulty: "intermediate",
    readTime: 10,
    helpful: 78,
    notHelpful: 5,
    lastUpdated: new Date("2024-01-08"),
    relatedArticles: ["advanced-analytics", "data-export"],
  },
];

const DEFAULT_TIPS: ContextualTip[] = [
  {
    id: "dashboard-welcome",
    element: '[data-help="dashboard"]',
    title: "Welcome to Your Dashboard",
    content:
      "This is your command center. Here you can see today's tasks, habit progress, and quick stats.",
    position: "bottom",
    trigger: "auto",
    delay: 2000,
    showOnce: true,
    category: "dashboard",
  },
  {
    id: "task-quick-add",
    element: '[data-help="task-add"]',
    title: "Quick Task Creation",
    content:
      "Click here to quickly add a new task. You can also use Ctrl+N as a keyboard shortcut.",
    position: "bottom",
    trigger: "hover",
    delay: 500,
    category: "tasks",
  },
  {
    id: "habit-streak",
    element: '[data-help="habit-streak"]',
    title: "Habit Streaks",
    content:
      "Your streak shows how many consecutive days you've completed this habit. Keep it going!",
    position: "top",
    trigger: "hover",
    category: "habits",
  },
  {
    id: "analytics-filter",
    element: '[data-help="analytics-filter"]',
    title: "Filter Your Data",
    content:
      "Use these filters to view specific time periods or categories in your analytics.",
    position: "left",
    trigger: "focus",
    category: "analytics",
  },
];

export const HelpProvider: React.FC<HelpProviderProps> = ({
  children,
  userId,
  initialPage = "dashboard",
}) => {
  const [articles] = useState<HelpArticle[]>(DEFAULT_ARTICLES);
  const [tips] = useState<ContextualTip[]>(DEFAULT_TIPS);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [helpSettings, setHelpSettings] = useState({
    showTips: true,
    enableKeyboardShortcuts: true,
    autoShowTips: true,
    tipDelay: 2000,
  });

  // Load dismissed tips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("help-dismissed-tips");
    if (saved) {
      setDismissedTips(JSON.parse(saved));
    }
  }, []);

  // Save dismissed tips to localStorage
  useEffect(() => {
    localStorage.setItem("help-dismissed-tips", JSON.stringify(dismissedTips));
  }, [dismissedTips]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!helpSettings.enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + ? to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === "?") {
        e.preventDefault();
        toggleHelp();
      }
      // F1 to show help
      if (e.key === "F1") {
        e.preventDefault();
        setIsHelpVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [helpSettings.enableKeyboardShortcuts]);

  const searchArticles = (query: string, category?: string): HelpArticle[] => {
    return articles.filter((article) => {
      const matchesQuery =
        query === "" ||
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase()),
        );

      const matchesCategory =
        !category || category === "all" || article.category === category;

      return matchesQuery && matchesCategory;
    });
  };

  const getArticle = (id: string): HelpArticle | undefined => {
    return articles.find((article) => article.id === id);
  };

  const rateArticle = (articleId: string, helpful: boolean) => {
    // In a real app, this would send data to the server
    console.log(
      `Article ${articleId} rated as ${helpful ? "helpful" : "not helpful"}`,
    );

    // Update local state (this would normally be handled by the server)
    // This is just for demo purposes
  };

  const showTip = (tipId: string) => {
    if (!dismissedTips.includes(tipId)) {
      // Show tip implementation would go here
      console.log("Showing tip:", tipId);
    }
  };

  const dismissTip = (tipId: string) => {
    setDismissedTips((prev) => [...prev, tipId]);
  };

  const submitTicket = async (
    ticketData: Omit<SupportTicket, "id" | "createdAt" | "status">,
  ): Promise<string> => {
    const ticket: SupportTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}`,
      createdAt: new Date(),
      status: "open",
      userId: userId || "anonymous",
    };

    setSupportTickets((prev) => [...prev, ticket]);

    // In a real app, this would send to the server
    console.log("Support ticket submitted:", ticket);

    return ticket.id;
  };

  const getTickets = (): SupportTicket[] => {
    return supportTickets.filter((ticket) => ticket.userId === userId);
  };

  const updateHelpSettings = (
    newSettings: Partial<HelpContextValue["helpSettings"]>,
  ) => {
    setHelpSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleHelp = () => {
    setIsHelpVisible((prev) => !prev);
  };

  const contextValue: HelpContextValue = {
    articles,
    searchArticles,
    getArticle,
    rateArticle,
    tips,
    showTip,
    dismissTip,
    dismissedTips,
    submitTicket,
    getTickets,
    helpSettings,
    updateHelpSettings,
    currentPage,
    setCurrentPage,
    isHelpVisible,
    toggleHelp,
  };

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
      <ContextualHelp
        currentPage={currentPage}
        userId={userId}
        showTips={helpSettings.showTips}
        enableSupportTickets={true}
      />
    </HelpContext.Provider>
  );
};

export const useHelp = (): HelpContextValue => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
};

// Hook for page-specific help
export const usePageHelp = (pageName: string) => {
  const { setCurrentPage, tips, articles } = useHelp();

  useEffect(() => {
    setCurrentPage(pageName);
  }, [pageName, setCurrentPage]);

  const pageTips = tips.filter((tip) => tip.category === pageName);
  const pageArticles = articles.filter(
    (article) =>
      article.category.toLowerCase() === pageName.toLowerCase() ||
      article.tags.includes(pageName.toLowerCase()),
  );

  return {
    tips: pageTips,
    articles: pageArticles,
  };
};

// Hook for contextual tips management
export const useTips = () => {
  const { tips, showTip, dismissTip, dismissedTips, helpSettings } = useHelp();

  const activeTips = tips.filter((tip) => !dismissedTips.includes(tip.id));

  const triggerTip = (tipId: string) => {
    const tip = tips.find((t) => t.id === tipId);
    if (tip && helpSettings.showTips) {
      showTip(tipId);
    }
  };

  return {
    tips: activeTips,
    triggerTip,
    dismissTip,
  };
};
