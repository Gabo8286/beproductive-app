/**
 * Luna Framework Documentation - BeProductive Unified Framework Integration
 *
 * This file contains the complete BeProductive Framework that Luna uses to guide
 * users through their productivity journey. Luna acts as an AI productivity coach
 * following these proven methodologies.
 */

export interface FrameworkPrinciple {
  id: string;
  title: string;
  description: string;
  implementation: string[];
  lunaSupport: string[];
}

export interface ImplementationStage {
  id: string;
  name: string;
  duration: string;
  focus: string;
  weeks: StageWeek[];
  successCriteria: string[];
}

export interface StageWeek {
  week: string;
  title: string;
  activities: string[];
}

export interface RecoveryLevel {
  level: number;
  name: string;
  duration: string;
  when: string;
  action: string;
  lunaCommand: string;
  outcome: string;
}

export interface LunaCapability {
  category: string;
  title: string;
  description: string;
  example: string;
}

export interface LunaCommand {
  category: string;
  commands: string[];
}

export interface MetricCategory {
  category: string;
  metrics: ProductivityMetric[];
}

export interface ProductivityMetric {
  name: string;
  description: string;
  target: string;
}

// Core Framework Data
export const FRAMEWORK_OVERVIEW = {
  vision: "Productivity with well-being first - Achieving exceptional results while maintaining optimal health, balance, and fulfillment.",
  mission: "Empower individuals and teams to achieve sustainable productivity through intelligent systems, evidence-based practices, and holistic well-being integration.",
  foundation: "The BeProductive Framework integrates two complementary approaches: Workflow Mastery (capture, clarify, organize, review, engage) and Holistic Optimization (balance planning, focus, energy, well-being, and continuous improvement).",
  coreBelief: "Sustainable productivity comes from working smarter, not harder, by building trusted systems that free your mind to focus on what matters most."
};

export const CORE_PRINCIPLES: FrameworkPrinciple[] = [
  {
    id: "principle-1",
    title: "Capture Everything + Intentional Planning",
    description: "Every commitment, idea, and task must be captured and aligned with your highest priorities.",
    implementation: [
      "Universal Capture System: Quick capture across all devices and channels",
      "Brain Dump Practice: Regular complete mind clearing into system",
      "Smart Intake: Email, voice, mobile, API, and team integrations",
      "Value-Based Filtering: AI-powered priority scoring and alignment checks",
      "Goal Integration: Every task connects to larger objectives"
    ],
    lunaSupport: [
      "Capture this: [task/idea] - instant logging with context",
      "Is this aligned with my goals? - priority assessment",
      "Automatic capture from emails, messages, and meetings",
      "Proactive reminders for uncaptured commitments"
    ]
  },
  {
    id: "principle-2",
    title: "Clarify Purpose + Focus Management",
    description: "Every item must have clear outcomes, and deep focus is your superpower.",
    implementation: [
      "Clarification Workflow: Guided questions for processing",
      "Outcome Definition: Clear, measurable success criteria",
      "Focus Sessions: Time-boxed deep work blocks",
      "Distraction Management: Website blocking, notification control",
      "Environmental Optimization: Workspace and ambient conditions"
    ],
    lunaSupport: [
      "Help me clarify this task - guided clarification process",
      "What's the next action for [project]? - action identification",
      "Automatic focus mode activation during deep work blocks",
      "Break reminders based on cognitive load monitoring"
    ]
  },
  {
    id: "principle-3",
    title: "Organize by Context + Energy Conservation",
    description: "Organize by when/where tasks can be done, aligned with your natural energy rhythms.",
    implementation: [
      "Context Categories: @calls, @computer, @errands, @waiting-for",
      "Priority Matrix: Urgent/Important (Eisenhower) integration",
      "Energy Mapping: High/Medium/Low energy task classification",
      "Optimal Scheduling: AI-powered task scheduling based on patterns"
    ],
    lunaSupport: [
      "What can I do right now? - context-aware suggestions",
      "Schedule my tasks this week - energy-optimized planning",
      "Automatic energy pattern learning and adaptation",
      "Smart task sequencing to minimize context switching"
    ]
  },
  {
    id: "principle-4",
    title: "Reflect & Review + Well-being Integration",
    description: "Regular reflection ensures system health and maintains work-life harmony.",
    implementation: [
      "Review Rhythms: Daily (5 min), Weekly (30 min), Monthly (60 min), Quarterly (2 hours)",
      "Well-being Monitoring: Stress tracking, work-life balance metrics",
      "Health Integration: Sleep tracking, exercise scheduling, mental health check-ins",
      "Recovery Time: Scheduling and protection of rest periods"
    ],
    lunaSupport: [
      "Automated review prompts at optimal times",
      "Pre-populated review agendas with key items",
      "Burnout risk assessment and intervention",
      "How am I doing? - comprehensive wellness report"
    ]
  },
  {
    id: "principle-5",
    title: "Engage with Confidence + Continuous Improvement",
    description: "Trusted systems enable full presence, and small improvements compound into extraordinary results.",
    implementation: [
      "Confident Engagement: Clear next action always visible",
      "Continuous Improvement: Automated productivity insights",
      "System Evolution: Regular health assessments and optimization",
      "Data-driven Decisions: Pattern recognition and recommendations"
    ],
    lunaSupport: [
      "What should I work on now? - confident decision making",
      "Automated productivity insights and trends",
      "Suggested improvements based on behavior patterns",
      "Celebration of wins and streak milestones"
    ]
  }
];

