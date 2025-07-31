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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Plaid environment and determine endpoint
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox'
    const plaidEndpoint = plaidEnv === 'production' 
      ? 'https://production.plaid.com' 
      : 'https://sandbox.plaid.com'

    // Create Plaid link token
    const plaidResponse = await fetch(`${plaidEndpoint}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
      },
      body: JSON.stringify({
        client_name: 'Dividend Tracker',
        country_codes: ['US'],
        language: 'en',
        user: {
          client_user_id: user.id,
        },
        products: ['transactions'],
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings'],
          },
          investment: {
            account_subtypes: ['401k', 'brokerage', 'ira', 'roth'],
          },
        },
      }),
    })

    const plaidData = await plaidResponse.json()

    if (!plaidResponse.ok) {
      console.error('Plaid error:', plaidData)
      return new Response(
        JSON.stringify({ error: 'Failed to create link token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ link_token: plaidData.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})