import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }), 
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client to verify JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }), 
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages, context, personality } = await req.json();
    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    
    if (!GOOGLE_AI_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    console.log('[ai-chat] Processing request for user:', user.id, 'with', messages.length, 'messages, context:', context, 'personality:', personality);

    // Generate context-aware system prompt
    const getSystemPrompt = (ctx: string, pers: string): string => {
      const baseIntro = pers === 'enthusiastic' 
        ? "You are Luna, an enthusiastic AI productivity fox! 🦊✨"
        : pers === 'focused'
        ? "You are Luna, a focused AI productivity assistant. 🦊"
        : "You are Luna, a helpful AI productivity companion. 🦊";
      
      const contextGuide = ctx === 'capture'
        ? "You're in CAPTURE mode. Help users quickly capture ideas, tasks, and notes. Be concise and encouraging."
        : ctx === 'plan'
        ? "You're in PLAN mode. Help users organize, prioritize, and structure their work. Suggest actionable next steps."
        : ctx === 'engage'
        ? "You're in ENGAGE mode. Help users focus, stay motivated, and complete their tasks. Be supportive and energizing."
        : "Help users with productivity, task management, and goal tracking.";
      
      return `${baseIntro}\n\n${contextGuide}\n\nKeep responses friendly, concise (2-3 sentences), and actionable. Use emojis sparingly but thoughtfully.`;
    };

    const systemPrompt = getSystemPrompt(context || 'general', personality || 'helpful');

    // Convert messages to Gemini format
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=${GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ai-chat] Google AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[ai-chat] Streaming response started');

    // Transform Google's streaming format to match expected format
    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    // Transform to OpenAI-compatible format for client compatibility
                    const sse = `data: ${JSON.stringify({
                      choices: [{ delta: { content: text } }]
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(sse));
                  }
                } catch (e) {
                  console.error('[ai-chat] Parse error:', e);
                }
              }
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[ai-chat] Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(transformedStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error('[ai-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