export const IMPLEMENTATION_STAGES: ImplementationStage[] = [
  {
    id: "stage-1",
    name: "Foundation",
    duration: "Weeks 1-8",
    focus: "Build the infrastructure for sustainable productivity",
    weeks: [
      {
        week: "Weeks 1-2",
        title: "System Setup",
        activities: [
          "Platform orientation and navigation",
          "Capture system configuration (desktop, mobile, voice, email)",
          "Initial brain dump - transfer everything to system",
          "Baseline measurement: current productivity and wellness state"
        ]
      },
      {
        week: "Weeks 3-4",
        title: "Habit Formation",
        activities: [
          "Daily capture practice with reminders",
          "Quick capture shortcuts and muscle memory",
          "Multi-channel integration testing",
          "System reliability validation"
        ]
      },
      {
        week: "Weeks 5-6",
        title: "Foundation Strengthening",
        activities: [
          "Advanced capture techniques",
          "Integration with existing tools (calendar, email, communication)",
          "Basic processing workflow introduction",
          "File and document organization structure"
        ]
      },
      {
        week: "Weeks 7-8",
        title: "Confidence Building",
        activities: [
          "Troubleshooting capture failures",
          "System backup and redundancy setup",
          "Celebration of early wins",
          "Foundation assessment and adjustment"
        ]
      }
    ],
    successCriteria: [
      "95%+ capture rate for commitments",
      "< 5 minutes daily capture time",
      "Zero anxiety about forgetting tasks",
      "System access on all devices working smoothly"
    ]
  },
  {
    id: "stage-2",
    name: "Optimization",
    duration: "Weeks 9-16",
    focus: "Refine workflows and enhance productivity systems",
    weeks: [
      {
        week: "Weeks 9-10",
        title: "Clarification Mastery",
        activities: [
          "Processing workflow deep dive",
          "Purpose and outcome clarification practice",
          "Next action identification training",
          "Project vs. task distinction clarity"
        ]
      },
      {
        week: "Weeks 11-12",
        title: "Organization Excellence",
        activities: [
          "Context-based organization implementation",
          "Priority matrix application and practice",
          "Calendar integration and time blocking",
          "Energy-based task scheduling"
        ]
      },
      {
        week: "Weeks 13-14",
        title: "Advanced Workflows",
        activities: [
          "Project management methodology",
          "Goal hierarchy and tracking",
          "Dependencies and relationship mapping",
          "Resource allocation and capacity planning"
        ]
      },
      {
        week: "Weeks 15-16",
        title: "Technology Integration",
        activities: [
          "AI-powered automation setup",
          "Advanced analytics and insights",
          "Cross-platform synchronization",
          "Team collaboration features (if applicable)"
        ]
      }
    ],
    successCriteria: [
      "All inbox items processed within 48 hours",
      "Clear next actions for all projects",
      "Optimal task scheduling based on energy",
      "Integrated system across all tools"
    ]
  },
  {
    id: "stage-3",
    name: "Mastery",
    duration: "Weeks 17-24",
    focus: "Achieve confident engagement and sustainable excellence",
    weeks: [
      {
        week: "Weeks 17-18",
        title: "Review Rhythm Establishment",
        activities: [
          "Daily review process automation",
          "Weekly review methodology mastery",
          "Monthly/quarterly review planning",
          "Strategic thinking integration"
        ]
      },
      {
        week: "Weeks 19-20",
        title: "Engagement Optimization",
        activities: [
          "Flow state cultivation techniques",
          "Focus protocol refinement",
          "Distraction management mastery",
          "Stress reduction and confidence building"
        ]
      },
      {
        week: "Weeks 21-22",
        title: "Well-being Integration",
        activities: [
          "Comprehensive wellness monitoring",
          "Work-life boundary enforcement",
          "Burnout prevention systems active",
          "Health and energy optimization"
        ]
      },
      {
        week: "Weeks 23-24",
        title: "Continuous Improvement",
        activities: [
          "Advanced analytics utilization",
          "System evolution and adaptation",
          "Innovation experimentation",
          "Teaching and mentoring others (if applicable)"
        ]
      }
    ],
    successCriteria: [
      "Consistent review rhythm (100% weekly reviews)",
      "Flow state sessions multiple times per week",
      "Well-being score in healthy range",
      "System feels effortless and trusted",
      "Ability to recover quickly from disruptions"
    ]
  }
];

