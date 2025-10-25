// Type definitions for iOS Development MCP Prompt Library
// Compatible with existing Spark Bloom Flow prompt system
// Error handling
export class PromptLibraryError extends Error {
    code;
    templateId;
    context;
    constructor(message, code, templateId, context) {
        super(message);
        this.code = code;
        this.templateId = templateId;
        this.context = context;
        this.name = 'PromptLibraryError';
    }
}
export class PromptValidationError extends PromptLibraryError {
    constructor(message, templateId, errors) {
        super(message, 'VALIDATION_ERROR', templateId, { errors });
        this.name = 'PromptValidationError';
    }
}
export class PromptNotFoundError extends PromptLibraryError {
    constructor(templateId) {
        super(`Template not found: ${templateId}`, 'NOT_FOUND', templateId);
        this.name = 'PromptNotFoundError';
    }
}
// Configuration and constants
export const PROMPT_LIBRARY_VERSION = '1.0.0';
export const MAX_TEMPLATE_SIZE = 50000; // characters
export const MAX_CONTEXT_SIZE = 10000; // characters
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'];
export const SUPPORTED_FRAMEWORKS = [
    'SwiftUI',
    'UIKit',
    'Foundation',
    'Core Data',
    'CloudKit',
    'Combine',
    'RealityKit',
    'ARKit',
    'Core ML',
    'Vision',
    'Natural Language',
    'Speech',
    'AVFoundation',
    'Core Animation',
    'Metal',
    'Game Center',
    'StoreKit',
    'EventKit',
    'Contacts',
    'PhotosUI',
    'MapKit',
    'Core Location'
];
//# sourceMappingURL=prompt-library.js.map