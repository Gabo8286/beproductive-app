/**
 * Predictive Navigation Service
 * Anticipates user navigation patterns and preloads resources for improved performance
 */

import {
  NavigationHubId,
  EnhancedNavigationContext,
  SubNavigationItem,
} from '@/types/navigation';
import { smartNavigationSuggestionsService } from './SmartNavigationSuggestionsService';
import { navigationHubRegistry } from './NavigationHubRegistry';

interface PreloadTask {
  id: string;
  hubId: NavigationHubId;
  path: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedSize: number; // bytes
  startTime: number;
  status: 'pending' | 'loading' | 'completed' | 'failed';
  type: 'route' | 'component' | 'data' | 'image';
}

interface PreloadCache {
  [key: string]: {
    data: any;
    timestamp: number;
    hits: number;
    lastAccess: number;
  };
}

interface PredictionMetrics {
  totalPredictions: number;
  successfulPredictions: number;
  accuracy: number;
  averagePreloadTime: number;
  cacheHitRate: number;
  bandwidthSaved: number;
}

class PredictiveNavigationService {
  private preloadQueue: PreloadTask[] = [];
  private activePreloads: Map<string, AbortController> = new Map();
  private preloadCache: PreloadCache = {};
  private metrics: PredictionMetrics = {
    totalPredictions: 0,
    successfulPredictions: 0,
    accuracy: 0,
    averagePreloadTime: 0,
    cacheHitRate: 0,
    bandwidthSaved: 0,
  };

  private maxConcurrentPreloads = 3;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private preloadTimeout = 10000; // 10 seconds
  private confidenceThreshold = 0.6;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the predictive navigation service
   */
  private initializeService(): void {
    // Load cached metrics
    this.loadMetrics();

    // Set up periodic cache cleanup
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // Every 5 minutes

    // Monitor connection quality
    this.setupNetworkMonitoring();
  }

  /**
   * Generate predictions based on current context and suggest preloads
   */
  public generatePredictions(context: EnhancedNavigationContext): void {
    // Get AI-powered suggestions
    const suggestions = smartNavigationSuggestionsService.getPredictiveSuggestions(context);

    // Get temporal predictions
    const temporalPredictions = this.getTemporalPredictions(context);

    // Get workflow-based predictions
    const workflowPredictions = this.getWorkflowPredictions(context);

    // Combine and prioritize predictions
    const allPredictions = [
      ...suggestions.map(hubId => ({ hubId, source: 'ai', confidence: 0.8 })),
      ...temporalPredictions.map(hubId => ({ hubId, source: 'temporal', confidence: 0.7 })),
      ...workflowPredictions.map(hubId => ({ hubId, source: 'workflow', confidence: 0.6 })),
    ];

    // Create preload tasks
    this.createPreloadTasks(allPredictions, context);

    // Execute preloads
    this.executePreloadQueue();
  }

  /**
   * Get temporal-based navigation predictions
   */
  private getTemporalPredictions(context: EnhancedNavigationContext): NavigationHubId[] {
    const currentHour = new Date().getHours();
    const predictions: NavigationHubId[] = [];

    // Morning patterns (7-11 AM)
    if (currentHour >= 7 && currentHour <= 11) {
      predictions.push('planning-time', 'capture-productivity');
    }

    // Midday patterns (11 AM - 2 PM)
    if (currentHour >= 11 && currentHour <= 14) {
      predictions.push('engage-collaboration', 'capture-productivity');
    }

    // Afternoon patterns (2-5 PM)
    if (currentHour >= 14 && currentHour <= 17) {
      predictions.push('capture-productivity', 'insights-growth');
    }

    // Evening patterns (5-8 PM)
    if (currentHour >= 17 && currentHour <= 20) {
      predictions.push('insights-growth', 'planning-time');
    }

    return predictions.filter((hub, index, self) => self.indexOf(hub) === index);
  }

  /**
   * Get workflow-based navigation predictions
   */
  private getWorkflowPredictions(context: EnhancedNavigationContext): NavigationHubId[] {
    const predictions: NavigationHubId[] = [];

    switch (context.workflowState) {
      case 'planning':
        predictions.push('capture-productivity', 'engage-collaboration');
        break;
      case 'executing':
        predictions.push('insights-growth', 'engage-collaboration');
        break;
      case 'collaborating':
        predictions.push('capture-productivity', 'planning-time');
        break;
      case 'reviewing':
        predictions.push('planning-time', 'capture-productivity');
        break;
      case 'learning':
        predictions.push('insights-growth', 'capture-productivity');
        break;
      default:
        predictions.push('capture-productivity', 'planning-time');
    }

    return predictions;
  }