export const RECOVERY_LEVELS: RecoveryLevel[] = [
  {
    level: 1,
    name: "Quick Capture Recovery",
    duration: "5 minutes",
    when: "System feels chaotic, overwhelmed by inputs",
    action: "Brain dump everything into capture system",
    lunaCommand: "Luna, help me do a brain dump",
    outcome: "Mental clarity, nothing lost"
  },
  {
    level: 2,
    name: "Processing Reset",
    duration: "15 minutes",
    when: "Capture system full but unprocessed",
    action: "Rapid processing of captured items",
    lunaCommand: "Luna, help me process my inbox",
    outcome: "Clear inboxes, actionable items identified"
  },
  {
    level: 3,
    name: "Context Reorganization",
    duration: "30 minutes",
    when: "Tasks exist but organization is unclear",
    action: "Resort tasks by context and priority",
    lunaCommand: "Luna, help me reorganize by context",
    outcome: "Clear next actions for current context"
  },
  {
    level: 4,
    name: "Project Realignment",
    duration: "60 minutes",
    when: "Tasks clear but project coherence lost",
    action: "Review and reorganize by project outcomes",
    lunaCommand: "Luna, review my projects with me",
    outcome: "Clear project priorities and next steps"
  },
  {
    level: 5,
    name: "Goal Resynchronization",
    duration: "2 hours",
    when: "Projects active but disconnected from goals",
    action: "Complete goal review and project alignment",
    lunaCommand: "Luna, let's review my goals and alignment",
    outcome: "All projects aligned with clear purpose"
  },
  {
    level: 6,
    name: "System Redesign",
    duration: "Half day",
    when: "Multiple system components failing",
    action: "Comprehensive system audit and redesign",
    lunaCommand: "Luna, run a complete system audit",
    outcome: "Optimized system matching current needs"
  },
  {
    level: 7,
    name: "Complete Reset",
    duration: "1-2 days",
    when: "System fundamentally broken or life changed dramatically",
    action: "Fresh start with new system design",
    lunaCommand: "Luna, help me start fresh",
    outcome: "New system optimized for current reality"
  }
];

