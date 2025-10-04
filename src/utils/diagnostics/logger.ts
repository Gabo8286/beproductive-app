/**
 * Comprehensive diagnostic logging system
 * Helps identify where initialization fails in Safari/Brave
 */

interface DiagnosticStep {
  step: string;
  timestamp: number;
  duration?: number;
  status: "started" | "completed" | "failed";
  error?: string;
  metadata?: Record<string, any>;
}

class DiagnosticLogger {
  private steps: DiagnosticStep[] = [];
  private stepTimers: Map<string, number> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId =
      Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    console.log(`[Diagnostics] Session ${this.sessionId} started`);
  }

  /**
   * Start timing a diagnostic step
   */
  startStep(step: string, metadata?: Record<string, any>): void {
    const timestamp = Date.now();
    this.stepTimers.set(step, timestamp);

    const stepData: DiagnosticStep = {
      step,
      timestamp,
      status: "started",
      metadata,
    };

    this.steps.push(stepData);
    console.log(`[Diagnostics] 🟡 ${step} - Started`, metadata || "");
  }

  /**
   * Complete a diagnostic step successfully
   */
  completeStep(step: string, metadata?: Record<string, any>): void {
    const endTime = Date.now();
    const startTime = this.stepTimers.get(step);
    const duration = startTime ? endTime - startTime : undefined;

    const stepData: DiagnosticStep = {
      step,
      timestamp: endTime,
      duration,
      status: "completed",
      metadata,
    };

    this.steps.push(stepData);
    this.stepTimers.delete(step);

    console.log(
      `[Diagnostics] ✅ ${step} - Completed (${duration}ms)`,
      metadata || "",
    );
  }

  /**
   * Mark a diagnostic step as failed
   */
  failStep(
    step: string,
    error: string | Error,
    metadata?: Record<string, any>,
  ): void {
    const endTime = Date.now();
    const startTime = this.stepTimers.get(step);
    const duration = startTime ? endTime - startTime : undefined;

    const stepData: DiagnosticStep = {
      step,
      timestamp: endTime,
      duration,
      status: "failed",
      error: error instanceof Error ? error.message : error,
      metadata,
    };

    this.steps.push(stepData);
    this.stepTimers.delete(step);

    console.error(
      `[Diagnostics] ❌ ${step} - Failed (${duration}ms):`,
      error,
      metadata || "",
    );
  }

  /**
   * Log a simple event without timing
   */
  logEvent(event: string, data?: any): void {
    console.log(`[Diagnostics] 📝 ${event}`, data || "");

    this.steps.push({
      step: event,
      timestamp: Date.now(),
      status: "completed",
      metadata: data,
    });
  }

  /**
   * Get full diagnostic report
   */
  getReport(): {
    sessionId: string;
    steps: DiagnosticStep[];
    summary: {
      totalSteps: number;
      completedSteps: number;
      failedSteps: number;
      totalDuration: number;
      firstStep: number;
      lastStep: number;
    };
    browserInfo: {
      userAgent: string;
      language: string;
      cookieEnabled: boolean;
      onLine: boolean;
      platform: string;
      url: string;
    };
  } {
    const completedSteps = this.steps.filter(
      (s) => s.status === "completed",
    ).length;
    const failedSteps = this.steps.filter((s) => s.status === "failed").length;
    const firstStep =
      this.steps.length > 0 ? this.steps[0].timestamp : Date.now();
    const lastStep =
      this.steps.length > 0
        ? this.steps[this.steps.length - 1].timestamp
        : Date.now();

    return {
      sessionId: this.sessionId,
      steps: [...this.steps],
      summary: {
        totalSteps: this.steps.length,
        completedSteps,
        failedSteps,
        totalDuration: lastStep - firstStep,
        firstStep,
        lastStep,
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        platform: navigator.platform,
        url: window.location.href,
      },
    };
  }

  /**
   * Print formatted diagnostic report
   */
  printReport(): void {
    const report = this.getReport();

    console.group(`[Diagnostics] Session Report - ${report.sessionId}`);

    // Summary
    console.log("📊 Summary:", {
      totalSteps: report.summary.totalSteps,
      completed: report.summary.completedSteps,
      failed: report.summary.failedSteps,
      totalDuration: `${report.summary.totalDuration}ms`,
    });

    // Browser info
    console.log("🌐 Browser:", report.browserInfo);

    // Step details
    console.log("📋 Steps:");
    report.steps.forEach((step, index) => {
      const icon =
        step.status === "completed"
          ? "✅"
          : step.status === "failed"
            ? "❌"
            : "🟡";
      const duration = step.duration ? ` (${step.duration}ms)` : "";
      console.log(
        `  ${index + 1}. ${icon} ${step.step}${duration}`,
        step.error || step.metadata || "",
      );
    });

    console.groupEnd();
  }

  /**
   * Export report for external analysis
   */
  exportReport(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * Check if any critical steps have failed
   */
  hasCriticalFailures(): boolean {
    const criticalSteps = [
      "Environment Validation",
      "Supabase Client Initialization",
      "Auth Context Initialization",
      "React Render",
    ];

    return this.steps.some(
      (step) => criticalSteps.includes(step.step) && step.status === "failed",
    );
  }
}

// Create singleton instance
export const diagnostics = new DiagnosticLogger();

// Add to window for debugging
if (typeof window !== "undefined") {
  (window as any).__diagnostics = diagnostics;
}

/**
 * Utility functions for common diagnostic patterns
 */
export const diagnostic = {
  /**
   * Wrap an async function with diagnostic timing
   */
  async measure<T>(
    stepName: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>,
  ): Promise<T> {
    diagnostics.startStep(stepName, metadata);
    try {
      const result = await fn();
      diagnostics.completeStep(stepName, { success: true });
      return result;
    } catch (error) {
      diagnostics.failStep(stepName, error as Error, metadata);
      throw error;
    }
  },

  /**
   * Wrap a synchronous function with diagnostic timing
   */
  measureSync<T>(
    stepName: string,
    fn: () => T,
    metadata?: Record<string, any>,
  ): T {
    diagnostics.startStep(stepName, metadata);
    try {
      const result = fn();
      diagnostics.completeStep(stepName, { success: true });
      return result;
    } catch (error) {
      diagnostics.failStep(stepName, error as Error, metadata);
      throw error;
    }
  },

  /**
   * Add checkpoint for debugging flow
   */
  checkpoint(name: string, data?: any): void {
    diagnostics.logEvent(`Checkpoint: ${name}`, data);
  },

  /**
   * Log browser-specific behavior
   */
  logBrowserBehavior(behavior: string, details?: any): void {
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isBrave =
      /Brave/.test(navigator.userAgent) || !!(navigator as any).brave;
    const isChrome =
      /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);

    diagnostics.logEvent(`Browser Behavior: ${behavior}`, {
      isSafari,
      isBrave,
      isChrome,
      details,
      userAgent: navigator.userAgent,
    });
  },
};
