import { faker } from '@faker-js/faker';

// Type definitions for our domain models
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tags: string[];
  milestones: Milestone[];
  metrics: GoalMetrics;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  targetDate: string;
  order: number;
}

export interface GoalMetrics {
  timeSpent: number; // in minutes
  completionRate: number;
  difficulty: number; // 1-10 scale
  satisfaction: number; // 1-10 scale
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'premium' | 'admin';
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminders: boolean;
  achievements: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareProgress: boolean;
  allowAnalytics: boolean;
}

export interface UserStats {
  totalGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  level: number;
  experience: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  reminderTime?: string;
  isActive: boolean;
  streak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  createdAt: string;
  userId: string;
}

export interface HabitCompletion {
  id: string;
  date: string;
  completed: boolean;
  notes?: string;
  mood?: number; // 1-5 scale
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  startDate: string;
  endDate?: string;
  teamMembers: string[]; // User IDs
  goals: string[]; // Goal IDs
  createdBy: string;
  createdAt: string;
}

// Base factory class
abstract class BaseFactory<T> {
  protected abstract create(overrides?: Partial<T>): T;

  public build(overrides?: Partial<T>): T {
    return this.create(overrides);
  }

  public buildList(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  public buildMany(count: number, overridesList?: Partial<T>[]): T[] {
    return Array.from({ length: count }, (_, index) =>
      this.build(overridesList?.[index])
    );
  }
}

// Goal Factory
export class GoalFactory extends BaseFactory<Goal> {
  protected create(overrides: Partial<Goal> = {}): Goal {
    const baseGoal: Goal = {
      id: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 2, max: 6 }),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement([
        'fitness', 'career', 'education', 'personal', 'finance', 'health', 'travel'
      ]),
      status: faker.helpers.arrayElement(['draft', 'active', 'paused', 'completed', 'cancelled']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      progress: faker.number.int({ min: 0, max: 100 }),
      startDate: faker.date.past().toISOString(),
      targetDate: faker.date.future().toISOString(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      userId: faker.string.uuid(),
      tags: faker.helpers.arrayElements([
        'important', 'urgent', 'personal', 'work', 'learning', 'health', 'creative'
      ], { min: 0, max: 4 }),
      milestones: this.createMilestones(faker.number.int({ min: 2, max: 5 })),
      metrics: this.createMetrics(),
    };

    return { ...baseGoal, ...overrides };
  }

  private createMilestones(count: number): Milestone[] {
    return Array.from({ length: count }, (_, index) => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 3, max: 7 }),
      description: faker.lorem.sentence(),
      completed: faker.datatype.boolean(),
      completedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,
      targetDate: faker.date.future().toISOString(),
      order: index + 1,
    }));
  }

  private createMetrics(): GoalMetrics {
    return {
      timeSpent: faker.number.int({ min: 0, max: 10000 }),
      completionRate: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      difficulty: faker.number.int({ min: 1, max: 10 }),
      satisfaction: faker.number.int({ min: 1, max: 10 }),
    };
  }

  // Specialized factory methods
  public buildDraft(overrides?: Partial<Goal>): Goal {
    return this.build({ status: 'draft', progress: 0, ...overrides });
  }

  public buildActive(overrides?: Partial<Goal>): Goal {
    return this.build({
      status: 'active',
      progress: faker.number.int({ min: 1, max: 99 }),
      ...overrides
    });
  }

  public buildCompleted(overrides?: Partial<Goal>): Goal {
    return this.build({ status: 'completed', progress: 100, ...overrides });
  }

  public buildWithCategory(category: string, overrides?: Partial<Goal>): Goal {
    return this.build({ category, ...overrides });
  }

  public buildWithPriority(priority: Goal['priority'], overrides?: Partial<Goal>): Goal {
    return this.build({ priority, ...overrides });
  }
}

