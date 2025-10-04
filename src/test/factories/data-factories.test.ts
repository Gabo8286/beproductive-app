import { describe, it, expect, beforeEach } from "vitest";
import {
  dataFactory,
  goalFactory,
  userFactory,
  habitFactory,
  projectFactory,
  Goal,
  User,
  Habit,
  Project,
} from "./data-factories";

describe("Data Factories", () => {
  describe("GoalFactory", () => {
    it("should create a valid goal with default values", () => {
      const goal = goalFactory.build();

      expect(goal.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(goal.title).toBeTruthy();
      expect(goal.description).toBeTruthy();
      expect([
        "fitness",
        "career",
        "education",
        "personal",
        "finance",
        "health",
        "travel",
      ]).toContain(goal.category);
      expect(["draft", "active", "paused", "completed", "cancelled"]).toContain(
        goal.status,
      );
      expect(["low", "medium", "high", "urgent"]).toContain(goal.priority);
      expect(goal.progress).toBeGreaterThanOrEqual(0);
      expect(goal.progress).toBeLessThanOrEqual(100);
      expect(goal.tags).toBeInstanceOf(Array);
      expect(goal.milestones).toBeInstanceOf(Array);
      expect(goal.milestones.length).toBeGreaterThan(0);
      expect(goal.metrics).toBeDefined();
    });

    it("should create a goal with custom overrides", () => {
      const customGoal = goalFactory.build({
        title: "Custom Goal Title",
        status: "active",
        progress: 75,
        category: "fitness",
      });

      expect(customGoal.title).toBe("Custom Goal Title");
      expect(customGoal.status).toBe("active");
      expect(customGoal.progress).toBe(75);
      expect(customGoal.category).toBe("fitness");
    });

    it("should create multiple goals with buildList", () => {
      const goals = goalFactory.buildList(5);

      expect(goals).toHaveLength(5);
      goals.forEach((goal) => {
        expect(goal.id).toBeTruthy();
        expect(goal.title).toBeTruthy();
      });

      // Ensure goals have unique IDs
      const ids = goals.map((goal) => goal.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it("should create specialized goal types", () => {
      const draftGoal = goalFactory.buildDraft();
      expect(draftGoal.status).toBe("draft");
      expect(draftGoal.progress).toBe(0);

      const activeGoal = goalFactory.buildActive();
      expect(activeGoal.status).toBe("active");
      expect(activeGoal.progress).toBeGreaterThan(0);
      expect(activeGoal.progress).toBeLessThan(100);

      const completedGoal = goalFactory.buildCompleted();
      expect(completedGoal.status).toBe("completed");
      expect(completedGoal.progress).toBe(100);

      const fitnessGoal = goalFactory.buildWithCategory("fitness");
      expect(fitnessGoal.category).toBe("fitness");

      const urgentGoal = goalFactory.buildWithPriority("urgent");
      expect(urgentGoal.priority).toBe("urgent");
    });

    it("should create valid milestones", () => {
      const goal = goalFactory.build();

      goal.milestones.forEach((milestone, index) => {
        expect(milestone.id).toBeTruthy();
        expect(milestone.title).toBeTruthy();
        expect(milestone.order).toBe(index + 1);
        expect(typeof milestone.completed).toBe("boolean");
        if (milestone.completed) {
          expect(milestone.completedAt).toBeTruthy();
        }
      });
    });

    it("should create valid metrics", () => {
      const goal = goalFactory.build();

      expect(goal.metrics.timeSpent).toBeGreaterThanOrEqual(0);
      expect(goal.metrics.completionRate).toBeGreaterThanOrEqual(0);
      expect(goal.metrics.completionRate).toBeLessThanOrEqual(1);
      expect(goal.metrics.difficulty).toBeGreaterThanOrEqual(1);
      expect(goal.metrics.difficulty).toBeLessThanOrEqual(10);
      expect(goal.metrics.satisfaction).toBeGreaterThanOrEqual(1);
      expect(goal.metrics.satisfaction).toBeLessThanOrEqual(10);
    });
  });

  describe("UserFactory", () => {
    it("should create a valid user with default values", () => {
      const user = userFactory.build();

      expect(user.id).toBeTruthy();
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(user.name).toBeTruthy();
      expect(["user", "premium", "admin"]).toContain(user.role);
      expect(user.preferences).toBeDefined();
      expect(user.stats).toBeDefined();
      expect(new Date(user.createdAt)).toBeInstanceOf(Date);
      expect(new Date(user.lastLoginAt)).toBeInstanceOf(Date);
    });

    it("should create valid user preferences", () => {
      const user = userFactory.build();
      const prefs = user.preferences;

      expect(["light", "dark", "auto"]).toContain(prefs.theme);
      expect(prefs.timezone).toBeTruthy();
      expect(prefs.language).toBeTruthy();
      expect(typeof prefs.notifications.email).toBe("boolean");
      expect(typeof prefs.notifications.push).toBe("boolean");
      expect(["public", "friends", "private"]).toContain(
        prefs.privacy.profileVisibility,
      );
    });

    it("should create valid user stats", () => {
      const user = userFactory.build();
      const stats = user.stats;

      expect(stats.totalGoals).toBeGreaterThanOrEqual(0);
      expect(stats.completedGoals).toBeGreaterThanOrEqual(0);
      expect(stats.completedGoals).toBeLessThanOrEqual(stats.totalGoals);
      expect(stats.currentStreak).toBeGreaterThanOrEqual(0);
      expect(stats.longestStreak).toBeGreaterThanOrEqual(0);
      expect(stats.level).toBeGreaterThanOrEqual(1);
      expect(stats.experience).toBeGreaterThanOrEqual(0);
    });

    it("should create specialized user types", () => {
      const newUser = userFactory.buildNewUser();
      expect(newUser.stats.totalGoals).toBe(0);
      expect(newUser.stats.completedGoals).toBe(0);
      expect(newUser.stats.level).toBe(1);

      const premiumUser = userFactory.buildPremiumUser();
      expect(premiumUser.role).toBe("premium");

      const adminUser = userFactory.buildAdminUser();
      expect(adminUser.role).toBe("admin");
    });
  });

  describe("HabitFactory", () => {
    it("should create a valid habit with default values", () => {
      const habit = habitFactory.build();

      expect(habit.id).toBeTruthy();
      expect(habit.name).toBeTruthy();
      expect([
        "health",
        "fitness",
        "mindfulness",
        "learning",
        "productivity",
        "relationships",
      ]).toContain(habit.category);
      expect(["daily", "weekly", "monthly"]).toContain(habit.frequency);
      expect(["easy", "medium", "hard"]).toContain(habit.difficulty);
      expect(typeof habit.isActive).toBe("boolean");
      expect(habit.streak).toBeGreaterThanOrEqual(0);
      expect(habit.longestStreak).toBeGreaterThanOrEqual(habit.streak);
      expect(habit.completions).toBeInstanceOf(Array);
    });

    it("should create valid habit completions", () => {
      const habit = habitFactory.build();

      habit.completions.forEach((completion) => {
        expect(completion.id).toBeTruthy();
        expect(completion.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof completion.completed).toBe("boolean");
        if (completion.mood) {
          expect(completion.mood).toBeGreaterThanOrEqual(1);
          expect(completion.mood).toBeLessThanOrEqual(5);
        }
      });
    });

    it("should create specialized habit types", () => {
      const dailyHabit = habitFactory.buildDaily();
      expect(dailyHabit.frequency).toBe("daily");

      const activeHabit = habitFactory.buildActive();
      expect(activeHabit.isActive).toBe(true);

      const streakHabit = habitFactory.buildWithStreak(15);
      expect(streakHabit.streak).toBe(15);
      expect(streakHabit.longestStreak).toBeGreaterThanOrEqual(15);
    });
  });

  describe("ProjectFactory", () => {
    it("should create a valid project with default values", () => {
      const project = projectFactory.build();

      expect(project.id).toBeTruthy();
      expect(project.name).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(["active", "paused", "completed", "archived"]).toContain(
        project.status,
      );
      expect(project.progress).toBeGreaterThanOrEqual(0);
      expect(project.progress).toBeLessThanOrEqual(100);
      expect(project.teamMembers).toBeInstanceOf(Array);
      expect(project.teamMembers.length).toBeGreaterThan(0);
      expect(project.goals).toBeInstanceOf(Array);
      expect(project.goals.length).toBeGreaterThan(0);
    });

    it("should create specialized project types", () => {
      const personalProject = projectFactory.buildPersonalProject();
      expect(personalProject.teamMembers).toHaveLength(1);

      const teamProject = projectFactory.buildTeamProject(5);
      expect(teamProject.teamMembers).toHaveLength(5);
    });
  });

  describe("DataFactoryManager", () => {
    it("should create coordinated user data", () => {
      const userData = dataFactory.createUserWithData(3, 2);

      expect(userData.user).toBeDefined();
      expect(userData.goals).toHaveLength(3);
      expect(userData.habits).toHaveLength(2);

      // All goals should belong to the user
      userData.goals.forEach((goal) => {
        expect(goal.userId).toBe(userData.user.id);
      });

      // All habits should belong to the user
      userData.habits.forEach((habit) => {
        expect(habit.userId).toBe(userData.user.id);
      });
    });

    it("should create coordinated project data", () => {
      const projectData = dataFactory.createProjectWithTeam(4, 6);

      expect(projectData.project).toBeDefined();
      expect(projectData.teamMembers).toHaveLength(4);
      expect(projectData.goals).toHaveLength(6);

      // Project should reference all team members
      expect(projectData.project.teamMembers).toHaveLength(4);
      projectData.teamMembers.forEach((member) => {
        expect(projectData.project.teamMembers).toContain(member.id);
      });

      // Project should reference all goals
      expect(projectData.project.goals).toHaveLength(6);
      projectData.goals.forEach((goal) => {
        expect(projectData.project.goals).toContain(goal.id);
      });
    });

    it("should create realistic new user scenario", () => {
      const scenario = dataFactory.createNewUserScenario();

      expect(scenario.user.stats.totalGoals).toBe(0);
      expect(scenario.user.stats.level).toBe(1);
      expect(scenario.goals).toHaveLength(2);
      expect(scenario.habits).toHaveLength(1);

      // Should have one draft and one active goal
      const statuses = scenario.goals.map((goal) => goal.status);
      expect(statuses).toContain("draft");
      expect(statuses).toContain("active");

      // Habit should have no streak for new user
      expect(scenario.habits[0].streak).toBe(0);
    });

    it("should create realistic active user scenario", () => {
      const scenario = dataFactory.createActiveUserScenario();

      expect(scenario.user.stats.totalGoals).toBe(15);
      expect(scenario.user.stats.completedGoals).toBe(8);
      expect(scenario.user.stats.currentStreak).toBe(12);
      expect(scenario.goals).toHaveLength(6);
      expect(scenario.habits).toHaveLength(3);

      // Should have various goal statuses
      const statuses = scenario.goals.map((goal) => goal.status);
      expect(statuses.filter((s) => s === "active")).toHaveLength(3);
      expect(statuses.filter((s) => s === "completed")).toHaveLength(2);
      expect(statuses.filter((s) => s === "draft")).toHaveLength(1);

      // Should have habits with streaks
      const streaks = scenario.habits.map((habit) => habit.streak);
      expect(streaks).toContain(12);
      expect(streaks).toContain(8);
      expect(streaks).toContain(0);
    });
  });

  describe("Data Consistency and Relationships", () => {
    it("should maintain referential integrity", () => {
      const userData = dataFactory.createUserWithData(5, 3);
      const projectData = dataFactory.createProjectWithTeam(
        3,
        userData.goals.length,
      );

      // Update project to use existing goals
      projectData.project.goals = userData.goals.map((goal) => goal.id);

      // Verify relationships
      userData.goals.forEach((goal) => {
        expect(projectData.project.goals).toContain(goal.id);
      });
    });

    it("should generate realistic date relationships", () => {
      const goal = goalFactory.build();

      const startDate = new Date(goal.startDate);
      const targetDate = new Date(goal.targetDate);
      const createdAt = new Date(goal.createdAt);
      const updatedAt = new Date(goal.updatedAt);

      expect(targetDate.getTime()).toBeGreaterThan(startDate.getTime());
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
    });

    it("should handle edge cases and boundary values", () => {
      // Test with zero progress
      const draftGoal = goalFactory.buildDraft();
      expect(draftGoal.progress).toBe(0);

      // Test with maximum progress
      const completedGoal = goalFactory.buildCompleted();
      expect(completedGoal.progress).toBe(100);

      // Test with new user stats
      const newUser = userFactory.buildNewUser();
      expect(newUser.stats.completedGoals).toBeLessThanOrEqual(
        newUser.stats.totalGoals,
      );

      // Test with habit streaks
      const highStreakHabit = habitFactory.buildWithStreak(100);
      expect(highStreakHabit.longestStreak).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Performance and Scalability", () => {
    it("should efficiently create large datasets", () => {
      const startTime = performance.now();

      // Create a large dataset
      const users = userFactory.buildList(100);
      const goals = goalFactory.buildList(500);
      const habits = habitFactory.buildList(300);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(users).toHaveLength(100);
      expect(goals).toHaveLength(500);
      expect(habits).toHaveLength(300);

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it("should generate unique identifiers across large datasets", () => {
      const goals = goalFactory.buildList(1000);
      const ids = goals.map((goal) => goal.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(1000);
    });
  });

  describe("Serialization and Persistence", () => {
    it("should create JSON-serializable objects", () => {
      const goal = goalFactory.build();
      const user = userFactory.build();
      const habit = habitFactory.build();

      expect(() => JSON.stringify(goal)).not.toThrow();
      expect(() => JSON.stringify(user)).not.toThrow();
      expect(() => JSON.stringify(habit)).not.toThrow();

      // Verify round-trip serialization
      const goalJson = JSON.stringify(goal);
      const parsedGoal = JSON.parse(goalJson);
      expect(parsedGoal.id).toBe(goal.id);
      expect(parsedGoal.title).toBe(goal.title);
    });

    it("should maintain data types after deserialization", () => {
      const original = goalFactory.build();
      const serialized = JSON.stringify(original);
      const deserialized = JSON.parse(serialized);

      expect(typeof deserialized.progress).toBe("number");
      expect(Array.isArray(deserialized.tags)).toBe(true);
      expect(Array.isArray(deserialized.milestones)).toBe(true);
    });
  });
});
