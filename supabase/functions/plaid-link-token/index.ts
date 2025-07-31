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
    console.log('Starting plaid-link-token function')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    console.log('Supabase client created')

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Getting user from auth header')
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if required Plaid credentials are available
    const clientId = Deno.env.get('PLAID_CLIENT_ID')
    const secret = Deno.env.get('PLAID_SECRET')
    
    if (!clientId || !secret) {
      console.error('Missing Plaid credentials - CLIENT_ID:', !!clientId, 'SECRET:', !!secret)
      return new Response(
        JSON.stringify({ error: 'Missing Plaid configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating Plaid link token for user:', user.id)

    // Create Plaid link token
    const plaidResponse = await fetch('https://production.plaid.com/link/token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
      body: JSON.stringify({
        client_name: 'Dividend Tracker',
        country_codes: ['US'],
        language: 'en',
        user: {
          client_user_id: user.id,
        },
        products: ['assets'],
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

    console.log('Plaid API response status:', plaidResponse.status)

    const plaidData = await plaidResponse.json()
    console.log('Plaid API response data:', JSON.stringify(plaidData, null, 2))

    if (!plaidResponse.ok) {
      console.error('Plaid error:', plaidData)
      return new Response(
        JSON.stringify({ error: 'Failed to create link token', plaidError: plaidData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ link_token: plaidData.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Detailed error in plaid-link-token:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})