export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: string;
  shadow: string;
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface Shadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ComponentConfig {
  button: {
    height: {
      sm: string;
      md: string;
      lg: string;
    };
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
    borderRadius: string;
  };
  card: {
    padding: string;
    borderRadius: string;
    shadow: string;
  };
  modal: {
    maxWidth: string;
    borderRadius: string;
    backdrop: string;
  };
  input: {
    height: string;
    padding: string;
    borderRadius: string;
    borderWidth: string;
  };
}

export interface AppConfig {
  theme: {
    colors: ThemeColors;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    shadows: Shadows;
    animation: Animation;
  };
  components: ComponentConfig;
  features: {
    luna: {
      enabled: boolean;
      localProcessingEnabled: boolean;
      apiCallReduction: number;
      insightsEnabled: boolean;
      metricsEnabled: boolean;
    };
    performance: {
      monitoringEnabled: boolean;
      supabaseMonitoringEnabled: boolean;
      trackingEnabled: boolean;
    };
    dashboard: {
      autoRefresh: boolean;
      refreshInterval: number;
      maxTasksShown: number;
      showCompletedTasks: boolean;
    };
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    cacheDuration: number;
  };
  storage: {
    prefix: string;
    enableCompression: boolean;
  };
}

// Light theme configuration
const lightTheme: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#8b5cf6',
  neutral: '#f8fafc',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  background: '#ffffff',
  surface: '#f8fafc',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Dark theme configuration
const darkTheme: ThemeColors = {
  primary: '#60a5fa',
  secondary: '#94a3b8',
  accent: '#a78bfa',
  neutral: '#1e293b',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#22d3ee',
  background: '#0f172a',
  surface: '#1e293b',
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#64748b',
    inverse: '#0f172a',
  },
  border: '#334155',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Default configuration
export const defaultConfig: AppConfig = {
  theme: {
    colors: lightTheme,
    typography: {
      fontFamily: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'ui-serif, Georgia, serif',
        mono: 'ui-monospace, "SF Mono", Consolas, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  components: {
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
      borderRadius: '0.375rem',
    },
    card: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    modal: {
      maxWidth: '32rem',
      borderRadius: '0.5rem',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
      height: '2.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      borderWidth: '1px',
    },
  },
  features: {
    luna: {
      enabled: true,
      localProcessingEnabled: true,
      apiCallReduction: 60,
      insightsEnabled: true,
      metricsEnabled: true,
    },
    performance: {
      monitoringEnabled: true,
      supabaseMonitoringEnabled: true,
      trackingEnabled: true,
    },
    dashboard: {
      autoRefresh: true,
      refreshInterval: 30000,
      maxTasksShown: 10,
      showCompletedTasks: false,
    },
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000,
    retryAttempts: 3,
    cacheDuration: 300000,
  },
  storage: {
    prefix: 'spark-bloom-',
    enableCompression: false,
  },
};

// Theme variants
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeName = keyof typeof themes;