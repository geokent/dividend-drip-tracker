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
            }, {
              onConflict: 'user_id,account_id'
            })

          if (insertError) {
            console.error(`Error storing account ${account.account_id}:`, insertError)
          } else {
            console.log(`Successfully stored investment account: ${account.name}`)
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