import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock user for testing
export const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: "https://example.com/avatar.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// Mock modules for testing
export const mockModules = {
  goals: true,
  habits: true,
  tasks: true,
  notes: true,
  analytics: true,
  automation: true,
  collaboration: true,
  integrations: true,
};

// Create test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// All providers wrapper for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Render with authentication context
export const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    user?: typeof mockUser;
    isAuthenticated?: boolean;
  },
) => {
  const {
    user = mockUser,
    isAuthenticated = true,
    ...renderOptions
  } = options || {};

  const AuthenticatedWrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const queryClient = createTestQueryClient();

    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AuthenticatedWrapper, ...renderOptions });
};

// Mobile viewport testing utility
export const setMobileViewport = () => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 375,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 667,
  });
  window.dispatchEvent(new Event("resize"));
};

// Desktop viewport testing utility
export const setDesktopViewport = () => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1920,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 1080,
  });
  window.dispatchEvent(new Event("resize"));
};

// Tablet viewport testing utility
export const setTabletViewport = () => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 768,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 1024,
  });
  window.dispatchEvent(new Event("resize"));
};

// Mock navigator.vibrate for haptic feedback testing
export const mockVibrate = () => {
  Object.defineProperty(navigator, "vibrate", {
    writable: true,
    value: vi.fn(),
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  return localStorageMock;
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });
  return sessionStorageMock;
};

// Mock service worker for PWA testing
export const mockServiceWorker = () => {
  Object.defineProperty(navigator, "serviceWorker", {
    value: {
      register: vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      ready: Promise.resolve({
        installing: null,
        waiting: null,
        active: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
};

// Wait for async operations
export const waitForElement = async (callback: () => HTMLElement | null) => {
  return new Promise<HTMLElement>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Element not found within timeout"));
    }, 5000);

    const check = () => {
      const element = callback();
      if (element) {
        clearTimeout(timeout);
        resolve(element);
      } else {
        setTimeout(check, 100);
      }
    };

    check();
  });
};

// Accessibility testing helper
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import("jest-axe");
  const results = await axe(container);
  return results;
};

// Performance testing helper
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for next tick
  const end = performance.now();
  return end - start;
};

// Export all from @testing-library/react with our custom render
export * from "@testing-library/react";
export { customRender as render };
