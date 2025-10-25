// Type definitions for iOS Development MCP Prompt Library
// Compatible with existing Spark Bloom Flow prompt system

export type PromptCategory =
  | 'swift-development'
  | 'swiftui-development'
  | 'uikit-development'
  | 'xcode-tools'
  | 'architecture'
  | 'performance'
  | 'testing'
  | 'deployment'
  | 'tasks'
  | 'goals'
  | 'habits'
  | 'productivity'
  | 'ai-assistance';

export type ResponseType = 'text' | 'structured' | 'code' | 'json';

export interface PromptKeywords {
  primary: string[];
  synonyms: string[];
  multilingual: {
    en: string[];
    es: string[];
    fr: string[];
    de: string[];
  };
  contextVariations: string[];
  informalVersions: string[];
  technicalTerms: string[];
}

export interface PromptExample {
  input: string;
  output: string;
  context?: Record<string, any>;
}

export interface PromptMetadata {
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTokens: number;
  category: string;
  frameworks: string[];
  prerequisites?: string[];
  relatedTemplates?: string[];
}

export interface PromptTemplate {
  id: string;
  category: PromptCategory;
  name: string;
  description: string;
  version: string;
  keywords: PromptKeywords;
  systemPrompt: string;
  userPromptTemplate: string;
  responseType: ResponseType;
  temperature?: number;
  tags: string[];
  examples: PromptExample[];
  metadata: PromptMetadata;
  isActive?: boolean;
  lastUpdated?: string;
  author?: string;
  usage?: {
    count: number;
    averageRating: number;
    lastUsed: string;
  };
}

// iOS-specific extensions
export interface iOSPromptContext {
  targetiOSVersion?: string;
  swiftVersion?: string;
  uiFramework?: 'SwiftUI' | 'UIKit' | 'Mixed';
  architecturePattern?: 'MVVM' | 'MVC' | 'VIPER' | 'Clean Architecture';
  projectType?: 'app' | 'framework' | 'package' | 'playground';
  targetDevices?: ('iPhone' | 'iPad' | 'Mac' | 'Apple Watch' | 'Apple TV')[];
  deploymentTarget?: 'development' | 'testflight' | 'appstore' | 'enterprise';
  teamSize?: 'solo' | 'small' | 'medium' | 'large';
  performanceRequirements?: 'standard' | 'high' | 'critical';
  accessibilityNeeds?: 'basic' | 'comprehensive' | 'specialized';
}

export interface AppleFrameworkReference {
  name: string;
  version: string;
  documentation: string;
  availability: string;
  deprecated?: boolean;
  replacement?: string;
}

export interface XcodeToolConfiguration {
  toolName: string;
  version: string;
  configuration: Record<string, any>;
  supportedPlatforms: string[];
}

// Prompt validation and management
export interface PromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PromptLibraryConfig {
  version: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  categories: PromptCategory[];
  maxTokens: number;
  cacheTimeout: number;
}

// Search and filtering
export interface PromptSearchQuery {
  text?: string;
  category?: PromptCategory;
  tags?: string[];
  frameworks?: string[];
  complexity?: PromptMetadata['complexity'];
  language?: string;
}

export interface PromptSearchResult {
  template: PromptTemplate;
  relevanceScore: number;
  matchedKeywords: string[];
  matchedCategories: string[];
}

// Analytics and usage tracking
export interface PromptUsageAnalytics {
  templateId: string;
  timestamp: string;
  userId?: string;
  context: Record<string, any>;
  responseQuality?: number;
  executionTime: number;
  success: boolean;
  errorMessage?: string;
}

export interface PromptPerformanceMetrics {
  templateId: string;
  usageCount: number;
  averageResponseTime: number;
  successRate: number;
  averageRating: number;
  popularKeywords: string[];
  commonErrors: string[];
}

// Template management interfaces
export interface PromptTemplateManager {
  loadTemplate(id: string): Promise<PromptTemplate | null>;
  saveTemplate(template: PromptTemplate): Promise<boolean>;
  deleteTemplate(id: string): Promise<boolean>;
  searchTemplates(query: PromptSearchQuery): Promise<PromptSearchResult[]>;
  validateTemplate(template: PromptTemplate): PromptValidationResult;
  getCategories(): PromptCategory[];
  getTemplatesByCategory(category: PromptCategory): Promise<PromptTemplate[]>;
  updateTemplateUsage(id: string, usage: PromptUsageAnalytics): Promise<void>;
  getTemplateMetrics(id: string): Promise<PromptPerformanceMetrics | null>;
}

// Integration with Apple documentation
export interface AppleDocumentationProvider {
  searchAPIs(query: string, framework?: string): Promise<AppleFrameworkReference[]>;
  getFrameworkDocumentation(framework: string): Promise<string>;
  getLatestUpdates(framework?: string): Promise<any[]>;
  validateAPIAvailability(api: string, version: string): Promise<boolean>;
}

// MCP integration types
export interface MCPPromptRequest {
  templateId: string;
  context: iOSPromptContext;
  userInput: string;
  customizations?: Record<string, any>;
  targetModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MCPPromptResponse {
  prompt: string;
  metadata: PromptMetadata;
  context: iOSPromptContext;
  estimatedTokens: number;
  executionTime: number;
  cacheKey?: string;
}

// Error handling
export class PromptLibraryError extends Error {
  constructor(
    message: string,
    public code: string,
    public templateId?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PromptLibraryError';
  }
}

export class PromptValidationError extends PromptLibraryError {
  constructor(message: string, templateId: string, errors: string[]) {
    super(message, 'VALIDATION_ERROR', templateId, { errors });
    this.name = 'PromptValidationError';
  }
}

export class PromptNotFoundError extends PromptLibraryError {
  constructor(templateId: string) {
    super(`Template not found: ${templateId}`, 'NOT_FOUND', templateId);
    this.name = 'PromptNotFoundError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type TemplateUpdate = DeepPartial<Omit<PromptTemplate, 'id' | 'version'>>;

export type CategoryTemplates = {
  [K in PromptCategory]: PromptTemplate[];
};

// Configuration and constants
export const PROMPT_LIBRARY_VERSION = '1.0.0';
export const MAX_TEMPLATE_SIZE = 50000; // characters
export const MAX_CONTEXT_SIZE = 10000; // characters
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 4096;

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;
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
] as const;

export type SupportedFramework = typeof SUPPORTED_FRAMEWORKS[number];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];