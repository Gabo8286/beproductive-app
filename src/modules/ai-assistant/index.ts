// AI Assistant Module
// Central AI intelligence for natural language processing and user interaction

// Components
export { ConversationalAI } from './components/ConversationalAI';

// Services
export { intentRecognitionService } from './services/intentRecognition';
export { setupCommunication, aiAssistantComm } from './services/communication';

// Hooks
export { useAIAssistant } from './hooks/useAIAssistant';

// Types
export type * from './types/intent';
export type * from './types/conversation';
export type * from './types/aiResponses';

// Module configuration
export const AI_ASSISTANT_MODULE = {
  name: 'ai-assistant',
  version: '1.0.0',
  description: 'Central AI intelligence for natural language processing and user interaction',
  dependencies: ['automation-engine', 'voice-interface'],
  capabilities: [
    'natural-language-processing',
    'intent-recognition',
    'context-awareness',
    'cross-module-actions',
    'conversation-memory'
  ]
} as const;

// Module initialization function
export async function init() {
  console.log('AI Assistant module initialized');

  // Setup inter-module communication
  const { setupCommunication } = await import('./services/communication');
  setupCommunication();

  return {
    intentRecognitionService,
    components: {
      ConversationalAI
    },
    capabilities: {
      'intent-recognition': (input: string) => intentRecognitionService.recognizeIntent(input),
      'natural-language-processing': (text: string) => intentRecognitionService.extractEntities(text),
      'conversation-management': ConversationalAI,
      'action-execution': (action: any) => console.log('Executing action:', action)
    }
  };
}