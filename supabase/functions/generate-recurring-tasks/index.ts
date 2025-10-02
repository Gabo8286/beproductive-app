import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationResult {
  template_id: string;
  instances_created: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting recurring task instance generation...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the database function to generate instances
    const { data, error } = await supabase.rpc('generate_recurring_instances');

    if (error) {
      console.error('Error generating instances:', error);
      throw error;
    }

    const results = data as GenerationResult[];
    const totalInstancesCreated = results.reduce((sum, result) => sum + result.instances_created, 0);
    const templatesProcessed = results.length;

    console.log(`Generation complete: ${totalInstancesCreated} instances created from ${templatesProcessed} templates`);

    // Log details for each template
    results.forEach(result => {
      if (result.instances_created > 0) {
        console.log(`Template ${result.template_id}: ${result.instances_created} instances created`);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        templatesProcessed,
        totalInstancesCreated,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-recurring-tasks function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
