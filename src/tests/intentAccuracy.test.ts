import { describe, it, expect, beforeEach } from 'vitest';
import { IntentRecognitionEngine } from '@/services/intentRecognition';
import { IntentAccuracyFramework } from '@/tests/intentAccuracyFramework';
import { basicIntentTests, edgeCaseTests } from '@/tests/data/intentTestDatasets';

describe('Intent Recognition System', () => {
  let engine: IntentRecognitionEngine;
  let framework: IntentAccuracyFramework;

  beforeEach(() => {
    engine = new IntentRecognitionEngine();
    framework = new IntentAccuracyFramework();
  });

  describe('Basic Intent Recognition', () => {
    it('should recognize task creation intent', async () => {
      const result = await engine.recognizeIntent('I need to create a new task');
      expect(result.intent).toBe('task_creation');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should recognize goal setting intent', async () => {
      const result = await engine.recognizeIntent('I want to set a new goal');
      expect(result.intent).toBe('goal_setting');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should recognize note taking intent', async () => {
      const result = await engine.recognizeIntent('I need to write a quick note');
      expect(result.intent).toBe('note_taking');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should recognize schedule management intent', async () => {
      const result = await engine.recognizeIntent('Schedule a meeting for tomorrow');
      expect(result.intent).toBe('schedule_management');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should recognize analytics request intent', async () => {
      const result = await engine.recognizeIntent('Show me my productivity trends');
      expect(result.intent).toBe('analytics_request');
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      const result = await engine.recognizeIntent('');
      expect(result.intent).toBe('general_assistance');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle single word input', async () => {
      const result = await engine.recognizeIntent('task');
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const result = await engine.recognizeIntent('!!!???');
      expect(result.intent).toBe('general_assistance');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Accuracy Framework', () => {
    it('should run basic test cases successfully', async () => {
      const testCases = basicIntentTests.slice(0, 5); // Test first 5 cases
      const results = await framework.runTests(testCases);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.actualIntent)).toBe(true);
      expect(results.every(r => r.actualConfidence >= 0)).toBe(true);
      expect(results.every(r => r.executionTime > 0)).toBe(true);
    });

    it('should generate comprehensive test suite results', async () => {
      const testCases = basicIntentTests.slice(0, 3);
      const results = await framework.runTests(testCases);
      const suiteResults = framework['analyzeResults'](results);

      expect(suiteResults.totalTests).toBe(3);
      expect(suiteResults.accuracy).toBeGreaterThanOrEqual(0);
      expect(suiteResults.accuracy).toBeLessThanOrEqual(1);
      expect(suiteResults.categoryBreakdown).toBeDefined();
      expect(suiteResults.intentBreakdown).toBeDefined();
    });

    it('should handle test execution errors gracefully', async () => {
      const testCase = {
        input: "test input",
        expectedIntent: "task_creation" as const,
        description: "Test case",
        category: "basic" as const
      };

      const result = await framework.runSingleTest(testCase);
      expect(result.testCase).toBe(testCase);
      expect(result.actualIntent).toBeDefined();
      expect(result.passed).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should measure execution time', async () => {
      const start = performance.now();
      await engine.recognizeIntent('Create a new task');
      const end = performance.now();

      expect(end - start).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(1000); // Should be fast
    });

    it('should handle multiple rapid requests', async () => {
      const inputs = [
        'Create a task',
        'Set a goal',
        'Write a note',
        'Schedule meeting',
        'Show analytics'
      ];

      const promises = inputs.map(input => engine.recognizeIntent(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.every(r => r.intent)).toBe(true);
      expect(results.every(r => r.confidence >= 0)).toBe(true);
    });
  });

  describe('Intent Accuracy Benchmarks', () => {
    it('should achieve minimum accuracy on basic tests', async () => {
      const basicTests = basicIntentTests.slice(0, 10);
      const results = await framework.runTests(basicTests);
      const suiteResults = framework['analyzeResults'](results);

      // Should achieve at least 70% accuracy on basic tests
      expect(suiteResults.accuracy).toBeGreaterThanOrEqual(0.7);
    });

    it('should show reasonable confidence levels', async () => {
      const testCases = basicIntentTests.slice(0, 5);
      const results = await framework.runTests(testCases);

      // Most basic cases should have decent confidence
      const highConfidenceResults = results.filter(r => r.actualConfidence >= 0.6);
      expect(highConfidenceResults.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Multilingual Support', () => {
    it('should handle non-English inputs', async () => {
      const spanishInput = 'crear una nueva tarea';
      const result = await engine.recognizeIntent(spanishInput);

      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle accented characters', async () => {
      const frenchInput = 'créer une nouvelle tâche';
      const result = await engine.recognizeIntent(frenchInput);

      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Typo Tolerance', () => {
    it('should handle common typos', async () => {
      const typoInput = 'creat a new taks';
      const result = await engine.recognizeIntent(typoInput);

      expect(result.intent).toBe('task_creation');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle missing letters', async () => {
      const typoInput = 'crete task';
      const result = await engine.recognizeIntent(typoInput);

      expect(result.intent).toBe('task_creation');
      expect(result.confidence).toBeGreaterThan(0.4);
    });
  });
});