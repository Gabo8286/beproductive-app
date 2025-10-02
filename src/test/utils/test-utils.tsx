import { render, RenderOptions } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ModulesProvider } from '@/contexts/ModulesContext';
import { TaskViewProvider } from '@/contexts/TaskViewContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { AuthContext } from '@/contexts/AuthContext';

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
        <AuthContext.Provider value={authValue}>
          <BrowserRouter>
            <ModulesProvider>
              <TaskViewProvider>
                <WidgetProvider>
                  {children}
                </WidgetProvider>
              </TaskViewProvider>
            </ModulesProvider>
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { screen };
export { renderWithProviders as render };
