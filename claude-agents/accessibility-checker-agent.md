# Accessibility Checker Agent ♿

## Purpose
Automated accessibility testing and validation to ensure WCAG 2.1 AA/AAA compliance, screen reader compatibility, and inclusive design principles across the BeProductive application.

## Capabilities
- WCAG 2.1 compliance validation
- Screen reader compatibility testing
- Keyboard navigation verification
- Color contrast analysis
- ARIA attributes validation
- Focus management testing
- Mobile accessibility auditing
- Automated accessibility reporting
- Accessibility regression detection
- User flow accessibility testing

## Tech Stack & Tools
- **Testing**: axe-core, Pa11y, WAVE, Lighthouse
- **Screen Readers**: NVDA, JAWS simulation, VoiceOver
- **Automation**: Playwright, Cypress with accessibility plugins
- **Analysis**: Color Oracle, Contrast Ratio tools
- **Reporting**: HTML accessibility reports, JSON APIs

## Accessibility Testing Templates

### 1. WCAG Compliance Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('WCAG Compliance Testing', () => {
  it('should pass WCAG 2.1 AA compliance for dashboard', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container, {
      rules: {
        // Enable all WCAG 2.1 AA rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'semantic-markup': { enabled: true },
        'aria-labels': { enabled: true }
      }
    });
    
    expect(results).toHaveNoViolations();
  });

  it('should validate semantic HTML structure', async () => {
    const { container } = render(<TaskList />);
    
    // Check for proper heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify heading order
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
    }
    
    // Check for semantic landmarks
    expect(container.querySelector('main')).toBeTruthy();
    expect(container.querySelector('nav')).toBeTruthy();
    
    // Validate list semantics
    const lists = container.querySelectorAll('ul, ol');
    lists.forEach(list => {
      expect(list.children.length).toBeGreaterThan(0);
      Array.from(list.children).forEach(child => {
        expect(child.tagName).toBe('LI');
      });
    });
  });

  it('should have proper ARIA attributes', async () => {
    const { container } = render(<InteractiveWidget />);
    
    // Check interactive elements have accessible names
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const accessibleName = button.getAttribute('aria-label') || 
                           button.getAttribute('aria-labelledby') ||
                           button.textContent;
      expect(accessibleName).toBeTruthy();
    });
    
    // Check form inputs have labels
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby') ||
                      input.getAttribute('id') && container.querySelector(`label[for="${input.id}"]`);
      expect(hasLabel).toBeTruthy();
    });
    
    // Check live regions
    const liveRegions = container.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      const liveValue = region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(liveValue);
    });
  });
});
```

### 2. Keyboard Navigation Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Keyboard Navigation Testing', () => {
  it('should support full keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<NavigationMenu />);
    
    // Start from first focusable element
    const firstButton = screen.getByRole('button', { name: /first/i });
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
    
    // Tab through all focusable elements
    const focusableElements = getAllFocusableElements();
    
    for (let i = 1; i < focusableElements.length; i++) {
      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(focusableElements[i]);
    }
    
    // Test Shift+Tab reverse navigation
    for (let i = focusableElements.length - 2; i >= 0; i--) {
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(focusableElements[i]);
    }
  });

  it('should handle arrow key navigation in menus', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu />);
    
    // Open menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    // First menu item should be focused
    const firstMenuItem = screen.getByRole('menuitem', { name: /first/i });
    expect(document.activeElement).toBe(firstMenuItem);
    
    // Arrow down to next item
    await user.keyboard('{ArrowDown}');
    const secondMenuItem = screen.getByRole('menuitem', { name: /second/i });
    expect(document.activeElement).toBe(secondMenuItem);
    
    // Arrow up back to first item
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(firstMenuItem);
    
    // Escape closes menu
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(menuButton);
  });

  it('should manage focus trapping in modals', async () => {
    const user = userEvent.setup();
    render(<ModalDialog />);
    
    // Open modal
    const openButton = screen.getByRole('button', { name: /open modal/i });
    await user.click(openButton);
    
    // Focus should be trapped in modal
    const modalElements = getModalFocusableElements();
    
    // Tab should cycle within modal
    for (let i = 0; i < modalElements.length * 2; i++) {
      await user.keyboard('{Tab}');
      const currentIndex = i % modalElements.length;
      expect(document.activeElement).toBe(modalElements[currentIndex]);
    }
    
    // Escape closes modal and returns focus
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(openButton);
  });

  function getAllFocusableElements(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled')) as HTMLElement[];
  }

  function getModalFocusableElements(): HTMLElement[] {
    const modal = screen.getByRole('dialog');
    return Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled')) as HTMLElement[];
  }
});
```