// User Factory
export class UserFactory extends BaseFactory<User> {
  protected create(overrides: Partial<User> = {}): User {
    const baseUser: User = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      role: faker.helpers.arrayElement(['user', 'premium', 'admin']),
      preferences: this.createPreferences(),
      stats: this.createStats(),
      createdAt: faker.date.past().toISOString(),
      lastLoginAt: faker.date.recent().toISOString(),
    };

    return { ...baseUser, ...overrides };
  }

  private createPreferences(): UserPreferences {
    return {
      theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
      timezone: faker.location.timeZone(),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de', 'pt', 'zh']),
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        reminders: faker.datatype.boolean(),
        achievements: faker.datatype.boolean(),
        weeklyDigest: faker.datatype.boolean(),
      },
      privacy: {
        profileVisibility: faker.helpers.arrayElement(['public', 'friends', 'private']),
        shareProgress: faker.datatype.boolean(),
        allowAnalytics: faker.datatype.boolean(),
      },
    };
  }

  private createStats(): UserStats {
    const totalGoals = faker.number.int({ min: 0, max: 100 });
    const completedGoals = faker.number.int({ min: 0, max: totalGoals });

    return {
      totalGoals,
      completedGoals,
      currentStreak: faker.number.int({ min: 0, max: 365 }),
      longestStreak: faker.number.int({ min: 0, max: 500 }),
      totalTimeSpent: faker.number.int({ min: 0, max: 100000 }),
      level: faker.number.int({ min: 1, max: 50 }),
      experience: faker.number.int({ min: 0, max: 10000 }),
    };
  }

  public buildNewUser(overrides?: Partial<User>): User {
    return this.build({
      stats: {
        totalGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        level: 1,
        experience: 0,
      },
      ...overrides
    });
  }

  public buildPremiumUser(overrides?: Partial<User>): User {
    return this.build({ role: 'premium', ...overrides });
  }

  public buildAdminUser(overrides?: Partial<User>): User {
    return this.build({ role: 'admin', ...overrides });
  }
}

// Habit Factory
export class HabitFactory extends BaseFactory<Habit> {
  protected create(overrides: Partial<Habit> = {}): Habit {
    const streak = faker.number.int({ min: 0, max: 100 });
    const longestStreak = faker.number.int({ min: streak, max: streak + 50 });

    const baseHabit: Habit = {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Morning meditation', 'Exercise', 'Read for 30 minutes', 'Drink 8 glasses of water',
        'Write in journal', 'Practice gratitude', 'Learn new language', 'Call family'
      ]),
      description: faker.lorem.sentence(),
      category: faker.helpers.arrayElement([
        'health', 'fitness', 'mindfulness', 'learning', 'productivity', 'relationships'
      ]),
      frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
      difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
      reminderTime: faker.datatype.boolean() ? faker.date.recent().toTimeString().slice(0, 5) : undefined,
      isActive: faker.datatype.boolean(),
      streak,
      longestStreak,
      completions: this.createCompletions(faker.number.int({ min: 0, max: 30 })),
      createdAt: faker.date.past().toISOString(),
      userId: faker.string.uuid(),
    };

    return { ...baseHabit, ...overrides };
  }

  private createCompletions(count: number): HabitCompletion[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      completed: faker.datatype.boolean(),
      notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
      mood: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 5 }) : undefined,
    }));
  }

  public buildDaily(overrides?: Partial<Habit>): Habit {
    return this.build({ frequency: 'daily', ...overrides });
  }

  public buildActive(overrides?: Partial<Habit>): Habit {
    return this.build({ isActive: true, ...overrides });
  }

  public buildWithStreak(streak: number, overrides?: Partial<Habit>): Habit {
    return this.build({
      streak,
      longestStreak: Math.max(streak, faker.number.int({ min: streak, max: streak + 20 })),
      ...overrides
    });
  }
}

