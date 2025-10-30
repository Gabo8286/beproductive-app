export const streamChat = async ({
  messages,
  context,
  personality,
  onDelta,
  onDone,
  onError,
}: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: string;
  personality?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}) => {
  const startTime = performance.now();
  let handledLocally = false;
  
  try {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
    
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        messages,
        context: context || 'general',
        personality: personality || 'helpful'
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
    
    // Track Luna request performance
    const executionTime = performance.now() - startTime;
    trackLunaUsage('ai-chat', handledLocally, executionTime);
  } catch (error) {
    console.error('Stream error:', error);
    if (onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
    
    // Track failed request
    const executionTime = performance.now() - startTime;
    trackLunaUsage('ai-chat-error', false, executionTime);
  }
};

// Helper to track Luna usage (imported dynamically to avoid circular deps)
async function trackLunaUsage(requestType: string, handledLocally: boolean, executionTimeMs: number) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.rpc('log_luna_local_usage', {
      user_id_param: (await supabase.auth.getUser()).data.user?.id,
      request_type_param: requestType,
      handled_locally_param: handledLocally,
      execution_time_param: executionTimeMs,
      confidence_param: null,
    });
  } catch (err) {
    // Silent fail - don't block the main flow
    console.debug('Luna tracking failed:', err);
  }
}
