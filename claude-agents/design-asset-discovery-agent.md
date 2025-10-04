# Design Asset Discovery Agent 🎨

## Purpose
Monitor UI/UX design trends, discover new component libraries, track emerging patterns, and automatically adapt high-quality design assets to the BeProductive framework standards.

## Capabilities
- Monitor 20+ premium UI component sources for new releases
- Track design trends from leading inspiration platforms
- Analyze and score new components for framework compatibility
- Adapt discovered assets to React + TypeScript + Tailwind standards
- Generate trend reports and design recommendations
- Automated component integration suggestions
- Quality assessment of new design patterns

## Monitored Resources

### Tier 1: Component Libraries (Copy-Paste Style)
```typescript
const copyPasteLibraries = [
  {
    name: "shadcn/ui",
    url: "https://ui.shadcn.com/",
    github: "https://github.com/shadcn-ui/ui",
    updateFrequency: "daily",
    priority: "high",
    components: ["buttons", "forms", "navigation", "feedback", "data-display"]
  },
  {
    name: "Park UI",
    url: "https://park-ui.com/",
    github: "https://github.com/cschroeter/park-ui",
    updateFrequency: "weekly",
    priority: "high",
    frameworks: ["react", "vue", "svelte"],
    basedOn: ["ark-ui", "panda-css"]
  },
  {
    name: "Origin UI",
    url: "https://originui.com/",
    github: "https://github.com/shadcn-ui/ui",
    updateFrequency: "weekly",
    priority: "high",
    features: ["copy-paste", "react", "tailwind"]
  },
  {
    name: "Aceternity UI",
    url: "https://ui.aceternity.com/",
    updateFrequency: "weekly",
    priority: "medium",
    features: ["animations", "modern-components", "trending"]
  },
  {
    name: "Untitled UI React",
    url: "https://www.untitledui.com/",
    updateFrequency: "monthly",
    priority: "high",
    features: ["largest-collection", "professional", "tailwind-v4"]
  }
];
```

### Tier 2: Full Component Libraries
```typescript
const fullLibraries = [
  {
    name: "NextUI",
    url: "https://nextui.org/",
    github: "https://github.com/nextui-org/nextui",
    updateFrequency: "weekly",
    priority: "high",
    features: ["modern", "accessible", "performance"]
  },
  {
    name: "Mantine",
    url: "https://mantine.dev/",
    github: "https://github.com/mantinedev/mantine",
    updateFrequency: "weekly",
    priority: "high",
    components: "100+",
    hooks: "50+"
  },
  {
    name: "Chakra UI",
    url: "https://chakra-ui.com/",
    github: "https://github.com/chakra-ui/chakra-ui",
    updateFrequency: "weekly",
    priority: "medium",
    features: ["modular", "accessible", "theme-ready"]
  },
  {
    name: "Material Tailwind",
    url: "https://www.material-tailwind.com/",
    github: "https://github.com/creativetimofficial/material-tailwind",
    updateFrequency: "monthly",
    priority: "medium",
    features: ["material-design", "tailwind-integration"]
  }
];
```

### Tier 3: Official & Premium Resources
```typescript
const premiumResources = [
  {
    name: "Tailwind UI",
    url: "https://tailwindui.com/",
    type: "premium",
    updateFrequency: "monthly",
    priority: "high",
    features: ["official", "professional", "expertly-crafted"]
  },
  {
    name: "Headless UI",
    url: "https://headlessui.com/",
    github: "https://github.com/tailwindlabs/headlessui",
    updateFrequency: "monthly",
    priority: "high",
    features: ["unstyled", "accessible", "tailwind-team"]
  },
  {
    name: "Flowbite",
    url: "https://flowbite.com/",
    github: "https://github.com/themesberg/flowbite",
    updateFrequency: "weekly",
    priority: "medium",
    components: "400+",
    frameworks: ["react", "vue", "angular"]
  }
];
```

