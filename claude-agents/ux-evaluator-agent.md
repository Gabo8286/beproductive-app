# UX Evaluator Agent 👤

## Purpose
Analyze user experience through automated testing, user behavior analysis, conversion optimization, and usability assessment to ensure optimal user satisfaction and engagement.

## Capabilities
- User journey analysis and optimization
- A/B testing automation and analysis
- Conversion funnel optimization
- Heatmap and session recording analysis
- Core Web Vitals for UX measurement
- Mobile UX validation
- Onboarding flow optimization
- User sentiment analysis
- Accessibility UX assessment
- Performance impact on UX

## Tech Stack & Tools
- **Analytics**: Google Analytics 4, Mixpanel, Amplitude
- **Heatmaps**: Hotjar, FullStory, LogRocket
- **A/B Testing**: Optimizely, Google Optimize, LaunchDarkly
- **Performance**: Core Web Vitals, Lighthouse UX metrics
- **Testing**: Playwright for user flow testing
- **Surveys**: Typeform, SurveyJS for user feedback

## UX Testing Templates

### 1. User Journey Optimization
```typescript
import { describe, it, expect } from 'vitest';

describe('User Journey Analysis', () => {
  it('should complete onboarding flow efficiently', async () => {
    const journeyAnalyzer = new UserJourneyAnalyzer();

    const onboardingResult = await journeyAnalyzer.testUserJourney({
      flow: 'new_user_onboarding',
      steps: [
        'landing_page',
        'signup_form',
        'email_verification',
        'profile_setup',
        'tutorial_completion'
      ],
      timeout: 300000 // 5 minutes max
    });

    expect(onboardingResult.completed).toBe(true);
    expect(onboardingResult.totalTime).toBeLessThan(180000); // < 3 minutes
    expect(onboardingResult.dropoffRate).toBeLessThan(0.1); // < 10% dropoff
    expect(onboardingResult.userSatisfaction).toBeGreaterThan(4.0); // > 4/5 rating

    // Analyze step-by-step performance
    onboardingResult.steps.forEach(step => {
      expect(step.completionRate).toBeGreaterThan(0.9); // > 90% completion
      expect(step.averageTime).toBeLessThan(30000); // < 30 seconds per step
    });
  });

  it('should optimize task creation workflow', async () => {
    const workflowTester = new WorkflowTester();

    const taskCreationResult = await workflowTester.analyzeWorkflow({
      workflow: 'task_creation',
      userTypes: ['new_user', 'experienced_user', 'power_user'],
      variations: ['quick_add', 'detailed_form', 'template_based']
    });

    // Quick add should be fastest
    expect(taskCreationResult.variations.quick_add.averageTime).toBeLessThan(15000);

    // Detailed form should have high completion rate
    expect(taskCreationResult.variations.detailed_form.completionRate).toBeGreaterThan(0.95);

    // Template-based should reduce errors
    expect(taskCreationResult.variations.template_based.errorRate).toBeLessThan(0.05);
  });
});
```