  /**
   * Create preload tasks from predictions
   */
  private createPreloadTasks(
    predictions: Array<{ hubId: NavigationHubId; source: string; confidence: number }>,
    context: EnhancedNavigationContext
  ): void {
    for (const prediction of predictions) {
      if (prediction.confidence < this.confidenceThreshold) continue;

      const hub = navigationHubRegistry.getHub(prediction.hubId);
      if (!hub) continue;

      // Create main hub preload task
      const mainTask: PreloadTask = {
        id: `hub-${prediction.hubId}-${Date.now()}`,
        hubId: prediction.hubId,
        path: hub.path,
        priority: this.calculatePriority(prediction.confidence),
        confidence: prediction.confidence,
        estimatedSize: this.estimateResourceSize(hub.path),
        startTime: Date.now(),
        status: 'pending',
        type: 'route',
      };

      this.preloadQueue.push(mainTask);

      // Create sub-navigation preload tasks
      const subNavItems = navigationHubRegistry.getRelevantSubNavigation(prediction.hubId);
      for (const subItem of subNavItems.slice(0, 2)) { // Limit to top 2 sub-items
        const subTask: PreloadTask = {
          id: `sub-${prediction.hubId}-${subItem.id}-${Date.now()}`,
          hubId: prediction.hubId,
          path: subItem.path,
          priority: 'low',
          confidence: prediction.confidence * 0.7,
          estimatedSize: this.estimateResourceSize(subItem.path),
          startTime: Date.now(),
          status: 'pending',
          type: 'route',
        };

        this.preloadQueue.push(subTask);
      }
    }

    // Sort queue by priority and confidence
    this.preloadQueue.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = priorityWeight[a.priority] + a.confidence;
      const scoreB = priorityWeight[b.priority] + b.confidence;
      return scoreB - scoreA;
    });
  }

  /**
   * Execute preload queue with concurrency control
   */
  private executePreloadQueue(): void {
    const activeCount = this.activePreloads.size;
    const availableSlots = this.maxConcurrentPreloads - activeCount;

    if (availableSlots <= 0) return;

    const tasksToExecute = this.preloadQueue
      .filter(task => task.status === 'pending')
      .slice(0, availableSlots);

    for (const task of tasksToExecute) {
      this.executePreloadTask(task);
    }
  }

  /**
   * Execute a single preload task
   */
  private async executePreloadTask(task: PreloadTask): Promise<void> {
    const abortController = new AbortController();
    this.activePreloads.set(task.id, abortController);

    task.status = 'loading';

    try {
      // Set timeout for preload
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, this.preloadTimeout);

      let preloadPromise: Promise<any>;

      switch (task.type) {
        case 'route':
          preloadPromise = this.preloadRoute(task.path, abortController.signal);
          break;
        case 'component':
          preloadPromise = this.preloadComponent(task.path, abortController.signal);
          break;
        case 'data':
          preloadPromise = this.preloadData(task.path, abortController.signal);
          break;
        case 'image':
          preloadPromise = this.preloadImage(task.path, abortController.signal);
          break;
        default:
          throw new Error(`Unknown preload type: ${task.type}`);
      }

      const result = await preloadPromise;

      clearTimeout(timeoutId);

      // Cache the result
      this.cacheResource(task.path, result);

      task.status = 'completed';
      this.metrics.successfulPredictions++;

      console.log(`✅ Preloaded: ${task.path} (confidence: ${Math.round(task.confidence * 100)}%)`);

    } catch (error) {
      task.status = 'failed';
      console.warn(`❌ Failed to preload: ${task.path}`, error);
    } finally {
      this.activePreloads.delete(task.id);
      this.metrics.totalPredictions++;
      this.updateMetrics();

      // Continue with next tasks in queue
      setTimeout(() => this.executePreloadQueue(), 100);
    }
  }

  /**
   * Preload a route/page
   */
  private async preloadRoute(path: string, signal: AbortSignal): Promise<any> {
    // For React Router, we can preload the route component
    // This is a placeholder - in real implementation, this would use
    // your specific router's preloading mechanism

    try {
      // Simulate route preloading by prefetching the component
      const response = await fetch(`${path}?preload=true`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      // For client-side routes, just resolve with path
      return { path, preloaded: true };
    }
  }

  /**
   * Preload a component
   */
  private async preloadComponent(componentPath: string, signal: AbortSignal): Promise<any> {
    // This would use dynamic imports to preload React components
    // Example: const component = await import(componentPath);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ componentPath, preloaded: true }), 100);
    });
  }

  /**
   * Preload data
   */
  private async preloadData(dataPath: string, signal: AbortSignal): Promise<any> {
    const response = await fetch(dataPath, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }

  /**
   * Preload an image
   */
  private async preloadImage(imagePath: string, signal: AbortSignal): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const cleanup = () => {
        signal.removeEventListener('abort', onAbort);
      };

      const onAbort = () => {
        cleanup();
        reject(new Error('Aborted'));
      };

      signal.addEventListener('abort', onAbort);

      img.onload = () => {
        cleanup();
        resolve(img);
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image'));
      };

      img.src = imagePath;
    });
  }

  /**
   * Cache a preloaded resource
   */
  private cacheResource(path: string, data: any): void {
    const now = Date.now();

    this.preloadCache[path] = {
      data,
      timestamp: now,
      hits: 0,
      lastAccess: now,
    };

    // Check cache size and cleanup if needed
    this.enforceeCacheSize();
  }

  /**
   * Get cached resource
   */
  public getCachedResource(path: string): any {
    const cached = this.preloadCache[path];
    if (!cached) return null;

    // Update access statistics
    cached.hits++;
    cached.lastAccess = Date.now();
    this.metrics.cacheHitRate = this.calculateCacheHitRate();

    return cached.data;
  }

  /**
   * Check if a resource is preloaded
   */
  public isPreloaded(path: string): boolean {
    return !!this.preloadCache[path];
  }

  /**
   * Calculate resource size estimation
   */
  private estimateResourceSize(path: string): number {
    // Estimate based on path type
    if (path.includes('/images/')) return 50000; // 50KB for images
    if (path.includes('/api/')) return 5000; // 5KB for API data
    return 20000; // 20KB for components/pages
  }

  /**
   * Calculate priority based on confidence
   */
  private calculatePriority(confidence: number): 'low' | 'medium' | 'high' {
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [path, entry] of Object.entries(this.preloadCache)) {
      if (now - entry.lastAccess > maxAge) {
        delete this.preloadCache[path];
      }
    }
  }

  /**
   * Enforce cache size limits
   */
  private enforceeCacheSize(): void {
    const cacheEntries = Object.entries(this.preloadCache);

    if (cacheEntries.length === 0) return;

    // Sort by access patterns (LRU)
    cacheEntries.sort((a, b) => {
      const scoreA = a[1].hits * 0.3 + (Date.now() - a[1].lastAccess) * -0.7;
      const scoreB = b[1].hits * 0.3 + (Date.now() - b[1].lastAccess) * -0.7;
      return scoreB - scoreA;
    });

    // Remove least valuable entries if over limit
    const maxEntries = 100;
    if (cacheEntries.length > maxEntries) {
      const toRemove = cacheEntries.slice(maxEntries);
      for (const [path] of toRemove) {
        delete this.preloadCache[path];
      }
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const entries = Object.values(this.preloadCache);
    if (entries.length === 0) return 0;

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = entries.length;

    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  /**
   * Setup network monitoring for adaptive preloading
   */
  private setupNetworkMonitoring(): void {
    // Adjust preload behavior based on connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updatePreloadStrategy = () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.maxConcurrentPreloads = 1;
          this.confidenceThreshold = 0.9;
        } else if (connection.effectiveType === '3g') {
          this.maxConcurrentPreloads = 2;
          this.confidenceThreshold = 0.8;
        } else {
          this.maxConcurrentPreloads = 3;
          this.confidenceThreshold = 0.6;
        }
      };

      connection.addEventListener('change', updatePreloadStrategy);
      updatePreloadStrategy();
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.accuracy = this.metrics.totalPredictions > 0
      ? this.metrics.successfulPredictions / this.metrics.totalPredictions
      : 0;

    this.saveMetrics();
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      localStorage.setItem('predictive-navigation-metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save predictive navigation metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('predictive-navigation-metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load predictive navigation metrics:', error);
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PredictionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current preload queue status
   */
  public getQueueStatus(): {
    pending: number;
    loading: number;
    completed: number;
    failed: number;
  } {
    const status = { pending: 0, loading: 0, completed: 0, failed: 0 };

    for (const task of this.preloadQueue) {
      status[task.status]++;
    }

    return status;
  }

  /**
   * Clear preload cache
   */
  public clearCache(): void {
    this.preloadCache = {};
  }

  /**
   * Cancel all active preloads
   */
  public cancelAllPreloads(): void {
    for (const [id, controller] of this.activePreloads) {
      controller.abort();
    }
    this.activePreloads.clear();

    // Reset queue
    this.preloadQueue = this.preloadQueue.filter(task =>
      task.status === 'completed' || task.status === 'failed'
    );
  }
}

// Export singleton instance
export const predictiveNavigationService = new PredictiveNavigationService();
export type { PreloadTask, PredictionMetrics };