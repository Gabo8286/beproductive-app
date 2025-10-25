#!/usr/bin/env node

/**
 * iOS Development MCP Server Entry Point
 *
 * This server provides iOS development resources, Apple documentation access,
 * and development workflow automation through the Model Context Protocol.
 *
 * Integration with claude-multi-ai system for enhanced AI-assisted iOS development.
 */

import { iOSMCPServer } from './ios-mcp-server.js';
import { AppleDocsServer } from './apple-docs-server.js';

interface ServerConfig {
  port?: number;
  host?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  appleDocsCache?: boolean;
  xcodeToolsPath?: string;
}

class iOSMCPServerRunner {
  private server?: iOSMCPServer;
  private config: ServerConfig;

  constructor(config: ServerConfig = {}) {
    this.config = {
      port: 3001,
      host: 'localhost',
      logLevel: 'info',
      appleDocsCache: true,
      ...config
    };
  }

  async start(): Promise<void> {
    try {
      this.log('info', 'Starting iOS Development MCP Server...');

      // Initialize the MCP server
      this.server = await iOSMCPServer.create();

      // Setup MCP transport (stdio for claude-multi-ai integration)
      this.setupStdioTransport();

      this.log('info', `iOS MCP Server started successfully`);
      this.log('info', `Available tools: ${await this.getAvailableToolsList()}`);

    } catch (error) {
      this.log('error', `Failed to start server: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  }

  private setupStdioTransport(): void {
    // Handle MCP requests from stdin
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.toString().trim());
        const response = await this.server!.handleRequest(request);

        // Send response to stdout for claude-multi-ai
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        const errorResponse = {
          id: 'unknown',
          error: {
            code: -32700,
            message: 'Parse error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('info', 'Received SIGINT, shutting down gracefully...');
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.log('info', 'Received SIGTERM, shutting down gracefully...');
      this.stop();
    });
  }

  private async getAvailableToolsList(): Promise<string> {
    if (!this.server) return 'No tools available';

    const toolsResponse = await this.server.handleRequest({
      id: 'tools-list',
      method: 'tools/list',
      params: {}
    });

    if (toolsResponse.result?.tools) {
      return toolsResponse.result.tools.map((tool: any) => tool.name).join(', ');
    }

    return 'Unable to list tools';
  }

  stop(): void {
    this.log('info', 'iOS MCP Server stopped');
    process.exit(0);
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    if (this.shouldLog(level)) {
      console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.logLevel || 'info');
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }
}

// CLI Integration for claude-multi-ai
class ClaudeMultiAIIntegration {
  /**
   * Register this MCP server with claude-multi-ai
   */
  static async registerWithClaudeMultiAI(): Promise<void> {
    const { spawn } = await import('child_process');
    const path = await import('path');

    const claudeMultiAIPath = '/Users/gabrielsotomorales/.local/bin/claude-multi-ai';
    const serverPath = path.join(__dirname, 'index.js');

    // Register iOS MCP server
    const registerProcess = spawn(claudeMultiAIPath, [
      '--add-mcp-server',
      'ios-development',
      '--server-path',
      serverPath,
      '--description',
      'iOS Development resources with Apple documentation and Xcode automation'
    ], {
      stdio: 'inherit'
    });

    return new Promise((resolve, reject) => {
      registerProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Successfully registered iOS MCP server with claude-multi-ai');
          resolve();
        } else {
          reject(new Error(`Registration failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Load iOS prompt templates into claude-multi-ai
   */
  static async loadPromptTemplates(): Promise<void> {
    const { spawn } = await import('child_process');
    const path = await import('path');

    const claudeMultiAIPath = '/Users/gabrielsotomorales/.local/bin/claude-multi-ai';
    const templatesPath = path.join(__dirname, '..', 'prompts', 'ios-templates.js');

    const loadProcess = spawn(claudeMultiAIPath, [
      '--load-prompts',
      templatesPath,
      '--category',
      'ios-development'
    ], {
      stdio: 'inherit'
    });

    return new Promise((resolve, reject) => {
      loadProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Successfully loaded iOS prompt templates');
          resolve();
        } else {
          reject(new Error(`Template loading failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Configure Apple documentation integration
   */
  static async configureAppleDocsIntegration(): Promise<void> {
    const { spawn } = await import('child_process');

    const claudeMultiAIPath = '/Users/gabrielsotomorales/.local/bin/claude-multi-ai';

    const configProcess = spawn(claudeMultiAIPath, [
      '--configure',
      'apple-docs-integration',
      '--enable-live-docs',
      'true',
      '--cache-duration',
      '3600'
    ], {
      stdio: 'inherit'
    });

    return new Promise((resolve, reject) => {
      configProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Successfully configured Apple documentation integration');
          resolve();
        } else {
          reject(new Error(`Apple docs configuration failed with code ${code}`));
        }
      });
    });
  }
}

// Command-line interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
    case undefined:
      // Start the MCP server
      const server = new iOSMCPServerRunner({
        logLevel: args.includes('--debug') ? 'debug' : 'info'
      });
      await server.start();
      break;

    case 'register':
      // Register with claude-multi-ai
      try {
        await ClaudeMultiAIIntegration.registerWithClaudeMultiAI();
        await ClaudeMultiAIIntegration.loadPromptTemplates();
        await ClaudeMultiAIIntegration.configureAppleDocsIntegration();
        console.log('🎉 iOS Development MCP integration completed successfully!');
      } catch (error) {
        console.error('❌ Integration failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
      break;

    case 'test':
      // Test Apple documentation access
      console.log('🔍 Testing Apple documentation access...');
      const appleDocsServer = new AppleDocsServer();

      try {
        const swiftUIUpdates = await appleDocsServer.getSwiftUIUpdates();
        console.log(`✅ Successfully fetched ${swiftUIUpdates.length} SwiftUI updates`);

        const xcodeNotes = await appleDocsServer.getXcodeReleaseNotes();
        console.log(`✅ Successfully fetched Xcode ${xcodeNotes.version} release notes`);

        const apiResults = await appleDocsServer.searchAppleAPIs('Button', 'SwiftUI');
        console.log(`✅ Successfully searched APIs, found ${apiResults.length} results`);

        console.log('🎉 All tests passed!');
      } catch (error) {
        console.error('❌ Test failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
      break;

    case 'help':
      console.log(`
iOS Development MCP Server

Usage: node index.js [command] [options]

Commands:
  start       Start the MCP server (default)
  register    Register with claude-multi-ai system
  test        Test Apple documentation access
  help        Show this help message

Options:
  --debug     Enable debug logging

Examples:
  node index.js start --debug
  node index.js register
  node index.js test

For more information, visit: https://github.com/spark-bloom-flow/ios-development-mcp
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node index.js help" for usage information');
      process.exit(1);
  }
}

// Export for programmatic use
export { iOSMCPServerRunner, ClaudeMultiAIIntegration };

// CLI execution
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}