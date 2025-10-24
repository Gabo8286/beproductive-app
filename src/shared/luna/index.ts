/**
 * Luna AI Framework - Core Module
 * Centralized Luna AI functionality for cross-platform consistency
 * Combines local intelligence, visual assets, and navigation services
 */

// Export all Luna core functionality
export * from './core';
export * from './intelligence';
export * from './providers';
export * from './agents';
export * from './assets';
export * from './navigation';
export * from './types';

// Export the main Luna manager instance
export { LunaManager, lunaManager } from './core';

// Export commonly used utilities
export {
  processWithLocalIntelligence,
  canHandleLocally,
  getLunaAssetWithFallback,
  getLunaExpressionForState,
  generateNavigationSuggestions
} from './intelligence';

// Export Luna configuration
export { LUNA_CONFIG, LunaConfig } from './config';

// Version information
export const LUNA_VERSION = '1.0.0';
export const LUNA_COMPATIBILITY = {
  web: true,
  ios: true,
  swift: '>=5.7.0',
  react: '>=18.0.0'
};

// Features Documentation
export const LUNA_FEATURES = {
  'Multi-provider support': 'Supports OpenAI, Claude, and Gemini providers with unified interface',
  'Local intelligence': 'Processes data locally when possible to reduce API costs and improve privacy',
  'Cross-platform': 'Consistent AI functionality across web and iOS platforms',
  'Agent system': 'Specialized AI agents for monitoring, security, and backup automation'
};