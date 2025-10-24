import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP (Model Context Protocol) Service
 *
 * Integrates with the claude-multi-ai MCP and existing MCP integration script
 * Provides AI-powered testing, analysis, and automation capabilities
 */
export class MCPService {
    constructor() {
        this.mcpConnection = null;
        this.scriptsPath = this.findScriptsPath();
        this.isConnected = false;
        this.messageQueue = [];
        this.requestCounter = 0;
    }

    async initialize() {
        console.log('🤖 Initializing MCP Service...');

        try {
            // Verify MCP integration script exists
            if (!this.scriptsPath) {
                throw new Error('MCP integration scripts not found');
            }

            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');
            if (!fs.existsSync(mcpScript)) {
                throw new Error(`MCP integration script not found: ${mcpScript}`);
            }

            // Test MCP availability
            await this.testMCPConnection();

            console.log(`📁 Scripts path: ${this.scriptsPath}`);
            console.log('✅ MCP Service initialized');

            return { success: true };
        } catch (error) {
            console.error('❌ MCP Service initialization failed:', error);
            // Don't throw - allow app to start without MCP
            return { success: false, error: error.message };
        }
    }

    findScriptsPath() {
        // Look for the scripts directory relative to the electron app
        const possiblePaths = [
            path.join(__dirname, '../../../scripts'),
            path.join(__dirname, '../../scripts'),
            path.join(__dirname, '../scripts'),
            path.join(process.cwd(), 'scripts'),
            path.join(process.cwd(), '../scripts')
        ];

        for (const scriptsPath of possiblePaths) {
            if (fs.existsSync(scriptsPath)) {
                const testFile = path.join(scriptsPath, 'mcp-integration.js');
                if (fs.existsSync(testFile)) {
                    return scriptsPath;
                }
            }
        }

        return null;
    }