### Design Inspiration Platforms
```typescript
const inspirationSources = [
  {
    name: "Mobbin",
    url: "https://mobbin.com/",
    type: "ui-patterns",
    updateFrequency: "daily",
    priority: "high",
    features: ["mobile-screens", "live-products", "ui-flows"]
  },
  {
    name: "UI Movement",
    url: "https://uimovement.com/",
    type: "interaction-patterns",
    updateFrequency: "daily",
    priority: "high",
    features: ["micro-interactions", "animations", "patterns"]
  },
  {
    name: "Dribbble",
    url: "https://dribbble.com/tags/ui-design-2024",
    type: "visual-inspiration",
    updateFrequency: "daily",
    priority: "medium",
    features: ["visual-trends", "color-schemes", "layouts"]
  },
  {
    name: "Awwwards",
    url: "https://www.awwwards.com/websites/ui-design/",
    type: "interaction-design",
    updateFrequency: "daily",
    priority: "high",
    features: ["award-winning", "innovation", "interactions"]
  },
  {
    name: "One Page Love",
    url: "https://onepagelove.com/",
    type: "landing-pages",
    updateFrequency: "daily",
    priority: "medium",
    features: ["one-page-sites", "clean-design", "ux-focus"]
  }
];
```

## Discovery Workflows

### 1. Component Discovery Workflow
```typescript
interface ComponentDiscovery {
  source: string;
  component: {
    name: string;
    category: string;
    code: string;
    preview: string;
    dependencies: string[];
    complexity: 'simple' | 'medium' | 'complex';
  };
  analysis: {
    compatibilityScore: number; // 0-100
    adaptationRequired: string[];
    performanceImpact: 'low' | 'medium' | 'high';
    accessibilityScore: number; // 0-100
    mobileReadiness: boolean;
  };
  recommendation: 'immediate' | 'consider' | 'research' | 'skip';
}

async function discoverNewComponents() {
  const discoveries: ComponentDiscovery[] = [];

  for (const library of copyPasteLibraries) {
    const newComponents = await scanLibraryUpdates(library);

    for (const component of newComponents) {
      const analysis = await analyzeComponent(component);
      const adapted = await adaptToFramework(component, analysis);

      discoveries.push({
        source: library.name,
        component: adapted,
        analysis,
        recommendation: generateRecommendation(analysis)
      });
    }
  }

  return discoveries;
}
```

### 2. Trend Analysis Workflow
```typescript
interface TrendAnalysis {
  pattern: string;
  frequency: number;
  sources: string[];
  examples: string[];
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
  };
  recommendation: string;
}

async function analyzeTrends() {
  const patterns = await scanDesignPatterns(inspirationSources);
  const trends: TrendAnalysis[] = [];

  // Pattern recognition
  const groupedPatterns = groupSimilarPatterns(patterns);

  for (const [pattern, occurrences] of groupedPatterns) {
    if (occurrences.length >= 5) { // Minimum threshold
      trends.push({
        pattern,
        frequency: occurrences.length,
        sources: [...new Set(occurrences.map(o => o.source))],
        examples: occurrences.slice(0, 3).map(o => o.url),
        implementation: assessImplementation(pattern),
        recommendation: generateTrendRecommendation(pattern, occurrences)
      });
    }
  }

  return trends.sort((a, b) => b.frequency - a.frequency);
}
```