// Project Factory
export class ProjectFactory extends BaseFactory<Project> {
  protected create(overrides: Partial<Project> = {}): Project {
    const baseProject: Project = {
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      color: faker.color.rgb(),
      status: faker.helpers.arrayElement(['active', 'paused', 'completed', 'archived']),
      progress: faker.number.int({ min: 0, max: 100 }),
      startDate: faker.date.past().toISOString(),
      endDate: faker.datatype.boolean() ? faker.date.future().toISOString() : undefined,
      teamMembers: Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => faker.string.uuid()),
      goals: Array.from({ length: faker.number.int({ min: 2, max: 10 }) }, () => faker.string.uuid()),
      createdBy: faker.string.uuid(),
      createdAt: faker.date.past().toISOString(),
    };

    return { ...baseProject, ...overrides };
  }

  public buildPersonalProject(overrides?: Partial<Project>): Project {
    return this.build({
      teamMembers: [faker.string.uuid()], // Single user
      ...overrides
    });
  }

  public buildTeamProject(memberCount: number, overrides?: Partial<Project>): Project {
    return this.build({
      teamMembers: Array.from({ length: memberCount }, () => faker.string.uuid()),
      ...overrides
    });
  }
}

// Factory manager for coordinated data creation
export class DataFactoryManager {
  private goalFactory = new GoalFactory();
  private userFactory = new UserFactory();
  private habitFactory = new HabitFactory();
  private projectFactory = new ProjectFactory();

  // Create a complete user with related data
  public createUserWithData(goalCount = 5, habitCount = 3): {
    user: User;
    goals: Goal[];
    habits: Habit[];
  } {
    const user = this.userFactory.build();

    const goals = this.goalFactory.buildList(goalCount, { userId: user.id });
    const habits = this.habitFactory.buildList(habitCount, { userId: user.id });

    return { user, goals, habits };
  }

  // Create a project with team and goals
  public createProjectWithTeam(teamSize = 3, goalCount = 8): {
    project: Project;
    teamMembers: User[];
    goals: Goal[];
  } {
    const teamMembers = this.userFactory.buildList(teamSize);
    const goals = this.goalFactory.buildList(goalCount);

    const project = this.projectFactory.build({
      teamMembers: teamMembers.map(member => member.id),
      goals: goals.map(goal => goal.id),
    });

    return { project, teamMembers, goals };
  }

  // Create realistic test scenarios
  public createNewUserScenario(): {
    user: User;
    goals: Goal[];
    habits: Habit[];
  } {
    const user = this.userFactory.buildNewUser();
    const goals = [
      this.goalFactory.buildDraft({ userId: user.id }),
      this.goalFactory.buildActive({ userId: user.id, progress: 25 }),
    ];
    const habits = [
      this.habitFactory.buildDaily({ userId: user.id, streak: 0 }),
    ];

    return { user, goals, habits };
  }

  public createActiveUserScenario(): {
    user: User;
    goals: Goal[];
    habits: Habit[];
  } {
    const user = this.userFactory.build({
      stats: {
        totalGoals: 15,
        completedGoals: 8,
        currentStreak: 12,
        longestStreak: 25,
        totalTimeSpent: 5000,
        level: 8,
        experience: 3200,
      }
    });

    const goals = [
      ...this.goalFactory.buildList(3, { userId: user.id, status: 'active' }),
      ...this.goalFactory.buildList(2, { userId: user.id, status: 'completed' }),
      this.goalFactory.buildDraft({ userId: user.id }),
    ];

    const habits = [
      this.habitFactory.buildWithStreak(12, { userId: user.id }),
      this.habitFactory.buildWithStreak(8, { userId: user.id }),
      this.habitFactory.buildWithStreak(0, { userId: user.id, isActive: false }),
    ];

    return { user, goals, habits };
  }

  // Getters for individual factories
  public get goals() { return this.goalFactory; }
  public get users() { return this.userFactory; }
  public get habits() { return this.habitFactory; }
  public get projects() { return this.projectFactory; }
}

// Export singleton instance
export const dataFactory = new DataFactoryManager();

// Export individual factories for direct use
export const goalFactory = new GoalFactory();
export const userFactory = new UserFactory();
export const habitFactory = new HabitFactory();
export const projectFactory = new ProjectFactory();