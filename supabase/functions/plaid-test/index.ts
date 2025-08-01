import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Test 1: Basic function execution
    console.log('Function started successfully')
    
    // Test 2: Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const clientId = Deno.env.get('PLAID_CLIENT_ID')
    const secret = Deno.env.get('PLAID_SECRET')
    const plaidEnv = Deno.env.get('PLAID_ENV')
    
    console.log('Environment check complete')
    
    // Test 3: Supabase client creation
    const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')
    console.log('Supabase client created')
    
    // Test 4: Auth header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header exists:', !!authHeader)
    
    // Return debug info
    return new Response(
      JSON.stringify({ 
        success: true,
        debug: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
          clientId: !!clientId,
          clientIdLength: clientId?.length || 0,
          secret: !!secret,
          secretLength: secret?.length || 0,
          plaidEnv: plaidEnv || 'not-set',
          authHeader: !!authHeader
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in test function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Test function failed', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})