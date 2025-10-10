// Inter-Module Communication Service
import { eventBus, EVENT_TYPES } from './eventBus';
import { moduleRegistry } from './moduleRegistry';

export interface ModuleMessage {
  from: string;
  to: string;
  action: string;
  payload?: any;
  requestId?: string;
}

export interface ModuleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class ModuleCommunication {
  private messageHandlers: Map<string, Map<string, (message: ModuleMessage) => Promise<ModuleResponse>>> = new Map();

  constructor() {
    this.setupGlobalHandlers();
  }

  // Register a message handler for a module
  public registerHandler(
    moduleName: string,
    action: string,
    handler: (message: ModuleMessage) => Promise<ModuleResponse>
  ): void {
    if (!this.messageHandlers.has(moduleName)) {
      this.messageHandlers.set(moduleName, new Map());
    }

    const moduleHandlers = this.messageHandlers.get(moduleName)!;
    moduleHandlers.set(action, handler);
  }

  // Send a message to another module
  public async sendMessage(message: ModuleMessage): Promise<ModuleResponse> {
    const { to, action } = message;

    // Check if target module is loaded
    if (!moduleRegistry.isModuleLoaded(to)) {
      try {
        await moduleRegistry.loadModule(to);
      } catch (error) {
        return {
          success: false,
          error: `Failed to load target module ${to}: ${error}`
        };
      }
    }

    // Get handler for the action
    const moduleHandlers = this.messageHandlers.get(to);
    if (!moduleHandlers) {
      return {
        success: false,
        error: `No handlers registered for module ${to}`
      };
    }

    const handler = moduleHandlers.get(action);
    if (!handler) {
      return {
        success: false,
        error: `No handler found for action ${action} in module ${to}`
      };
    }

    try {
      const response = await handler(message);

      // Emit communication event for monitoring
      eventBus.emit({
        type: EVENT_TYPES.MODULE_COMMUNICATION,
        source: message.from,
        target: message.to,
        data: { action, success: response.success }
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: `Handler error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Send a message and expect a response (request-response pattern)
  public async request(
    from: string,
    to: string,
    action: string,
    payload?: any,
    timeout: number = 5000
  ): Promise<ModuleResponse> {
    const message: ModuleMessage = {
      from,
      to,
      action,
      payload,
      requestId: Date.now().toString() + Math.random().toString(36)
    };

    return this.sendMessage(message);
  }

  // Broadcast a message to all loaded modules
  public async broadcast(
    from: string,
    action: string,
    payload?: any
  ): Promise<ModuleResponse[]> {
    const loadedModules = moduleRegistry.getLoadedModules();
    const promises = loadedModules
      .filter(module => module.name !== from) // Don't send to self
      .map(module => this.sendMessage({
        from,
        to: module.name,
        action,
        payload
      }));

    return Promise.all(promises);
  }

  // Get registered handlers for a module (for debugging)
  public getHandlers(moduleName: string): string[] {
    const moduleHandlers = this.messageHandlers.get(moduleName);
    return moduleHandlers ? Array.from(moduleHandlers.keys()) : [];
  }

  // Setup global event handlers for system-wide communication
  private setupGlobalHandlers(): void {
    // Handle module loading events
    eventBus.subscribe(EVENT_TYPES.MODULE_LOADED, (event) => {
      console.log(`Module communication: ${event.data.module} loaded`);
    }, { module: 'module-communication' });

    // Handle module errors
    eventBus.subscribe(EVENT_TYPES.MODULE_ERROR, (event) => {
      console.error(`Module communication: ${event.data.module} error:`, event.data.error);
    }, { module: 'module-communication' });
  }
}

// Export singleton instance
export const moduleComm = new ModuleCommunication();

// Predefined message types for common inter-module communications
export const MESSAGE_TYPES = {
  // AI Assistant messages
  AI_PROCESS_INTENT: 'process_intent',
  AI_GENERATE_RESPONSE: 'generate_response',
  AI_ANALYZE_DATA: 'analyze_data',

  // Productivity Cycle messages
  CYCLE_GET_STATE: 'get_state',
  CYCLE_SET_PHASE: 'set_phase',
  CYCLE_ADD_GOAL: 'add_goal',
  CYCLE_UPDATE_PROGRESS: 'update_progress',

  // Task Management messages
  TASK_CREATE: 'create_task',
  TASK_UPDATE: 'update_task',
  TASK_DELETE: 'delete_task',
  TASK_GET_LIST: 'get_task_list',

  // Automation Engine messages
  AUTOMATION_TRIGGER: 'trigger_automation',
  AUTOMATION_CREATE_RULE: 'create_rule',
  AUTOMATION_EXECUTE_WORKFLOW: 'execute_workflow',

  // Voice Interface messages
  VOICE_START_RECOGNITION: 'start_recognition',
  VOICE_STOP_RECOGNITION: 'stop_recognition',
  VOICE_SPEAK_TEXT: 'speak_text',
  VOICE_PROCESS_COMMAND: 'process_command',

  // General messages
  GET_STATUS: 'get_status',
  HEALTH_CHECK: 'health_check',
  SYNC_DATA: 'sync_data'
} as const;