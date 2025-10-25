import { IntentRecognitionEngine } from '@/services/intentRecognition';
import { basicIntentTests, typoTests, slangTests } from '@/tests/data/intentTestDatasets';

/**
 * Quick intent recognition accuracy test
 * Tests the current system performance and identifies issues
 */

async function runAccuracyTest() {
  console.log('🚀 Testing Intent Recognition Accuracy...\n');

  const engine = new IntentRecognitionEngine();
  let totalTests = 0;
  let passedTests = 0;
  const results: any[] = [];

  // Mock context for testing (matching AppContext interface)
  const mockContext = {
    currentRoute: '/dashboard',
    currentModule: 'dashboard',
    userState: {
      tasks: [],
      goals: [],
      habits: [],
      projects: [],
      recentActivity: []
    },
    timeContext: {
      timeOfDay: 'afternoon' as const,
      dayOfWeek: 'Tuesday',
      currentDate: new Date()
    },
    userPreferences: {
      language: 'en',
      timezone: 'UTC',
      workingHours: { start: '09:00', end: '17:00' },
      communicationStyle: 'conversational' as const
    },
    sessionContext: {
      recentIntents: [],
      conversationHistory: [],
      currentFocus: undefined
    }
  };

  // Test basic cases
  console.log('📋 Testing Basic Cases...');
  for (const testCase of basicIntentTests.slice(0, 10)) {
    totalTests++;
    try {
      const result = await engine.recognizeIntent(testCase.input, mockContext);
      const passed = result.intent === testCase.expectedIntent;

      if (passed) {
        passedTests++;
        console.log(`✅ "${testCase.input}" → ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      } else {
        console.log(`❌ "${testCase.input}" → Expected: ${testCase.expectedIntent}, Got: ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      }

      results.push({
        input: testCase.input,
        expected: testCase.expectedIntent,
        actual: result.intent,
        confidence: result.confidence,
        passed
      });
    } catch (error) {
      console.log(`💥 Error testing "${testCase.input}": ${error}`);
    }
  }

  // Test typo tolerance
  console.log('\n🔤 Testing Typo Tolerance...');
  for (const testCase of typoTests.slice(0, 5)) {
    totalTests++;
    try {
      const result = await engine.recognizeIntent(testCase.input, mockContext);
      const passed = result.intent === testCase.expectedIntent;

      if (passed) {
        passedTests++;
        console.log(`✅ "${testCase.input}" → ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      } else {
        console.log(`❌ "${testCase.input}" → Expected: ${testCase.expectedIntent}, Got: ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      }
    } catch (error) {
      console.log(`💥 Error testing "${testCase.input}": ${error}`);
    }
  }

  // Test slang tolerance
  console.log('\n🗣️ Testing Slang/Informal Language...');
  for (const testCase of slangTests.slice(0, 5)) {
    totalTests++;
    try {
      const result = await engine.recognizeIntent(testCase.input, mockContext);
      const passed = result.intent === testCase.expectedIntent;

      if (passed) {
        passedTests++;
        console.log(`✅ "${testCase.input}" → ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      } else {
        console.log(`❌ "${testCase.input}" → Expected: ${testCase.expectedIntent}, Got: ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
      }
    } catch (error) {
      console.log(`💥 Error testing "${testCase.input}": ${error}`);
    }
  }

  // Summary
  const accuracy = (passedTests / totalTests) * 100;
  console.log('\n' + '='.repeat(50));
  console.log('📊 ACCURACY REPORT');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}%`);

  if (accuracy >= 80) {
    console.log('🎉 Excellent performance!');
  } else if (accuracy >= 70) {
    console.log('✅ Good performance');
  } else if (accuracy >= 60) {
    console.log('⚠️ Needs improvement');
  } else {
    console.log('❌ Poor performance - requires attention');
  }

  // Identify common failures
  const failures = results.filter(r => !r.passed);
  if (failures.length > 0) {
    console.log('\n🔍 Common Failure Patterns:');
    const failurePatterns = new Map();

    failures.forEach(failure => {
      const pattern = `${failure.expected} → ${failure.actual}`;
      if (!failurePatterns.has(pattern)) {
        failurePatterns.set(pattern, []);
      }
      failurePatterns.get(pattern).push(failure.input);
    });

    failurePatterns.forEach((examples, pattern) => {
      console.log(`   ${pattern} (${examples.length} cases)`);
      examples.slice(0, 2).forEach(example => {
        console.log(`     - "${example}"`);
      });
    });
  }

  return { accuracy, totalTests, passedTests, results };
}

// Run the test directly
runAccuracyTest().catch(console.error);

export { runAccuracyTest };