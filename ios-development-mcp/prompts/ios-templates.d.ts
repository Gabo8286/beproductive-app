import { PromptTemplate } from '../types/prompt-library';
/**
 * Comprehensive iOS Development Prompt Templates
 * Based on the existing prompt structure from Spark Bloom Flow
 * Extends the luna prompt system with iOS-specific capabilities
 */
export declare const IOS_PROMPT_TEMPLATES: Record<string, PromptTemplate>;
export declare const IOS_TEMPLATE_CATEGORIES: {
    readonly 'swift-development': "Swift Development";
    readonly 'swiftui-development': "SwiftUI Development";
    readonly 'uikit-development': "UIKit Development";
    readonly 'xcode-tools': "Xcode Tools & Automation";
    readonly architecture: "Architecture & Patterns";
    readonly performance: "Performance Optimization";
    readonly testing: "Testing & Quality Assurance";
    readonly deployment: "Deployment & Distribution";
};
export declare const validateIOSTemplate: (template: PromptTemplate) => boolean;
export declare const getIOSTemplateById: (id: string) => PromptTemplate | undefined;
export declare const getIOSTemplatesByCategory: (category: string) => PromptTemplate[];
export declare const getAllIOSTemplates: () => PromptTemplate[];