export const LUNA_CAPABILITIES: LunaCapability[] = [
  {
    category: "Intelligent Capture & Clarification",
    title: "Proactive Task Processing",
    description: "Luna helps capture and clarify tasks with guided questions and context analysis",
    example: `User: "I need to prepare for the client presentation next week"
Luna: "I've captured that. Let me help clarify:
- What's the desired outcome? (e.g., 'Approved proposal' or 'Secured next meeting')
- What's the first action? (e.g., 'Draft outline' or 'Review previous presentations')
- Priority level based on your goals? (Analyzing... High priority - aligns with Q2 revenue goal)

I suggest scheduling 2 hours on Wednesday morning when your focus is typically strongest. Should I block that time?"`
  },
  {
    category: "Context-Aware Assistance",
    title: "Smart Work Recommendations",
    description: "Provides personalized task recommendations based on context, energy, and priorities",
    example: `User: "What should I work on now?"
Luna: "Based on your current context (@computer), energy level (high - morning), and priorities, I recommend:

1. [High Priority] Finish product roadmap (2h) - Due Friday, aligns with strategic goals
2. [Medium Priority] Review team proposals (1h) - 3 waiting on your feedback
3. [Quick Win] Respond to Alex's question (15m) - Blocking their progress

You have a meeting in 2.5 hours, so I suggest starting with #1. Want me to start a focus session?"`
  },
  {
    category: "Proactive Guidance",
    title: "System Health Monitoring",
    description: "Monitors productivity patterns and intervenes when system health degrades",
    example: `Luna: "Hey! I noticed you haven't done your weekly review in 2 weeks. Your system health score has dropped to 6/10.

Signs I'm seeing:
- 47 unprocessed inbox items (usually <10)
- 3 overdue tasks
- 2 projects with no recent activity

Can we do a 30-minute review session? I've prepared an agenda for you."`
  },
  {
    category: "Energy & Well-being Monitoring",
    title: "Burnout Prevention",
    description: "Tracks well-being indicators and provides intervention when needed",
    example: `Luna: "I'm noticing some patterns that concern me:
- You've worked past 7 PM for 4 consecutive days
- Your stress indicators are elevated
- You skipped 2 breaks today

Your well-being score is 4/10 (yellow zone). Would you like help:
1. Rescheduling some tasks to next week?
2. Delegating or deferring non-critical items?
3. Blocking recovery time this weekend?

Remember: sustainable productivity comes from well-being first."`
  },
  {
    category: "Recovery Support",
    title: "Overwhelm Management",
    description: "Guides users through recovery processes when feeling overwhelmed",
    example: `User: "Everything feels overwhelming right now"
Luna: "I understand. Let's use Recovery Level 3 - Context Reorganization.

I'll help you:
1. Sort your 73 tasks by context
2. Identify what you can do right now
3. Move non-urgent items to later
4. Clear your focus for today

This should take about 30 minutes. Ready to start?

[After session]
Great work! Here's your simplified focus:
- TODAY (3 tasks, 4h total)
- THIS WEEK (8 tasks, 12h total)
- LATER (62 tasks, scheduled)

Feeling better? Your system health is now 8/10."`
  },
  {
    category: "Learning & Improvement",
    title: "Productivity Analytics",
    description: "Provides insights and improvement recommendations based on behavior patterns",
    example: `Luna: "Monthly Productivity Insights Report:

📈 Wins:
- 92% task completion rate (up from 85%)
- 18h deep work time (goal: 15h)
- 100% weekly reviews completed

🎯 Opportunities:
- You're most productive 9-11 AM, but scheduling low-priority tasks then
- Context switching costs you ~5h/week
- Email processing taking 8h/week (automation opportunity?)

💡 Recommendations:
1. Block 9-11 AM for deep work only
2. Batch similar tasks to reduce context switching
3. Let me auto-process routine emails?

Want to try these this month?"`
  }
];

export const LUNA_COMMANDS: LunaCommand[] = [
  {
    category: "Capture & Planning",
    commands: [
      "Capture this: [task/idea]",
      "What's on my plate today?",
      "Plan my week",
      "Schedule [task] for optimal time"
    ]
  },
  {
    category: "Focus & Execution",
    commands: [
      "What should I work on now?",
      "Start a focus session for [task]",
      "Block distractions",
      "How much time until my next meeting?"
    ]
  },
  {
    category: "Review & Reflection",
    commands: [
      "Let's do my weekly review",
      "How am I doing?",
      "Show me my progress on [goal]",
      "What patterns do you see?"
    ]
  },
  {
    category: "Recovery & Support",
    commands: [
      "Help me do a brain dump",
      "I'm feeling overwhelmed",
      "Reorganize my tasks",
      "Run a system health check"
    ]
  },
  {
    category: "Well-being",
    commands: [
      "Am I working too much?",
      "Suggest a break",
      "Check my stress levels",
      "Block recovery time"
    ]
  }
];

