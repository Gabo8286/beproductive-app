import { useState, useCallback, useEffect } from "react";
import { DemoState, DemoStep, PersonaType, DemoUserData } from "@/types/demo";

const DEMO_STORAGE_KEY = "beproductive_demo_state";

const getInitialDemoData = (persona: PersonaType): DemoUserData => {
  const baseData = {
    professional: {
      goals: [
        {
          id: "1",
          title: "Launch Personal Brand Website",
          progress: 75,
          milestones: [
            "Design wireframes",
            "Write content",
            "Build MVP",
            "Launch",
          ],
          category: "professional",
        },
        {
          id: "2",
          title: "Master Public Speaking",
          progress: 40,
          milestones: [
            "Join Toastmasters",
            "Practice weekly",
            "Give 5 presentations",
          ],
          category: "professional",
        },
      ],
      habits: [
        { id: "1", name: "Morning Review", streak: 14, target: 30 },
        { id: "2", name: "LinkedIn Networking", streak: 7, target: 21 },
        { id: "3", name: "Industry Reading", streak: 21, target: 365 },
      ],
      tasks: [
        {
          id: "1",
          title: "Prepare Q2 presentation",
          priority: "high" as const,
          status: "in_progress" as const,
          dueDate: "2025-04-15",
        },
        {
          id: "2",
          title: "Review team performance",
          priority: "medium" as const,
          status: "todo" as const,
          dueDate: "2025-04-10",
        },
        {
          id: "3",
          title: "Update project roadmap",
          priority: "high" as const,
          status: "todo" as const,
        },
      ],
      quickTodos: [
        { id: "1", title: "Schedule dentist appointment", completed: false },
        { id: "2", title: "Call insurance company", completed: false },
        { id: "3", title: "Buy birthday gift", completed: true },
      ],
    },
    student: {
      goals: [
        {
          id: "1",
          title: "Read 24 Books This Year",
          progress: 45,
          milestones: [
            "Q1: 6 books",
            "Q2: 6 books",
            "Q3: 6 books",
            "Q4: 6 books",
          ],
          category: "personal",
        },
        {
          id: "2",
          title: "Maintain 3.8 GPA",
          progress: 60,
          milestones: ["Fall semester", "Spring semester"],
          category: "academic",
        },
      ],
      habits: [
        { id: "1", name: "Study 2 hours daily", streak: 12, target: 90 },
        { id: "2", name: "Exercise", streak: 7, target: 21 },
        { id: "3", name: "Morning meditation", streak: 5, target: 30 },
      ],
      tasks: [
        {
          id: "1",
          title: "Complete math assignment",
          priority: "high" as const,
          status: "in_progress" as const,
          dueDate: "2025-04-08",
        },
        {
          id: "2",
          title: "Research paper draft",
          priority: "high" as const,
          status: "todo" as const,
          dueDate: "2025-04-12",
        },
        {
          id: "3",
          title: "Group project meeting",
          priority: "medium" as const,
          status: "todo" as const,
        },
      ],
      quickTodos: [
        { id: "1", title: "Return library books", completed: false },
        { id: "2", title: "Email professor", completed: false },
        { id: "3", title: "Buy textbook", completed: true },
      ],
    },
    entrepreneur: {
      goals: [
        {
          id: "1",
          title: "Reach $10K MRR",
          progress: 30,
          milestones: ["$2.5K", "$5K", "$7.5K", "$10K"],
          category: "business",
        },
        {
          id: "2",
          title: "Build Email List to 5K",
          progress: 55,
          milestones: ["1K subscribers", "2.5K subscribers", "5K subscribers"],
          category: "marketing",
        },
      ],
      habits: [
        { id: "1", name: "Daily content creation", streak: 18, target: 90 },
        { id: "2", name: "Customer outreach", streak: 10, target: 30 },
        { id: "3", name: "Financial review", streak: 7, target: 21 },
      ],
      tasks: [
        {
          id: "1",
          title: "Launch new product feature",
          priority: "high" as const,
          status: "in_progress" as const,
          dueDate: "2025-04-20",
        },
        {
          id: "2",
          title: "Record marketing video",
          priority: "medium" as const,
          status: "todo" as const,
          dueDate: "2025-04-10",
        },
        {
          id: "3",
          title: "Schedule investor meeting",
          priority: "high" as const,
          status: "todo" as const,
        },
      ],
      quickTodos: [
        { id: "1", title: "Reply to customer emails", completed: false },
        { id: "2", title: "Update social media", completed: false },
        { id: "3", title: "Pay contractor invoice", completed: true },
      ],
    },
  };

  return baseData[persona] || baseData.professional;
};

