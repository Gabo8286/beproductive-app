// Shared Utilities and Services
// Cross-module shared functionality

// Services
export { eventBus } from './services/eventBus';
export { moduleRegistry } from './services/moduleRegistry';
export { stateManager } from './services/stateManager';
export { apiClient } from './services/apiClient';

// Components
export { LoadingSpinner } from './components/LoadingSpinner';
export { ErrorBoundary } from './components/ErrorBoundary';
export { Modal } from './components/Modal';
export { Toast } from './components/Toast';

// Hooks
export { useModuleLoader } from './hooks/useModuleLoader';
export { useEventBus } from './hooks/useEventBus';
export { useSharedState } from './hooks/useSharedState';

// Types
export type * from './types/module';
export type * from './types/events';
export type * from './types/state';

// Utils
export * from './utils/validation';
export * from './utils/formatting';
export * from './utils/storage';

// Shared configuration
export const SHARED_CONFIG = {
  version: '1.0.0',
  description: 'Cross-module shared functionality',
  eventBusChannels: [
    'module-communication',
    'state-changes',
    'automation-triggers',
    'ai-responses'
  ]
} as const;