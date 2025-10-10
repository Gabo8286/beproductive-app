// Event Bus for Inter-Module Communication
export interface ModuleEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
  handled?: boolean;
}

export type EventHandler = (event: ModuleEvent) => void | Promise<void>;

interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  module: string;
  priority: number;
}

class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: ModuleEvent[] = [];
  private maxHistorySize = 1000;

  // Subscribe to events
  public subscribe(
    eventType: string,
    handler: EventHandler,
    options: {
      module: string;
      priority?: number;
      once?: boolean;
    }
  ): () => void {
    const subscription: EventSubscription = {
      id: Date.now().toString() + Math.random().toString(36),
      eventType,
      handler: options.once ? this.createOnceHandler(handler) : handler,
      module: options.module,
      priority: options.priority || 0
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptionList = this.subscriptions.get(eventType)!;
    subscriptionList.push(subscription);

    // Sort by priority (higher priority first)
    subscriptionList.sort((a, b) => b.priority - a.priority);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(subscription.id);
    };
  }

  // Unsubscribe from events
  public unsubscribe(subscriptionId: string): void {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        break;
      }
    }
  }

  // Emit an event
  public async emit(event: Omit<ModuleEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: ModuleEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36),
      timestamp: new Date(),
      handled: false
    };

    // Add to history
    this.addToHistory(fullEvent);

    // Get subscriptions for this event type
    const subscriptions = this.subscriptions.get(event.type) || [];

    // Filter subscriptions based on target (if specified)
    const targetedSubscriptions = event.target
      ? subscriptions.filter(sub => sub.module === event.target)
      : subscriptions;

    // Handle event with all subscribers
    const handlerPromises = targetedSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler(fullEvent);
        fullEvent.handled = true;
      } catch (error) {
        console.error(`Error handling event ${event.type} in module ${subscription.module}:`, error);
      }
    });

    await Promise.all(handlerPromises);
  }

  // Emit event and wait for response
  public async request<T = any>(
    event: Omit<ModuleEvent, 'id' | 'timestamp'>,
    timeout: number = 5000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString() + Math.random().toString(36);
      const responseType = `${event.type}_response_${requestId}`;

      // Set up response listener
      const unsubscribe = this.subscribe(responseType, (responseEvent) => {
        unsubscribe();
        clearTimeout(timeoutHandle);
        resolve(responseEvent.data);
      }, { module: event.source });

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Request timeout for event ${event.type}`));
      }, timeout);

      // Emit the request
      this.emit({
        ...event,
        data: {
          ...event.data,
          requestId,
          responseType
        }
      });
    });
  }

  // Get event history
  public getEventHistory(filterOptions?: {
    eventType?: string;
    source?: string;
    target?: string;
    since?: Date;
  }): ModuleEvent[] {
    let filtered = [...this.eventHistory];

    if (filterOptions) {
      if (filterOptions.eventType) {
        filtered = filtered.filter(e => e.type === filterOptions.eventType);
      }
      if (filterOptions.source) {
        filtered = filtered.filter(e => e.source === filterOptions.source);
      }
      if (filterOptions.target) {
        filtered = filtered.filter(e => e.target === filterOptions.target);
      }
      if (filterOptions.since) {
        filtered = filtered.filter(e => e.timestamp >= filterOptions.since!);
      }
    }

    return filtered;
  }

  // Clear event history
  public clearHistory(): void {
    this.eventHistory = [];
  }

  // Get active subscriptions
  public getSubscriptions(): Map<string, EventSubscription[]> {
    return new Map(this.subscriptions);
  }

  // Private methods
  private createOnceHandler(handler: EventHandler): EventHandler {
    let called = false;
    return (event: ModuleEvent) => {
      if (!called) {
        called = true;
        return handler(event);
      }
    };
  }

  private addToHistory(event: ModuleEvent): void {
    this.eventHistory.push(event);

    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

// Common event types
export const EVENT_TYPES = {
  // AI Assistant events
  AI_INTENT_RECOGNIZED: 'ai:intent_recognized',
  AI_ACTION_REQUESTED: 'ai:action_requested',
  AI_RESPONSE_GENERATED: 'ai:response_generated',

  // Productivity Cycle events
  CYCLE_PHASE_CHANGED: 'cycle:phase_changed',
  CYCLE_GOAL_ADDED: 'cycle:goal_added',
  CYCLE_GOAL_COMPLETED: 'cycle:goal_completed',
  CYCLE_PROGRESS_UPDATED: 'cycle:progress_updated',

  // Task Management events
  TASK_CREATED: 'tasks:created',
  TASK_UPDATED: 'tasks:updated',
  TASK_COMPLETED: 'tasks:completed',
  TASK_DELETED: 'tasks:deleted',

  // Automation events
  AUTOMATION_TRIGGERED: 'automation:triggered',
  AUTOMATION_COMPLETED: 'automation:completed',
  AUTOMATION_FAILED: 'automation:failed',

  // Voice Interface events
  VOICE_COMMAND_RECEIVED: 'voice:command_received',
  VOICE_RECOGNITION_STARTED: 'voice:recognition_started',
  VOICE_RECOGNITION_STOPPED: 'voice:recognition_stopped',

  // System events
  MODULE_LOADED: 'system:module_loaded',
  MODULE_ERROR: 'system:module_error',
  MODULE_COMMUNICATION: 'system:module_communication',
  USER_ACTION: 'system:user_action'
} as const;

// Export singleton instance
export const eventBus = new EventBus();