import { analyticsService } from './analytics-service';

export type InterfaceMode = 'simple' | 'balanced' | 'advanced' | 'developer';
export type UserPersona = 'creator' | 'designer' | 'developer' | 'learner' | 'professional';

export interface InterfaceSettings {
  mode: InterfaceMode;
  persona: UserPersona;
  showCode: boolean;
  showTerminal: boolean;
  showFileTree: boolean;
  showAdvancedTools: boolean;
  autoHideComplexity: boolean;
  guidedWorkflow: boolean;
  visualFeedback: boolean;
  minimalistUI: boolean;
  contextualHelp: boolean;
  smartSuggestions: boolean;
}

export interface AdaptiveRule {
  id: string;
  condition: (settings: InterfaceSettings, userActivity: UserActivity) => boolean;
  action: (settings: InterfaceSettings) => Partial<InterfaceSettings>;
  description: string;
  category: 'productivity' | 'learning' | 'focus' | 'efficiency';
}

export interface UserActivity {
  recentActions: string[];
  timeInMode: number;
  errorsEncountered: number;
  tasksCompleted: number;
  aiInteractions: number;
  codeEditing: boolean;
  usingVisualTools: boolean;
  sessionFocus: 'creation' | 'editing' | 'learning' | 'debugging';
}

class AdaptiveInterfaceService {
  private settings: InterfaceSettings;
  private userActivity: UserActivity;
  private adaptiveRules: AdaptiveRule[];
  private lastAdaptation: Date = new Date();

  constructor() {
    this.settings = this.loadSettings();
    this.userActivity = this.initializeActivity();
    this.adaptiveRules = this.createAdaptiveRules();
    this.setupActivityTracking();
  }

  private loadSettings(): InterfaceSettings {
    const stored = localStorage.getItem('beproductive_interface_settings');
    if (stored) {
      return JSON.parse(stored);
    }

    // Default to simple mode for new users
    return {
      mode: 'simple',
      persona: 'creator',
      showCode: false,
      showTerminal: false,
      showFileTree: false,
      showAdvancedTools: false,
      autoHideComplexity: true,
      guidedWorkflow: true,
      visualFeedback: true,
      minimalistUI: true,
      contextualHelp: true,
      smartSuggestions: true
    };
  }

  private saveSettings(): void {
    localStorage.setItem('beproductive_interface_settings', JSON.stringify(this.settings));
  }

  private initializeActivity(): UserActivity {
    return {
      recentActions: [],
      timeInMode: 0,
      errorsEncountered: 0,
      tasksCompleted: 0,
      aiInteractions: 0,
      codeEditing: false,
      usingVisualTools: true,
      sessionFocus: 'creation'
    };
  }

  private setupActivityTracking(): void {
    // Track user activity every 30 seconds
    setInterval(() => {
      this.updateActivity();
      this.evaluateAdaptations();
    }, 30000);
  }

  private updateActivity(): void {
    this.userActivity.timeInMode += 30; // 30 seconds

    // Check if user is actively coding
    const codeEditor = document.querySelector('.monaco-editor');
    this.userActivity.codeEditing = !!codeEditor && document.activeElement === codeEditor;

    // Update session focus based on recent actions
    const recentActions = this.userActivity.recentActions.slice(-10);
    if (recentActions.includes('ai_interaction')) {
      this.userActivity.sessionFocus = 'creation';
    } else if (recentActions.includes('code_edit')) {
      this.userActivity.sessionFocus = 'editing';
    } else if (recentActions.includes('error') || recentActions.includes('debug')) {
      this.userActivity.sessionFocus = 'debugging';
    }
  }

