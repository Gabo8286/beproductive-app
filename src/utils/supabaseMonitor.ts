// Supabase performance monitoring utility
import { performanceMonitor } from '@/utils/performanceMonitor';

interface SupabaseCall {
  operation: string;
  table: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  rowCount?: number;
}

class SupabaseMonitor {
  private calls: SupabaseCall[] = [];
  private static instance: SupabaseMonitor;

  static getInstance(): SupabaseMonitor {
    if (!SupabaseMonitor.instance) {
      SupabaseMonitor.instance = new SupabaseMonitor();
    }
    return SupabaseMonitor.instance;
  }

  startCall(operation: string, table: string): string {
    const callId = `${operation}-${table}-${Date.now()}`;
    const startTime = performance.now();

    this.calls.push({
      operation,
      table,
      startTime,
      success: false
    });

    performanceMonitor.startMeasure(`supabase-${callId}`, { operation, table });

    console.log(`🔗 Supabase: Starting ${operation} on ${table}`);
    return callId;
  }

  endCall(callId: string, success: boolean, rowCount?: number, errorMessage?: string): void {
    const callIndex = this.calls.findIndex(call =>
      `${call.operation}-${call.table}-${Math.floor(call.startTime)}` === callId.replace(/\d+$/, Math.floor(call.startTime).toString())
    );

    if (callIndex === -1) {
      console.warn(`Supabase Monitor: Call ${callId} not found`);
      return;
    }

    const call = this.calls[callIndex];
    const endTime = performance.now();
    const duration = endTime - call.startTime;

    this.calls[callIndex] = {
      ...call,
      endTime,
      duration,
      success,
      rowCount,
      errorMessage
    };

    performanceMonitor.endMeasure(`supabase-${callId}`);

    const emoji = success ? '✅' : '❌';
    const durationFormatted = duration.toFixed(2);
    const rowInfo = rowCount !== undefined ? ` (${rowCount} rows)` : '';

    console.log(`${emoji} Supabase: ${call.operation} on ${call.table} completed in ${durationFormatted}ms${rowInfo}`);

    if (!success && errorMessage) {
      console.error(`Supabase Error: ${errorMessage}`);
    }
  }

  getAllCalls(): SupabaseCall[] {
    return [...this.calls];
  }

  getCallsByTable(table: string): SupabaseCall[] {
    return this.calls.filter(call => call.table === table);
  }

  getSlowCalls(threshold: number = 1000): SupabaseCall[] {
    return this.calls.filter(call => call.duration && call.duration > threshold);
  }

  getFailedCalls(): SupabaseCall[] {
    return this.calls.filter(call => !call.success);
  }

  getTotalCallTime(): number {
    return this.calls.reduce((total, call) => total + (call.duration || 0), 0);
  }

  clear(): void {
    this.calls = [];
    console.log('🗑️ Supabase Monitor: Cleared all calls');
  }

  logSummary(): void {
    const completedCalls = this.calls.filter(call => call.duration !== undefined);

    if (completedCalls.length === 0) {
      console.log('🔗 Supabase Summary: No completed calls');
      return;
    }

    console.group('📊 Supabase Performance Summary');

    // Group by table
    const byTable = completedCalls.reduce((acc, call) => {
      if (!acc[call.table]) {
        acc[call.table] = [];
      }
      acc[call.table].push(call);
      return acc;
    }, {} as Record<string, SupabaseCall[]>);

    Object.entries(byTable).forEach(([table, calls]) => {
      const totalTime = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
      const avgTime = totalTime / calls.length;
      const successCount = calls.filter(call => call.success).length;

      console.log(`📋 ${table}:`);
      console.log(`   ${calls.length} calls, ${successCount} successful`);
      console.log(`   Total: ${totalTime.toFixed(2)}ms, Avg: ${avgTime.toFixed(2)}ms`);

      calls.forEach(call => {
        const emoji = call.success ? '✅' : '❌';
        const duration = call.duration?.toFixed(2) || 'unknown';
        console.log(`   ${emoji} ${call.operation}: ${duration}ms`);
      });
    });

    const totalTime = this.getTotalCallTime();
    const slowCalls = this.getSlowCalls();
    const failedCalls = this.getFailedCalls();

    console.log(`📈 Total Supabase time: ${totalTime.toFixed(2)}ms`);

    if (slowCalls.length > 0) {
      console.log(`🐌 ${slowCalls.length} slow calls (>1000ms)`);
    }

    if (failedCalls.length > 0) {
      console.log(`❌ ${failedCalls.length} failed calls`);
    }

    console.groupEnd();
  }

  // Helper to wrap Supabase queries with monitoring
  wrapQuery<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const callId = this.startCall(operation, table);

    return queryFn()
      .then((result: any) => {
        // Try to extract row count from Supabase response
        let rowCount: number | undefined;
        if (Array.isArray(result?.data)) {
          rowCount = result.data.length;
        } else if (result?.data) {
          rowCount = 1;
        }

        this.endCall(callId, true, rowCount);
        return result;
      })
      .catch((error: any) => {
        this.endCall(callId, false, undefined, error.message);
        throw error;
      });
  }
}

// Export singleton instance
export const supabaseMonitor = SupabaseMonitor.getInstance();

// Utility function to monitor Luna-specific queries
export function monitorLunaQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const enhancedOperation = `luna-${operation}`;
  return supabaseMonitor.wrapQuery(enhancedOperation, table, queryFn);
}

// Hook to easily monitor component queries
export function useSupabaseMonitoring(componentName: string) {
  return {
    wrapQuery: <T>(operation: string, table: string, queryFn: () => Promise<T>) => {
      const enhancedOperation = `${componentName}-${operation}`;
      return supabaseMonitor.wrapQuery(enhancedOperation, table, queryFn);
    },
    logSummary: () => supabaseMonitor.logSummary(),
    clear: () => supabaseMonitor.clear()
  };
}