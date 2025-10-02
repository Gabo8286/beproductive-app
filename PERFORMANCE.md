# Performance Monitoring Guide

## Overview

This project includes comprehensive performance monitoring to track Core Web Vitals, bundle sizes, and runtime performance metrics.

## Core Web Vitals

We track all Core Web Vitals metrics:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **INP (Interaction to Next Paint)**: < 200ms (replaces FID)
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms

## Viewing Performance Metrics

### Development

Performance metrics are automatically logged to the console in development mode. Look for logs prefixed with `[Performance]`.

### Performance Dashboard

Access the performance dashboard at `/admin/performance` (requires authentication).

The dashboard shows:
- Overall performance score
- Individual Core Web Vitals metrics
- Status indicators (good/needs-improvement/poor)
- Historical trends

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Navigate to the "Lighthouse" tab
3. Run an audit to see detailed performance metrics

## Bundle Analysis

### Generate Bundle Statistics

```bash
npm run build
```

This creates a `dist/stats.html` file with a visual breakdown of your bundle sizes.

### Bundle Size Limits

- JavaScript: < 200KB (Brotli compressed)
- CSS: < 50KB (Brotli compressed)
- HTML: < 20KB

## Performance Optimization

### Code Splitting

Use the `lazyWithPreload` utility for code splitting:

```typescript
import { lazyWithPreload } from '@/utils/performance/optimization';

const HeavyComponent = lazyWithPreload(() => import('./HeavyComponent'));

// Preload when user hovers
<button onMouseEnter={() => HeavyComponent.preload()}>
  Load Component
</button>
```

### Image Lazy Loading

Use the `useLazyLoad` hook:

```typescript
import { useLazyLoad } from '@/utils/performance/optimization';

const ImageComponent = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  useLazyLoad(imgRef);

  return <img ref={imgRef} data-src="image.jpg" alt="Lazy loaded" />;
};
```

### Component Performance Tracking

```typescript
import { useComponentPerformance } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  useComponentPerformance('MyComponent');
  // Component renders are automatically tracked
};
```

### API Call Tracking

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const { trackAPICall } = usePerformanceMonitor();

const fetchData = async () => {
  const start = performance.now();
  try {
    const response = await fetch('/api/data');
    const duration = performance.now() - start;
    trackAPICall('fetch-data', duration, true);
    return response.json();
  } catch (error) {
    const duration = performance.now() - start;
    trackAPICall('fetch-data', duration, false);
    throw error;
  }
};
```

## Continuous Integration

### Lighthouse CI

Lighthouse CI runs automatically on:
- Push to main/develop branches
- Pull requests to main

View results in the GitHub Actions tab.

### Performance Budgets

The CI pipeline enforces performance budgets:
- Performance score: ≥ 80
- Accessibility score: ≥ 90
- Best Practices score: ≥ 90
- SEO score: ≥ 90

## Best Practices

1. **Lazy Load Non-Critical Resources**: Use code splitting and lazy loading for components not needed on initial render.

2. **Optimize Images**: 
   - Use WebP/AVIF formats
   - Serve responsive images
   - Implement lazy loading

3. **Minimize JavaScript**: 
   - Tree shake unused code
   - Remove unused dependencies
   - Use dynamic imports

4. **Reduce CSS**: 
   - Remove unused styles
   - Inline critical CSS
   - Use CSS modules

5. **Monitor Regularly**: 
   - Check performance dashboard weekly
   - Review Lighthouse reports
   - Track trends over time

## Troubleshooting

### Slow Component Renders

If you see warnings about slow renders:

1. Check the console for performance warnings
2. Use React DevTools Profiler
3. Consider memoization with `React.memo` or `useMemo`

### Poor Core Web Vitals

1. Run Lighthouse audit to identify issues
2. Check network requests in DevTools
3. Review bundle sizes
4. Optimize images and fonts

### High Bundle Sizes

1. Review `dist/stats.html` for large chunks
2. Check for duplicate dependencies
3. Use dynamic imports for large components
4. Consider lazy loading routes

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
