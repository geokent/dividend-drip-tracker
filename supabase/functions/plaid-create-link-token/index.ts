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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'
    
    console.log(`Creating link token for user ${user_id} using Plaid production environment`)

    // Get user profile for additional context
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user_id)
      .maybeSingle()

    // Create link token with Plaid API
    const response = await fetch(`${plaidApiHost}/link/token/create`, {
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
          client_user_id: user_id,
          legal_name: profile?.display_name || 'User',
        },
        products: ['investments'],
        required_if_supported_products: ['investments'],
        optional_products: ['transactions'],
        redirect_uri: null,
        webhook: null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Plaid API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        clientId: Deno.env.get('PLAID_CLIENT_ID') ? 'SET' : 'NOT_SET',
        secret: Deno.env.get('PLAID_SECRET') ? 'SET' : 'NOT_SET'
      })
      return new Response(
        JSON.stringify({ error: 'Failed to create link token', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Link token created successfully')

    return new Response(
      JSON.stringify({ 
        link_token: data.link_token,
        expiration: data.expiration 
      }),
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