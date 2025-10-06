import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    console.log('[generate-insights] Generating insights for user:', user.id);

    // Fetch user data
    const [tasksData, habitsData, goalsData] = await Promise.all([
      supabase.from('tasks').select('*').eq('created_by', user.id).limit(50),
      supabase.from('habits').select('*').eq('created_by', user.id).limit(20),
      supabase.from('goals').select('*').eq('created_by', user.id).limit(20),
    ]);

    const userData = {
      tasks: tasksData.data || [],
      habits: habitsData.data || [],
      goals: goalsData.data || [],
    };

    console.log('[generate-insights] Fetched data - Tasks:', userData.tasks.length, 'Habits:', userData.habits.length, 'Goals:', userData.goals.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Analyze this user's productivity data and generate insights:
    
Tasks (${userData.tasks.length} total):
- Completed: ${userData.tasks.filter(t => t.status === 'done').length}
- In Progress: ${userData.tasks.filter(t => t.status === 'in_progress').length}
- Todo: ${userData.tasks.filter(t => t.status === 'todo').length}

Habits (${userData.habits.length} total):
${userData.habits.map(h => `- ${h.title}: ${h.current_streak} day streak`).join('\n')}

Goals (${userData.goals.length} total):
${userData.goals.map(g => `- ${g.title}: ${g.progress}% complete`).join('\n')}

Generate 2-3 actionable insights about their productivity patterns.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a productivity analyst. Generate structured insights." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_insights",
            description: "Generate productivity insights",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { 
                        type: "string", 
                        enum: ["productivity_pattern", "recommendation", "warning", "achievement"] 
                      },
                      title: { type: "string" },
                      content: { type: "string" },
                      confidence_score: { type: "number" },
                    },
                    required: ["type", "title", "content", "confidence_score"],
                  }
                }
              },
              required: ["insights"],
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_insights" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-insights] AI error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[generate-insights] AI response received');

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const insights = JSON.parse(toolCall.function.arguments).insights;
    console.log('[generate-insights] Generated', insights.length, 'insights');

    // Store insights in database
    const insightsToInsert = insights.map((insight: any) => ({
      user_id: user.id,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      confidence_score: insight.confidence_score,
      provider: 'lovable',
      metadata: { generated_from: 'auto_analysis' }
    }));

    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert(insightsToInsert);

    if (insertError) {
      console.error('[generate-insights] Insert error:', insertError);
      throw insertError;
    }

    console.log('[generate-insights] Insights saved successfully');

    return new Response(
      JSON.stringify({ success: true, insights_count: insights.length }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('[generate-insights] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