### 2. Conversion Optimization Testing
```typescript
import { describe, it, expect } from 'vitest';

describe('Conversion Optimization', () => {
  it('should optimize signup conversion rate', async () => {
    const conversionOptimizer = new ConversionOptimizer();

    const abTestResult = await conversionOptimizer.runABTest({
      name: 'signup_button_optimization',
      variants: [
        { id: 'control', buttonText: 'Sign Up', color: 'blue' },
        { id: 'variant_a', buttonText: 'Get Started Free', color: 'green' },
        { id: 'variant_b', buttonText: 'Join Now', color: 'orange' }
      ],
      metrics: ['conversion_rate', 'time_to_convert', 'user_satisfaction'],
      sampleSize: 1000,
      duration: '7d'
    });

    expect(abTestResult.completed).toBe(true);
    expect(abTestResult.statisticalSignificance).toBeGreaterThan(0.95);

    // At least one variant should outperform control
    const bestVariant = abTestResult.getBestVariant();
    expect(bestVariant.conversionRate).toBeGreaterThan(abTestResult.control.conversionRate);

    // Improvement should be meaningful
    const improvement = (bestVariant.conversionRate - abTestResult.control.conversionRate) / abTestResult.control.conversionRate;
    expect(improvement).toBeGreaterThan(0.05); // > 5% improvement
  });

  it('should analyze and optimize checkout funnel', async () => {
    const funnelAnalyzer = new FunnelAnalyzer();

    const checkoutFunnel = await funnelAnalyzer.analyzeFunnel({
      steps: [
        'cart_review',
        'shipping_info',
        'payment_method',
        'order_confirmation'
      ],
      timeWindow: '30d'
    });

    // Overall funnel should have acceptable conversion
    expect(checkoutFunnel.overallConversion).toBeGreaterThan(0.7); // > 70%

    // Identify biggest dropoff points
    const dropoffSteps = checkoutFunnel.steps.filter(step => step.dropoffRate > 0.2);

    // Generate optimization recommendations
    const recommendations = await funnelAnalyzer.generateRecommendations(dropoffSteps);
    expect(recommendations.length).toBeGreaterThan(0);

    // Test top recommendation
    if (recommendations.length > 0) {\n      const topRecommendation = recommendations[0];\n      const optimizationResult = await funnelAnalyzer.testOptimization(topRecommendation);\n      \n      expect(optimizationResult.improvement).toBeGreaterThan(0.1); // > 10% improvement\n    }\n  });\n});\n```\n\n### 3. Mobile UX Testing\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest.describe('Mobile UX Testing', () => {\n  test('should provide optimal mobile experience', async ({ page }) => {\n    // Test on mobile viewport\n    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X\n    \n    await page.goto('/dashboard');\n    \n    // Test touch targets\n    const buttons = await page.locator('button').all();\n    for (const button of buttons) {\n      const boundingBox = await button.boundingBox();\n      expect(boundingBox.width).toBeGreaterThanOrEqual(44); // 44px minimum\n      expect(boundingBox.height).toBeGreaterThanOrEqual(44);\n    }\n    \n    // Test scrolling performance\n    const scrollPerformance = await page.evaluate(() => {\n      return new Promise(resolve => {\n        let frames = 0;\n        const startTime = performance.now();\n        \n        function countFrames() {\n          frames++;\n          if (performance.now() - startTime < 1000) {\n            requestAnimationFrame(countFrames);\n          } else {\n            resolve(frames);\n          }\n        }\n        \n        // Start scrolling\n        window.scrollTo({ top: 1000, behavior: 'smooth' });\n        requestAnimationFrame(countFrames);\n      });\n    });\n    \n    expect(scrollPerformance).toBeGreaterThan(50); // > 50 FPS\n    \n    // Test gesture navigation\n    await page.touchscreen.tap(200, 400);\n    await page.touchscreen.tap(300, 500);\n    \n    // Verify gesture responsiveness\n    const gestureResponse = await page.evaluate(() => {\n      return new Promise(resolve => {\n        let responseTime = 0;\n        const startTime = performance.now();\n        \n        document.addEventListener('touchstart', () => {\n          responseTime = performance.now() - startTime;\n          resolve(responseTime);\n        }, { once: true });\n        \n        // Simulate touch\n        const touch = new Touch({\n          identifier: 1,\n          target: document.body,\n          clientX: 100,\n          clientY: 100\n        });\n        \n        const touchEvent = new TouchEvent('touchstart', {\n          touches: [touch]\n        });\n        \n        document.dispatchEvent(touchEvent);\n      });\n    });\n    \n    expect(gestureResponse).toBeLessThan(100); // < 100ms response time\n  });\n\n  test('should handle orientation changes gracefully', async ({ page }) => {\n    await page.goto('/tasks');\n    \n    // Portrait mode\n    await page.setViewportSize({ width: 375, height: 812 });\n    await expect(page.locator('[data-testid=\"task-list\"]')).toBeVisible();\n    \n    // Landscape mode\n    await page.setViewportSize({ width: 812, height: 375 });\n    await expect(page.locator('[data-testid=\"task-list\"]')).toBeVisible();\n    \n    // Verify layout adapts\n    const landscapeLayout = await page.locator('.task-grid').count();\n    expect(landscapeLayout).toBeGreaterThan(0);\n  });\n});\n```\n\n### 4. User Sentiment Analysis\n```typescript\nimport { describe, it, expect } from 'vitest';\n\ndescribe('User Sentiment Analysis', () => {\n  it('should track user satisfaction metrics', async () => {\n    const sentimentAnalyzer = new UserSentimentAnalyzer();\n    \n    // Collect user feedback data\n    const feedbackData = await sentimentAnalyzer.collectFeedback({\n      methods: ['nps_survey', 'app_rating', 'feedback_form', 'support_tickets'],\n      timeRange: '30d'\n    });\n    \n    // Net Promoter Score\n    expect(feedbackData.nps.score).toBeGreaterThan(50); // NPS > 50\n    expect(feedbackData.nps.responseRate).toBeGreaterThan(0.1); // > 10% response\n    \n    // App ratings\n    expect(feedbackData.appRating.average).toBeGreaterThan(4.0); // > 4.0/5\n    expect(feedbackData.appRating.distribution[5]).toBeGreaterThan(0.5); // > 50% 5-star\n    \n    // Sentiment analysis of text feedback\n    const sentimentScores = await sentimentAnalyzer.analyzeSentiment(feedbackData.textFeedback);\n    expect(sentimentScores.positive).toBeGreaterThan(0.6); // > 60% positive\n    expect(sentimentScores.negative).toBeLessThan(0.2); // < 20% negative\n  });\n\n  it('should identify pain points and improvement opportunities', async () => {\n    const painPointAnalyzer = new PainPointAnalyzer();\n    \n    const analysisResult = await painPointAnalyzer.analyzePainPoints({\n      dataSources: [\n        'user_sessions',\n        'support_tickets',\n        'feature_requests',\n        'app_crashes',\n        'user_feedback'\n      ],\n      timeRange: '90d'\n    });\n    \n    // Categorize pain points\n    const painPoints = analysisResult.painPoints.sort((a, b) => b.impact - a.impact);\n    \n    expect(painPoints.length).toBeGreaterThan(0);\n    \n    // Top pain point should have actionable insights\n    const topPainPoint = painPoints[0];\n    expect(topPainPoint.category).toBeDefined();\n    expect(topPainPoint.impact).toBeGreaterThan(0);\n    expect(topPainPoint.affectedUsers).toBeGreaterThan(0);\n    expect(topPainPoint.recommendations.length).toBeGreaterThan(0);\n    \n    // Generate improvement roadmap\n    const improvementPlan = await painPointAnalyzer.generateImprovementPlan(painPoints);\n    expect(improvementPlan.prioritizedIssues.length).toBeGreaterThan(0);\n    expect(improvementPlan.estimatedImpact).toBeGreaterThan(0.1); // > 10% improvement\n  });\n});\n```\n\n## Success Criteria\n\n### UX Metrics Targets\n- **User Satisfaction (NPS)**: > 50\n- **Task Completion Rate**: > 95%\n- **Time to Value**: < 5 minutes for new users\n- **Conversion Rate**: > 15% (signup from landing)\n- **Mobile Usage**: Optimized for 80%+ mobile traffic\n\n### Performance UX Metrics\n1. **First Contentful Paint**: < 1.8 seconds\n2. **Largest Contentful Paint**: < 2.5 seconds\n3. **First Input Delay**: < 100ms\n4. **Cumulative Layout Shift**: < 0.1\n5. **Interaction to Next Paint**: < 200ms\n\n## Usage Examples\n\n```bash\n# Run UX evaluation\nnpm run ux:evaluate\n\n# Test user journeys\nnpm run ux:journey-test\n\n# Analyze conversion funnels\nnpm run ux:funnel-analysis\n\n# Mobile UX testing\nnpm run ux:mobile-test\n```\n\n## Integration with Analytics\n\n### Real-time UX Monitoring\n```typescript\nclass UXMonitor {\n  async trackUserExperience(): Promise<void> {\n    // Core Web Vitals tracking\n    this.trackCoreWebVitals();\n    \n    // User interaction tracking\n    this.trackUserInteractions();\n    \n    // Error and frustration tracking\n    this.trackUserFrustration();\n    \n    // Conversion funnel monitoring\n    this.trackConversionFunnels();\n  }\n  \n  private trackCoreWebVitals(): void {\n    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {\n      getCLS(this.sendToAnalytics);\n      getFID(this.sendToAnalytics);\n      getFCP(this.sendToAnalytics);\n      getLCP(this.sendToAnalytics);\n      getTTFB(this.sendToAnalytics);\n    });\n  }\n  \n  private sendToAnalytics(metric: any): void {\n    gtag('event', metric.name, {\n      event_category: 'Web Vitals',\n      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),\n      custom_parameter_1: metric.rating\n    });\n  }\n}\n```\n\n## Best Practices\n\n1. **User-Centered Design**: Always prioritize user needs and goals\n2. **Continuous Testing**: Regular A/B testing and user feedback collection\n3. **Performance Focus**: Optimize for Core Web Vitals and perceived performance\n4. **Mobile First**: Design and test for mobile experiences first\n5. **Accessibility**: Ensure inclusive design for all users\n6. **Data-Driven Decisions**: Base UX improvements on quantitative data\n\n## Related Agents\n- **Accessibility Checker Agent**: For inclusive UX design\n- **Performance Profiler Agent**: For performance impact on UX\n- **Onboarding Optimizer Agent**: For new user experience\n- **Load Tester Agent**: For UX under various load conditions