    async testMCPConnection() {
        try {
            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');
            const testCommand = `node "${mcpScript}" test`;

            const result = execSync(testCommand, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 5000
            });

            console.log('MCP Connection Test:', result);
            return { success: true, output: result };
        } catch (error) {
            console.warn('MCP connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendMessage(message, options = {}) {
        console.log('💬 Sending message to Claude via MCP...');

        const requestId = ++this.requestCounter;
        const defaultOptions = {
            provider: 'anthropic',
            model: 'claude-3-sonnet',
            maxTokens: 4000,
            ...options
        };

        try {
            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');

            // Prepare message data
            const messageData = {
                id: requestId,
                message: message,
                options: defaultOptions,
                timestamp: Date.now()
            };

            // Save message to temp file for complex data passing
            const tempFile = path.join(this.scriptsPath, `temp_message_${requestId}.json`);
            fs.writeFileSync(tempFile, JSON.stringify(messageData, null, 2));

            const command = `node "${mcpScript}" message "${tempFile}"`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 30000 // 30 seconds for AI response
            });

            // Clean up temp file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            const response = JSON.parse(result);

            console.log('✅ Claude response received');

            return {
                success: true,
                response: response.message || response.content || response,
                provider: response.provider,
                model: response.model,
                usage: response.usage,
                requestId
            };

        } catch (error) {
            console.error('❌ MCP message failed:', error);
            return {
                success: false,
                error: error.message,
                requestId
            };
        }
    }

    async generateTest(prompt, options = {}) {
        console.log('🧪 Generating test with AI...');

        const enhancedPrompt = `Generate comprehensive test code based on this request:

${prompt}

Requirements:
- Use modern testing frameworks (Playwright, Vitest, Jest)
- Include both unit and integration tests
- Add accessibility checks
- Include mobile/responsive testing
- Generate TypeScript/JavaScript code
- Add clear comments and documentation

Return the test code in a structured format with explanations.`;

        try {
            const response = await this.sendMessage(enhancedPrompt, {
                ...options,
                context: 'test_generation'
            });

            if (response.success) {
                // Parse and structure the test code
                const testData = this.parseTestResponse(response.response);

                return {
                    success: true,
                    testCode: testData.code,
                    framework: testData.framework,
                    description: testData.description,
                    instructions: testData.instructions,
                    requestId: response.requestId
                };
            } else {
                return response;
            }

        } catch (error) {
            console.error('❌ Test generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    parseTestResponse(response) {
        // Extract code blocks and metadata from AI response
        const codeBlocks = response.match(/```[\s\S]*?```/g) || [];
        const code = codeBlocks.map(block => block.replace(/```\w*\n?|\n?```/g, '')).join('\n\n');

        // Detect framework
        let framework = 'playwright';
        if (response.includes('vitest') || response.includes('describe(')) {
            framework = 'vitest';
        } else if (response.includes('jest')) {
            framework = 'jest';
        }

        return {
            code: code || response,
            framework,
            description: this.extractDescription(response),
            instructions: this.extractInstructions(response)
        };
    }

    extractDescription(text) {
        const lines = text.split('\n');
        const descLines = lines.filter(line =>
            line.includes('This test') ||
            line.includes('The test') ||
            line.includes('Description:')
        );
        return descLines.join(' ').substring(0, 200);
    }

    extractInstructions(text) {
        const lines = text.split('\n');
        const instructionLines = lines.filter(line =>
            line.includes('To run') ||
            line.includes('Execute') ||
            line.includes('npm') ||
            line.includes('Usage:')
        );
        return instructionLines.join('\n');
    }

    async analyzeImage(imagePath, analysisType = 'ui_review') {
        console.log('🖼️ Analyzing image with AI...');

        try {
            // Verify image exists
            if (!fs.existsSync(imagePath)) {
                throw new Error(`Image not found: ${imagePath}`);
            }

            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');

            // Prepare analysis request
            const analysisData = {
                imagePath: imagePath,
                analysisType: analysisType,
                timestamp: Date.now()
            };

            const tempFile = path.join(this.scriptsPath, `temp_analysis_${Date.now()}.json`);
            fs.writeFileSync(tempFile, JSON.stringify(analysisData, null, 2));

            const command = `node "${mcpScript}" analyze-image "${tempFile}"`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 45000 // 45 seconds for image analysis
            });

            // Clean up temp file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            const analysis = JSON.parse(result);

            console.log('✅ Image analysis complete');

            return {
                success: true,
                analysis: analysis.analysis || analysis,
                insights: analysis.insights || [],
                recommendations: analysis.recommendations || [],
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('❌ Image analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async generateTestPlan(applicationContext, options = {}) {
        console.log('📋 Generating comprehensive test plan...');

        const prompt = `Analyze this application context and create a comprehensive test plan:

${JSON.stringify(applicationContext, null, 2)}

Generate a detailed test strategy including:
1. Critical user journeys to test
2. Performance benchmarks and goals
3. Accessibility compliance requirements
4. Cross-browser compatibility matrix
5. Mobile/responsive testing scenarios
6. Security testing considerations
7. AI-powered testing recommendations

Provide specific test cases with priorities and expected outcomes.`;

        try {
            const response = await this.sendMessage(prompt, {
                ...options,
                context: 'test_planning',
                maxTokens: 6000
            });

            if (response.success) {
                const testPlan = this.parseTestPlan(response.response);

                return {
                    success: true,
                    testPlan: testPlan,
                    requestId: response.requestId
                };
            } else {
                return response;
            }

        } catch (error) {
            console.error('❌ Test plan generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    parseTestPlan(response) {
        // Structure the test plan response
        return {
            overview: this.extractSection(response, 'overview|summary'),
            criticalJourneys: this.extractSection(response, 'critical|journey|user flow'),
            performance: this.extractSection(response, 'performance|benchmark'),
            accessibility: this.extractSection(response, 'accessibility|a11y|wcag'),
            compatibility: this.extractSection(response, 'compatibility|browser|cross-browser'),
            mobile: this.extractSection(response, 'mobile|responsive'),
            security: this.extractSection(response, 'security'),
            aiRecommendations: this.extractSection(response, 'ai|recommendation|automation'),
            fullResponse: response
        };
    }

    extractSection(text, keywords) {
        const lines = text.split('\n');
        const keywordRegex = new RegExp(keywords, 'i');

        const relevantLines = lines.filter(line =>
            keywordRegex.test(line) || line.match(/^\d+\.|\-\s+/)
        );

        return relevantLines.join('\n').substring(0, 500);
    }

    async getAIProviderStatus() {
        try {
            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');
            const command = `node "${mcpScript}" status`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 5000
            });

            const status = JSON.parse(result);

            return {
                success: true,
                providers: status.providers || [],
                activeProvider: status.activeProvider,
                health: status.health || 'unknown'
            };

        } catch (error) {
            console.error('❌ Failed to get AI provider status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async optimizeProvider(preferences = {}) {
        console.log('⚡ Optimizing AI provider selection...');

        try {
            const mcpScript = path.join(this.scriptsPath, 'mcp-integration.js');

            const optimizationData = {
                preferences: {
                    speed: preferences.speed || 'balanced',
                    cost: preferences.cost || 'balanced',
                    quality: preferences.quality || 'high',
                    ...preferences
                },
                timestamp: Date.now()
            };

            const tempFile = path.join(this.scriptsPath, `temp_optimization_${Date.now()}.json`);
            fs.writeFileSync(tempFile, JSON.stringify(optimizationData, null, 2));

            const command = `node "${mcpScript}" optimize "${tempFile}"`;

            const result = execSync(command, {
                cwd: this.scriptsPath,
                encoding: 'utf8',
                timeout: 10000
            });

            // Clean up temp file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            const optimization = JSON.parse(result);

            console.log('✅ Provider optimization complete');

            return {
                success: true,
                recommendation: optimization.recommendation,
                rationale: optimization.rationale,
                estimatedSavings: optimization.estimatedSavings
            };

        } catch (error) {
            console.error('❌ Provider optimization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Cleanup method
    async cleanup() {
        console.log('🧹 Cleaning up MCP Service...');

        if (this.mcpConnection) {
            this.mcpConnection.close();
        }

        // Clean up any temp files
        if (this.scriptsPath) {
            const tempFiles = fs.readdirSync(this.scriptsPath).filter(file =>
                file.startsWith('temp_') && file.endsWith('.json')
            );

            for (const file of tempFiles) {
                try {
                    fs.unlinkSync(path.join(this.scriptsPath, file));
                } catch (error) {
                    console.warn(`Failed to clean temp file ${file}:`, error.message);
                }
            }
        }

        console.log('✅ MCP Service cleanup complete');
    }
}