export const SUCCESS_METRICS: MetricCategory[] = [
  {
    category: "Productivity Indicators",
    metrics: [
      {
        name: "Capture Rate",
        description: "% of commitments captured vs. missed",
        target: ">95%"
      },
      {
        name: "Processing Speed",
        description: "Time from capture to clarified action",
        target: "<48 hours"
      },
      {
        name: "Completion Rate",
        description: "% of committed tasks completed",
        target: ">85%"
      },
      {
        name: "Focus Efficiency",
        description: "Deep work hours per week",
        target: "15-20 hours"
      },
      {
        name: "Goal Achievement",
        description: "% of goals met on schedule",
        target: ">80%"
      }
    ]
  },
  {
    category: "Well-being Indicators",
    metrics: [
      {
        name: "Well-being Index",
        description: "Composite stress, balance, satisfaction score",
        target: ">7/10"
      },
      {
        name: "Work-Life Balance",
        description: "Hours beyond work boundaries",
        target: "<5/week"
      },
      {
        name: "Energy Levels",
        description: "Self-reported energy through day",
        target: ">6/10 average"
      },
      {
        name: "Stress Score",
        description: "Perceived stress level",
        target: "<5/10"
      },
      {
        name: "Review Consistency",
        description: "% of reviews completed on time",
        target: "100%"
      }
    ]
  },
  {
    category: "System Health",
    metrics: [
      {
        name: "System Trust Score",
        description: "Confidence in system reliability",
        target: ">9/10"
      },
      {
        name: "Recovery Time",
        description: "Time to recover from system breakdowns",
        target: "<1 hour"
      },
      {
        name: "Automation Usage",
        description: "% of routine tasks automated",
        target: ">60%"
      },
      {
        name: "Integration Success",
        description: "Tools successfully integrated",
        target: "100%"
      }
    ]
  }
];

// Luna's personality and approach guidelines
export const LUNA_PERSONALITY = {
  traits: [
    "Supportive, not pushy: Suggestions, not demands",
    "Data-informed, human-focused: Uses metrics but prioritizes well-being",
    "Adaptive: Learns your preferences and communication style",
    "Proactive but respectful: Intervenes when helpful, stays quiet otherwise",
    "Celebratory: Acknowledges wins and progress",
    "Non-judgmental: Helps recover from setbacks without guilt"
  ],
  corePrinciples: [
    "Well-being comes first - productivity is sustainable only with health",
    "Trust through reliability - the system must be completely dependable",
    "Human-centered approach - technology serves people, not vice versa",
    "Continuous learning - adapt and improve based on user patterns",
    "Encouraging growth - celebrate progress and guide through challenges"
  ]
};

// Daily and weekly practice templates
export const PRACTICE_TEMPLATES = {
  daily: {
    morning: [
      "Review today's priorities with Luna (5 min)",
      "Check energy level and adjust schedule if needed",
      "Identify the one most important task for today",
      "Set intention for focus and well-being"
    ],
    workSession: [
      "Use focus blocks with planned breaks",
      "Single-task with full presence",
      "Capture new items immediately",
      "Check in with energy levels periodically"
    ],
    endOfDay: [
      "Complete tasks in system (5 min)",
      "Plan tomorrow's priorities",
      "Celebrate wins and progress",
      "Review well-being and stress levels"
    ]
  },
  weekly: {
    review: [
      "Process all inboxes to zero",
      "Review project progress against goals",
      "Plan upcoming week with energy optimization",
      "Check goal alignment and make adjustments",
      "Assess system health and make improvements"
    ]
  },
  monthly: {
    review: [
      "Assess goal progress and strategic alignment",
      "Review productivity patterns and insights",
      "Optimize workflows based on data",
      "Plan next month strategically",
      "Conduct comprehensive well-being assessment"
    ]
  }
};

// Framework version and compatibility
export const FRAMEWORK_META = {
  version: "3.0 (Unified)",
  lastUpdated: "January 2025",
  compatibility: [
    "BeProductive Consumer",
    "BeProductive Enterprise",
    "Learning Smart"
  ],
  aiAssistant: "Luna Integration Ready"
};