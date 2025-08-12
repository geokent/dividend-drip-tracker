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

    const { public_token, user_id } = await req.json()
    
    // Extract request metadata for security logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Log the token exchange attempt
    await supabase.rpc('log_plaid_access', {
      p_user_id: user_id,
      p_action: 'token_exchange_attempt',
      p_account_id: null,
      p_ip_address: clientIP,
      p_user_agent: userAgent
    })

    if (!public_token || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing public_token or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'
    
    console.log(`Exchanging public token for user ${user_id} using Plaid production environment`)

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${plaidApiHost}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
      },
      body: JSON.stringify({
        public_token: public_token,
      }),
    })

    const exchangeData = await exchangeResponse.json()

    if (!exchangeResponse.ok) {
      console.error('Plaid token exchange error:', exchangeData)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange token', details: exchangeData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { access_token, item_id } = exchangeData
    
    // Log successful token exchange
    await supabase.rpc('log_plaid_access', {
      p_user_id: user_id,
      p_action: 'token_exchange_success',
      p_account_id: null,
      p_ip_address: clientIP,
      p_user_agent: userAgent
    })

    // Get account information
    const accountsResponse = await fetch(`${plaidApiHost}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
      },
      body: JSON.stringify({
        access_token: access_token,
      }),
    })

    const accountsData = await accountsResponse.json()

    if (!accountsResponse.ok) {
      console.error('Plaid accounts error:', accountsData)
      return new Response(
        JSON.stringify({ error: 'Failed to get account information', details: accountsData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get institution information
    const institutionResponse = await fetch(`${plaidApiHost}/institutions/get_by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
      },
      body: JSON.stringify({
        institution_id: accountsData.item.institution_id,
        country_codes: ['US'],
      }),
    })

    const institutionData = await institutionResponse.json()
    const institutionName = institutionData.institution?.name || 'Unknown Institution'

    console.log(`Processing ${accountsData.accounts.length} accounts for institution: ${institutionName}`)

    // Store account information in database
    for (const account of accountsData.accounts) {
      try {
        // Only store investment accounts
        if (account.type === 'investment') {
          const { error: insertError } = await supabase
            .from('plaid_accounts')
            .upsert({
              user_id: user_id,
              access_token: access_token,
              item_id: item_id,
              account_id: account.account_id,
              account_name: account.name,
              account_type: account.type,
              institution_name: institutionName,
              institution_id: accountsData.item.institution_id,
              is_active: true,
              token_last_rotated: new Date().toISOString(),
            }, {
              onConflict: 'user_id,account_id'
            })

          if (insertError) {
            console.error(`Error storing account ${account.account_id}:`, insertError)
            // Log failed account storage
            await supabase.rpc('log_plaid_access', {
              p_user_id: user_id,
              p_action: 'account_storage_failed',
              p_account_id: account.account_id,
              p_ip_address: clientIP,
              p_user_agent: userAgent
            })
          } else {
            console.log(`Successfully stored investment account: ${account.name}`)
            // Log successful account storage
            await supabase.rpc('log_plaid_access', {
              p_user_id: user_id,
              p_action: 'account_stored',
              p_account_id: account.account_id,
              p_ip_address: clientIP,
              p_user_agent: userAgent
            })
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
      }
    }

    const investmentAccounts = accountsData.accounts.filter(acc => acc.type === 'investment')

    return new Response(
      JSON.stringify({ 
        success: true,
        accounts_connected: investmentAccounts.length,
        institution_name: institutionName,
        message: `Successfully connected ${investmentAccounts.length} investment account(s) from ${institutionName}`
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