// Module Registry Service
import { eventBus, EVENT_TYPES } from './eventBus';

export interface ModuleDefinition {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  capabilities: string[];
  status: 'loading' | 'loaded' | 'error' | 'disabled';
  instance?: any;
  loadedAt?: Date;
  error?: string;
}

export interface ModuleCapability {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
  module: string;
}

class ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();
  private capabilities: Map<string, ModuleCapability> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  // Register a module
  public registerModule(definition: Omit<ModuleDefinition, 'status' | 'loadedAt'>): void {
    const module: ModuleDefinition = {
      ...definition,
      status: 'loading',
      loadedAt: undefined
    };

    this.modules.set(definition.name, module);

    // Emit module registration event
    eventBus.emit({
      type: EVENT_TYPES.MODULE_LOADED,
      source: 'module-registry',
      data: { module: definition.name, status: 'registered' }
    });
  }

  // Load a module
  public async loadModule(moduleName: string): Promise<any> {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    // Check dependencies
    const missingDeps = module.dependencies.filter(dep =>
      !this.isModuleLoaded(dep)
    );

    if (missingDeps.length > 0) {
      // Load dependencies first
      await Promise.all(missingDeps.map(dep => this.loadModule(dep)));
    }

    const loadingPromise = this.performModuleLoad(moduleName);
    this.loadingPromises.set(moduleName, loadingPromise);

    try {
      const instance = await loadingPromise;

      // Update module status
      module.status = 'loaded';
      module.instance = instance;
      module.loadedAt = new Date();

      // Register module capabilities
      if (instance.capabilities) {
        this.registerCapabilities(moduleName, instance.capabilities);
      }

      // Emit success event
      eventBus.emit({
        type: EVENT_TYPES.MODULE_LOADED,
        source: 'module-registry',
        data: { module: moduleName, status: 'loaded' }
      });

      return instance;

    } catch (error) {
      // Update module status
      module.status = 'error';
      module.error = error instanceof Error ? error.message : 'Unknown error';

      // Emit error event
      eventBus.emit({
        type: EVENT_TYPES.MODULE_ERROR,
        source: 'module-registry',
        data: { module: moduleName, error: module.error }
      });

      throw error;
    } finally {
      this.loadingPromises.delete(moduleName);
    }
  }

  // Get module instance
  public getModule(moduleName: string): any {
    const module = this.modules.get(moduleName);
    if (!module || module.status !== 'loaded') {
      return null;
    }
    return module.instance;
  }

  // Check if module is loaded
  public isModuleLoaded(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    return module?.status === 'loaded';
  }

  // Get all modules
  public getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  // Get loaded modules
  public getLoadedModules(): ModuleDefinition[] {
    return this.getAllModules().filter(m => m.status === 'loaded');
  }

  // Register module capabilities
  public registerCapabilities(moduleName: string, capabilities: Record<string, ModuleCapability>): void {
    Object.entries(capabilities).forEach(([name, capability]) => {
      this.capabilities.set(name, {
        ...capability,
        module: moduleName
      });
    });
  }

  // Execute a capability
  public async executeCapability(capabilityName: string, params: any): Promise<any> {
    const capability = this.capabilities.get(capabilityName);
    if (!capability) {
      throw new Error(`Capability ${capabilityName} not found`);
    }

    // Ensure the module is loaded
    if (!this.isModuleLoaded(capability.module)) {
      await this.loadModule(capability.module);
    }

    return capability.execute(params);
  }

  // Get available capabilities
  public getCapabilities(): ModuleCapability[] {
    return Array.from(this.capabilities.values());
  }

  // Get capabilities by module
  public getModuleCapabilities(moduleName: string): ModuleCapability[] {
    return this.getCapabilities().filter(cap => cap.module === moduleName);
  }

  // Unload module
  public unloadModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (!module) return;

    // Remove capabilities
    const moduleCapabilities = this.getModuleCapabilities(moduleName);
    moduleCapabilities.forEach(cap => {
      this.capabilities.delete(cap.name);
    });

    // Cleanup module instance
    if (module.instance?.cleanup) {
      try {
        module.instance.cleanup();
      } catch (error) {
        console.error(`Error cleaning up module ${moduleName}:`, error);
      }
    }

    // Update status
    module.status = 'disabled';
    module.instance = undefined;
  }

  // Reload module
  public async reloadModule(moduleName: string): Promise<any> {
    this.unloadModule(moduleName);
    return this.loadModule(moduleName);
  }

  // Private methods
  private async performModuleLoad(moduleName: string): Promise<any> {
    try {
      // Dynamic import based on module name
      const moduleMap: Record<string, () => Promise<any>> = {
        'ai-assistant': () => import('../../modules/ai-assistant'),
        'productivity-cycle': () => import('../../modules/productivity-cycle'),
        'task-management': () => import('../../modules/task-management'),
        'automation-engine': () => import('../../modules/automation-engine'),
        'voice-interface': () => import('../../modules/voice-interface')
      };

      const loader = moduleMap[moduleName];
      if (!loader) {
        throw new Error(`No loader found for module ${moduleName}`);
      }

      const moduleExports = await loader();

      // Initialize module if it has an init function
      if (moduleExports.init) {
        return await moduleExports.init();
      }

      return moduleExports;

    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
      throw error;
    }
  }

  // Get module dependency graph
  public getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    this.modules.forEach((module, name) => {
      graph[name] = module.dependencies;
    });

    return graph;
  }

  // Check for circular dependencies
  public hasCircularDependencies(): boolean {
    const graph = this.getDependencyGraph();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) {
        return true;
      }
      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recursionStack.add(node);

      const dependencies = graph[node] || [];
      for (const dep of dependencies) {
        if (hasCycle(dep)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    return Object.keys(graph).some(hasCycle);
  }

  // Get load order based on dependencies
  public getLoadOrder(): string[] {
    const graph = this.getDependencyGraph();
    const visited = new Set<string>();
    const loadOrder: string[] = [];

    const visit = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);

      const dependencies = graph[node] || [];
      dependencies.forEach(visit);
      loadOrder.push(node);
    };

    Object.keys(graph).forEach(visit);
    return loadOrder;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();

