export type ModuleId =
  | "auth"
  | "goals"
  | "tasks"
  | "habits"
  | "projects"
  | "reflections"
  | "quick-todos"
  | "ai-insights"
  | "team-collaboration"
  | "process-inventory";

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  path: string;
  requiredRole?: string[];
}

export interface ModulesState {
  modules: Record<ModuleId, ModuleConfig>;
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  toggleModule: (moduleId: ModuleId, enabled: boolean) => void;
}
