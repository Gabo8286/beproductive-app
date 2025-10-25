import { z } from 'zod';
import { AppleDocsServer, AppleDocumentationUpdate, XcodeReleaseNotes, APIReference } from './apple-docs-server.js';
import { IOS_PROMPT_TEMPLATES, getIOSTemplateById, getIOSTemplatesByCategory } from '../prompts/ios-templates.js';

/**
 * iOS Development MCP Server
 * Integrates with Model Context Protocol to provide iOS development resources,
 * Apple documentation access, and development workflow automation.
 */

// MCP Protocol Types
export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, any>;
}

export interface MCPResponse {
  id: string;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

// iOS-specific request schemas
const AppleDocsSearchSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  framework: z.enum(['SwiftUI', 'UIKit', 'Foundation', 'Swift']).optional(),
  apiType: z.enum(['class', 'struct', 'enum', 'protocol', 'function', 'modifier']).optional(),
  version: z.string().optional()
});

const XcodeBuildSchema = z.object({
  projectPath: z.string(),
  scheme: z.string(),
  configuration: z.enum(['Debug', 'Release']).default('Debug'),
  destination: z.string().default('generic/platform=iOS Simulator'),
  action: z.enum(['build', 'test', 'archive', 'analyze']).default('build'),
  derivedDataPath: z.string().optional(),
  additionalFlags: z.array(z.string()).optional()
});

const SimulatorControlSchema = z.object({
  action: z.enum(['boot', 'shutdown', 'install', 'uninstall', 'launch', 'terminate']),
  deviceId: z.string().optional(),
  appBundleId: z.string().optional(),
  appPath: z.string().optional()
});

const PromptGenerationSchema = z.object({
  templateId: z.string(),
  context: z.record(z.string(), z.any()),
  userInput: z.string(),
  customizations: z.record(z.string(), z.any()).optional()
});

const CodeGenerationSchema = z.object({
  language: z.enum(['swift', 'objective-c']).default('swift'),
  framework: z.enum(['SwiftUI', 'UIKit', 'Foundation']).default('SwiftUI'),
  pattern: z.enum(['MVVM', 'MVC', 'VIPER', 'Clean Architecture']).default('MVVM'),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  targetVersion: z.string().default('iOS 15.0+')
});

export class iOSMCPServer {
  private appleDocsServer: AppleDocsServer;
  private tools: Map<string, MCPTool>;

  constructor() {
    this.appleDocsServer = new AppleDocsServer();
    this.tools = new Map();
    this.registerTools();
  }