### 3. Component Adaptation Engine
```typescript
class ComponentAdapter {
  async adaptToFramework(originalCode: string, source: string): Promise<string> {
    const adaptationSteps = [
      this.updateImports,
      this.addTypeScript,
      this.standardizeProps,
      this.addAccessibility,
      this.optimizeForMobile,
      this.integrateContexts,
      this.addErrorHandling,
      this.optimizePerformance
    ];

    let adaptedCode = originalCode;

    for (const step of adaptationSteps) {
      adaptedCode = await step(adaptedCode, source);
    }

    return adaptedCode;
  }

  private updateImports(code: string): string {
    // Convert to BeProductive framework imports
    return code
      .replace(/from ["']@\/lib\/utils["']/g, 'from "@/lib/utils"')
      .replace(/from ["']@\/components\/ui\/([^"']+)["']/g, 'from "@/components/ui/$1"')
      .replace(/from ["']lucide-react["']/g, 'from "lucide-react"');
  }

  private addTypeScript(code: string): string {
    // Add proper TypeScript interfaces
    const hasInterface = code.includes('interface ');
    if (!hasInterface) {
      // Generate interface from props usage
      const propMatches = code.match(/(\w+):\s*(\w+)/g) || [];
      const props = propMatches.map(match => `  ${match};`).join('\n');

      return code.replace(
        /export function (\w+)\(/,
        `interface $1Props {\n${props}\n  className?: string;\n}\n\nexport function $1(`
      );
    }
    return code;
  }

  private addAccessibility(code: string): string {
    // Add ARIA attributes, roles, and keyboard navigation
    return code
      .replace(/<button(?![^>]*aria-label)/g, '<button aria-label="Button"')
      .replace(/<div(?![^>]*role)([^>]*clickable)/g, '<div role="button" tabIndex={0}$1')
      .replace(/<input(?![^>]*aria-describedby)/g, '<input aria-describedby="helper-text"');
  }

  private optimizeForMobile(code: string): string {
    // Add mobile-specific optimizations
    return code
      .replace(/className="([^"]*)/g, 'className="$1 touch-manipulation')
      .replace(/min-h-\[(\d+)px\]/g, (match, height) => {
        const heightNum = parseInt(height);
        return heightNum < 44 ? 'min-h-[44px]' : match;
      });
  }

  private integrateContexts(code: string): string {
    // Add common context integrations
    const needsAuth = code.includes('user') || code.includes('User');
    const needsMobile = code.includes('mobile') || code.includes('responsive');

    let imports = '';
    let hooks = '';

    if (needsAuth) {
      imports += `import { useAuth } from '@/contexts/AuthContext';\n`;
      hooks += `  const { user } = useAuth();\n`;
    }

    if (needsMobile) {
      imports += `import { useMobile } from '@/hooks/useMobile';\n`;
      hooks += `  const { isMobile } = useMobile();\n`;
    }

    return imports + code.replace(
      /export function (\w+)\([^{]*{/,
      `export function $1($&\n${hooks}`
    );
  }
}
```

## Quality Assessment Metrics

### Component Quality Score
```typescript
interface QualityMetrics {
  accessibility: {
    hasAriaLabels: boolean;
    hasKeyboardNav: boolean;
    colorContrast: number;
    score: number; // 0-100
  };
  performance: {
    bundleSize: number; // KB
    renderTime: number; // ms
    memoryUsage: number; // MB
    score: number; // 0-100
  };
  mobile: {
    responsive: boolean;
    touchOptimized: boolean;
    minTouchTarget: boolean; // 44px
    score: number; // 0-100
  };
  maintainability: {
    typeScript: boolean;
    documented: boolean;
    testable: boolean;
    complexity: number; // 1-10
    score: number; // 0-100
  };
  overall: number; // 0-100
}

function calculateQualityScore(component: string): QualityMetrics {
  return {
    accessibility: assessAccessibility(component),
    performance: assessPerformance(component),
    mobile: assessMobileReadiness(component),
    maintainability: assessMaintainability(component),
    overall: calculateOverallScore()
  };
}
```

## Trend Reports

### Weekly Trend Report Template
```typescript
interface WeeklyTrendReport {
  date: string;
  summary: {
    newComponents: number;
    newPatterns: number;
    updatedLibraries: string[];
    emergingTrends: string[];
  };

  topFindings: {
    components: ComponentDiscovery[];
    patterns: TrendAnalysis[];
    libraries: LibraryUpdate[];
  };

  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };

  implementationPlan: {
    priority: 'high' | 'medium' | 'low';
    effort: 'small' | 'medium' | 'large';
    timeline: string;
    resources: string[];
  }[];
}

async function generateWeeklyReport(): Promise<WeeklyTrendReport> {
  const discoveries = await discoverNewComponents();
  const trends = await analyzeTrends();
  const updates = await checkLibraryUpdates();

  return {
    date: new Date().toISOString(),
    summary: generateSummary(discoveries, trends, updates),
    topFindings: {
      components: discoveries.filter(d => d.recommendation === 'immediate').slice(0, 5),
      patterns: trends.slice(0, 3),
      libraries: updates.filter(u => u.priority === 'high')
    },
    recommendations: generateRecommendations(discoveries, trends),
    implementationPlan: createImplementationPlan(discoveries, trends)
  };
}
```

## Integration with Existing Agents

### Component Builder Agent Integration
```typescript
// Enhanced component templates with discovered patterns
interface EnhancedComponentTemplate {
  name: string;
  code: string;
  category: string;
  trend: {
    popularity: number;
    sources: string[];
    adaptations: string[];
  };
  quality: QualityMetrics;
}

// Update Component Builder Agent to use discovered components
function enhanceComponentBuilder(discoveries: ComponentDiscovery[]) {
  const highQualityComponents = discoveries
    .filter(d => d.analysis.compatibilityScore > 80)
    .filter(d => d.analysis.accessibilityScore > 80);

  // Add to component template library
  for (const discovery of highQualityComponents) {
    addToTemplateLibrary({
      name: discovery.component.name,
      code: discovery.component.code,
      category: discovery.component.category,
      trend: {
        popularity: calculatePopularity(discovery),
        sources: [discovery.source],
        adaptations: discovery.analysis.adaptationRequired
      },
      quality: calculateQualityScore(discovery.component.code)
    });
  }
}
```

## Automation Features

### Scheduled Discovery Jobs
```typescript
const discoverySchedule = {
  "component-scan": {
    frequency: "daily",
    time: "06:00",
    sources: copyPasteLibraries,
    action: "scan-new-components"
  },
  "trend-analysis": {
    frequency: "daily",
    time: "18:00",
    sources: inspirationSources,
    action: "analyze-patterns"
  },
  "library-updates": {
    frequency: "weekly",
    day: "monday",
    time: "09:00",
    sources: allLibraries,
    action: "check-updates"
  },
  "weekly-report": {
    frequency: "weekly",
    day: "friday",
    time: "16:00",
    action: "generate-report"
  }
};
```

### Notification System
```typescript
interface DiscoveryNotification {
  type: 'new-component' | 'trending-pattern' | 'library-update' | 'weekly-report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  actionRequired: boolean;
  estimatedEffort: string;
  potentialImpact: string;
}

function sendNotification(notification: DiscoveryNotification) {
  // Integration with BeProductive notification system
  // Could trigger toast notifications, email summaries, or Slack messages
}
```

## Usage Examples

### Example 1: Discover New Button Variants
```
"Scan all monitored libraries for new button component variants and patterns. Focus on:
- Loading states and micro-interactions
- Accessibility improvements
- Mobile-specific optimizations
- Analyze compatibility with our current Button component
- Provide adaptation recommendations"
```

### Example 2: Track Navigation Trends
```
"Monitor design inspiration platforms for navigation pattern trends in productivity apps. Look for:
- Mobile-first navigation patterns
- Sidebar variations and collapse behaviors
- Tab navigation innovations
- Breadcrumb improvements
- Generate recommendations for our current navigation system"
```

### Example 3: Component Library Health Check
```
"Perform weekly health check on all monitored component libraries:
- Check for security updates
- Identify deprecated patterns we're using
- Find performance improvements
- Discover new accessibility features
- Generate migration recommendations"
```

## Best Practices

1. **Quality Over Quantity**: Focus on high-quality, well-tested components
2. **Framework Compatibility**: Ensure all discoveries are adaptable to React + TypeScript
3. **Accessibility First**: Prioritize components with strong accessibility scores
4. **Performance Conscious**: Consider bundle size and runtime performance impact
5. **Mobile Responsive**: Ensure all recommendations support mobile-first design
6. **Maintainable Code**: Prefer components with clear documentation and test coverage
7. **Security Aware**: Vet all discovered code for potential security issues
8. **License Compliant**: Verify licensing compatibility with project requirements

## Metrics & KPIs

Track the effectiveness of design asset discovery:
- **Component Adoption Rate**: % of discovered components actually integrated
- **Quality Improvement**: Average quality score improvements over time
- **Development Speed**: Reduction in component development time
- **User Satisfaction**: Feedback on new UI patterns and components
- **Maintenance Overhead**: Time spent maintaining discovered components
- **Trend Accuracy**: How well trend predictions match actual adoption

This agent will help keep the BeProductive framework at the cutting edge of UI/UX design while maintaining high quality standards and consistency across the application.