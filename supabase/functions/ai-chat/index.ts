import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, personality } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[ai-chat] Processing request with', messages.length, 'messages, context:', context, 'personality:', personality);

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('[ai-chat] Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        console.error('[ai-chat] Payment required');
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error('[ai-chat] AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[ai-chat] Streaming response started');
    return new Response(response.body, {
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
