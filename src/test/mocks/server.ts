import { setupServer } from 'msw/node';
import {
  handlers,
  errorHandlers,
  slowHandlers,
  successHandlers
} from './api-handlers';

// Setup MSW server with default handlers
export const server = setupServer(...handlers);

// Helper functions to switch between different handler sets
export const useSuccessHandlers = () => {
  server.resetHandlers(...successHandlers);
};

export const useErrorHandlers = () => {
  server.resetHandlers(...errorHandlers);
};

export const useSlowHandlers = () => {
  server.resetHandlers(...slowHandlers);
};

export const resetToDefaultHandlers = () => {
  server.resetHandlers(...handlers);
};

// Utility to override specific endpoints
export const overrideHandler = (handler: any) => {
  server.use(handler);
};

// Setup for different test scenarios
export const setupMockScenarios = {
  success: () => useSuccessHandlers(),
  error: () => useErrorHandlers(),
  slow: () => useSlowHandlers(),
  default: () => resetToDefaultHandlers(),
};

export default server;