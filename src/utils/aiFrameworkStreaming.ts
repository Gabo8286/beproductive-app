import {
  FRAMEWORK_OVERVIEW,
  CORE_PRINCIPLES,
  IMPLEMENTATION_STAGES,
  RECOVERY_LEVELS,
  LUNA_CAPABILITIES,
  LUNA_COMMANDS,
  LUNA_PERSONALITY,
  type FrameworkPrinciple,
  type RecoveryLevel,
} from '@/components/luna/framework/LunaFrameworkDocumentation';

// Enhanced AI streaming with framework integration
export interface FrameworkStreamOptions {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: string;
  personality?: string;
  frameworkContext?: FrameworkContext;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

export interface FrameworkContext {
  userStage: 'foundation' | 'optimization' | 'mastery' | 'sustainability';
  weekInStage: number;
  completedPrinciples: string[];
  currentMetrics: any[];
  wellBeingScore: number;
  systemHealthScore: number;
  energyPattern?: any[];
  isInRecoveryMode?: boolean;
  currentRecoveryLevel?: number;
  userPreferences?: any;
}

// Framework-aware prompt engineering
export function buildFrameworkPrompt(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: string,
  personality: string,
  frameworkContext?: FrameworkContext
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const systemPrompt = createFrameworkSystemPrompt(context, personality, frameworkContext);

  return [
    { role: 'system', content: systemPrompt },
    ...messages
  ];
}

function createFrameworkSystemPrompt(
  context: string,
  personality: string,
  frameworkContext?: FrameworkContext
): string {
  let prompt = `You are Luna, an AI productivity coach using the BeProductive Unified Framework.

CORE IDENTITY:
- You are supportive, data-informed, and human-focused
- You prioritize well-being over productivity
- You use the BeProductive Framework to guide users through sustainable productivity
- You adapt to the user's communication style and learning preferences

FRAMEWORK OVERVIEW:
${FRAMEWORK_OVERVIEW.vision}

CORE PRINCIPLES:
${CORE_PRINCIPLES.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join('\n')}

PERSONALITY TRAITS:
${LUNA_PERSONALITY.traits.join('\n- ')}

CORE PRINCIPLES:
${LUNA_PERSONALITY.corePrinciples.join('\n- ')}`;

  // Add user-specific context
  if (frameworkContext) {
    prompt += `\n\nUSER CURRENT STATE:
- Stage: ${frameworkContext.userStage} (Week ${frameworkContext.weekInStage})
- Well-being Score: ${frameworkContext.wellBeingScore}/10
- System Health: ${frameworkContext.systemHealthScore}/10
- Completed Principles: ${frameworkContext.completedPrinciples.join(', ') || 'None yet'}`;

    // Add stage-specific guidance
    const stageIndex = ['foundation', 'optimization', 'mastery', 'sustainability'].indexOf(frameworkContext.userStage);
    if (stageIndex >= 0 && stageIndex < IMPLEMENTATION_STAGES.length) {
      const currentStage = IMPLEMENTATION_STAGES[stageIndex];
      prompt += `\n\nCURRENT STAGE FOCUS: ${currentStage.focus}
STAGE SUCCESS CRITERIA: ${currentStage.successCriteria.join(', ')}`;
    }

    // Add recovery context if applicable
    if (frameworkContext.isInRecoveryMode && frameworkContext.currentRecoveryLevel) {
      const recoveryLevel = RECOVERY_LEVELS.find(r => r.level === frameworkContext.currentRecoveryLevel);
      if (recoveryLevel) {
        prompt += `\n\nRECOVERY MODE: Level ${recoveryLevel.level} - ${recoveryLevel.name}
RECOVERY ACTION: ${recoveryLevel.action}
EXPECTED OUTCOME: ${recoveryLevel.outcome}`;
      }
    }

    // Add well-being alerts
    if (frameworkContext.wellBeingScore < 6) {
      prompt += `\n\nWELL-BEING ALERT: User's well-being score is low (${frameworkContext.wellBeingScore}/10).
PRIORITY: Focus on sustainable practices and stress reduction before productivity optimization.`;
    }

    if (frameworkContext.systemHealthScore < 5) {
      prompt += `\n\nSYSTEM HEALTH ALERT: User's productivity system needs attention (${frameworkContext.systemHealthScore}/10).
PRIORITY: Help with system organization and workflow optimization.`;
    }
  }

  // Add context-specific guidance
  switch (context) {
    case 'capture':
      prompt += `\n\nCONTEXT: User is in capture mode. Help with:
- Capturing tasks, ideas, and commitments effectively
- Clarifying vague inputs into actionable items
- Ensuring nothing falls through the cracks
- Quick processing and organization`;
      break;

    case 'plan':
      prompt += `\n\nCONTEXT: User is in planning mode. Help with:
- Strategic task prioritization
- Energy-based scheduling
- Goal alignment checking
- Workflow optimization`;
      break;

    case 'engage':
      prompt += `\n\nCONTEXT: User is in execution mode. Help with:
- Focus session guidance
- Distraction management
- Energy monitoring
- Break suggestions
- Progress tracking`;
      break;

    default:
      prompt += `\n\nCONTEXT: General productivity assistance. Help with any aspect of the framework.`;
  }

  // Add personality adjustments
  switch (personality) {
    case 'enthusiastic':
      prompt += `\n\nTONE: Be encouraging, celebratory, and motivating. Use positive language and emojis appropriately.`;
      break;
    case 'focused':
      prompt += `\n\nTONE: Be direct, concise, and action-oriented. Focus on practical next steps.`;
      break;
    default:
      prompt += `\n\nTONE: Be warm, supportive, and helpful. Balance encouragement with practical guidance.`;
  }

  prompt += `\n\nREMEMBER:
- Always prioritize user well-being
- Provide specific, actionable guidance based on the framework
- Ask clarifying questions when needed
- Celebrate progress and wins
- Guide users to appropriate recovery levels when overwhelmed
- Adapt your responses to the user's current stage and needs
- Use framework-specific language and concepts
- Reference specific principles and practices when relevant`;

  return prompt;
}

// Framework command detection and processing
export function detectFrameworkCommand(userMessage: string): {
  isFrameworkCommand: boolean;
  commandType?: string;
  extractedData?: any;
} {
  const message = userMessage.toLowerCase();

  // Recovery commands
  const recoveryKeywords = ['overwhelmed', 'chaotic', 'lost', 'confused', 'help me organize', 'brain dump'];
  if (recoveryKeywords.some(keyword => message.includes(keyword))) {
    return {
      isFrameworkCommand: true,
      commandType: 'recovery',
      extractedData: { triggerWord: recoveryKeywords.find(k => message.includes(k)) }
    };
  }

  // Assessment commands
  const assessmentKeywords = ['how am i doing', 'progress check', 'assessment', 'review my goals'];
  if (assessmentKeywords.some(keyword => message.includes(keyword))) {
    return {
      isFrameworkCommand: true,
      commandType: 'assessment',
      extractedData: {}
    };
  }

  // Capture commands
  const captureKeywords = ['capture this', 'remember this', 'add task', 'new idea'];
  if (captureKeywords.some(keyword => message.includes(keyword))) {
    return {
      isFrameworkCommand: true,
      commandType: 'capture',
      extractedData: { content: userMessage }
    };
  }

  // Planning commands
  const planningKeywords = ['plan my day', 'schedule tasks', 'what should i work on', 'prioritize'];
  if (planningKeywords.some(keyword => message.includes(keyword))) {
    return {
      isFrameworkCommand: true,
      commandType: 'planning',
      extractedData: {}
    };
  }

  // Well-being commands
  const wellBeingKeywords = ['tired', 'stressed', 'break', 'energy', 'feeling'];
  if (wellBeingKeywords.some(keyword => message.includes(keyword))) {
    return {
      isFrameworkCommand: true,
      commandType: 'wellbeing',
      extractedData: { concern: wellBeingKeywords.find(k => message.includes(k)) }
    };
  }

  return { isFrameworkCommand: false };
}

// Enhanced streaming with framework integration
export const streamFrameworkChat = async (options: FrameworkStreamOptions) => {
  const {
    messages,
    context = 'general',
    personality = 'helpful',
    frameworkContext,
    onDelta,
    onDone,
    onError
  } = options;

  const startTime = performance.now();
  let handledLocally = false;

  try {
    // Detect if this is a framework-specific command
    const lastUserMessage = messages[messages.length - 1];
    const commandDetection = lastUserMessage?.role === 'user'
      ? detectFrameworkCommand(lastUserMessage.content)
      : { isFrameworkCommand: false };

    // Build framework-enhanced prompt
    const enhancedMessages = buildFrameworkPrompt(messages, context, personality, frameworkContext);

    // Add framework command context if detected
    if (commandDetection.isFrameworkCommand) {
      const commandContext = `\n\nFRAMEWORK COMMAND DETECTED: ${commandDetection.commandType}
Please provide framework-specific guidance for this type of request.`;

      enhancedMessages[0].content += commandContext;
    }

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: enhancedMessages,
        context,
        personality,
        frameworkEnabled: true
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('No response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onDelta(content);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Flush remaining buffer
    if (textBuffer.trim()) {
      const lines = textBuffer.split('\n');
      for (let raw of lines) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
    
    // Track Luna framework request performance
    const executionTime = performance.now() - startTime;
    const confidence = frameworkContext ? calculateFrameworkConfidence(frameworkContext) : undefined;
    trackLunaUsage('framework-chat', handledLocally, executionTime, confidence);
  } catch (error) {
    console.error('Framework stream error:', error);
    if (onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
    
    // Track failed request
    const executionTime = performance.now() - startTime;
    trackLunaUsage('framework-chat-error', false, executionTime);
  }
};

// Calculate confidence score based on framework context completeness
function calculateFrameworkConfidence(context: FrameworkContext): number {
  let score = 0.5; // Base confidence
  
  if (context.completedPrinciples.length > 0) score += 0.1;
  if (context.currentMetrics.length > 0) score += 0.1;
  if (context.wellBeingScore > 0) score += 0.1;
  if (context.systemHealthScore > 0) score += 0.1;
  if (context.energyPattern && context.energyPattern.length > 0) score += 0.1;
  
  return Math.min(score, 1.0);
}

// Helper to track Luna usage
async function trackLunaUsage(
  requestType: string,
  handledLocally: boolean,
  executionTimeMs: number,
  confidence?: number
) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const user = (await supabase.auth.getUser()).data.user;
    
    if (user) {
      await supabase.rpc('log_luna_local_usage', {
        user_id_param: user.id,
        request_type_param: requestType,
        handled_locally_param: handledLocally,
        execution_time_param: executionTimeMs,
        confidence_param: confidence || null,
      });
    }
  } catch (err) {
    // Silent fail - don't block the main flow
    console.debug('Luna tracking failed:', err);
  }
}

// Utility function to generate contextual suggestions
export function generateContextualSuggestions(
  context: string,
  frameworkContext?: FrameworkContext
): string[] {
  const suggestions: string[] = [];

  switch (context) {
    case 'capture':
      suggestions.push(
        "What's on your mind that needs capturing?",
        "Tell me about a project or task you're thinking about",
        "Is there something you're worried about forgetting?"
      );
      break;

    case 'plan':
      suggestions.push(
        "What should I work on next?",
        "Help me prioritize my tasks",
        "Plan my day based on my energy levels"
      );
      break;

    case 'engage':
      suggestions.push(
        "Start a focus session",
        "I'm feeling distracted",
        "How much time do I have for deep work?"
      );
      break;
  }

  // Add framework-specific suggestions based on user state
  if (frameworkContext) {
    if (frameworkContext.wellBeingScore < 6) {
      suggestions.unshift("I'm feeling stressed and overwhelmed");
    }

    if (frameworkContext.systemHealthScore < 5) {
      suggestions.unshift("Help me organize my productivity system");
    }

    // Stage-specific suggestions
    switch (frameworkContext.userStage) {
      case 'foundation':
        suggestions.push("Help me build better capture habits");
        break;
      case 'optimization':
        suggestions.push("How can I optimize my workflows?");
        break;
      case 'mastery':
        suggestions.push("Let's review my productivity patterns");
        break;
    }
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

// Export the original streaming function for backward compatibility
export { streamChat } from './aiStreaming';