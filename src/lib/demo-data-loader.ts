import { AllDemoData, PersonaDemoData, PersonaKey } from "@/types/demo-data";

// Import all demo data files
import sarahData from "@/data/demo/sarah-demo-data.json";
import marcusData from "@/data/demo/marcus-demo-data.json";
import elenaData from "@/data/demo/elena-demo-data.json";
import jamesData from "@/data/demo/james-demo-data.json";
import aishaData from "@/data/demo/aisha-demo-data.json";

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
      aisha: aishaData as PersonaDemoData,
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
    if (typeof window !== "undefined") {
      localStorage.setItem("demo-persona", persona);
      localStorage.setItem("demo-user", JSON.stringify(data.user));
      localStorage.setItem("demo-activity", JSON.stringify(data.activityData));
    }

    return data;
  }

  /**
   * Get current demo persona from localStorage
   */
  getCurrentPersona(): PersonaKey | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("demo-persona") as PersonaKey;
    }
    return null;
  }

  /**
   * Load demo data into application state
   */
  loadDemoData(persona?: PersonaKey): PersonaDemoData {
    const targetPersona = persona || this.getCurrentPersona() || "sarah";
    return this.switchPersona(targetPersona);
  }

  /**
   * Generate summary statistics across all personas
   */
  getGlobalStatistics() {
    const allStats = Object.values(this.demoData).map((d) => d.statistics);

    return {
      totalUsers: Object.keys(this.demoData).length,
      totalTasks: allStats.reduce((sum, s) => sum + s.totalTasks, 0),
      totalCompletedTasks: allStats.reduce(
        (sum, s) => sum + s.completedTasks,
        0,
      ),
      avgCompletionRate:
        allStats.reduce((sum, s) => sum + s.completedTasks / s.totalTasks, 0) /
        allStats.length,
      totalGoals: allStats.reduce((sum, s) => sum + s.totalGoals, 0),
      avgGoalProgress:
        allStats.reduce((sum, s) => sum + s.avgGoalProgress, 0) /
        allStats.length,
      totalHabits: allStats.reduce((sum, s) => sum + s.totalHabits, 0),
      maxHabitStreak: Math.max(...allStats.map((s) => s.habitStreak)),
      totalTimeTracked: allStats.reduce(
        (sum, s) => sum + s.totalTimeTracked,
        0,
      ),
    };
  }
}

// Export singleton instance
export const demoDataLoader = DemoDataLoader.getInstance();

// Export convenience functions
export const getPersonaData = (persona: PersonaKey) =>
  demoDataLoader.getPersonaData(persona);
export const getAllDemoData = () => demoDataLoader.getAllData();
export const switchDemoPersona = (persona: PersonaKey) =>
  demoDataLoader.switchPersona(persona);
export const loadDemoData = (persona?: PersonaKey) =>
  demoDataLoader.loadDemoData(persona);

export default DemoDataLoader;
