# Component Builder Agent 🏗️

## Purpose
Automatically generate new UI components following established patterns in the BeProductive framework, ensuring consistency, accessibility, and mobile optimization.

## Capabilities
- Creates React components with TypeScript
- Follows shadcn/ui component structure
- Implements accessibility features (ARIA labels, keyboard navigation)
- Adds mobile responsiveness and touch optimization
- Integrates with existing contexts and hooks
- Generates corresponding test files
- Creates Storybook stories (if applicable)

## Tech Stack Knowledge
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **UI Library**: shadcn/ui components
- **State Management**: React Context API, Tanstack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Mobile**: Touch optimization, PWA features

## Component Templates

### Basic Component Template
```typescript
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { [IconName] } from 'lucide-react';

interface [ComponentName]Props {
  className?: string;
  [propName]: [propType];
}

export function [ComponentName]({
  className,
  ...props
}: [ComponentName]Props) {
  const [state, setState] = useState();

  return (
    <div className={cn('', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Mobile-Optimized Component Template
```typescript
import { TouchOptimizedCard, TouchOptimizedButton } from '@/components/mobile/TouchOptimizedButton';
import { useMobile } from '@/hooks/useMobile';

export function Mobile[ComponentName]() {
  const { isMobile, orientation } = useMobile();

  return (
    <TouchOptimizedCard
      className="touch-manipulation min-h-[44px]"
      onPress={() => {}}
      hapticFeedback
    >
      {/* Mobile-optimized content */}
    </TouchOptimizedCard>
  );
}
```

### Form Component Template
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  [fieldName]: z.string().min(1, 'Required'),
});

export function [ComponentName]Form() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      [fieldName]: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="[fieldName]"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Helper text</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## File Structure Convention
```
src/components/
├── [feature-name]/
│   ├── [ComponentName].tsx        # Main component
│   ├── [ComponentName].test.tsx   # Test file
│   ├── Mobile[ComponentName].tsx  # Mobile variant (if needed)
│   └── index.ts                   # Barrel export
```

## UI Resource References

Consult the comprehensive [UI Resources Reference](./ui-resources-reference.md) for the latest component libraries and design inspiration sources.

### Primary Component Sources (Tier 1)
- **shadcn/ui** - Primary reference library (ui.shadcn.com)
- **Park UI** - Ark UI + Panda CSS components (park-ui.com)
- **Origin UI** - Modern copy-paste components (originui.com)
- **Untitled UI React** - Largest open-source collection (untitledui.com)

### Inspiration Sources
- **Mobbin** - Mobile UI patterns and flows
- **UI Movement** - Micro-interactions and animations
- **Awwwards** - Award-winning design innovation
- **Behance** - Comprehensive design case studies

### When Creating Components
1. **Check Primary Sources**: Always review latest patterns from Tier 1 libraries
2. **Analyze Trends**: Consult Design Asset Discovery Agent for trending patterns
3. **Quality Assessment**: Use the scoring matrix from UI Resources Reference
4. **Mobile-First**: Reference mobile patterns from Mobbin and UI Movement
5. **Accessibility**: Follow WCAG guidelines and check accessibility patterns

## Component Requirements Checklist
- [ ] TypeScript interfaces for all props
- [ ] Proper error boundaries where needed
- [ ] Loading and error states
- [ ] Accessibility attributes (aria-label, role, etc.)
- [ ] Keyboard navigation support
- [ ] Touch optimization for mobile (44px min touch targets)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support via Tailwind classes
- [ ] Proper semantic HTML
- [ ] Memoization where appropriate (React.memo, useMemo, useCallback)
- [ ] Integration with existing contexts
- [ ] Proper data fetching with React Query (if needed)
- [ ] Form validation with Zod (if applicable)
- [ ] Offline support consideration

## Accessibility Standards
- WCAG 2.1 Level AA compliance
- Proper heading hierarchy
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Focus indicators
- Screen reader announcements
- Skip navigation links
- ARIA live regions for dynamic content

## Mobile Optimization
- Touch targets minimum 44x44px (Apple HIG)
- Haptic feedback for interactions
- Gesture support (swipe, long press)
- Viewport meta tag consideration
- Safe area insets for notched devices
- Orientation change handling
- Offline-first approach

## Performance Guidelines
- Lazy loading for heavy components
- Code splitting with dynamic imports
- Image optimization with next/image or lazy loading
- Minimal re-renders (proper dependency arrays)
- Virtual scrolling for long lists
- Debouncing/throttling for frequent events

## Testing Requirements
Each component should have:
1. Unit tests for logic
2. Render tests for UI
3. Accessibility tests
4. Mobile responsiveness tests
5. User interaction tests

## Integration Points
Components should integrate with:
- `AuthContext` for user authentication
- `ModulesContext` for feature flags
- `AccessibilityContext` for a11y preferences
- `useOfflineSync` for offline capabilities
- `useMobile` for responsive behavior
- `useToast` for notifications

## Common Imports
```typescript
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Hooks
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { useMobile } from '@/hooks/useMobile';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/hooks/use-toast';

// Utils
import { cn } from '@/lib/utils';

// Icons
import { [IconName] } from 'lucide-react';

// Mobile Components
import { TouchOptimizedButton, TouchOptimizedCard } from '@/components/mobile/TouchOptimizedButton';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
```

## Example Usage

### Request: "Create a notification center component"

The agent would:
1. Create `/src/components/notifications/NotificationCenter.tsx`
2. Include real-time updates, offline queue, mobile optimization
3. Add accessibility features (aria-live regions, keyboard nav)
4. Create mobile variant with touch gestures
5. Add tests for the component
6. Integrate with existing notification system

## Quality Assurance
Before delivering a component, ensure:
- No TypeScript errors
- ESLint rules pass
- Component is exported properly
- Documentation comments added
- Props interface is complete
- Default props handled
- Error boundaries implemented where needed
- Loading states included
- Empty states designed
- Responsive at all breakpoints