  private createAdaptiveRules(): AdaptiveRule[] {
    return [
      {
        id: 'show_code_when_editing',
        condition: (settings, activity) =>
          !settings.showCode && activity.codeEditing && activity.timeInMode > 300,
        action: (settings) => ({ showCode: true, showFileTree: true }),
        description: 'Show code editor when user starts editing',
        category: 'productivity'
      },
      {
        id: 'hide_complexity_for_beginners',
        condition: (settings, activity) =>
          settings.persona === 'learner' && activity.errorsEncountered > 3,
        action: (settings) => ({
          showAdvancedTools: false,
          guidedWorkflow: true,
          contextualHelp: true
        }),
        description: 'Simplify interface when learner encounters errors',
        category: 'learning'
      },
      {
        id: 'advance_interface_for_power_users',
        condition: (settings, activity) =>
          settings.mode === 'simple' &&
          activity.tasksCompleted > 5 &&
          activity.aiInteractions > 10,
        action: (settings) => ({
          mode: 'balanced',
          showAdvancedTools: true,
          autoHideComplexity: false
        }),
        description: 'Advance interface for experienced users',
        category: 'efficiency'
      },
      {
        id: 'focus_mode_when_concentrated',
        condition: (settings, activity) =>
          activity.timeInMode > 1800 && // 30 minutes
          activity.sessionFocus === 'creation' &&
          !settings.minimalistUI,
        action: (settings) => ({
          minimalistUI: true,
          showTerminal: false,
          contextualHelp: false
        }),
        description: 'Enable focus mode during long creation sessions',
        category: 'focus'
      },
      {
        id: 'show_terminal_for_developers',
        condition: (settings, activity) =>
          settings.persona === 'developer' &&
          activity.recentActions.includes('deploy') &&
          !settings.showTerminal,
        action: (settings) => ({ showTerminal: true, showAdvancedTools: true }),
        description: 'Show terminal for developers doing deployments',
        category: 'productivity'
      }
    ];
  }

  private evaluateAdaptations(): void {
    const now = new Date();

    // Don't adapt too frequently
    if (now.getTime() - this.lastAdaptation.getTime() < 60000) { // 1 minute
      return;
    }

    const applicableRules = this.adaptiveRules.filter(rule =>
      rule.condition(this.settings, this.userActivity)
    );

    if (applicableRules.length > 0) {
      // Apply the most relevant rule
      const rule = applicableRules[0];
      const changes = rule.action(this.settings);

      this.updateSettings(changes);
      this.lastAdaptation = now;

      analyticsService.track('interface_adapted', {
        ruleId: rule.id,
        changes: Object.keys(changes),
        category: rule.category
      }, 'feature');
    }
  }

  // Public methods
  getSettings(): InterfaceSettings {
    return { ...this.settings };
  }

  updateSettings(changes: Partial<InterfaceSettings>): void {
    this.settings = { ...this.settings, ...changes };
    this.saveSettings();

    // Broadcast changes to UI
    window.dispatchEvent(new CustomEvent('interface-settings-changed', {
      detail: this.settings
    }));

    analyticsService.track('interface_settings_updated', {
      changes: Object.keys(changes),
      newMode: this.settings.mode
    }, 'feature');
  }

  setMode(mode: InterfaceMode): void {
    const modeSettings = this.getModePresets(mode);
    this.updateSettings({ mode, ...modeSettings });
  }

  setPersona(persona: UserPersona): void {
    const personaSettings = this.getPersonaPresets(persona);
    this.updateSettings({ persona, ...personaSettings });
  }

  private getModePresets(mode: InterfaceMode): Partial<InterfaceSettings> {
    switch (mode) {
      case 'simple':
        return {
          showCode: false,
          showTerminal: false,
          showFileTree: false,
          showAdvancedTools: false,
          autoHideComplexity: true,
          guidedWorkflow: true,
          visualFeedback: true,
          minimalistUI: true,
          contextualHelp: true
        };

      case 'balanced':
        return {
          showCode: true,
          showTerminal: false,
          showFileTree: true,
          showAdvancedTools: false,
          autoHideComplexity: true,
          guidedWorkflow: true,
          visualFeedback: true,
          minimalistUI: false,
          contextualHelp: true
        };

      case 'advanced':
        return {
          showCode: true,
          showTerminal: true,
          showFileTree: true,
          showAdvancedTools: true,
          autoHideComplexity: false,
          guidedWorkflow: false,
          visualFeedback: false,
          minimalistUI: false,
          contextualHelp: false
        };

      case 'developer':
        return {
          showCode: true,
          showTerminal: true,
          showFileTree: true,
          showAdvancedTools: true,
          autoHideComplexity: false,
          guidedWorkflow: false,
          visualFeedback: false,
          minimalistUI: false,
          contextualHelp: false,
          smartSuggestions: false
        };

      default:
        return {};
    }
  }

