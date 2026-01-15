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
    // Validate JWT and get authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: authUser }, error: authError } = await anonSupabase.auth.getUser()
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use authenticated user ID, NOT from request body
    const user_id = authUser.id

    // Service role client for privileged operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { public_token } = await req.json()
    
    // Extract request metadata for security logging
    const xForwardedFor = req.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Log the token exchange attempt
    try {
      await supabase.rpc('log_plaid_access', {
        p_user_id: user_id,
        p_action: 'token_exchange_attempt',
        p_account_id: null,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log token exchange attempt:', logError)
    }

    if (!public_token) {
      return new Response(
        JSON.stringify({ error: 'Missing public_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check free tier limit before processing
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
      console.log(`User ${user_id} already has ${uniqueItems.size} connected institution(s), blocking token exchange`)
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
    try {
      await supabase.rpc('log_plaid_access', {
        p_user_id: user_id,
        p_action: 'token_exchange_success',
        p_account_id: null,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log token exchange success:', logError)
    }

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

    // Store account information in database using encrypted token storage
    const accountResults = []
    let successfulAccounts = 0
    let failedAccounts = 0
    const failureDetails = []
    
    for (const account of accountsData.accounts) {
      try {
        // Only store investment accounts
        if (account.type === 'investment') {
          console.log(`Processing investment account: ${account.name} (${account.account_id})`)
          
          // Check if account already exists and is inactive - reactivate instead of creating duplicate
          const { data: existingAccount } = await supabase
            .from('plaid_accounts')
            .select('*')
            .eq('user_id', user_id)
            .eq('account_id', account.account_id)
            .single()

          if (existingAccount) {
            console.log(`Reactivating existing account: ${account.account_id}`)
            
            // Encrypt new access token
            const { data: encryptedToken, error: encryptError } = await supabase.rpc('encrypt_sensitive_data', {
              data: access_token
            })
            
            if (encryptError || !encryptedToken) {
              console.error(`Failed to encrypt token for ${account.account_id}:`, encryptError)
              failedAccounts++
              failureDetails.push(`${account.name}: Token encryption failed`)
              continue
            }
            
            // Update existing account to reactivate it
            const { error: updateError } = await supabase
              .from('plaid_accounts')
              .update({
                access_token_encrypted: encryptedToken,
                is_active: true,
                is_encrypted: true,
                encryption_version: 1,
                token_last_rotated: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user_id)
              .eq('account_id', account.account_id)

            if (updateError) {
              console.error(`Failed to reactivate account ${account.account_id}:`, updateError)
              failedAccounts++
              failureDetails.push(`${account.name}: Failed to reactivate account - ${updateError.message}`)
              continue
            }
            
            console.log(`Successfully reactivated existing investment account: ${account.name}`)
            successfulAccounts++
            accountResults.push({
              account_id: account.account_id,
              name: account.name,
              success: true
            })
            continue
          }
          
          // Use the secure encrypted token storage function (now returns JSONB)
          const { data: result, error: rpcError } = await supabase.rpc('store_encrypted_access_token', {
            p_user_id: user_id,
            p_account_id: account.account_id,
            p_access_token: access_token,
            p_item_id: item_id,
            p_account_name: account.name,
            p_account_type: account.type,
            p_institution_name: institutionName,
            p_institution_id: accountsData.item.institution_id
          })

          if (rpcError) {
            console.error(`RPC error for account ${account.account_id}:`, rpcError)
            failedAccounts++
            failureDetails.push(`${account.name}: RPC error - ${rpcError.message}`)
            
            // Log failed account storage
            try {
              await supabase.rpc('log_plaid_access', {
                p_user_id: user_id,
                p_action: 'account_storage_failed',
                p_account_id: account.account_id,
                p_ip_address: clientIP,
                p_user_agent: userAgent
              })
            } catch (logError) {
              console.error('Failed to log account storage failure:', logError)
            }
          } else if (result && !result.success) {
            console.error(`Storage failed for account ${account.account_id}:`, result.error)
            failedAccounts++
            failureDetails.push(`${account.name}: ${result.error}`)
            
            // Log failed account storage with detailed reason
            try {
              await supabase.rpc('log_plaid_access', {
                p_user_id: user_id,
                p_action: 'account_storage_failed',
                p_account_id: account.account_id,
                p_ip_address: clientIP,
                p_user_agent: userAgent
              })
            } catch (logError) {
              console.error('Failed to log account storage failure:', logError)
            }
          } else {
            console.log(`Successfully stored encrypted investment account: ${account.name}`)
            successfulAccounts++
            accountResults.push({
              account_id: account.account_id,
              name: account.name,
              success: true
            })
            
            // Log successful account storage
            try {
              await supabase.rpc('log_plaid_access', {
                p_user_id: user_id,
                p_action: 'account_stored',
                p_account_id: account.account_id,
                p_ip_address: clientIP,
                p_user_agent: userAgent
              })
            } catch (logError) {
              console.error('Failed to log account storage success:', logError)
            }
          }
        } else {
          console.log(`Skipping non-investment account: ${account.name} (${account.type})`)
        }
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
        failedAccounts++
        failureDetails.push(`${account.name}: Unexpected error - ${(error as Error).message}`)
      }
    }

    const investmentAccounts = accountsData.accounts.filter((acc: any) => acc.type === 'investment')
    const totalInvestmentAccounts = investmentAccounts.length

    // Validate account connectivity if any accounts were processed
    let connectivityStatus = null
    if (totalInvestmentAccounts > 0) {
      try {
        const { data: connectivity } = await supabase.rpc('validate_plaid_account_connectivity', {
          p_user_id: user_id,
          p_item_id: item_id
        })
        connectivityStatus = connectivity
      } catch (error) {
        console.error('Failed to validate connectivity:', error)
      }
    }

    // Determine response based on success/failure rates
    if (failedAccounts === 0 && successfulAccounts > 0) {
      // Complete success
      return new Response(
        JSON.stringify({ 
          success: true,
          accounts_connected: successfulAccounts,
          accounts_failed: 0,
          institution_name: institutionName,
          connectivity: connectivityStatus,
          message: `Successfully connected ${successfulAccounts} investment account(s) from ${institutionName}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (successfulAccounts > 0 && failedAccounts > 0) {
      // Partial success
      console.warn(`Partial connection success: ${successfulAccounts} succeeded, ${failedAccounts} failed`)
      return new Response(
        JSON.stringify({ 
          success: true,
          partial_failure: true,
          accounts_connected: successfulAccounts,
          accounts_failed: failedAccounts,
          institution_name: institutionName,
          connectivity: connectivityStatus,
          failure_details: failureDetails,
          message: `Partially connected to ${institutionName}: ${successfulAccounts} accounts connected, ${failedAccounts} failed. Some syncing features may not work properly.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (failedAccounts > 0) {
      // Complete failure
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to connect any accounts',
          accounts_connected: 0,
          accounts_failed: failedAccounts,
          institution_name: institutionName,
          failure_details: failureDetails,
          message: `Failed to connect to ${institutionName}. Please try again or contact support if the issue persists.`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // No investment accounts found
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No investment accounts found',
          accounts_connected: 0,
          accounts_failed: 0,
          institution_name: institutionName,
          message: `No investment accounts found at ${institutionName}. Please ensure you have investment accounts or try a different institution.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})