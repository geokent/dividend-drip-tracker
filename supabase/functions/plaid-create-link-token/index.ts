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

    // Check free tier limit - only allow one connected institution per user
    const { data: existingAccounts, error: countError } = await supabase
      .from('plaid_accounts')
      .select('item_id')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (countError) {
      console.error('Error checking existing accounts:', countError)
      return new Response(
        JSON.stringify({ error: 'Failed to check account limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unique item IDs (institutions)
    const uniqueItems = new Set(existingAccounts?.map(acc => acc.item_id) || [])
    
    if (uniqueItems.size >= 1) {
      console.log(`User ${user_id} already has ${uniqueItems.size} connected institution(s), blocking new connection`)
      return new Response(
        JSON.stringify({ 
          error: 'Free tier limit reached',
          message: 'You can only connect one institution on the free tier. Please disconnect your current institution first.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'
    
    console.log(`Creating link token for user ${user_id} using Plaid production environment`)

    // Check if secrets are available
    const clientId = Deno.env.get('PLAID_CLIENT_ID')
    const secret = Deno.env.get('PLAID_SECRET')
    
    console.log('Secret check:', {
      clientId: clientId ? 'SET' : 'NOT_SET',
      secret: secret ? 'SET' : 'NOT_SET'
    })

    if (!clientId || !secret) {
      console.error('Missing Plaid credentials')
      return new Response(
        JSON.stringify({ error: 'Missing Plaid API credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for additional context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user_id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    console.log('Profile data:', profile)

    // Create link token with Plaid API
    console.log('Making request to Plaid API...')
    const response = await fetch(`${plaidApiHost}/link/token/create`, {
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
          client_user_id: user_id,
          legal_name: profile?.display_name || 'User',
        },
        products: ['investments'],
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