const demoSteps: DemoStep[] = [
  {
    id: "welcome",
    title: "Welcome to BeProductive",
    description:
      "Take a quick tour to see how BeProductive can transform your productivity journey.",
    interactions: [],
    nextStep: "dashboard-overview",
  },
  {
    id: "dashboard-overview",
    title: "Your Personal Dashboard",
    description:
      "This is your command center. All your goals, habits, tasks, and reflections in one place.",
    highlightTarget: '[data-demo="dashboard"]',
    interactions: [],
    nextStep: "goals-widget",
  },
  {
    id: "goals-widget",
    title: "Set & Track Goals",
    description:
      "Break down big dreams into actionable milestones. Track your progress in real-time.",
    highlightTarget: '[data-demo="goals"]',
    interactions: [
      {
        type: "click",
        target: '[data-demo="goal-card"]',
        action: "View goal",
        feedback: "Great! This is how you track goal progress.",
      },
    ],
    nextStep: "habits-widget",
  },
  {
    id: "habits-widget",
    title: "Build Lasting Habits",
    description:
      "Track daily habits and build streaks. Consistency is key to transformation.",
    highlightTarget: '[data-demo="habits"]',
    interactions: [
      {
        type: "click",
        target: '[data-demo="habit-complete"]',
        action: "Complete habit",
        feedback: "Excellent! Watch your streak grow.",
      },
    ],
    nextStep: "tasks-widget",
  },
  {
    id: "tasks-widget",
    title: "Manage Your Tasks",
    description:
      "Organize tasks by priority and status. Never miss a deadline again.",
    highlightTarget: '[data-demo="tasks"]',
    interactions: [
      {
        type: "click",
        target: '[data-demo="task-complete"]',
        action: "Complete task",
        feedback: "Nice work! Keep the momentum going.",
      },
    ],
    nextStep: "quick-todos",
  },
  {
    id: "quick-todos",
    title: "Quick Travel Notes",
    description:
      "Capture quick thoughts and to-dos on the go. Perfect for those spontaneous ideas.",
    highlightTarget: '[data-demo="quick-todos"]',
    interactions: [
      {
        type: "input",
        target: '[data-demo="quick-input"]',
        action: "Add note",
        feedback: "Perfect! Quick capture keeps you organized.",
      },
    ],
    nextStep: "completion",
  },
  {
    id: "completion",
    title: "Ready to Start Your Journey?",
    description:
      "You've seen how BeProductive works. Now it's time to create your own success story.",
    interactions: [],
  },
];

export function useDemoState() {
  const [demoState, setDemoState] = useState<DemoState>(() => {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to default state
      }
    }
    return {
      currentStep: "welcome",
      completedSteps: [],
      userData: getInitialDemoData("professional"),
      progress: 0,
      persona: "professional",
      isActive: false,
    };
  });

  useEffect(() => {
    if (demoState.isActive) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
    }
  }, [demoState]);

  const startDemo = useCallback((persona: PersonaType = "professional") => {
    setDemoState({
      currentStep: "welcome",
      completedSteps: [],
      userData: getInitialDemoData(persona),
      progress: 0,
      persona,
      isActive: true,
    });
  }, []);

  const nextStep = useCallback(() => {
    const currentStepObj = demoSteps.find(
      (s) => s.id === demoState.currentStep,
    );
    if (currentStepObj?.nextStep) {
      setDemoState((prev) => ({
        ...prev,
        currentStep: currentStepObj.nextStep!,
        completedSteps: [...prev.completedSteps, prev.currentStep],
        progress: Math.round(
          ((prev.completedSteps.length + 1) / demoSteps.length) * 100,
        ),
      }));
    }
  }, [demoState.currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = demoSteps.findIndex(
      (s) => s.id === demoState.currentStep,
    );
    if (currentIndex > 0) {
      const prevStep = demoSteps[currentIndex - 1];
      setDemoState((prev) => ({
        ...prev,
        currentStep: prevStep.id,
        completedSteps: prev.completedSteps.slice(0, -1),
        progress: Math.round(
          ((prev.completedSteps.length - 1) / demoSteps.length) * 100,
        ),
      }));
    }
  }, [demoState.currentStep]);

  const skipToStep = useCallback((stepId: string) => {
    const stepIndex = demoSteps.findIndex((s) => s.id === stepId);
    if (stepIndex !== -1) {
      setDemoState((prev) => ({
        ...prev,
        currentStep: stepId,
        progress: Math.round((stepIndex / demoSteps.length) * 100),
      }));
    }
  }, []);

  const endDemo = useCallback(() => {
    setDemoState((prev) => ({
      ...prev,
      isActive: false,
    }));
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }, []);

  const resetDemo = useCallback(() => {
    setDemoState({
      currentStep: "welcome",
      completedSteps: [],
      userData: getInitialDemoData(demoState.persona),
      progress: 0,
      persona: demoState.persona,
      isActive: true,
    });
  }, [demoState.persona]);

  const updateDemoData = useCallback((updates: Partial<DemoUserData>) => {
    setDemoState((prev) => ({
      ...prev,
      userData: {
        ...prev.userData,
        ...updates,
      },
    }));
  }, []);

  const getCurrentStep = useCallback(() => {
    return demoSteps.find((s) => s.id === demoState.currentStep);
  }, [demoState.currentStep]);

  return {
    demoState,
    demoSteps,
    startDemo,
    nextStep,
    previousStep,
    skipToStep,
    endDemo,
    resetDemo,
    updateDemoData,
    getCurrentStep,
  };
}
