import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { defaultConfig, themes, type AppConfig, type ThemeName } from '@/config/app.config';

interface ConfigState {
  config: AppConfig;
  currentTheme: ThemeName;
  isLoading: boolean;
  isDirty: boolean;
}

type ConfigAction =
  | { type: 'SET_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'UPDATE_THEME_COLORS'; payload: Partial<AppConfig['theme']['colors']> }
  | { type: 'UPDATE_COMPONENT_CONFIG'; payload: { component: string; config: any } }
  | { type: 'UPDATE_FEATURE_CONFIG'; payload: { feature: string; config: any } }
  | { type: 'RESET_CONFIG' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SAVE_SUCCESS' };

const initialState: ConfigState = {
  config: defaultConfig,
  currentTheme: 'light',
  isLoading: false,
  isDirty: false,
};

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
        isDirty: true,
      };

    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        config: {
          ...state.config,
          theme: {
            ...state.config.theme,
            colors: themes[action.payload],
          },
        },
        isDirty: true,
      };

    case 'UPDATE_THEME_COLORS':
      return {
        ...state,
        config: {
          ...state.config,
          theme: {
            ...state.config.theme,
            colors: {
              ...state.config.theme.colors,
              ...action.payload,
            },
          },
        },
        isDirty: true,
      };

    case 'UPDATE_COMPONENT_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          components: {
            ...state.config.components,
            [action.payload.component]: {
              ...state.config.components[action.payload.component as keyof typeof state.config.components],
              ...action.payload.config,
            },
          },
        },
        isDirty: true,
      };

    case 'UPDATE_FEATURE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          features: {
            ...state.config.features,
            [action.payload.feature]: {
              ...state.config.features[action.payload.feature as keyof typeof state.config.features],
              ...action.payload.config,
            },
          },
        },
        isDirty: true,
      };

    case 'RESET_CONFIG':
      return {
        ...state,
        config: defaultConfig,
        currentTheme: 'light',
        isDirty: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isDirty: false,
      };

    default:
      return state;
  }
}

interface ConfigContextType {
  state: ConfigState;
  setConfig: (config: Partial<AppConfig>) => void;
  setTheme: (theme: ThemeName) => void;
  updateThemeColors: (colors: Partial<AppConfig['theme']['colors']>) => void;
  updateComponentConfig: (component: string, config: any) => void;
  updateFeatureConfig: (feature: string, config: any) => void;
  resetConfig: () => void;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
  exportConfig: () => string;
  importConfig: (configJson: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'spark-bloom-config';

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // Load configuration from localStorage on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Apply CSS custom properties whenever config changes
  useEffect(() => {
    applyConfigToCSSVariables(state.config);
  }, [state.config]);

  const setConfig = useCallback((config: Partial<AppConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const updateThemeColors = useCallback((colors: Partial<AppConfig['theme']['colors']>) => {
    dispatch({ type: 'UPDATE_THEME_COLORS', payload: colors });
  }, []);

  const updateComponentConfig = useCallback((component: string, config: any) => {
    dispatch({ type: 'UPDATE_COMPONENT_CONFIG', payload: { component, config } });
  }, []);

  const updateFeatureConfig = useCallback((feature: string, config: any) => {
    dispatch({ type: 'UPDATE_FEATURE_CONFIG', payload: { feature, config } });
  }, []);

  const resetConfig = useCallback(() => {
    dispatch({ type: 'RESET_CONFIG' });
  }, []);

  const saveConfig = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.config]);

  const loadConfig = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedConfig = JSON.parse(saved);
        // Merge saved config with default to ensure new properties are included
        const mergedConfig = mergeConfigs(defaultConfig, savedConfig);
        dispatch({ type: 'SET_CONFIG', payload: mergedConfig });
        dispatch({ type: 'SET_DIRTY', payload: false });
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const exportConfig = useCallback(() => {
    return JSON.stringify(state.config, null, 2);
  }, [state.config]);

  const importConfig = useCallback((configJson: string) => {
    try {
      const importedConfig = JSON.parse(configJson);
      const mergedConfig = mergeConfigs(defaultConfig, importedConfig);
      dispatch({ type: 'SET_CONFIG', payload: mergedConfig });
    } catch (error) {
      console.error('Failed to import configuration:', error);
      throw new Error('Invalid configuration format');
    }
  }, []);

  const value: ConfigContextType = {
    state,
    setConfig,
    setTheme,
    updateThemeColors,
    updateComponentConfig,
    updateFeatureConfig,
    resetConfig,
    saveConfig,
    loadConfig,
    exportConfig,
    importConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Utility function to deeply merge configurations
function mergeConfigs(defaultConfig: AppConfig, userConfig: any): AppConfig {
  const merged = { ...defaultConfig };

  Object.keys(userConfig).forEach(key => {
    if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
      merged[key as keyof AppConfig] = {
        ...merged[key as keyof AppConfig],
        ...mergeConfigs(merged[key as keyof AppConfig] as any, userConfig[key])
      } as any;
    } else {
      (merged as any)[key] = userConfig[key];
    }
  });

  return merged;
}

// Apply configuration to CSS custom properties
function applyConfigToCSSVariables(config: AppConfig) {
  const root = document.documentElement;

  // Apply color variables
  Object.entries(config.theme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--color-${key}`, value);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        root.style.setProperty(`--color-${key}-${subKey}`, String(subValue));
      });
    }
  });

  // Apply typography variables
  Object.entries(config.theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });

  Object.entries(config.theme.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value);
  });

  Object.entries(config.theme.typography.lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, value);
  });

  // Apply spacing variables
  Object.entries(config.theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Apply border radius variables
  Object.entries(config.theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--border-radius-${key}`, value);
  });

  // Apply shadow variables
  Object.entries(config.theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Apply animation variables
  Object.entries(config.theme.animation.duration).forEach(([key, value]) => {
    root.style.setProperty(`--duration-${key}`, value);
  });

  Object.entries(config.theme.animation.easing).forEach(([key, value]) => {
    root.style.setProperty(`--easing-${key}`, value);
  });

  // Apply component-specific variables
  Object.entries(config.components).forEach(([component, componentConfig]) => {
    Object.entries(componentConfig).forEach(([property, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--${component}-${property}-${subKey}`, String(subValue));
        });
      } else {
        root.style.setProperty(`--${component}-${property}`, String(value));
      }
    });
  });
}