### 3. Color Contrast and Visual Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('Color Contrast and Visual Accessibility', () => {
  it('should meet WCAG color contrast requirements', async () => {
    const { container } = render(<ColoredComponents />);
    
    const contrastChecker = new ColorContrastChecker();
    
    // Check all text elements
    const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, button');
    
    for (const element of textElements) {
      const computedStyle = window.getComputedStyle(element);
      const textColor = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      const contrastRatio = contrastChecker.calculateContrast(textColor, backgroundColor);
      
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontWeight = computedStyle.fontWeight;
      
      if (fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || fontWeight >= '700'))) {
        // Large text
        expect(contrastRatio).toBeGreaterThanOrEqual(3);
      } else {
        // Normal text
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('should not rely solely on color for information', async () => {
    const { container } = render(<StatusIndicators />);
    
    // Check status indicators have text or icons in addition to color
    const statusElements = container.querySelectorAll('[data-status]');
    
    statusElements.forEach(element => {
      const hasText = element.textContent?.trim().length > 0;
      const hasIcon = element.querySelector('svg, img, [class*="icon"]');
      const hasAriaLabel = element.getAttribute('aria-label');
      const hasTitle = element.getAttribute('title');
      
      // Should have at least one non-color indicator
      expect(hasText || hasIcon || hasAriaLabel || hasTitle).toBe(true);
    });
  });

  it('should support high contrast mode', async () => {
    // Simulate high contrast mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    const { container } = render(<HighContrastComponent />);
    
    // Verify high contrast styles are applied
    const elements = container.querySelectorAll('[data-high-contrast]');
    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      
      // In high contrast mode, ensure borders are visible
      expect(computedStyle.borderWidth).not.toBe('0px');
      expect(computedStyle.borderStyle).not.toBe('none');
    });
  });
});
```

### 4. Screen Reader Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Screen Reader Accessibility', () => {
  it('should provide proper screen reader announcements', async () => {
    const announcements = [];
    
    // Mock screen reader announcements
    const mockAnnounce = jest.fn((text) => announcements.push(text));
    
    render(<TaskManager onAnnounce={mockAnnounce} />);
    
    // Perform actions that should trigger announcements
    const addButton = screen.getByRole('button', { name: /add task/i });
    addButton.click();
    
    expect(announcements).toContain('Task added successfully');
    
    // Test error announcements
    const invalidInput = screen.getByRole('textbox', { name: /task title/i });
    fireEvent.blur(invalidInput); // Trigger validation
    
    expect(announcements).toContain('Task title is required');
  });

  it('should have proper reading order', async () => {
    const { container } = render(<ComplexLayout />);
    
    const readingOrderTester = new ReadingOrderTester();
    const readingOrder = readingOrderTester.getReadingOrder(container);
    
    // Verify logical reading order
    expect(readingOrder[0]).toContain('heading');
    expect(readingOrder[1]).toContain('navigation');
    expect(readingOrder[2]).toContain('main content');
    expect(readingOrder[readingOrder.length - 1]).toContain('footer');
  });

  it('should provide context for form fields', async () => {
    render(<RegistrationForm />);
    
    // Check form field descriptions
    const passwordField = screen.getByLabelText(/password/i);
    const description = screen.getByText(/at least 8 characters/i);
    
    expect(passwordField.getAttribute('aria-describedby')).toBe(description.id);
    
    // Check required field indicators
    const requiredFields = screen.getAllByRole('textbox', { required: true });
    requiredFields.forEach(field => {
      const label = screen.getByLabelText(field.getAttribute('aria-label') || field.name);
      expect(label.textContent).toMatch(/required|\*/i);
    });
  });

  it('should announce dynamic content changes', async () => {
    const announcements = [];
    const mockAnnounce = jest.fn((text) => announcements.push(text));
    
    render(<DynamicContent onAnnounce={mockAnnounce} />);
    
    // Trigger content change
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    refreshButton.click();
    
    // Wait for async update
    await waitFor(() => {
      expect(announcements).toContain('Content updated');
    });
    
    // Test loading states
    const loadingRegion = screen.getByRole('status');
    expect(loadingRegion.getAttribute('aria-live')).toBe('polite');
  });
});
```

## Success Criteria

### Accessibility Metrics
- **WCAG 2.1 AA Compliance**: 100% compliance
- **Color Contrast**: All text meets 4.5:1 ratio (3:1 for large text)
- **Keyboard Navigation**: 100% functionality accessible via keyboard
- **Screen Reader Compatibility**: Full functionality with major screen readers
- **Mobile Accessibility**: Touch targets ≥ 44px, gesture alternatives

### Performance Thresholds
1. **Accessibility Scan Time**: < 30 seconds for full app
2. **WCAG Violation Detection**: 100% of violations caught
3. **False Positive Rate**: < 5%
4. **Focus Management**: No focus loss or trapping issues
5. **Screen Reader Speed**: Content readable at 2x speed

## Usage Examples

```bash
# Run accessibility audit
npm run accessibility:audit

# Test specific component
npm run accessibility:test --component=Dashboard

# Generate accessibility report
npm run accessibility:report

# Test keyboard navigation
npm run accessibility:keyboard-test
```

## Integration with Development Workflow

### Pre-commit Accessibility Checks
```typescript
export async function preCommitAccessibilityCheck(): Promise<void> {
  const changedFiles = await getChangedFiles();
  const componentFiles = changedFiles.filter(f => f.endsWith('.tsx'));
  
  for (const file of componentFiles) {
    const component = await importComponent(file);
    const accessibilityResult = await runAccessibilityTest(component);
    
    if (accessibilityResult.violations.length > 0) {
      throw new Error(`Accessibility violations found in ${file}`);
    }
  }
}
```

## Best Practices

1. **Semantic HTML**: Use proper HTML elements for their intended purpose
2. **ARIA Attributes**: Implement ARIA where HTML semantics are insufficient
3. **Keyboard Support**: Ensure all functionality is keyboard accessible
4. **Focus Management**: Maintain logical focus order and visibility
5. **Color Independence**: Don't rely solely on color for information
6. **Responsive Design**: Ensure accessibility across all device sizes

## Related Agents
- **UX Evaluator Agent**: For overall user experience assessment
- **Compliance Auditor Agent**: For accessibility compliance reporting
- **Performance Profiler Agent**: For accessibility performance impact
- **Testing & Quality Agent**: For integration with test suites