// Initialize core modules
moduleRegistry.registerModule({
  name: 'ai-assistant',
  version: '1.0.0',
  description: 'Central AI intelligence for natural language processing and user interaction',
  dependencies: [],
  capabilities: [
    'intent-recognition',
    'natural-language-processing',
    'conversation-management',
    'action-execution'
  ]
});

moduleRegistry.registerModule({
  name: 'productivity-cycle',
  version: '1.0.0',
  description: 'Manage the 3-step productivity cycle',
  dependencies: ['ai-assistant'],
  capabilities: [
    'cycle-management',
    'phase-transitions',
    'goal-tracking',
    'progress-analytics'
  ]
});

moduleRegistry.registerModule({
  name: 'task-management',
  version: '1.0.0',
  description: 'Comprehensive task lifecycle management',
  dependencies: ['ai-assistant'],
  capabilities: [
    'task-creation',
    'task-management',
    'smart-prioritization',
    'status-detection'
  ]
});

moduleRegistry.registerModule({
  name: 'automation-engine',
  version: '1.0.0',
  description: 'Central automation system for all modules',
  dependencies: ['ai-assistant'],
  capabilities: [
    'automation-rules',
    'workflow-execution',
    'pattern-learning',
    'optimization'
  ]
});

moduleRegistry.registerModule({
  name: 'voice-interface',
  version: '1.0.0',
  description: 'Voice interaction and speech processing',
  dependencies: ['ai-assistant'],
  capabilities: [
    'speech-recognition',
    'text-to-speech',
    'voice-commands',
    'audio-processing'
  ]
});