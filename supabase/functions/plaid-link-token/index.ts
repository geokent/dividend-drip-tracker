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
    console.log('=== PLAID LINK TOKEN FUNCTION START ===')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('ERROR: No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('ERROR: Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('SUCCESS: User authenticated:', user.id)

    // Get Plaid credentials
    const clientId = Deno.env.get('PLAID_CLIENT_ID')
    const secret = Deno.env.get('PLAID_SECRET')
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox'
    
    console.log('=== PLAID CREDENTIALS CHECK ===')
    console.log('Client ID exists:', !!clientId)
    console.log('Client ID length:', clientId?.length || 0)
    console.log('Secret exists:', !!secret)
    console.log('Secret length:', secret?.length || 0)
    console.log('Environment:', plaidEnv)
    
    if (!clientId || !secret) {
      console.log('ERROR: Missing Plaid credentials')
      return new Response(
        JSON.stringify({ 
          error: 'Missing Plaid configuration',
          debug: {
            clientIdExists: !!clientId,
            secretExists: !!secret,
            plaidEnv: plaidEnv
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine Plaid API URL
    const plaidApiHost = plaidEnv === 'production' ? 'https://production.plaid.com' : 'https://sandbox.plaid.com'
    console.log('Using Plaid API host:', plaidApiHost)

    // Create Plaid link token request
    const requestBody = {
      client_name: 'Dividend Tracker',
      country_codes: ['US'],
      language: 'en',
      user: {
        client_user_id: user.id,
      },
      products: ['investments'],
      account_filters: {
        investment: {
          account_subtypes: ['401k', 'brokerage', 'ira', 'roth'],
        },
      },
    }

    console.log('=== MAKING PLAID API REQUEST ===')
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const plaidResponse = await fetch(`${plaidApiHost}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Plaid response status:', plaidResponse.status)
    
    const plaidData = await plaidResponse.json()
    console.log('Plaid response data:', JSON.stringify(plaidData, null, 2))

    if (!plaidResponse.ok) {
      console.log('ERROR: Plaid API failed')
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create link token', 
          plaidError: plaidData,
          debug: {
            status: plaidResponse.status,
            clientIdLength: clientId?.length,
            secretLength: secret?.length,
            environment: plaidEnv,
            apiHost: plaidApiHost
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('SUCCESS: Link token created')
    return new Response(
      JSON.stringify({ link_token: plaidData.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('=== FATAL ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})