  private getPersonaPresets(persona: UserPersona): Partial<InterfaceSettings> {
    switch (persona) {
      case 'creator':
        return {
          mode: 'simple',
          showCode: false,
          guidedWorkflow: true,
          visualFeedback: true,
          minimalistUI: true,
          contextualHelp: true
        };

      case 'designer':
        return {
          mode: 'balanced',
          showCode: false,
          showAdvancedTools: false,
          visualFeedback: true,
          minimalistUI: false,
          contextualHelp: true
        };

      case 'developer':
        return {
          mode: 'advanced',
          showCode: true,
          showTerminal: true,
          showFileTree: true,
          showAdvancedTools: true,
          guidedWorkflow: false,
          contextualHelp: false
        };

      case 'learner':
        return {
          mode: 'simple',
          showCode: false,
          showAdvancedTools: false,
          autoHideComplexity: true,
          guidedWorkflow: true,
          visualFeedback: true,
          contextualHelp: true,
          smartSuggestions: true
        };

      case 'professional':
        return {
          mode: 'balanced',
          showCode: true,
          showAdvancedTools: true,
          autoHideComplexity: false,
          guidedWorkflow: false,
          minimalistUI: false,
          contextualHelp: false
        };

      default:
        return {};
    }
  }

  // Activity tracking methods
  trackAction(action: string): void {
    this.userActivity.recentActions.push(action);

    // Keep only last 50 actions
    if (this.userActivity.recentActions.length > 50) {
      this.userActivity.recentActions = this.userActivity.recentActions.slice(-50);
    }

    // Update specific counters
    if (action.includes('ai')) {
      this.userActivity.aiInteractions++;
    }
    if (action.includes('complete')) {
      this.userActivity.tasksCompleted++;
    }
    if (action.includes('error')) {
      this.userActivity.errorsEncountered++;
    }
  }

  // UI helper methods
  shouldShowComponent(component: string): boolean {
    switch (component) {
      case 'code-editor':
        return this.settings.showCode;
      case 'terminal':
        return this.settings.showTerminal;
      case 'file-tree':
        return this.settings.showFileTree;
      case 'advanced-tools':
        return this.settings.showAdvancedTools;
      case 'contextual-help':
        return this.settings.contextualHelp;
      case 'guided-workflow':
        return this.settings.guidedWorkflow;
      default:
        return true;
    }
  }

  getUIClasses(): string[] {
    const classes: string[] = [];

    if (this.settings.minimalistUI) classes.push('minimalist-ui');
    if (this.settings.visualFeedback) classes.push('visual-feedback');
    if (this.settings.guidedWorkflow) classes.push('guided-workflow');
    if (this.settings.autoHideComplexity) classes.push('auto-hide-complexity');

    classes.push(`mode-${this.settings.mode}`);
    classes.push(`persona-${this.settings.persona}`);

    return classes;
  }

  // Quick toggles for testing
  toggleCodeView(): void {
    this.updateSettings({ showCode: !this.settings.showCode });
  }

  toggleSimplicity(): void {
    const newMode = this.settings.mode === 'simple' ? 'balanced' : 'simple';
    this.setMode(newMode);
  }

  // Get current state for debugging
  getDebugInfo(): {
    settings: InterfaceSettings;
    activity: UserActivity;
    applicableRules: string[];
  } {
    const applicableRules = this.adaptiveRules
      .filter(rule => rule.condition(this.settings, this.userActivity))
      .map(rule => rule.id);

    return {
      settings: this.settings,
      activity: this.userActivity,
      applicableRules
    };
  }
}

// Create singleton instance
export const adaptiveInterface = new AdaptiveInterfaceService();