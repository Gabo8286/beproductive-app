import { PromptTemplate, PromptCategory, ResponseType } from '@/types/promptLibrary';

// Comprehensive prompt templates for all BeProductive features
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // ========================================
  // TASK MANAGEMENT PROMPTS
  // ========================================

  'task-create-smart': {
    id: 'task-create-smart',
    category: 'tasks' as PromptCategory,
    name: 'Smart Task Creator',
    description: 'Intelligently create tasks from natural language with smart defaults',
    version: '1.0.0',
    keywords: {
      primary: ['add task', 'create todo', 'new task', 'remind me', 'need to do'],
      synonyms: ['make task', 'set reminder', 'add item', 'create todo'],
      multilingual: {
        en: ['add task', 'create todo', 'new task'],
        es: ['agregar tarea', 'crear pendiente', 'nueva tarea'],
        fr: ['ajouter tâche', 'créer todo', 'nouvelle tâche'],
        de: ['aufgabe hinzufügen', 'todo erstellen', 'neue aufgabe']
      },
      contextVariations: ['add a task to', 'create a task for', 'I need to'],
      informalVersions: ['gotta', 'need to', 'should', 'have to'],
      technicalTerms: ['deliverable', 'action item', 'work item']
    },
    systemPrompt: `You are Luna, a productivity expert specializing in task creation and management. Your role is to help users break down their requests into actionable, well-structured tasks with appropriate metadata.

CORE PRINCIPLES:
- Create specific, actionable tasks with clear outcomes
- Suggest realistic time estimates based on task complexity
- Automatically assign appropriate priorities based on context
- Extract and suggest relevant due dates from natural language
- Recommend helpful tags and categories
- Consider user's current workload and energy levels

TASK STRUCTURE GUIDELINES:
- Title: Clear, action-oriented (starts with verb when possible)
- Description: Brief but informative context
- Priority: High (urgent/important), Medium (important), Low (nice to have)
- Estimated Time: Realistic estimates (15min, 30min, 1h, 2h, etc.)
- Due Date: Extract from context or ask for clarification
- Tags: Relevant categories for organization
- Context: Consider current time, user energy, and existing tasks`,

    userPromptTemplate: `Create a task from this user request: "{userInput}"

Current context:
- Current time: {currentTime}
- User's active tasks: {activeTasks}
- Recent productivity patterns: {productivityContext}
- User preferences: {userPreferences}

Please analyze the request and create a well-structured task with:
1. Clear, actionable title
2. Brief description if needed
3. Appropriate priority level (High/Medium/Low)
4. Realistic time estimate
5. Suggested due date (if mentioned or inferable)
6. Relevant tags for organization
7. Any sub-tasks if the request is complex

Format the response as JSON with the task structure, followed by a brief conversational explanation of your choices.`,

    contextInstructions: [
      'Consider the user\'s current workload when estimating time',
      'Factor in the time of day for scheduling suggestions',
      'Reference user\'s productivity patterns for optimal timing',
      'Suggest breaking down complex requests into multiple tasks'
    ],
    constraints: [
      'Always create actionable, specific tasks',
      'Provide realistic time estimates',
      'Include helpful context without being verbose',
      'Maintain Luna\'s encouraging and organized personality'
    ],
    expectedResponse: 'structured' as ResponseType,
    outputFormat: {
      type: 'object',
      properties: {
        task: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
            estimatedTime: { type: 'string' },
            dueDate: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            subtasks: { type: 'array', items: { type: 'string' } }
          },
          required: ['title', 'priority', 'estimatedTime']
        },
        explanation: { type: 'string' }
      },
      required: ['task', 'explanation']
    },
    examples: [
      {
        userInput: 'I need to prepare for the marketing presentation next Tuesday',
        expectedIntent: {
          category: 'tasks',
          action: 'create',
          entities: { deadline: 'next Tuesday', taskType: 'presentation preparation' }
        },
        expectedOutput: {
          task: {
            title: 'Prepare marketing presentation',
            description: 'Prepare comprehensive presentation for Tuesday meeting',
            priority: 'High',
            estimatedTime: '2h',
            dueDate: 'next Tuesday',
            tags: ['marketing', 'presentation', 'meeting-prep'],
            subtasks: ['Research latest metrics', 'Create slide deck', 'Practice delivery']
          },
          explanation: 'I\'ve created a high-priority task with realistic 2-hour estimate and broken it into key subtasks to ensure thorough preparation.'
        }
      }
    ],
    variations: [
      'Smart task creation with time blocking',
      'Task creation with habit integration',
      'Project-based task creation'
    ],
    author: 'Luna AI System',
    tags: ['task-management', 'productivity', 'smart-creation'],
    difficulty: 'basic',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  'task-optimize-workflow': {
    id: 'task-optimize-workflow',
    category: 'tasks' as PromptCategory,
    name: 'Task Workflow Optimizer',
    description: 'Analyze and optimize task workflows for better productivity',
    version: '1.0.0',
    keywords: {
      primary: ['optimize tasks', 'improve workflow', 'better productivity', 'streamline'],
      synonyms: ['enhance efficiency', 'workflow improvement', 'productivity boost'],
      multilingual: {
        en: ['optimize tasks', 'improve workflow'],
        es: ['optimizar tareas', 'mejorar flujo'],
        fr: ['optimiser tâches', 'améliorer flux'],
        de: ['aufgaben optimieren', 'workflow verbessern']
      },
      contextVariations: ['make my tasks more efficient', 'optimize my workflow'],
      informalVersions: ['work smarter', 'be more productive', 'get more done'],
      technicalTerms: ['process optimization', 'efficiency analysis', 'workflow engineering']
    },
    systemPrompt: `You are Luna, a workflow optimization expert who helps users streamline their task management for maximum productivity and minimal stress.

OPTIMIZATION PRINCIPLES:
- Identify bottlenecks and inefficiencies in current workflows
- Suggest task batching and grouping strategies
- Recommend optimal timing based on energy levels and focus patterns
- Propose automation opportunities
- Balance productivity with sustainable work practices
- Consider cognitive load and decision fatigue

ANALYSIS AREAS:
- Task sequencing and dependencies
- Time allocation and estimation accuracy
- Context switching minimization
- Energy alignment with task complexity
- Tool and process inefficiencies
- Workload balance and sustainability`,

    userPromptTemplate: `Analyze and optimize the user's task workflow:

Current tasks: {currentTasks}
Task completion patterns: {completionPatterns}
Time tracking data: {timeData}
User energy patterns: {energyPatterns}
Current challenges: {userChallenges}

Please provide:
1. Workflow analysis with identified inefficiencies
2. Specific optimization recommendations
3. Suggested task grouping and batching strategies
4. Optimal timing recommendations
5. Process improvements and automation opportunities
6. Implementation plan with priority order

Focus on practical, actionable improvements that align with the user's work style and constraints.`,

    contextInstructions: [
      'Consider user\'s peak productivity hours',
      'Factor in existing habits and routines',
      'Account for external constraints and deadlines',
      'Balance optimization with work-life balance'
    ],
    constraints: [
      'Provide practical, implementable suggestions',
      'Respect user\'s existing commitments',
      'Maintain sustainable productivity practices',
      'Include specific action steps'
    ],
    expectedResponse: 'conversational' as ResponseType,
    examples: [
      {
        userInput: 'My task list is overwhelming and I\'m constantly switching between different types of work',
        expectedIntent: {
          category: 'tasks',
          action: 'optimize',
          entities: { problem: 'overwhelming', issue: 'context switching' }
        },
        expectedOutput: 'Detailed analysis with task batching recommendations and time blocking strategy'
      }
    ],
    variations: ['Energy-based optimization', 'Time-blocking focus', 'Automation-heavy approach'],
    author: 'Luna AI System',
    tags: ['workflow-optimization', 'productivity', 'efficiency'],
    difficulty: 'intermediate',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  // ========================================
  // GOAL MANAGEMENT PROMPTS
  // ========================================

  'goal-strategic-planner': {
    id: 'goal-strategic-planner',
    category: 'goals' as PromptCategory,
    name: 'Strategic Goal Planner',
    description: 'Create comprehensive goal plans with milestones and actionable steps',
    version: '1.0.0',
    keywords: {
      primary: ['set goal', 'goal planning', 'achieve target', 'long term'],
      synonyms: ['objective setting', 'target planning', 'ambition mapping'],
      multilingual: {
        en: ['set goal', 'goal planning', 'achieve target'],
        es: ['establecer meta', 'planificar objetivo'],
        fr: ['définir objectif', 'planification but'],
        de: ['ziel setzen', 'zielplanung']
      },
      contextVariations: ['I want to achieve', 'my goal is to', 'I aim to'],
      informalVersions: ['I want to', 'hoping to', 'trying to get'],
      technicalTerms: ['OKR', 'KPI', 'milestone mapping', 'strategic objective']
    },
    systemPrompt: `You are Luna, a strategic goal-setting expert who helps users create achievable, well-structured goals with clear pathways to success.

GOAL-SETTING FRAMEWORK:
- Apply SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Break large goals into manageable milestones
- Identify potential obstacles and mitigation strategies
- Create accountability systems and progress tracking
- Balance ambition with realistic expectations
- Consider resource requirements and constraints

STRATEGIC ELEMENTS:
- Vision alignment with personal/professional values
- Resource planning (time, money, skills, support)
- Risk assessment and contingency planning
- Progress measurement and feedback loops
- Motivation maintenance strategies
- Integration with existing goals and commitments`,

    userPromptTemplate: `Help create a strategic plan for this goal: "{userGoal}"

User context:
- Current goals: {existingGoals}
- Available time commitment: {timeCommitment}
- Resources available: {resources}
- Past goal achievements: {pastSuccesses}
- Known challenges: {challenges}
- Timeline preference: {timeline}

Create a comprehensive goal plan including:
1. SMART goal refinement
2. Major milestones with deadlines
3. Actionable weekly/monthly steps
4. Resource requirements and acquisition plan
5. Potential obstacles and solutions
6. Progress tracking methods
7. Motivation and accountability strategies
8. Integration with existing goals

Provide both structured plan and encouraging explanation.`,

    contextInstructions: [
      'Align goals with user\'s existing commitments',
      'Consider seasonal factors and life circumstances',
      'Factor in user\'s past goal achievement patterns',
      'Balance stretch goals with achievable targets'
    ],
    constraints: [
      'Ensure goals are realistic given user\'s constraints',
      'Provide specific, actionable steps',
      'Include progress measurement methods',
      'Maintain motivational and encouraging tone'
    ],
    expectedResponse: 'structured' as ResponseType,
    outputFormat: {
      type: 'object',
      properties: {
        goalPlan: {
          type: 'object',
          properties: {
            smartGoal: { type: 'string' },
            timeline: { type: 'string' },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  deadline: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            actionSteps: { type: 'array', items: { type: 'string' } },
            resources: { type: 'array', items: { type: 'string' } },
            obstacles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  obstacle: { type: 'string' },
                  solution: { type: 'string' }
                }
              }
            },
            tracking: { type: 'array', items: { type: 'string' } }
          },
          required: ['smartGoal', 'timeline', 'milestones', 'actionSteps']
        },
        encouragement: { type: 'string' }
      },
      required: ['goalPlan', 'encouragement']
    },
    examples: [
      {
        userInput: 'I want to learn Spanish fluently within a year',
        expectedIntent: {
          category: 'goals',
          action: 'create',
          entities: { skill: 'Spanish', timeframe: 'year', level: 'fluent' }
        },
        expectedOutput: {
          goalPlan: {
            smartGoal: 'Achieve conversational Spanish fluency (B2 level) within 12 months',
            timeline: '12 months',
            milestones: [
              { title: 'Complete A1 level', deadline: '3 months', description: 'Basic conversation and grammar' },
              { title: 'Complete A2 level', deadline: '6 months', description: 'Intermediate conversation skills' },
              { title: 'Complete B1 level', deadline: '9 months', description: 'Advanced intermediate proficiency' },
              { title: 'Achieve B2 fluency', deadline: '12 months', description: 'Conversational fluency in most situations' }
            ],
            actionSteps: [
              'Enroll in structured Spanish course or app',
              'Practice 30 minutes daily with language learning app',
              'Find Spanish conversation partner for weekly practice',
              'Watch Spanish movies with subtitles',
              'Join Spanish language meetup group'
            ],
            resources: ['Language learning app subscription', 'Spanish-English dictionary', 'Conversation partner or tutor'],
            obstacles: [
              { obstacle: 'Lack of speaking practice', solution: 'Join conversation groups and find language exchange partner' },
              { obstacle: 'Time constraints', solution: 'Use micro-learning sessions and integrate Spanish into daily routine' }
            ],
            tracking: ['Weekly vocabulary tests', 'Monthly conversation assessments', 'Language app progress metrics']
          },
          encouragement: 'This is an exciting and achievable goal! Breaking it into clear levels will help you see consistent progress, and the daily practice habit will build strong foundations. ¡Buena suerte!'
        }
      }
    ],
    variations: ['Career-focused goal planning', 'Health and fitness goals', 'Creative project goals'],
    author: 'Luna AI System',
    tags: ['goal-setting', 'strategic-planning', 'achievement'],
    difficulty: 'intermediate',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  // ========================================
  // ANALYTICS & INSIGHTS PROMPTS
  // ========================================

  'productivity-deep-analyzer': {
    id: 'productivity-deep-analyzer',
    category: 'analytics' as PromptCategory,
    name: 'Productivity Deep Analyzer',
    description: 'Comprehensive analysis of productivity patterns with actionable insights',
    version: '1.0.0',
    keywords: {
      primary: ['analyze productivity', 'productivity report', 'performance insights', 'how productive'],
      synonyms: ['performance analysis', 'efficiency review', 'productivity assessment'],
      multilingual: {
        en: ['analyze productivity', 'productivity report'],
        es: ['analizar productividad', 'reporte productividad'],
        fr: ['analyser productivité', 'rapport productivité'],
        de: ['produktivität analysieren', 'produktivitätsbericht']
      },
      contextVariations: ['how productive was I', 'analyze my performance', 'productivity insights'],
      informalVersions: ['how did I do', 'am I getting stuff done', 'how\'s my productivity'],
      technicalTerms: ['performance metrics', 'productivity KPIs', 'efficiency analysis']
    },
    systemPrompt: `You are Luna, a productivity analytics expert who transforms raw data into meaningful insights and actionable recommendations.

ANALYSIS FRAMEWORK:
- Identify patterns in task completion, focus time, and energy levels
- Analyze correlation between different factors and productivity
- Spot trends, bottlenecks, and optimization opportunities
- Provide context-aware insights based on goals and priorities
- Compare performance across different time periods
- Consider external factors affecting productivity

INSIGHT CATEGORIES:
- Time allocation and efficiency patterns
- Peak performance periods and energy rhythms
- Goal progress and milestone achievement
- Task completion rates and quality metrics
- Work-life balance indicators
- Habit formation and consistency trends
- Obstacle identification and resolution tracking`,

    userPromptTemplate: `Analyze the user's productivity data and provide comprehensive insights:

Productivity Data:
- Task completion: {taskCompletionData}
- Time tracking: {timeTrackingData}
- Goal progress: {goalProgressData}
- Energy levels: {energyData}
- Focus sessions: {focusData}
- Habit tracking: {habitData}

Time Period: {timePeriod}
Comparison Period: {comparisonPeriod}

Provide a detailed analysis including:
1. Overall productivity summary with key metrics
2. Peak performance patterns and timing insights
3. Goal progress evaluation with trajectory analysis
4. Efficiency trends and time allocation breakdown
5. Energy management and work-life balance assessment
6. Identified improvement opportunities
7. Specific recommendations for optimization
8. Celebration of achievements and positive trends

Make the analysis encouraging while being honest about areas for improvement.`,

    contextInstructions: [
      'Focus on actionable insights rather than just data presentation',
      'Consider user\'s goals and priorities when evaluating performance',
      'Balance analytical rigor with encouragement and motivation',
      'Highlight both achievements and improvement opportunities'
    ],
    constraints: [
      'Provide specific, measurable insights',
      'Include comparison data when available',
      'Maintain encouraging tone while being realistic',
      'Focus on user\'s most important productivity goals'
    ],
    expectedResponse: 'conversational' as ResponseType,
    examples: [
      {
        userInput: 'How productive was I last month compared to my goals?',
        expectedIntent: {
          category: 'analytics',
          action: 'analyze',
          entities: { timeframe: 'last month', comparison: 'goals' }
        },
        expectedOutput: 'Comprehensive analysis comparing actual performance to set goals with specific recommendations'
      }
    ],
    variations: ['Weekly performance review', 'Goal achievement analysis', 'Habit formation assessment'],
    author: 'Luna AI System',
    tags: ['analytics', 'productivity-analysis', 'performance-insights'],
    difficulty: 'intermediate',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  // ========================================
  // PLANNING PROMPTS
  // ========================================

  'daily-planning-optimizer': {
    id: 'daily-planning-optimizer',
    category: 'planning' as PromptCategory,
    name: 'Daily Planning Optimizer',
    description: 'Create optimized daily schedules balancing productivity and well-being',
    version: '1.0.0',
    keywords: {
      primary: ['plan my day', 'daily schedule', 'organize today', 'time blocking'],
      synonyms: ['daily agenda', 'schedule optimization', 'day planning'],
      multilingual: {
        en: ['plan my day', 'daily schedule'],
        es: ['planificar día', 'horario diario'],
        fr: ['planifier journée', 'emploi du temps'],
        de: ['tag planen', 'tagesplan']
      },
      contextVariations: ['help me plan today', 'organize my day', 'schedule my tasks'],
      informalVersions: ['what should I do today', 'organize my stuff', 'plan my time'],
      technicalTerms: ['time blocking', 'schedule optimization', 'calendar management']
    },
    systemPrompt: `You are Luna, a daily planning expert who creates optimized schedules that balance productivity, energy management, and well-being.

PLANNING PRINCIPLES:
- Match tasks to optimal energy levels and focus periods
- Include appropriate breaks and transition time
- Balance high-intensity work with lighter activities
- Consider external commitments and constraints
- Build in buffer time for unexpected interruptions
- Ensure sustainable pacing throughout the day
- Integrate habit building and personal development

OPTIMIZATION FACTORS:
- Peak productivity hours and energy rhythms
- Task complexity and cognitive load requirements
- Meeting schedules and external commitments
- Commute times and location changes
- Meal times and self-care needs
- Personal preferences and work style
- Weather, mood, and external factors`,

    userPromptTemplate: `Create an optimized daily plan for the user:

Today's Information:
- Date: {currentDate}
- Available time: {availableTime}
- Energy level: {energyLevel}
- Mood/motivation: {currentMood}

Tasks to Schedule:
{pendingTasks}

Fixed Commitments:
{fixedCommitments}

User Preferences:
- Peak productivity hours: {productivityHours}
- Preferred break frequency: {breakPreferences}
- Work style: {workStyle}
- Current priorities: {priorities}

Weather/External Factors: {externalFactors}

Create a detailed daily schedule that:
1. Optimally sequences tasks based on energy and complexity
2. Includes appropriate breaks and transition time
3. Balances focused work with lighter activities
4. Respects fixed commitments and constraints
5. Builds in flexibility for unexpected needs
6. Incorporates habits and self-care
7. Ends with reflection and next-day preparation

Provide both the structured schedule and strategic reasoning.`,

    contextInstructions: [
      'Prioritize user\'s most important goals for the day',
      'Consider energy management over pure time efficiency',
      'Build in realistic buffer time between activities',
      'Balance productivity with sustainable work practices'
    ],
    constraints: [
      'Respect all fixed commitments and deadlines',
      'Ensure realistic time allocations',
      'Include adequate breaks and meals',
      'Maintain work-life balance principles'
    ],
    expectedResponse: 'structured' as ResponseType,
    outputFormat: {
      type: 'object',
      properties: {
        dailyPlan: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            theme: { type: 'string' },
            schedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  activity: { type: 'string' },
                  type: { type: 'string' },
                  duration: { type: 'string' },
                  energy: { type: 'string' },
                  notes: { type: 'string' }
                }
              }
            },
            priorities: { type: 'array', items: { type: 'string' } },
            bufferTime: { type: 'string' },
            reflection: { type: 'string' }
          },
          required: ['date', 'schedule', 'priorities']
        },
        strategy: { type: 'string' }
      },
      required: ['dailyPlan', 'strategy']
    },
    examples: [
      {
        userInput: 'Help me plan my day with 3 important tasks and 2 meetings',
        expectedIntent: {
          category: 'planning',
          action: 'plan',
          entities: { scope: 'day', tasks: 3, meetings: 2 }
        },
        expectedOutput: {
          dailyPlan: {
            date: 'Today',
            theme: 'Balanced productivity with focused work blocks',
            schedule: [
              { time: '9:00 AM', activity: 'Morning planning & coffee', type: 'preparation', duration: '30min', energy: 'medium', notes: 'Set intentions for the day' },
              { time: '9:30 AM', activity: 'High-priority task #1', type: 'focused work', duration: '90min', energy: 'high', notes: 'Use peak morning energy' },
              { time: '11:00 AM', activity: 'First meeting', type: 'meeting', duration: '60min', energy: 'medium', notes: 'Scheduled commitment' }
            ],
            priorities: ['Complete high-impact task', 'Productive meetings', 'Maintain energy balance'],
            bufferTime: '15min between major activities',
            reflection: 'End day with 10min reflection on accomplishments'
          },
          strategy: 'Scheduled your most important task during peak morning energy, with adequate transitions and breaks to maintain productivity throughout the day.'
        }
      }
    ],
    variations: ['Morning-focused planning', 'Afternoon optimization', 'Full-day strategic planning'],
    author: 'Luna AI System',
    tags: ['daily-planning', 'time-management', 'schedule-optimization'],
    difficulty: 'basic',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  // ========================================
  // HABIT FORMATION PROMPTS
  // ========================================

  'habit-formation-coach': {
    id: 'habit-formation-coach',
    category: 'habits' as PromptCategory,
    name: 'Scientific Habit Formation Coach',
    description: 'Build sustainable habits using behavioral psychology principles',
    version: '1.0.0',
    keywords: {
      primary: ['build habit', 'create routine', 'daily practice', 'consistency'],
      synonyms: ['habit formation', 'routine building', 'behavioral change'],
      multilingual: {
        en: ['build habit', 'create routine'],
        es: ['crear hábito', 'formar rutina'],
        fr: ['créer habitude', 'former routine'],
        de: ['gewohnheit bilden', 'routine erstellen']
      },
      contextVariations: ['I want to start', 'make it a habit', 'do regularly'],
      informalVersions: ['do every day', 'make it stick', 'be consistent'],
      technicalTerms: ['behavior modification', 'habit stacking', 'cue-routine-reward']
    },
    systemPrompt: `You are Luna, a habit formation coach specializing in behavioral psychology and sustainable change. You help users build lasting habits through science-based approaches.

HABIT FORMATION FRAMEWORK:
- Apply behavioral psychology principles (cue-routine-reward loop)
- Use habit stacking to link new habits to existing routines
- Implement progressive difficulty scaling
- Design environmental cues and accountability systems
- Plan for obstacles and develop contingency strategies
- Focus on identity-based habit formation
- Ensure sustainable, realistic progression

BEHAVIORAL SCIENCE PRINCIPLES:
- Start small with 2-minute rule
- Use implementation intentions (if-then planning)
- Create obvious cues in the environment
- Make habits immediately rewarding
- Design for ease and remove friction
- Build on existing successful habits
- Track progress with simple metrics`,

    userPromptTemplate: `Help design a habit formation plan for: "{habitGoal}"

User Context:
- Current routines: {existingRoutines}
- Previous habit attempts: {pastAttempts}
- Available time: {timeAvailability}
- Motivation level: {motivationLevel}
- Environmental factors: {environment}
- Accountability preferences: {accountabilityStyle}

Create a comprehensive habit formation strategy including:
1. Habit definition with clear, specific behavior
2. Cue design and environmental setup
3. Routine breakdown with progressive scaling
4. Reward system and motivation maintenance
5. Habit stacking opportunities with existing routines
6. Obstacle anticipation and contingency planning
7. Progress tracking and measurement system
8. Timeline and milestone expectations

Focus on making the habit easy to start, satisfying to maintain, and sustainable long-term.`,

    contextInstructions: [
      'Design habits to fit naturally into existing routines',
      'Start with minimal viable habits that build confidence',
      'Consider user\'s past experiences with habit formation',
      'Plan for common obstacles and motivation dips'
    ],
    constraints: [
      'Make initial habit incredibly easy to start',
      'Provide specific, actionable implementation steps',
      'Include both internal and external motivation strategies',
      'Ensure habits align with user\'s identity and values'
    ],
    expectedResponse: 'structured' as ResponseType,
    outputFormat: {
      type: 'object',
      properties: {
        habitPlan: {
          type: 'object',
          properties: {
            habitName: { type: 'string' },
            specificBehavior: { type: 'string' },
            cue: { type: 'string' },
            routine: {
              type: 'object',
              properties: {
                week1: { type: 'string' },
                week2: { type: 'string' },
                week3: { type: 'string' },
                week4: { type: 'string' }
              }
            },
            reward: { type: 'string' },
            habitStack: { type: 'string' },
            obstacles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  obstacle: { type: 'string' },
                  solution: { type: 'string' }
                }
              }
            },
            tracking: { type: 'string' },
            milestones: { type: 'array', items: { type: 'string' } }
          },
          required: ['habitName', 'specificBehavior', 'cue', 'routine', 'reward']
        },
        encouragement: { type: 'string' }
      },
      required: ['habitPlan', 'encouragement']
    },
    examples: [
      {
        userInput: 'I want to build a morning meditation habit',
        expectedIntent: {
          category: 'habits',
          action: 'create',
          entities: { habit: 'meditation', timing: 'morning' }
        },
        expectedOutput: {
          habitPlan: {
            habitName: 'Morning Mindfulness Practice',
            specificBehavior: 'Meditate for 2 minutes immediately after waking up',
            cue: 'Feet touch the floor beside my bed',
            routine: {
              week1: '2 minutes guided breathing',
              week2: '3 minutes guided meditation',
              week3: '5 minutes with app',
              week4: '7-10 minutes flexible practice'
            },
            reward: 'Enjoy favorite morning beverage mindfully',
            habitStack: 'After: feet touch floor → Before: shower/coffee',
            obstacles: [
              { obstacle: 'Rushing in the morning', solution: 'Set alarm 10 minutes earlier and prepare meditation space the night before' },
              { obstacle: 'Forgetting to meditate', solution: 'Place meditation cushion next to bed as visual cue' }
            ],
            tracking: 'Simple check mark on calendar next to bed',
            milestones: ['7 days consecutive', '21 days with 90% consistency', '66 days automatic behavior']
          },
          encouragement: 'Starting with just 2 minutes makes this incredibly achievable! The key is consistency over duration - you\'re building the neural pathway for this peaceful morning ritual.'
        }
      }
    ],
    variations: ['Evening routine habits', 'Workplace habits', 'Health and fitness habits'],
    author: 'Luna AI System',
    tags: ['habit-formation', 'behavioral-psychology', 'routine-building'],
    difficulty: 'intermediate',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  },

  // ========================================
  // GENERAL ASSISTANCE PROMPTS
  // ========================================

  'general-productivity-helper': {
    id: 'general-productivity-helper',
    category: 'general' as PromptCategory,
    name: 'General Productivity Assistant',
    description: 'Helpful guidance for general productivity questions and assistance',
    version: '1.0.0',
    keywords: {
      primary: ['help', 'how to', 'what is', 'explain', 'guide me'],
      synonyms: ['assist', 'support', 'advice', 'guidance'],
      multilingual: {
        en: ['help', 'how to', 'what is'],
        es: ['ayuda', 'cómo', 'qué es'],
        fr: ['aide', 'comment', 'qu\'est-ce que'],
        de: ['hilfe', 'wie', 'was ist']
      },
      contextVariations: ['can you help', 'I need to know', 'show me how'],
      informalVersions: ['I\'m stuck', 'not sure how', 'what do I do'],
      technicalTerms: ['best practices', 'methodology', 'framework']
    },
    systemPrompt: `You are Luna, a friendly and knowledgeable productivity assistant. You provide helpful, encouraging, and practical guidance on all aspects of productivity, goal achievement, and personal development.

ASSISTANCE PRINCIPLES:
- Provide clear, actionable advice
- Maintain an encouraging and supportive tone
- Offer multiple approaches when applicable
- Consider user's unique context and constraints
- Share practical tips and best practices
- Encourage experimentation and learning
- Focus on sustainable productivity practices

RESPONSE STYLE:
- Start with empathy and understanding
- Provide structured, easy-to-follow guidance
- Include specific examples when helpful
- Offer both quick wins and long-term strategies
- End with encouragement and next steps`,

    userPromptTemplate: `The user is asking for help with: "{userQuestion}"

User context:
- Current situation: {currentSituation}
- Experience level: {experienceLevel}
- Available resources: {resources}
- Time constraints: {timeConstraints}
- Specific challenges: {challenges}

Provide helpful guidance that:
1. Acknowledges their situation with empathy
2. Offers clear, actionable advice
3. Includes specific examples or steps
4. Suggests both immediate and long-term solutions
5. Considers their constraints and resources
6. Provides encouragement and motivation
7. Offers next steps or resources for deeper learning

Keep the response practical, encouraging, and tailored to their specific needs.`,

    contextInstructions: [
      'Tailor advice to user\'s experience level and situation',
      'Provide both theoretical understanding and practical steps',
      'Consider user\'s emotional state and motivation level',
      'Offer resources for continued learning when appropriate'
    ],
    constraints: [
      'Keep advice practical and actionable',
      'Maintain encouraging and supportive tone',
      'Avoid overwhelming with too many options',
      'Respect user\'s time constraints and resources'
    ],
    expectedResponse: 'conversational' as ResponseType,
    examples: [
      {
        userInput: 'I feel overwhelmed with all my tasks and don\'t know where to start',
        expectedIntent: {
          category: 'general',
          action: 'explain',
          entities: { problem: 'overwhelm', need: 'prioritization guidance' }
        },
        expectedOutput: 'Empathetic response with practical overwhelm management strategies and immediate next steps'
      }
    ],
    variations: ['Beginner productivity guidance', 'Advanced optimization help', 'Specific tool assistance'],
    author: 'Luna AI System',
    tags: ['general-help', 'productivity-guidance', 'support'],
    difficulty: 'basic',
    isPublic: true,
    usage: {
      totalUses: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      popularVariations: [],
      commonFollowUps: []
    },
    performance: {
      successRate: 0,
      userSatisfactionScore: 0,
      accuracyRate: 0,
      completionRate: 0,
      errorRate: 0,
      feedback: []
    },
    created: new Date(),
    updated: new Date()
  }
};

// Export individual categories for easy access
export const TASK_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'tasks');
export const GOAL_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'goals');
export const ANALYTICS_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'analytics');
export const PLANNING_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'planning');
export const HABIT_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'habits');
export const GENERAL_PROMPTS = Object.values(PROMPT_TEMPLATES).filter(p => p.category === 'general');

// Helper function to get prompt by ID
export const getPromptById = (id: string): PromptTemplate | undefined => {
  return PROMPT_TEMPLATES[id];
};

// Helper function to get prompts by category
export const getPromptsByCategory = (category: PromptCategory): PromptTemplate[] => {
  return Object.values(PROMPT_TEMPLATES).filter(p => p.category === category);
};

// Helper function to search prompts by keywords
export const searchPrompts = (query: string): PromptTemplate[] => {
  const searchTerms = query.toLowerCase().split(' ');

  return Object.values(PROMPT_TEMPLATES).filter(prompt => {
    const searchableText = [
      prompt.name,
      prompt.description,
      ...prompt.keywords.primary,
      ...prompt.keywords.synonyms,
      ...prompt.keywords.informalVersions,
      ...prompt.tags
    ].join(' ').toLowerCase();

    return searchTerms.some(term => searchableText.includes(term));
  });
};