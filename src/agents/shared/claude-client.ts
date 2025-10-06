// Claude AI Client for Agents
export interface ClaudeResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AnalysisRequest {
  context: string;
  data: any;
  question: string;
  format?: 'json' | 'text';
}

export class ClaudeClient {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string, model = 'claude-3-haiku-20240307') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(request: AnalysisRequest): Promise<ClaudeResponse> {
    try {
      const prompt = this.buildPrompt(request);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude analysis failed:', error);
      throw error;
    }
  }

  private buildPrompt(request: AnalysisRequest): string {
    return `
Context: ${request.context}

Data to analyze:
${typeof request.data === 'string' ? request.data : JSON.stringify(request.data, null, 2)}

Question: ${request.question}

${request.format === 'json' ?
  'Please respond with valid JSON only.' :
  'Please provide a clear, actionable response.'
}
    `.trim();
  }

  // Specialized methods for common agent tasks
  async analyzeMetrics(metrics: any): Promise<{
    issues: string[];
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const response = await this.analyze({
      context: 'You are a system monitoring expert analyzing application metrics.',
      data: metrics,
      question: `
        Analyze these metrics and identify:
        1. Any performance issues or anomalies
        2. Specific recommendations for improvement
        3. Overall severity level (low/medium/high/critical)

        Focus on response times, error rates, resource usage, and trends.
      `,
      format: 'json',
    });

    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        issues: ['Analysis parsing failed'],
        recommendations: ['Check Claude response format'],
        severity: 'medium' as const,
      };
    }
  }

  async analyzeSecurityLogs(logs: any[]): Promise<{
    threats: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    summary: string;
  }> {
    const response = await this.analyze({
      context: 'You are a cybersecurity expert analyzing application security logs.',
      data: logs,
      question: `
        Analyze these security logs and identify:
        1. Potential security threats or suspicious patterns
        2. The severity of each threat
        3. Specific recommendations for mitigation
        4. A summary of overall security status
      `,
      format: 'json',
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        threats: [],
        summary: 'Security analysis parsing failed',
      };
    }
  }

  async generateIncidentResponse(incident: any): Promise<{
    diagnosis: string;
    steps: string[];
    escalation: boolean;
    estimated_resolution: string;
  }> {
    const response = await this.analyze({
      context: 'You are an SRE expert providing incident response guidance.',
      data: incident,
      question: `
        Based on this incident data, provide:
        1. A diagnosis of the root cause
        2. Step-by-step resolution steps
        3. Whether this requires human escalation
        4. Estimated time to resolution
      `,
      format: 'json',
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        diagnosis: 'Unable to analyze incident',
        steps: ['Manual investigation required'],
        escalation: true,
        estimated_resolution: 'Unknown',
      };
    }
  }
}