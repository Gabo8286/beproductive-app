import { render, RenderOptions } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ModulesProvider } from '@/contexts/ModulesContext';
import { TaskViewProvider } from '@/contexts/TaskViewContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AuthContext } from '@/contexts/AuthContext';
import { runAccessibilityAudit } from '@/utils/accessibility/testing';

// Create a custom render function that includes all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  authValue?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = '/',
    authValue = {
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    },
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  window.history.pushState({}, 'Test page', initialRoute);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <AuthContext.Provider value={authValue}>
            <BrowserRouter>
              <ModulesProvider>
                <TaskViewProvider>
                  <WidgetProvider>
                    {/* ARIA Live Regions for testing */}
                    <div id="aria-live-polite" aria-live="polite" aria-atomic="true" className="sr-only" />
                    <div id="aria-live-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
                    {children}
                  </WidgetProvider>
                </TaskViewProvider>
              </ModulesProvider>
            </BrowserRouter>
          </AuthContext.Provider>
        </AccessibilityProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Accessibility-focused test renderer
 * Includes ARIA live regions and runs accessibility audit
 */
export async function a11yRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const renderResult = renderWithProviders(ui, options);
  
  // Run accessibility audit on rendered component
  const auditResult = await runAccessibilityAudit(renderResult.container);
  
  return {
    ...renderResult,
    accessibility: auditResult,
  };
}

/**
 * Custom matchers for accessibility testing
 */
export const customMatchers = {
  toBeAccessible: async (element: HTMLElement) => {
    const result = await runAccessibilityAudit(element);
    
    return {
      pass: result.passed,
      message: () => result.summary,
    };
  },

  toHaveNoViolations: async (element: HTMLElement) => {
    const result = await runAccessibilityAudit(element);
    
    return {
      pass: result.violations.length === 0,
      message: () => 
        result.violations.length > 0
          ? `Expected no violations, but found ${result.violations.length}`
          : 'No accessibility violations found',
    };
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { screen };
export { renderWithProviders as render };