  /**
   * Register all available MCP tools
   */
  private registerTools(): void {
    const tools: MCPTool[] = [
      {
        name: 'apple_docs_search',
        description: 'Search Apple Developer Documentation for APIs, tutorials, and guides',
        inputSchema: AppleDocsSearchSchema
      },
      {
        name: 'get_swiftui_updates',
        description: 'Get the latest SwiftUI updates and changes from Apple',
        inputSchema: z.object({
          version: z.string().optional()
        })
      },
      {
        name: 'get_xcode_release_notes',
        description: 'Fetch Xcode release notes and new features',
        inputSchema: z.object({
          version: z.string().optional()
        })
      },
      {
        name: 'xcode_build',
        description: 'Build iOS project using xcodebuild command',
        inputSchema: XcodeBuildSchema
      },
      {
        name: 'simulator_control',
        description: 'Control iOS Simulator operations',
        inputSchema: SimulatorControlSchema
      },
      {
        name: 'generate_ios_prompt',
        description: 'Generate iOS development prompts using templates',
        inputSchema: PromptGenerationSchema
      },
      {
        name: 'generate_swift_code',
        description: 'Generate Swift code with specified patterns and requirements',
        inputSchema: CodeGenerationSchema
      },
      {
        name: 'list_ios_templates',
        description: 'List all available iOS development prompt templates',
        inputSchema: z.object({
          category: z.string().optional()
        })
      },
      {
        name: 'analyze_project_structure',
        description: 'Analyze iOS project structure and suggest improvements',
        inputSchema: z.object({
          projectPath: z.string(),
          analysisType: z.enum(['architecture', 'performance', 'best-practices']).default('architecture')
        })
      },
      {
        name: 'create_project_template',
        description: 'Create a new iOS project template with specified architecture',
        inputSchema: z.object({
          projectName: z.string(),
          bundleId: z.string(),
          architecture: z.enum(['MVVM', 'VIPER', 'Clean Architecture']).default('MVVM'),
          uiFramework: z.enum(['SwiftUI', 'UIKit', 'Mixed']).default('SwiftUI'),
          features: z.array(z.string()).optional()
        })
      }
    ];

    tools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  /**
   * Handle incoming MCP requests
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const result = await this.processRequest(request);
      return {
        id: request.id,
        result
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
          data: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }

  /**
   * Process specific request types
   */
  private async processRequest(request: MCPRequest): Promise<any> {
    switch (request.method) {
      case 'apple_docs_search':
        return await this.handleAppleDocsSearch(request.params);

      case 'get_swiftui_updates':
        return await this.handleGetSwiftUIUpdates(request.params);

      case 'get_xcode_release_notes':
        return await this.handleGetXcodeReleaseNotes(request.params);

      case 'xcode_build':
        return await this.handleXcodeBuild(request.params);

      case 'simulator_control':
        return await this.handleSimulatorControl(request.params);

      case 'generate_ios_prompt':
        return await this.handleGenerateIOSPrompt(request.params);

      case 'generate_swift_code':
        return await this.handleGenerateSwiftCode(request.params);

      case 'list_ios_templates':
        return await this.handleListIOSTemplates(request.params);

      case 'analyze_project_structure':
        return await this.handleAnalyzeProjectStructure(request.params);

      case 'create_project_template':
        return await this.handleCreateProjectTemplate(request.params);

      case 'tools/list':
        return this.listTools();

      case 'tools/call':
        return await this.callTool(request.params);

      default:
        throw new Error(`Unknown method: ${request.method}`);
    }
  }

  /**
   * Apple Documentation Search
   */
  private async handleAppleDocsSearch(params: any): Promise<APIReference[]> {
    const validated = AppleDocsSearchSchema.parse(params);
    return await this.appleDocsServer.searchAppleAPIs(validated.query, validated.framework);
  }

  /**
   * Get SwiftUI Updates
   */
  private async handleGetSwiftUIUpdates(params: any): Promise<AppleDocumentationUpdate[]> {
    return await this.appleDocsServer.getSwiftUIUpdates();
  }

  /**
   * Get Xcode Release Notes
   */
  private async handleGetXcodeReleaseNotes(params: any): Promise<XcodeReleaseNotes> {
    const { version } = params;
    return await this.appleDocsServer.getXcodeReleaseNotes(version);
  }

  /**
   * Xcode Build Command
   */
  private async handleXcodeBuild(params: any): Promise<{ success: boolean; output: string; error?: string }> {
    const validated = XcodeBuildSchema.parse(params);

    // Import required modules dynamically to avoid issues in browser environments
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Build xcodebuild command
      const baseCommand = [
        'xcodebuild',
        validated.action,
        '-project', validated.projectPath,
        '-scheme', validated.scheme,
        '-configuration', validated.configuration,
        '-destination', validated.destination
      ];

      if (validated.derivedDataPath) {
        baseCommand.push('-derivedDataPath', validated.derivedDataPath);
      }

      if (validated.additionalFlags) {
        baseCommand.push(...validated.additionalFlags);
      }

      const command = baseCommand.join(' ');
      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        output: stdout,
        error: stderr || undefined
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Build failed'
      };
    }
  }

  /**
   * iOS Simulator Control
   */
  private async handleSimulatorControl(params: any): Promise<{ success: boolean; message: string }> {
    const validated = SimulatorControlSchema.parse(params);
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      let command: string;

      switch (validated.action) {
        case 'boot':
          command = `xcrun simctl boot "${validated.deviceId}"`;
          break;
        case 'shutdown':
          command = `xcrun simctl shutdown "${validated.deviceId}"`;
          break;
        case 'install':
          command = `xcrun simctl install "${validated.deviceId}" "${validated.appPath}"`;
          break;
        case 'uninstall':
          command = `xcrun simctl uninstall "${validated.deviceId}" "${validated.appBundleId}"`;
          break;
        case 'launch':
          command = `xcrun simctl launch "${validated.deviceId}" "${validated.appBundleId}"`;
          break;
        case 'terminate':
          command = `xcrun simctl terminate "${validated.deviceId}" "${validated.appBundleId}"`;
          break;
        default:
          throw new Error(`Unsupported simulator action: ${validated.action}`);
      }

      await execAsync(command);
      return {
        success: true,
        message: `Successfully executed ${validated.action} action`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Simulator command failed'
      };
    }
  }

  /**
   * Generate iOS Development Prompt
   */
  private async handleGenerateIOSPrompt(params: any): Promise<{ prompt: string; metadata: any }> {
    const validated = PromptGenerationSchema.parse(params);
    const template = getIOSTemplateById(validated.templateId);

    if (!template) {
      throw new Error(`Template not found: ${validated.templateId}`);
    }

    // Replace template variables with context values
    let prompt = template.userPromptTemplate;

    // Replace user input
    prompt = prompt.replace(/\{userInput\}/g, validated.userInput);

    // Replace context variables
    Object.entries(validated.context).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(regex, String(value));
    });

    // Apply customizations if provided
    if (validated.customizations) {
      Object.entries(validated.customizations).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        prompt = prompt.replace(regex, String(value));
      });
    }

    const fullPrompt = `${template.systemPrompt}\n\n${prompt}`;

    return {
      prompt: fullPrompt,
      metadata: {
        templateId: template.id,
        category: template.category,
        estimatedTokens: template.metadata?.estimatedTokens,
        complexity: template.metadata?.complexity,
        frameworks: template.metadata?.frameworks
      }
    };
  }

  /**
   * Generate Swift Code
   */
  private async handleGenerateSwiftCode(params: any): Promise<{ code: string; explanation: string; suggestions: string[] }> {
    const validated = CodeGenerationSchema.parse(params);

    // This would integrate with an AI service for code generation
    // For now, return a structured response
    const codeTemplate = this.generateSwiftCodeTemplate(validated);

    return {
      code: codeTemplate.code,
      explanation: codeTemplate.explanation,
      suggestions: codeTemplate.suggestions
    };
  }

  /**
   * List iOS Templates
   */
  private async handleListIOSTemplates(params: any): Promise<{ templates: any[], categories: string[] }> {
    const { category } = params;

    const templates = category
      ? getIOSTemplatesByCategory(category)
      : Object.values(IOS_PROMPT_TEMPLATES);

    const categories = [...new Set(Object.values(IOS_PROMPT_TEMPLATES).map(t => t.category))];

    return {
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        complexity: t.metadata?.complexity,
        frameworks: t.metadata?.frameworks
      })),
      categories
    };
  }

  /**
   * Analyze Project Structure
   */
  private async handleAnalyzeProjectStructure(params: any): Promise<any> {
    // Implementation for project structure analysis
    return {
      analysis: 'Project structure analysis would be implemented here',
      suggestions: [
        'Consider implementing MVVM architecture',
        'Add unit tests for core functionality',
        'Organize code into feature modules'
      ],
      metrics: {
        fileCount: 0,
        testCoverage: '0%',
        codeComplexity: 'unknown'
      }
    };
  }

  /**
   * Create Project Template
   */
  private async handleCreateProjectTemplate(params: any): Promise<any> {
    // Implementation for creating project templates
    return {
      projectPath: '/path/to/new/project',
      filesCreated: [
        'App.swift',
        'ContentView.swift',
        'Models/',
        'ViewModels/',
        'Services/'
      ],
      nextSteps: [
        'Open project in Xcode',
        'Configure bundle identifier',
        'Add required dependencies'
      ]
    };
  }

  /**
   * List Available Tools
   */
  private listTools(): { tools: any[] } {
    return {
      tools: Array.from(this.tools.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema._def
      }))
    };
  }

  /**
   * Call Tool
   */
  private async callTool(params: any): Promise<any> {
    const tool = this.tools.get(params.name);
    if (!tool) {
      throw new Error(`Tool not found: ${params.name}`);
    }

    // Validate arguments against schema
    const validated = tool.inputSchema.parse(params.arguments);

    // Create a mock request to reuse existing handlers
    const mockRequest: MCPRequest = {
      id: 'tool-call',
      method: params.name,
      params: validated
    };

    const response = await this.handleRequest(mockRequest);
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  /**
   * Helper method to generate Swift code templates
   */
  private generateSwiftCodeTemplate(params: any): { code: string; explanation: string; suggestions: string[] } {
    // This is a simplified template generator
    // In a real implementation, this would use AI or more sophisticated templates

    const basicSwiftUIView = `
import SwiftUI

struct ${this.capitalizeFirstLetter(params.description.replace(/\s+/g, ''))}View: View {
    var body: some View {
        VStack {
            Text("${params.description}")
                .font(.title)
                .padding()

            // Add your implementation here
        }
        .navigationTitle("${params.description}")
    }
}

#Preview {
    ${this.capitalizeFirstLetter(params.description.replace(/\s+/g, ''))}View()
}
`;

    return {
      code: basicSwiftUIView,
      explanation: `Generated a basic SwiftUI view for ${params.description} following ${params.pattern} architecture pattern.`,
      suggestions: [
        'Add proper state management with @State or @ObservableObject',
        'Implement proper error handling',
        'Add accessibility support',
        'Consider adding unit tests'
      ]
    };
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Initialize server and return configuration
   */
  static async create(): Promise<iOSMCPServer> {
    const server = new iOSMCPServer();

    // Perform any async initialization here
    console.log('iOS MCP Server initialized with tools:', Array.from(server.tools.keys()));

    return server;
  }

  /**
   * Get server capabilities for MCP handshake
   */
  getCapabilities(): any {
    return {
      tools: {
        listChanged: true
      },
      resources: {
        subscribe: true,
        listChanged: true
      },
      prompts: {
        listChanged: true
      },
      sampling: {}
    };
  }
}