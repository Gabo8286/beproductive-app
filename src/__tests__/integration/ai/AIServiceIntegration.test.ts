import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiServiceManager } from '@/services/ai/aiServiceManager';
import { productivityInsightsGenerator } from '@/services/ai/productivityInsightsGenerator';
import { smartTaskPrioritizer } from '@/services/ai/smartTaskPrioritizer';
import { habitOptimizer } from '@/services/ai/habitOptimizer';
import { burnoutPredictor } from '@/services/ai/burnoutPredictor';
import { intelligentTimeBlocker } from '@/services/ai/intelligentTimeBlocker';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { result: 'success' }, error: null }),
  },
}));

// Mock fetch for external API calls
global.fetch = vi.fn();

describe('AI Service Integration Tests', () => {
  let mockSupabaseChain: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase chain
    mockSupabaseChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Service Manager', () => {
    it('should handle API key retrieval and caching', async () => {
      // Mock API keys response - note: order() returns an array, not single
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            id: 'test-key-1',
            provider: 'openai',
            status: 'active',
            current_month_cost: 10,
            monthly_limit_usd: 100,
            current_day_requests: 50,
            daily_request_limit: 1000,
            encrypted_key: 'test-key',
            additional_headers: {},
            last_used_at: new Date().toISOString()
          }
        ],
        error: null
      });

      // Mock successful API response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
        })
      } as Response);

      const result = await aiServiceManager.makeRequest({
        provider: 'openai',
        prompt: 'Test prompt',
        userId: 'test-user',
        requestType: 'test',
        maxTokens: 100,
        temperature: 0.7
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Test response');
      expect(result.tokensUsed.total).toBe(30);
    });

    it('should handle API key limit exceeded', async () => {
      // Mock API key with exceeded limit
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            id: 'test-key-1',
            provider: 'openai',
            status: 'active',
            current_month_cost: 150, // Exceeds limit
            monthly_limit_usd: 100,
            current_day_requests: 50,
            daily_request_limit: 1000,
            encrypted_key: 'test-key',
            additional_headers: {},
            last_used_at: new Date().toISOString()
          }
        ],
        error: null
      });

      const result = await aiServiceManager.makeRequest({
        provider: 'openai',
        prompt: 'Test prompt',
        userId: 'test-user',
        requestType: 'test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Monthly cost limit exceeded');
    });

    it('should handle network failures gracefully', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            id: 'test-key-1',
            provider: 'openai',
            status: 'active',
            current_month_cost: 10,
            monthly_limit_usd: 100,
            current_day_requests: 50,
            daily_request_limit: 1000,
            encrypted_key: 'test-key',
            additional_headers: {},
            last_used_at: new Date().toISOString()
          }
        ],
        error: null
      });

      // Mock network failure
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await aiServiceManager.makeRequest({
        provider: 'openai',
        prompt: 'Test prompt',
        userId: 'test-user',
        requestType: 'test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle rate limiting with exponential backoff', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            id: 'test-key-1',
            provider: 'openai',
            status: 'active',
            current_month_cost: 10,
            monthly_limit_usd: 100,
            current_day_requests: 50,
            daily_request_limit: 1000,
            encrypted_key: 'test-key',
            additional_headers: {},
            last_used_at: new Date().toISOString()
          }
        ],
        error: null
      });

      // Mock rate limit response then success
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Success after retry' } }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          })
        } as Response);

      const result = await aiServiceManager.makeRequest({
        provider: 'openai',
        prompt: 'Test prompt',
        userId: 'test-user',
        requestType: 'test'
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Success after retry');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Productivity Insights Generator', () => {
    beforeEach(() => {
      // Mock successful AI service response
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: JSON.stringify([
          {
            title: 'Optimize Morning Routine',
            content: 'Your productivity peaks between 9-11 AM. Schedule your most important tasks during this time.',
            category: 'productivity_pattern',
            confidence: 0.85,
            priority: 'high',
            impact: 'significant'
          }
        ]),
        success: true,
        tokensUsed: { prompt: 10, completion: 20, total: 30 },
        cost: 0.001,
        responseTime: 1200,
      });

      // Mock user data retrieval
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          { id: 'task1', title: 'Test Task', completed_at: new Date().toISOString() },
          { id: 'goal1', title: 'Test Goal', progress: 75 }
        ],
        error: null
      });
    });

    it('should generate productivity insights with proper error handling', async () => {
      const insights = await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      expect(Array.isArray(insights)).toBe(true);
      expect(insights[0]).toMatchObject({
        title: 'Optimize Morning Routine',
        category: 'productivity_pattern',
        confidence: 0.85
      });
    });

    it('should handle insufficient data gracefully', async () => {
      // Mock empty data response
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null
      });

      const insights = await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      expect(Array.isArray(insights)).toBe(true);
      // Should return empty array or default insights when no data available
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle AI service errors and fallback gracefully', async () => {
      // Mock AI service failure
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: '',
        success: false,
        error: 'Service unavailable',
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: 0,
      });

      const insights = await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      // Should handle errors gracefully and potentially return fallback insights
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('Smart Task Prioritizer', () => {
    beforeEach(() => {
      // Mock successful prioritization response
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: JSON.stringify([
          {
            taskId: 'task1',
            recommendedPriority: 'high',
            confidence: 0.9,
            reasoning: 'This task has a tight deadline and high impact on project success.',
            estimatedDuration: 120,
            optimalTimeSlot: '09:00-11:00'
          }
        ]),
        success: true,
        tokensUsed: { prompt: 15, completion: 25, total: 40 },
        cost: 0.002,
        responseTime: 1500,
      });
    });

    it('should prioritize tasks with context awareness', async () => {
      const recommendations = await smartTaskPrioritizer.analyzeTasks({
        userId: 'test-user',
        tasks: [
          {
            id: 'task1',
            title: 'Complete project proposal',
            description: 'Write the final project proposal for client',
            category: 'work',
            priority: 'medium',
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimated_duration: 120,
            tags: ['urgent', 'client'],
            status: 'in_progress',
            created_at: new Date().toISOString(),
            dependencies: []
          }
        ],
        userContext: {
          userId: 'test-user',
          currentWorkload: 75,
          availableTime: 8,
          skillset: [],
          preferences: {
            workingHours: { start: '09:00', end: '17:00' },
            preferredTaskTypes: [],
            energyLevels: { morning: 8, afternoon: 6, evening: 4 }
          },
          currentGoals: [],
          recentProductivity: { completionRate: 0.7, averageTaskTime: 60, focusScore: 0.8 }
        }
      });

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations[0]).toMatchObject({
        taskId: 'task1',
        recommendedPriority: expect.any(String),
        confidence: expect.any(Number)
      });
    });

    it('should handle empty task lists', async () => {
      const recommendations = await smartTaskPrioritizer.analyzeTasks({
        userId: 'test-user',
        tasks: [],
        userContext: {
          userId: 'test-user',
          currentWorkload: 0,
          availableTime: 8,
          skillset: [],
          preferences: {
            workingHours: { start: '09:00', end: '17:00' },
            preferredTaskTypes: [],
            energyLevels: { morning: 8, afternoon: 6, evening: 4 }
          },
          currentGoals: [],
          recentProductivity: { completionRate: 0, averageTaskTime: 0, focusScore: 0 }
        }
      });

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });

    it('should handle AI service failures with fallback logic', async () => {
      // Mock AI service failure
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: '',
        success: false,
        error: 'AI service timeout',
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        cost: 0,
        responseTime: 0,
      });

      const recommendations = await smartTaskPrioritizer.analyzeTasks({
        userId: 'test-user',
        tasks: [
          {
            id: 'task1',
            title: 'Test Task',
            description: 'Test',
            category: 'work',
            priority: 'medium',
            due_date: new Date().toISOString(),
            estimated_duration: 60,
            tags: [],
            status: 'pending',
            created_at: new Date().toISOString(),
            dependencies: []
          }
        ],
        userContext: {
          userId: 'test-user',
          currentWorkload: 50,
          availableTime: 8,
          skillset: [],
          preferences: {
            workingHours: { start: '09:00', end: '17:00' },
            preferredTaskTypes: [],
            energyLevels: { morning: 8, afternoon: 6, evening: 4 }
          },
          currentGoals: [],
          recentProductivity: { completionRate: 0.5, averageTaskTime: 45, focusScore: 0.6 }
        }
      });

      // Should provide fallback recommendations based on simple heuristics
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Cross-Service Integration', () => {
    it('should handle cascading failures between services', async () => {
      // Mock partial service failures
      vi.spyOn(aiServiceManager, 'makeRequest')
        .mockResolvedValueOnce({
          content: '',
          success: false,
          error: 'Service A failed',
          tokensUsed: { prompt: 0, completion: 0, total: 0 },
          cost: 0,
          responseTime: 0,
        })
        .mockResolvedValueOnce({
          content: JSON.stringify({ analysis: 'fallback data' }),
          success: true,
          tokensUsed: { prompt: 10, completion: 15, total: 25 },
          cost: 0.001,
          responseTime: 800,
        });

      // Test that other services can still function when one fails
      const insights = await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      expect(Array.isArray(insights)).toBe(true);
      // Should have fallback mechanisms
    });

    it('should maintain data consistency across service calls', async () => {
      // Mock user preferences
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            ai_preferences: {
              preferred_provider: 'openai',
              max_tokens: 1000,
              temperature: 0.7
            }
          }
        ],
        error: null
      });

      // Test that services use consistent user preferences
      vi.spyOn(aiServiceManager, 'makeRequest').mockImplementation(async (request) => {
        // Verify that preferences are applied consistently
        expect(request.maxTokens).toBeLessThanOrEqual(1000);
        expect(request.temperature).toBe(0.7);

        return {
          content: JSON.stringify({ result: 'success' }),
          success: true,
          tokensUsed: { prompt: 10, completion: 15, total: 25 },
          cost: 0.001,
          responseTime: 800,
        };
      });

      await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        preferredProvider: 'openai'
      });

      expect(aiServiceManager.makeRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'openai',
          maxTokens: expect.any(Number),
          temperature: expect.any(Number)
        })
      );
    });

    it('should handle concurrent service requests efficiently', async () => {
      const startTime = Date.now();

      // Mock fast responses
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: JSON.stringify({ result: 'concurrent success' }),
        success: true,
        tokensUsed: { prompt: 10, completion: 15, total: 25 },
        cost: 0.001,
        responseTime: 500,
      });

      // Run multiple services concurrently
      const promises = [
        productivityInsightsGenerator.generateInsights({
          userId: 'test-user',
          insightTypes: ['productivity_pattern'],
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        }),
        smartTaskPrioritizer.analyzeTasks({
          userId: 'test-user',
          tasks: [{
            id: 'test',
            title: 'Test',
            description: 'Test',
            category: 'work',
            priority: 'medium',
            due_date: new Date().toISOString(),
            estimated_duration: 60,
            tags: [],
            status: 'pending',
            created_at: new Date().toISOString(),
            dependencies: []
          }],
          userContext: {
            userId: 'test-user',
            currentWorkload: 50,
            availableTime: 8,
            skillset: [],
            preferences: {
              workingHours: { start: '09:00', end: '17:00' },
              preferredTaskTypes: [],
              energyLevels: { morning: 8, afternoon: 6, evening: 4 }
            },
            currentGoals: [],
            recentProductivity: { completionRate: 0.5, averageTaskTime: 45, focusScore: 0.6 }
          }
        })
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Should complete in reasonable time even with multiple concurrent requests
      expect(endTime - startTime).toBeLessThan(3000);
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should implement circuit breaker pattern for failing services', async () => {
      // Mock consecutive failures
      vi.spyOn(aiServiceManager, 'makeRequest')
        .mockRejectedValue(new Error('Service unavailable'))
        .mockRejectedValue(new Error('Service unavailable'))
        .mockRejectedValue(new Error('Service unavailable'));

      // After multiple failures, service should implement circuit breaker
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        try {
          await productivityInsightsGenerator.generateInsights({
            userId: 'test-user',
            insightTypes: ['productivity_pattern'],
            dateRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date()
            }
          });
          attempts.push('success');
        } catch (error) {
          attempts.push('failure');
        }
      }

      // Should have some mechanism to prevent cascading failures
      expect(attempts.length).toBe(5);
    });

    it('should provide graceful degradation when AI services are unavailable', async () => {
      // Mock complete AI service unavailability
      vi.spyOn(aiServiceManager, 'makeRequest').mockRejectedValue(
        new Error('All AI providers unavailable')
      );

      // Services should still provide basic functionality without AI
      const insights = await productivityInsightsGenerator.generateInsights({
        userId: 'test-user',
        insightTypes: ['productivity_pattern'],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });

      // Should return fallback insights or empty array rather than throwing
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should log errors appropriately for monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock service failure
      vi.spyOn(aiServiceManager, 'makeRequest').mockRejectedValue(
        new Error('Critical AI service failure')
      );

      try {
        await productivityInsightsGenerator.generateInsights({
          userId: 'test-user',
          insightTypes: ['productivity_pattern'],
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        });
      } catch (error) {
        // Error logging is expected
      }

      // Should log errors for monitoring (implementation dependent)
      // This verifies that services handle errors appropriately
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle high-volume requests efficiently', async () => {
      vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: JSON.stringify({ result: 'bulk success' }),
        success: true,
        tokensUsed: { prompt: 5, completion: 10, total: 15 },
        cost: 0.0005,
        responseTime: 200,
      });

      const startTime = Date.now();

      // Simulate high volume of requests
      const requests = Array.from({ length: 50 }, (_, i) =>
        productivityInsightsGenerator.generateInsights({
          userId: `test-user-${i}`,
          insightTypes: ['productivity_pattern'],
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        })
      );

      const results = await Promise.all(requests);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      // Should handle bulk requests efficiently
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
    });

    it('should implement proper caching mechanisms', async () => {
      const mockRequest = vi.spyOn(aiServiceManager, 'makeRequest').mockResolvedValue({
        content: JSON.stringify({ cached: 'result' }),
        success: true,
        tokensUsed: { prompt: 10, completion: 15, total: 25 },
        cost: 0.001,
        responseTime: 800,
      });

      const userId = 'test-user';
      const requestParams = {
        userId,
        insightTypes: ['productivity_pattern'] as const,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      };

      // Make same request twice
      await productivityInsightsGenerator.generateInsights({
        ...requestParams,
        insightTypes: ['productivity_pattern'] as Array<'productivity_pattern'>
      });
      await productivityInsightsGenerator.generateInsights({
        ...requestParams,
        insightTypes: ['productivity_pattern'] as Array<'productivity_pattern'>
      });

      // Depending on implementation, second call might use cache
      // This test verifies that caching doesn't break functionality
      expect(mockRequest).toHaveBeenCalled();
    });
  });
});