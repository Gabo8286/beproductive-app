import React, { createContext, useContext, useState, useEffect } from "react";
import { ModuleId, ModulesState } from "@/types/modules";
import { modulesConfig } from "@/config/modules";

const ModulesContext = createContext<ModulesState | undefined>(undefined);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState(modulesConfig);

  // Load module states from localStorage
  useEffect(() => {
    const savedStates = localStorage.getItem("moduleStates");
    if (savedStates) {
      const parsed = JSON.parse(savedStates);
      setModules((prev) => {
        const updated = { ...prev };
        Object.keys(parsed).forEach((key) => {
          const moduleId = key as ModuleId;
          if (updated[moduleId]) {
            updated[moduleId].enabled = parsed[moduleId];
          }
        });
        return updated;
      });
    }
  }, []);

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    return modules[moduleId]?.enabled ?? false;
  };

  const toggleModule = (moduleId: ModuleId, enabled: boolean) => {
    setModules((prev) => {
      const updated = {
        ...prev,
        [moduleId]: { ...prev[moduleId], enabled },
      };

      // Save to localStorage
      const states: Record<string, boolean> = {};
      Object.entries(updated).forEach(([key, config]) => {
        states[key] = config.enabled;
      });
      localStorage.setItem("moduleStates", JSON.stringify(states));

      return updated;
    });
  };

  return (
    <ModulesContext.Provider value={{ modules, isModuleEnabled, toggleModule }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error("useModules must be used within ModulesProvider");
  }
  return context;
}
