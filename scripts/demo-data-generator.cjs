#!/usr/bin/env node

/**
 * Demo Data Generator
 * BeProductive v2: Spark Bloom Flow
 *
 * Purpose: Generate realistic demo data for all user personas
 * Author: Gabriel Soto Morales (with AI assistance)
 * Date: January 2025
 */

const fs = require('fs');
const path = require('path');

class DemoDataGenerator {
  constructor() {
    this.agentName = 'Demo Data Generator';
    this.version = '1.0.0';
    this.startTime = Date.now();
    this.basePath = process.cwd();

    this.personas = {
      sarah: {
        name: 'Sarah Chen',
        role: 'Executive',
        email: 'sarah.chen@company.com',
        preferences: { theme: 'light', language: 'en', timezone: 'America/New_York' }
      },
      marcus: {
        name: 'Marcus Rodriguez',
        role: 'Developer',
        email: 'marcus.rodriguez@dev.com',
        preferences: { theme: 'dark', language: 'en', timezone: 'America/Los_Angeles' }
      },
      elena: {
        name: 'Elena Petrov',
        role: 'Project Manager',
        email: 'elena.petrov@pm.com',
        preferences: { theme: 'light', language: 'en', timezone: 'Europe/London' }
      },
      james: {
        name: 'James Thompson',
        role: 'Freelancer',
        email: 'james.thompson@freelancer.com',
        preferences: { theme: 'auto', language: 'en', timezone: 'America/Chicago' }
      },
      aisha: {
        name: 'Aisha Williams',
        role: 'Student',
        email: 'aisha.williams@student.edu',
        preferences: { theme: 'dark', language: 'en', timezone: 'America/New_York' }
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${this.agentName}: ${message}${colors.reset}`);
  }

  generatePersonaData(personaKey, persona) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let tasks, goals, habits, timeEntries, notes;

    switch (personaKey) {
      case 'sarah':
        tasks = [
          {
            id: 'sarah-task-1',
            title: 'Board meeting preparation',
            description: 'Prepare Q4 financial reports and strategy presentation',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'meeting',
            estimatedTime: 180,
            tags: ['quarterly', 'board', 'finance']
          },
          {
            id: 'sarah-task-2',
            title: 'Review team performance metrics',
            description: 'Analyze team KPIs and prepare feedback sessions',
            completed: true,
            createdAt: yesterday.toISOString(),
            completedAt: now.toISOString(),
            priority: 'high',
            category: 'management',
            estimatedTime: 120,
            actualTime: 105,
            tags: ['team', 'performance', 'kpi']
          },
          {
            id: 'sarah-task-3',
            title: 'Investor call - Series B discussion',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'meeting',
            estimatedTime: 90,
            tags: ['investor', 'funding', 'series-b']
          },
          {
            id: 'sarah-task-4',
            title: 'Approve marketing budget for Q1',
            completed: false,
            createdAt: yesterday.toISOString(),
            dueDate: nextWeek.toISOString(),
            priority: 'medium',
            category: 'finance',
            estimatedTime: 60,
            tags: ['budget', 'marketing', 'q1']
          }
        ];

        goals = [
          {
            id: 'sarah-goal-1',
            title: 'Increase company revenue by 25%',
            description: 'Drive revenue growth through strategic initiatives',
            progress: 78,
            deadline: new Date(2025, 11, 31).toISOString(),
            category: 'business',
            milestones: [
              { title: 'Q1 targets met', completed: true, date: new Date(2025, 2, 31).toISOString() },
              { title: 'Q2 targets met', completed: true, date: new Date(2025, 5, 30).toISOString() },
              { title: 'Q3 targets met', completed: true, date: new Date(2025, 8, 30).toISOString() },
              { title: 'Q4 targets', completed: false, date: new Date(2025, 11, 31).toISOString() }
            ]
          },
          {
            id: 'sarah-goal-2',
            title: 'Complete executive leadership program',
            description: 'Enhance leadership skills through certified program',
            progress: 45,
            deadline: new Date(2025, 5, 30).toISOString(),
            category: 'professional',
            milestones: [
              { title: 'Module 1: Strategic Thinking', completed: true },
              { title: 'Module 2: Team Leadership', completed: true },
              { title: 'Module 3: Financial Management', completed: false },
              { title: 'Module 4: Innovation Leadership', completed: false }
            ]
          }
        ];

        habits = [
          {
            id: 'sarah-habit-1',
            title: 'Morning meditation',
            description: '10 minutes of mindfulness to start the day',
            completions: [
              yesterday.toISOString(),
              new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              now.toISOString()
            ],
            target: 7,
            frequency: 'daily',
            streak: 3
          },
          {
            id: 'sarah-habit-2',
            title: 'Review daily priorities',
            description: 'Plan and prioritize the day ahead',
            completions: [
              yesterday.toISOString(),
              new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              now.toISOString()
            ],
            target: 7,
            frequency: 'daily',
            streak: 4
          }
        ];
        break;

      case 'marcus':
        tasks = [
          {
            id: 'marcus-task-1',
            title: 'Fix authentication bug in user login',
            description: 'Resolve OAuth integration issue causing login failures',
            completed: true,
            createdAt: yesterday.toISOString(),
            completedAt: now.toISOString(),
            priority: 'high',
            category: 'bug',
            estimatedTime: 120,
            actualTime: 95,
            tags: ['auth', 'oauth', 'critical']
          },
          {
            id: 'marcus-task-2',
            title: 'Implement dark mode toggle component',
            description: 'Create reusable theme switcher with smooth transitions',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            category: 'feature',
            estimatedTime: 180,
            tags: ['ui', 'theme', 'component']
          },
          {
            id: 'marcus-task-3',
            title: 'Code review for team PRs',
            description: 'Review 5 pending pull requests from team members',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            category: 'review',
            estimatedTime: 90,
            tags: ['review', 'team', 'pr']
          },
          {
            id: 'marcus-task-4',
            title: 'Optimize database queries',
            description: 'Improve performance of user data fetching',
            completed: false,
            createdAt: yesterday.toISOString(),
            priority: 'low',
            category: 'optimization',
            estimatedTime: 240,
            tags: ['database', 'performance', 'optimization']
          }
        ];

        goals = [
          {
            id: 'marcus-goal-1',
            title: 'Master TypeScript advanced patterns',
            description: 'Become proficient in advanced TS concepts and patterns',
            progress: 65,
            deadline: new Date(2025, 2, 31).toISOString(),
            category: 'learning',
            milestones: [
              { title: 'Generic Types', completed: true },
              { title: 'Conditional Types', completed: true },
              { title: 'Template Literal Types', completed: false },
              { title: 'Advanced Mapped Types', completed: false }
            ]
          },
          {
            id: 'marcus-goal-2',
            title: 'Contribute to 3 open source projects',
            description: 'Make meaningful contributions to OSS community',
            progress: 33,
            deadline: new Date(2025, 11, 31).toISOString(),
            category: 'professional',
            milestones: [
              { title: 'React component library', completed: true },
              { title: 'Node.js utility package', completed: false },
              { title: 'TypeScript definitions', completed: false }
            ]
          }
        ];

        habits = [
          {
            id: 'marcus-habit-1',
            title: 'Daily coding practice',
            description: 'Solve algorithmic problems and practice coding',
            completions: Array.from({ length: 5 }, (_, i) =>
              new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString()
            ),
            target: 7,
            frequency: 'daily',
            streak: 5
          },
          {
            id: 'marcus-habit-2',
            title: 'Read tech articles',
            description: 'Stay updated with latest development trends',
            completions: [
              yesterday.toISOString(),
              new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              now.toISOString()
            ],
            target: 5,
            frequency: 'weekly',
            streak: 3
          }
        ];
        break;

      case 'elena':
        tasks = [
          {
            id: 'elena-task-1',
            title: 'Sprint planning meeting',
            description: 'Plan user stories and estimate effort for next sprint',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'planning',
            estimatedTime: 120,
            tags: ['sprint', 'planning', 'team']
          },
          {
            id: 'elena-task-2',
            title: 'Update project timeline',
            description: 'Adjust milestones based on current progress',
            completed: true,
            createdAt: yesterday.toISOString(),
            completedAt: now.toISOString(),
            priority: 'medium',
            category: 'planning',
            estimatedTime: 90,
            actualTime: 75,
            tags: ['timeline', 'milestones', 'tracking']
          },
          {
            id: 'elena-task-3',
            title: 'Client stakeholder review',
            description: 'Present project progress to key stakeholders',
            completed: false,
            createdAt: yesterday.toISOString(),
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'meeting',
            estimatedTime: 60,
            tags: ['client', 'stakeholder', 'review']
          }
        ];

        goals = [
          {
            id: 'elena-goal-1',
            title: 'Deliver project on time and budget',
            description: 'Successfully complete the digital transformation project',
            progress: 75,
            deadline: new Date(2025, 5, 30).toISOString(),
            category: 'project',
            milestones: [
              { title: 'Discovery Phase', completed: true },
              { title: 'Design Phase', completed: true },
              { title: 'Development Phase', completed: false },
              { title: 'Testing & Launch', completed: false }
            ]
          },
          {
            id: 'elena-goal-2',
            title: 'Achieve PMP certification',
            description: 'Complete Project Management Professional certification',
            progress: 40,
            deadline: new Date(2025, 8, 30).toISOString(),
            category: 'professional',
            milestones: [
              { title: 'Complete training hours', completed: false },
              { title: 'Submit application', completed: false },
              { title: 'Take exam', completed: false }
            ]
          }
        ];

        habits = [
          {
            id: 'elena-habit-1',
            title: 'Daily team standup',
            description: 'Check in with team progress and blockers',
            completions: [
              yesterday.toISOString(),
              new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              now.toISOString()
            ],
            target: 5,
            frequency: 'weekdays',
            streak: 4
          }
        ];
        break;

      case 'james':
        tasks = [
          {
            id: 'james-task-1',
            title: 'Client A - Website redesign',
            description: 'Complete homepage and product pages redesign',
            completed: false,
            createdAt: lastWeek.toISOString(),
            dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'client_work',
            estimatedTime: 480,
            tags: ['client-a', 'redesign', 'website']
          },
          {
            id: 'james-task-2',
            title: 'Invoice Client B for December',
            description: 'Generate and send invoice for completed work',
            completed: true,
            createdAt: yesterday.toISOString(),
            completedAt: now.toISOString(),
            priority: 'high',
            category: 'administrative',
            estimatedTime: 30,
            actualTime: 25,
            tags: ['invoice', 'client-b', 'billing']
          },
          {
            id: 'james-task-3',
            title: 'Update portfolio website',
            description: 'Add recent projects and client testimonials',
            completed: false,
            createdAt: now.toISOString(),
            priority: 'medium',
            category: 'personal',
            estimatedTime: 120,
            tags: ['portfolio', 'marketing', 'website']
          }
        ];

        goals = [
          {
            id: 'james-goal-1',
            title: 'Increase monthly income by 30%',
            description: 'Grow freelance business through better rates and more clients',
            progress: 45,
            deadline: new Date(2025, 11, 31).toISOString(),
            category: 'financial',
            milestones: [
              { title: 'Raise rates by 20%', completed: true },
              { title: 'Get 2 new premium clients', completed: false },
              { title: 'Launch premium service package', completed: false }
            ]
          }
        ];

        habits = [
          {
            id: 'james-habit-1',
            title: 'Track time for all projects',
            description: 'Record time spent on each client project',
            completions: Array.from({ length: 7 }, (_, i) =>
              new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString()
            ),
            target: 7,
            frequency: 'daily',
            streak: 7
          }
        ];
        break;

      case 'aisha':
        tasks = [
          {
            id: 'aisha-task-1',
            title: 'Complete calculus homework - Chapter 8',
            description: 'Solve integration problems 1-25',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'study',
            estimatedTime: 120,
            tags: ['calculus', 'homework', 'math']
          },
          {
            id: 'aisha-task-2',
            title: 'Read "Pride and Prejudice" - Chapters 10-15',
            description: 'Reading assignment for English Literature class',
            completed: true,
            createdAt: yesterday.toISOString(),
            completedAt: now.toISOString(),
            priority: 'medium',
            category: 'study',
            estimatedTime: 90,
            actualTime: 105,
            tags: ['english', 'literature', 'reading']
          },
          {
            id: 'aisha-task-3',
            title: 'Study group - Chemistry exam prep',
            description: 'Review organic chemistry concepts with study group',
            completed: false,
            createdAt: now.toISOString(),
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            category: 'study',
            estimatedTime: 180,
            tags: ['chemistry', 'exam', 'study-group']
          }
        ];

        goals = [
          {
            id: 'aisha-goal-1',
            title: 'Maintain 3.8 GPA this semester',
            description: 'Keep high academic performance across all courses',
            progress: 85,
            deadline: new Date(2025, 4, 15).toISOString(),
            category: 'academic',
            milestones: [
              { title: 'Midterm exams average 3.8+', completed: true },
              { title: 'Complete all major assignments', completed: false },
              { title: 'Final exams average 3.8+', completed: false }
            ]
          }
        ];

        habits = [
          {
            id: 'aisha-habit-1',
            title: 'Study for 2 hours daily',
            description: 'Dedicated study time for coursework',
            completions: [
              yesterday.toISOString(),
              new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              now.toISOString()
            ],
            target: 7,
            frequency: 'daily',
            streak: 4
          }
        ];
        break;
    }

    // Generate time entries based on completed tasks
    timeEntries = tasks
      .filter(task => task.completed && task.actualTime)
      .map(task => ({
        id: `time-${task.id}`,
        taskId: task.id,
        startTime: new Date(task.completedAt).toISOString(),
        endTime: new Date(new Date(task.completedAt).getTime() + task.actualTime * 60 * 1000).toISOString(),
        duration: task.actualTime,
        category: task.category,
        description: task.title
      }));

    // Generate notes based on persona
    notes = this.generateNotesForPersona(personaKey, persona);

    return {
      user: {
        id: `${personaKey}-001`,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        preferences: persona.preferences,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`,
        joinDate: new Date(2024, 0, 1).toISOString(),
        lastActive: now.toISOString()
      },
      activityData: {
        tasks,
        goals,
        habits,
        timeEntries,
        notes
      },
      statistics: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        totalGoals: goals.length,
        avgGoalProgress: goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
        totalHabits: habits.length,
        habitStreak: Math.max(...habits.map(h => h.streak || 0)),
        totalTimeTracked: timeEntries.reduce((sum, t) => sum + t.duration, 0)
      }
    };
  }

  generateNotesForPersona(personaKey, persona) {
    const now = new Date();

    const notesByPersona = {
      sarah: [
        {
          id: 'sarah-note-1',
          title: 'Board Meeting Strategy',
          content: 'Key points for Q4 board presentation:\n- Revenue up 23% YoY\n- Team expansion in Q1\n- New product line launch timeline\n- Investment in AI/ML capabilities',
          tags: ['board', 'strategy', 'q4'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 'sarah-note-2',
          title: 'Leadership Insights',
          content: 'Notes from executive coaching session:\n- Focus on delegation\n- Improve cross-functional collaboration\n- Develop succession planning\n- Invest in team development',
          tags: ['leadership', 'coaching', 'development'],
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      marcus: [
        {
          id: 'marcus-note-1',
          title: 'TypeScript Advanced Patterns',
          content: 'Conditional types syntax:\n```typescript\ntype NonNullable<T> = T extends null | undefined ? never : T\n```\nUseful for creating more precise type definitions.',
          tags: ['typescript', 'learning', 'programming'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 'marcus-note-2',
          title: 'Code Review Checklist',
          content: '- Security vulnerabilities\n- Performance implications\n- Code readability\n- Test coverage\n- Documentation updates\n- Breaking changes',
          tags: ['code-review', 'checklist', 'best-practices'],
          createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
        }
      ],
      elena: [
        {
          id: 'elena-note-1',
          title: 'Project Retrospective',
          content: 'Sprint 12 retrospective notes:\nWhat went well:\n- Team velocity improved\n- Better estimation accuracy\n\nWhat to improve:\n- Earlier stakeholder feedback\n- More thorough testing',
          tags: ['project', 'retrospective', 'scrum'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ],
      james: [
        {
          id: 'james-note-1',
          title: 'Client Feedback - Website Project',
          content: 'Client A feedback on homepage:\n- Love the modern design\n- Request mobile optimization\n- Add contact form\n- Consider adding testimonials section',
          tags: ['client-feedback', 'website', 'design'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ],
      aisha: [
        {
          id: 'aisha-note-1',
          title: 'Chemistry Study Notes',
          content: 'Organic Chemistry - Chapter 12:\n- Alcohols and Phenols\n- Naming conventions: -ol suffix\n- Properties: hydrogen bonding affects boiling point\n- Reactions: dehydration, oxidation',
          tags: ['chemistry', 'study', 'organic'],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 'aisha-note-2',
          title: 'Literature Essay Ideas',
          content: 'Pride and Prejudice essay topics:\n1. Social class and marriage\n2. Character development of Elizabeth Bennet\n3. Irony and wit in Austen\'s writing\n4. Gender roles in Regency England',
          tags: ['literature', 'essay', 'pride-prejudice'],
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return notesByPersona[personaKey] || [];
  }

  async generateAllPersonaData() {
    this.log('🎭 Generating demo data for all personas...');

    const allData = {};

    for (const [key, persona] of Object.entries(this.personas)) {
      this.log(`📊 Generating data for ${persona.name} (${persona.role})`);
      allData[key] = this.generatePersonaData(key, persona);
    }

    // Save individual persona files
    const dataDir = path.join(this.basePath, 'src/data/demo');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save each persona's data
    for (const [key, data] of Object.entries(allData)) {
      const filePath = path.join(dataDir, `${key}-demo-data.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      this.log(`✅ Created ${key} demo data`);
    }

    // Create consolidated demo data file
    const consolidatedPath = path.join(dataDir, 'all-personas-demo-data.json');
    fs.writeFileSync(consolidatedPath, JSON.stringify(allData, null, 2));

    // Create TypeScript types for demo data
    await this.createDemoDataTypes();

    // Create demo data loader utility
    await this.createDemoDataLoader();

    this.log(`✅ Demo data generation completed for ${Object.keys(allData).length} personas`);
    return allData;
  }

  async createDemoDataTypes() {
    const typesContent = `// Demo Data Types
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  avatar: string;
  joinDate: string;
  lastActive: string;
}

export interface DemoTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedTime?: number;
  actualTime?: number;
  tags: string[];
}

export interface DemoGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  category: string;
  milestones: Array<{
    title: string;
    completed: boolean;
    date?: string;
  }>;
}

export interface DemoHabit {
  id: string;
  title: string;
  description: string;
  completions: string[];
  target: number;
  frequency: 'daily' | 'weekly' | 'weekdays';
  streak: number;
}

export interface DemoTimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  description: string;
}

export interface DemoNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoActivityData {
  tasks: DemoTask[];
  goals: DemoGoal[];
  habits: DemoHabit[];
  timeEntries: DemoTimeEntry[];
  notes: DemoNote[];
}

export interface DemoStatistics {
  totalTasks: number;
  completedTasks: number;
  totalGoals: number;
  avgGoalProgress: number;
  totalHabits: number;
  habitStreak: number;
  totalTimeTracked: number;
}

export interface PersonaDemoData {
  user: DemoUser;
  activityData: DemoActivityData;
  statistics: DemoStatistics;
}

export interface AllDemoData {
  sarah: PersonaDemoData;
  marcus: PersonaDemoData;
  elena: PersonaDemoData;
  james: PersonaDemoData;
  aisha: PersonaDemoData;
}

export type PersonaKey = keyof AllDemoData;

export default PersonaDemoData;`;

    const typesPath = path.join(this.basePath, 'src/types/demo-data.ts');
    fs.writeFileSync(typesPath, typesContent);
    this.log('✅ Created demo data TypeScript types');
  }

  async createDemoDataLoader() {
    const loaderContent = `import { AllDemoData, PersonaDemoData, PersonaKey } from '@/types/demo-data';

// Import all demo data files
import sarahData from '@/data/demo/sarah-demo-data.json';
import marcusData from '@/data/demo/marcus-demo-data.json';
import elenaData from '@/data/demo/elena-demo-data.json';
import jamesData from '@/data/demo/james-demo-data.json';
import aishaData from '@/data/demo/aisha-demo-data.json';

/**
 * Demo Data Loader Utility
 * Provides easy access to persona demo data for development and testing
 */
export class DemoDataLoader {
  private static instance: DemoDataLoader;
  private demoData: AllDemoData;

  private constructor() {
    this.demoData = {
      sarah: sarahData as PersonaDemoData,
      marcus: marcusData as PersonaDemoData,
      elena: elenaData as PersonaDemoData,
      james: jamesData as PersonaDemoData,
      aisha: aishaData as PersonaDemoData
    };
  }

  public static getInstance(): DemoDataLoader {
    if (!DemoDataLoader.instance) {
      DemoDataLoader.instance = new DemoDataLoader();
    }
    return DemoDataLoader.instance;
  }

  /**
   * Get demo data for a specific persona
   */
  getPersonaData(persona: PersonaKey): PersonaDemoData {
    return this.demoData[persona];
  }

  /**
   * Get all demo data
   */
  getAllData(): AllDemoData {
    return this.demoData;
  }

  /**
   * Get all persona keys
   */
  getPersonaKeys(): PersonaKey[] {
    return Object.keys(this.demoData) as PersonaKey[];
  }

  /**
   * Get demo user data only
   */
  getPersonaUser(persona: PersonaKey) {
    return this.demoData[persona].user;
  }

  /**
   * Get demo activity data only
   */
  getPersonaActivity(persona: PersonaKey) {
    return this.demoData[persona].activityData;
  }

  /**
   * Get demo statistics only
   */
  getPersonaStatistics(persona: PersonaKey) {
    return this.demoData[persona].statistics;
  }

  /**
   * Switch demo user context (for development/testing)
   */
  switchPersona(persona: PersonaKey): PersonaDemoData {
    const data = this.getPersonaData(persona);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-persona', persona);
      localStorage.setItem('demo-user', JSON.stringify(data.user));
      localStorage.setItem('demo-activity', JSON.stringify(data.activityData));
    }

    return data;
  }

  /**
   * Get current demo persona from localStorage
   */
  getCurrentPersona(): PersonaKey | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo-persona') as PersonaKey;
    }
    return null;
  }

  /**
   * Load demo data into application state
   */
  loadDemoData(persona?: PersonaKey): PersonaDemoData {
    const targetPersona = persona || this.getCurrentPersona() || 'sarah';
    return this.switchPersona(targetPersona);
  }

  /**
   * Generate summary statistics across all personas
   */
  getGlobalStatistics() {
    const allStats = Object.values(this.demoData).map(d => d.statistics);

    return {
      totalUsers: Object.keys(this.demoData).length,
      totalTasks: allStats.reduce((sum, s) => sum + s.totalTasks, 0),
      totalCompletedTasks: allStats.reduce((sum, s) => sum + s.completedTasks, 0),
      avgCompletionRate: allStats.reduce((sum, s) => sum + (s.completedTasks / s.totalTasks), 0) / allStats.length,
      totalGoals: allStats.reduce((sum, s) => sum + s.totalGoals, 0),
      avgGoalProgress: allStats.reduce((sum, s) => sum + s.avgGoalProgress, 0) / allStats.length,
      totalHabits: allStats.reduce((sum, s) => sum + s.totalHabits, 0),
      maxHabitStreak: Math.max(...allStats.map(s => s.habitStreak)),
      totalTimeTracked: allStats.reduce((sum, s) => sum + s.totalTimeTracked, 0)
    };
  }
}

// Export singleton instance
export const demoDataLoader = DemoDataLoader.getInstance();

// Export convenience functions
export const getPersonaData = (persona: PersonaKey) => demoDataLoader.getPersonaData(persona);
export const getAllDemoData = () => demoDataLoader.getAllData();
export const switchDemoPersona = (persona: PersonaKey) => demoDataLoader.switchPersona(persona);
export const loadDemoData = (persona?: PersonaKey) => demoDataLoader.loadDemoData(persona);

export default DemoDataLoader;`;

    const loaderPath = path.join(this.basePath, 'src/lib/demo-data-loader.ts');
    fs.writeFileSync(loaderPath, loaderContent);
    this.log('✅ Created demo data loader utility');
  }

  generateReport() {
    const report = {
      agentInfo: {
        name: this.agentName,
        version: this.version,
        executionTime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      personasGenerated: Object.keys(this.personas).length,
      personas: this.personas,
      filesCreated: [
        'src/data/demo/sarah-demo-data.json',
        'src/data/demo/marcus-demo-data.json',
        'src/data/demo/elena-demo-data.json',
        'src/data/demo/james-demo-data.json',
        'src/data/demo/aisha-demo-data.json',
        'src/data/demo/all-personas-demo-data.json',
        'src/types/demo-data.ts',
        'src/lib/demo-data-loader.ts'
      ]
    };

    const reportPath = path.join(this.basePath, 'DEMO_DATA_REPORT.md');
    const reportContent = `# Demo Data Generation Report
Generated by: ${this.agentName} v${this.version}
Date: ${new Date().toLocaleDateString()}
Execution Time: ${Date.now() - this.startTime}ms

## Executive Summary
Comprehensive demo data generated for ${Object.keys(this.personas).length} user personas with realistic activity patterns.

## Personas Generated
${Object.entries(this.personas).map(([key, persona]) => `
### ${persona.name} (${persona.role})
- **Email**: ${persona.email}
- **Theme**: ${persona.preferences.theme}
- **Timezone**: ${persona.preferences.timezone}
- **Demo Data**: Realistic tasks, goals, habits, and notes
`).join('')}

## Data Categories
✅ **Tasks**: Role-specific tasks with realistic priorities and deadlines
✅ **Goals**: Long-term objectives with progress tracking and milestones
✅ **Habits**: Daily/weekly habits with completion tracking and streaks
✅ **Time Entries**: Logged time data based on completed tasks
✅ **Notes**: Persona-relevant notes and documentation
✅ **Statistics**: Calculated metrics and performance indicators

## Usage Instructions

### Load Demo Data
\`\`\`typescript
import { demoDataLoader, switchDemoPersona } from '@/lib/demo-data-loader';

// Switch to a specific persona
const sarahData = switchDemoPersona('sarah');

// Load current or default persona
const currentData = demoDataLoader.loadDemoData();

// Get specific data types
const tasks = demoDataLoader.getPersonaActivity('marcus').tasks;
const user = demoDataLoader.getPersonaUser('elena');
\`\`\`

### Demo Mode Toggle
Add this to your app for easy persona switching:
\`\`\`typescript
const PersonaSwitcher = () => {
  const personas = demoDataLoader.getPersonaKeys();

  return (
    <select onChange={(e) => switchDemoPersona(e.target.value)}>
      {personas.map(key => (
        <option key={key} value={key}>
          {demoDataLoader.getPersonaUser(key).name}
        </option>
      ))}
    </select>
  );
};
\`\`\`

## File Structure
\`\`\`
src/
├── data/demo/
│   ├── sarah-demo-data.json      # Executive persona data
│   ├── marcus-demo-data.json     # Developer persona data
│   ├── elena-demo-data.json      # PM persona data
│   ├── james-demo-data.json      # Freelancer persona data
│   ├── aisha-demo-data.json      # Student persona data
│   └── all-personas-demo-data.json
├── types/
│   └── demo-data.ts              # TypeScript definitions
└── lib/
    └── demo-data-loader.ts       # Utility functions
\`\`\`

## Next Steps
1. Integrate demo data loader into your app
2. Add persona switcher for development/demo
3. Use persona data for testing scenarios
4. Showcase app capabilities with realistic data

---
Report generated automatically by Demo Data Generator
`;

    fs.writeFileSync(reportPath, reportContent);
    this.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }

  async run() {
    try {
      this.log(`🚀 Starting ${this.agentName} v${this.version}`);

      const demoData = await this.generateAllPersonaData();
      const report = this.generateReport();

      this.log(`✅ ${this.agentName} completed successfully!`);
      this.log(`⏱️  Total execution time: ${Date.now() - this.startTime}ms`);
      this.log(`👥 Generated data for ${Object.keys(this.personas).length} personas`);

      return { demoData, report };
    } catch (error) {
      this.log(`❌ Agent failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const generator = new DemoDataGenerator();
  generator.run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { DemoDataGenerator };