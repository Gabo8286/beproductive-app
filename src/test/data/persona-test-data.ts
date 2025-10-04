import { UserActivityData } from "@/types/ai";

export interface PersonaTestData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: {
      theme: "light" | "dark" | "auto";
      language: string;
      timezone: string;
    };
  };
  activityData: UserActivityData;
  testScenarios: string[];
}

export const sarahTestData: PersonaTestData = {
  user: {
    id: "sarah-001",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Executive",
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
    },
  },
  activityData: {
    tasks: [
      {
        id: "task-1",
        title: "Board meeting preparation",
        completed: false,
        createdAt: new Date("2025-01-04T08:00:00Z"),
        priority: "high",
        category: "meeting",
        estimatedTime: 120,
      },
      {
        id: "task-2",
        title: "Review Q4 reports",
        completed: true,
        createdAt: new Date("2025-01-03T10:00:00Z"),
        completedAt: new Date("2025-01-03T11:30:00Z"),
        priority: "high",
        category: "review",
        estimatedTime: 90,
        actualTime: 90,
      },
      {
        id: "task-3",
        title: "Call with venture partners",
        completed: false,
        createdAt: new Date("2025-01-04T14:00:00Z"),
        priority: "medium",
        category: "meeting",
        estimatedTime: 60,
      },
    ],
    goals: [
      {
        id: "goal-1",
        title: "Increase company revenue by 25%",
        progress: 78,
        deadline: new Date("2025-12-31"),
        category: "business",
      },
      {
        id: "goal-2",
        title: "Complete leadership training",
        progress: 45,
        deadline: new Date("2025-06-30"),
        category: "professional",
      },
    ],
    habits: [
      {
        id: "habit-1",
        title: "Morning meditation",
        completions: [
          new Date("2025-01-01"),
          new Date("2025-01-02"),
          new Date("2025-01-04"),
        ],
        target: 7,
      },
    ],
    timeEntries: [
      {
        id: "time-1",
        taskId: "task-2",
        startTime: new Date("2025-01-03T10:00:00Z"),
        endTime: new Date("2025-01-03T11:30:00Z"),
        duration: 90,
        category: "review",
      },
    ],
  },
  testScenarios: [
    "mobile_task_creation",
    "voice_note_capture",
    "quick_dashboard_actions",
    "meeting_preparation_workflow",
    "executive_reporting_view",
  ],
};

export const marcusTestData: PersonaTestData = {
  user: {
    id: "marcus-002",
    name: "Marcus Rodriguez",
    email: "marcus.rodriguez@dev.com",
    role: "Developer",
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "America/Los_Angeles",
    },
  },
  activityData: {
    tasks: [
      {
        id: "dev-task-1",
        title: "Fix authentication bug",
        completed: true,
        createdAt: new Date("2025-01-03T09:00:00Z"),
        completedAt: new Date("2025-01-03T11:00:00Z"),
        priority: "high",
        category: "bug",
        estimatedTime: 120,
        actualTime: 120,
      },
      {
        id: "dev-task-2",
        title: "Implement dark mode toggle",
        completed: false,
        createdAt: new Date("2025-01-04T10:00:00Z"),
        priority: "medium",
        category: "feature",
        estimatedTime: 180,
      },
      {
        id: "dev-task-3",
        title: "Code review for team PRs",
        completed: false,
        createdAt: new Date("2025-01-04T15:00:00Z"),
        priority: "medium",
        category: "review",
        estimatedTime: 90,
      },
    ],
    goals: [
      {
        id: "dev-goal-1",
        title: "Learn TypeScript advanced patterns",
        progress: 65,
        deadline: new Date("2025-03-31"),
        category: "learning",
      },
      {
        id: "dev-goal-2",
        title: "Contribute to open source projects",
        progress: 30,
        deadline: new Date("2025-12-31"),
        category: "professional",
      },
    ],
    habits: [
      {
        id: "dev-habit-1",
        title: "Daily coding practice",
        completions: [
          new Date("2025-01-01"),
          new Date("2025-01-02"),
          new Date("2025-01-03"),
          new Date("2025-01-04"),
        ],
        target: 7,
      },
    ],
    timeEntries: [
      {
        id: "dev-time-1",
        taskId: "dev-task-1",
        startTime: new Date("2025-01-03T09:00:00Z"),
        endTime: new Date("2025-01-03T11:00:00Z"),
        duration: 120,
        category: "development",
      },
    ],
  },
  testScenarios: [
    "keyboard_navigation",
    "dark_mode_consistency",
    "technical_task_management",
    "command_palette_usage",
    "developer_workflow_optimization",
  ],
};

