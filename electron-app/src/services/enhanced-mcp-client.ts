import { Project } from './project-manager';

export interface MCPRequest {
  id: string;
  type: 'code_generation' | 'code_review' | 'documentation' | 'debugging' | 'architecture' | 'testing';
  prompt: string;
  context?: {
    project?: Project;
    files?: string[];
    codeSnippet?: string;
    language?: string;
    framework?: string;
  };
  options?: {
    model?: 'claude' | 'gpt4' | 'gemini' | 'local';
    maxTokens?: number;
    temperature?: number;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface MCPResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    provider: string;
    model: string;
    tokens: number;
    cost: number;
  };
  metadata?: {
    responseTime: number;
    confidence: number;
    suggestions?: string[];
  };
}

export interface CodeGenerationTask {
  type: 'component' | 'function' | 'class' | 'api' | 'test' | 'documentation';
  description: string;
  language: string;
  framework?: string;
  dependencies?: string[];
  examples?: string[];
}

export interface CodeReviewTask {
  code: string;
  language: string;
  focusAreas: ('security' | 'performance' | 'maintainability' | 'style' | 'bugs')[];
  severity: 'low' | 'medium' | 'high';
}

export class EnhancedMCPClient {
  private baseUrl: string;
  private apiKey?: string;
  private requestQueue: MCPRequest[] = [];
  private isProcessing = false;
  private routingRules: Map<string, string> = new Map();

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.setupRoutingRules();
  }

  private setupRoutingRules() {
    // Define which AI provider to use for different task types
    this.routingRules.set('code_generation', 'claude'); // Claude for complex code generation
    this.routingRules.set('code_review', 'gpt4'); // GPT-4 for detailed code review
    this.routingRules.set('documentation', 'claude'); // Claude for documentation
    this.routingRules.set('debugging', 'gpt4'); // GPT-4 for debugging
    this.routingRules.set('architecture', 'claude'); // Claude for system design
    this.routingRules.set('testing', 'gemini'); // Gemini for test generation
  }

  // Enhanced Code Generation
  async generateCode(task: CodeGenerationTask, project?: Project): Promise<MCPResponse> {
    const contextualPrompt = this.buildContextualPrompt(task, project);

    const request: MCPRequest = {
      id: `code_gen_${Date.now()}`,
      type: 'code_generation',
      prompt: contextualPrompt,
      context: {
        project,
        language: task.language,
        framework: task.framework
      },
      options: {
        model: this.routingRules.get('code_generation') as any,
        maxTokens: 4000,
        temperature: 0.7
      }
    };

    return await this.processRequest(request);
  }

  // Intelligent Code Review
  async reviewCode(task: CodeReviewTask, project?: Project): Promise<MCPResponse> {
    const reviewPrompt = this.buildCodeReviewPrompt(task, project);

    const request: MCPRequest = {
      id: `code_review_${Date.now()}`,
      type: 'code_review',
      prompt: reviewPrompt,
      context: {
        project,
        codeSnippet: task.code,
        language: task.language
      },
      options: {
        model: this.routingRules.get('code_review') as any,
        maxTokens: 3000,
        temperature: 0.3
      }
    };

    return await this.processRequest(request);
  }

  // Documentation Generation
  async generateDocumentation(code: string, language: string, project?: Project): Promise<MCPResponse> {
    const docPrompt = `Generate comprehensive documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Please include:
1. Purpose and functionality
2. Parameters and return values
3. Usage examples
4. Dependencies and requirements
5. Performance considerations
6. Error handling

${project ? `Context: This is part of a ${project.type} project using ${project.framework}.` : ''}

Format the documentation in Markdown.`;

    const request: MCPRequest = {
      id: `docs_${Date.now()}`,
      type: 'documentation',
      prompt: docPrompt,
      context: {
        project,
        codeSnippet: code,
        language
      },
      options: {
        model: this.routingRules.get('documentation') as any,
        maxTokens: 2500
      }
    };

    return await this.processRequest(request);
  }

  // Architecture Design Assistance
  async designArchitecture(requirements: string, project?: Project): Promise<MCPResponse> {
    const archPrompt = `Design a software architecture for the following requirements:

${requirements}

${project ? `
Current project context:
- Type: ${project.type}
- Framework: ${project.framework}
- Dependencies: ${project.dependencies?.slice(0, 10).join(', ')}
` : ''}

Please provide:
1. High-level architecture diagram (ASCII or Mermaid)
2. Component breakdown and responsibilities
3. Data flow and interactions
4. Technology recommendations
5. Scalability considerations
6. Security implications
7. Implementation roadmap

Format the response with clear sections and code examples where appropriate.`;

    const request: MCPRequest = {
      id: `arch_${Date.now()}`,
      type: 'architecture',
      prompt: archPrompt,
      context: { project },
      options: {
        model: this.routingRules.get('architecture') as any,
        maxTokens: 5000,
        temperature: 0.6
      }
    };

    return await this.processRequest(request);
  }

  // Debugging Assistant
  async debugCode(error: string, code: string, language: string, project?: Project): Promise<MCPResponse> {
    const debugPrompt = `Help debug this ${language} code with the following error:

Error: ${error}

Code:
\`\`\`${language}
${code}
\`\`\`

${project ? `Project context: ${project.type} using ${project.framework}` : ''}

Please provide:
1. Root cause analysis
2. Step-by-step debugging approach
3. Potential fixes with code examples
4. Prevention strategies
5. Related issues to watch for

Focus on practical solutions and best practices.`;

    const request: MCPRequest = {
      id: `debug_${Date.now()}`,
      type: 'debugging',
      prompt: debugPrompt,
      context: {
        project,
        codeSnippet: code,
        language
      },
      options: {
        model: this.routingRules.get('debugging') as any,
        maxTokens: 3500,
        temperature: 0.4
      }
    };

    return await this.processRequest(request);
  }

  // Test Generation
  async generateTests(code: string, language: string, framework?: string, project?: Project): Promise<MCPResponse> {
    const testPrompt = `Generate comprehensive tests for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

${framework ? `Using ${framework} testing framework.` : ''}

Please generate:
1. Unit tests covering all functions/methods
2. Integration tests for component interactions
3. Edge cases and error scenarios
4. Performance tests if applicable
5. Mock data and fixtures

${project ? `Project context: ${project.type} project` : ''}

Include setup/teardown code and test utilities as needed.`;

    const request: MCPRequest = {
      id: `test_${Date.now()}`,
      type: 'testing',
      prompt: testPrompt,
      context: {
        project,
        codeSnippet: code,
        language,
        framework
      },
      options: {
        model: this.routingRules.get('testing') as any,
        maxTokens: 4000,
        temperature: 0.5
      }
    };

    return await this.processRequest(request);
  }

  // Smart Model Selection
  private selectOptimalModel(request: MCPRequest): string {
    const { type, context, options } = request;

    // Override if explicitly specified
    if (options?.model) {
      return options.model;
    }

    // Complex code generation: Use Claude
    if (type === 'code_generation' && context?.framework) {
      return 'claude';
    }

    // Quick code review: Use GPT-4
    if (type === 'code_review' && options?.priority === 'high') {
      return 'gpt4';
    }

    // Documentation: Use Claude for better structure
    if (type === 'documentation') {
      return 'claude';
    }

    // Debugging: Use GPT-4 for detailed analysis
    if (type === 'debugging') {
      return 'gpt4';
    }

    // Use default routing rule
    return this.routingRules.get(type) || 'claude';
  }

  // Cost Optimization
  private estimateCost(request: MCPRequest): number {
    const model = this.selectOptimalModel(request);
    const tokenEstimate = request.options?.maxTokens || 2000;

    // Simplified cost estimation (per 1K tokens)
    const costs = {
      claude: 0.008,
      gpt4: 0.012,
      gemini: 0.004,
      local: 0.000
    };

    return (tokenEstimate / 1000) * (costs[model as keyof typeof costs] || 0.008);
  }

  // Request Processing
  private async processRequest(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();

    try {
      // Select optimal model
      const selectedModel = this.selectOptimalModel(request);
      request.options = { ...request.options, model: selectedModel as any };

      // Estimate cost
      const estimatedCost = this.estimateCost(request);

      console.log(`Processing ${request.type} with ${selectedModel} (est. cost: $${estimatedCost.toFixed(4)})`);

      // Make request to MCP server
      const response = await fetch(`${this.baseUrl}/api/mcp/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.statusText}`);
      }

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        id: request.id,
        success: true,
        data: result.data,
        usage: {
          provider: selectedModel,
          model: result.model || selectedModel,
          tokens: result.usage?.tokens || 0,
          cost: result.usage?.cost || estimatedCost
        },
        metadata: {
          responseTime,
          confidence: result.confidence || 0.9,
          suggestions: result.suggestions
        }
      };

    } catch (error) {
      return {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          responseTime: Date.now() - startTime,
          confidence: 0
        }
      };
    }
  }

  // Helper Methods
  private buildContextualPrompt(task: CodeGenerationTask, project?: Project): string {
    let prompt = `Generate ${task.type} in ${task.language}`;

    if (task.framework) {
      prompt += ` using ${task.framework}`;
    }

    prompt += `:\n\n${task.description}\n\n`;

    if (project) {
      prompt += `Project Context:
- Type: ${project.type}
- Framework: ${project.framework}
- Package Manager: ${project.packageManager}
- Key Dependencies: ${project.dependencies?.slice(0, 5).join(', ')}

`;
    }

    if (task.dependencies?.length) {
      prompt += `Required Dependencies: ${task.dependencies.join(', ')}\n\n`;
    }

    if (task.examples?.length) {
      prompt += `Examples or References:\n${task.examples.join('\n')}\n\n`;
    }

    prompt += `Please provide:
1. Complete, production-ready code
2. Clear comments and documentation
3. Error handling where appropriate
4. TypeScript types if applicable
5. Usage examples

Ensure the code follows best practices and is optimized for maintainability.`;

    return prompt;
  }

  private buildCodeReviewPrompt(task: CodeReviewTask, project?: Project): string {
    let prompt = `Perform a ${task.severity} severity code review for this ${task.language} code:

\`\`\`${task.language}
${task.code}
\`\`\`

`;

    if (project) {
      prompt += `Project Context: ${project.type} using ${project.framework}\n\n`;
    }

    prompt += `Focus Areas: ${task.focusAreas.join(', ')}\n\n`;

    prompt += `Please analyze:
1. Code quality and style
2. Performance implications
3. Security vulnerabilities
4. Maintainability issues
5. Best practice violations
6. Potential bugs or edge cases

Provide specific suggestions with code examples for improvements.`;

    return prompt;
  }

  // Queue Management
  async addToQueue(request: MCPRequest): Promise<void> {
    this.requestQueue.push(request);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await this.processRequest(request);
      }
    }

    this.isProcessing = false;
  }

  // Configuration
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  updateRoutingRule(taskType: string, model: string): void {
    this.routingRules.set(taskType, model);
  }

  getUsageStats(): any {
    // Return usage statistics
    return {
      totalRequests: 0,
      totalCost: 0,
      averageResponseTime: 0,
      modelUsage: {}
    };
  }
}