export const elenaTestData: PersonaTestData = {
  user: {
    id: "elena-003",
    name: "Elena Petrov",
    email: "elena.petrov@pm.com",
    role: "Project Manager",
    preferences: {
      theme: "light",
      language: "en",
      timezone: "Europe/London",
    },
  },
  activityData: {
    tasks: [
      {
        id: "pm-task-1",
        title: "Sprint planning meeting",
        completed: false,
        createdAt: new Date("2025-01-04T09:00:00Z"),
        priority: "high",
        category: "planning",
        estimatedTime: 120,
      },
      {
        id: "pm-task-2",
        title: "Update project timeline",
        completed: true,
        createdAt: new Date("2025-01-03T14:00:00Z"),
        completedAt: new Date("2025-01-03T15:30:00Z"),
        priority: "medium",
        category: "planning",
        estimatedTime: 90,
        actualTime: 90,
      },
    ],
    goals: [
      {
        id: "pm-goal-1",
        title: "Deliver project on time and budget",
        progress: 55,
        deadline: new Date("2025-06-30"),
        category: "project",
      },
    ],
    habits: [
      {
        id: "pm-habit-1",
        title: "Daily team standup",
        completions: [
          new Date("2025-01-01"),
          new Date("2025-01-02"),
          new Date("2025-01-03"),
        ],
        target: 5,
      },
    ],
    timeEntries: [
      {
        id: "pm-time-1",
        taskId: "pm-task-2",
        startTime: new Date("2025-01-03T14:00:00Z"),
        endTime: new Date("2025-01-03T15:30:00Z"),
        duration: 90,
        category: "planning",
      },
    ],
  },
  testScenarios: [
    "project_management_workflow",
    "team_collaboration_features",
    "reporting_and_analytics",
    "goal_tracking_and_updates",
    "cross_device_synchronization",
  ],
};

export const jamesTestData: PersonaTestData = {
  user: {
    id: "james-004",
    name: "James Thompson",
    email: "james.thompson@freelancer.com",
    role: "Freelancer",
    preferences: {
      theme: "auto",
      language: "en",
      timezone: "America/Chicago",
    },
  },
  activityData: {
    tasks: [
      {
        id: "freelance-task-1",
        title: "Client A website redesign",
        completed: false,
        createdAt: new Date("2025-01-04T08:00:00Z"),
        priority: "high",
        category: "client_work",
        estimatedTime: 480,
      },
      {
        id: "freelance-task-2",
        title: "Invoice preparation for December",
        completed: true,
        createdAt: new Date("2025-01-03T16:00:00Z"),
        completedAt: new Date("2025-01-03T17:00:00Z"),
        priority: "medium",
        category: "administrative",
        estimatedTime: 60,
        actualTime: 60,
      },
    ],
    goals: [
      {
        id: "freelance-goal-1",
        title: "Increase monthly income by 30%",
        progress: 40,
        deadline: new Date("2025-12-31"),
        category: "financial",
      },
    ],
    habits: [
      {
        id: "freelance-habit-1",
        title: "Track time for all projects",
        completions: [
          new Date("2025-01-01"),
          new Date("2025-01-02"),
          new Date("2025-01-03"),
          new Date("2025-01-04"),
        ],
        target: 7,
      },
    ],
    timeEntries: [
      {
        id: "freelance-time-1",
        taskId: "freelance-task-2",
        startTime: new Date("2025-01-03T16:00:00Z"),
        endTime: new Date("2025-01-03T17:00:00Z"),
        duration: 60,
        category: "administrative",
      },
    ],
  },
  testScenarios: [
    "time_tracking_workflow",
    "client_project_switching",
    "invoice_and_billing_features",
    "mobile_time_entry",
    "freelancer_dashboard_optimization",
  ],
};

export const aishaTestData: PersonaTestData = {
  user: {
    id: "aisha-005",
    name: "Aisha Williams",
    email: "aisha.williams@student.edu",
    role: "Student",
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "America/New_York",
    },
  },
  activityData: {
    tasks: [
      {
        id: "student-task-1",
        title: "Complete calculus homework",
        completed: false,
        createdAt: new Date("2025-01-04T18:00:00Z"),
        priority: "high",
        category: "study",
        estimatedTime: 120,
      },
      {
        id: "student-task-2",
        title: "Read chapter 5 for history class",
        completed: true,
        createdAt: new Date("2025-01-03T19:00:00Z"),
        completedAt: new Date("2025-01-03T20:30:00Z"),
        priority: "medium",
        category: "study",
        estimatedTime: 90,
        actualTime: 90,
      },
    ],
    goals: [
      {
        id: "student-goal-1",
        title: "Maintain 3.8 GPA this semester",
        progress: 85,
        deadline: new Date("2025-05-15"),
        category: "academic",
      },
    ],
    habits: [
      {
        id: "student-habit-1",
        title: "Study for 2 hours daily",
        completions: [
          new Date("2025-01-01"),
          new Date("2025-01-02"),
          new Date("2025-01-03"),
        ],
        target: 7,
      },
    ],
    timeEntries: [
      {
        id: "student-time-1",
        taskId: "student-task-2",
        startTime: new Date("2025-01-03T19:00:00Z"),
        endTime: new Date("2025-01-03T20:30:00Z"),
        duration: 90,
        category: "study",
      },
    ],
  },
  testScenarios: [
    "mobile_first_navigation",
    "habit_tracking_consistency",
    "study_session_management",
    "social_productivity_features",
    "student_dashboard_optimization",
  ],
};

export const allPersonaData = {
  sarah: sarahTestData,
  marcus: marcusTestData,
  elena: elenaTestData,
  james: jamesTestData,
  aisha: aishaTestData,
};

export default allPersonaData;
