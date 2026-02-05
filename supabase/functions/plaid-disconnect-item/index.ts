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

    const { item_id } = await req.json()
    
    // Extract request metadata for security logging
    const xForwardedFor = req.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'Missing item_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Disconnecting Plaid item ${item_id} for user ${user_id}`)

    // Get the access token for this item
    const { data: account, error: accountError } = await supabase
      .from('plaid_accounts')
      .select('access_token_encrypted, institution_name')
      .eq('user_id', user_id)
      .eq('item_id', item_id)
      .eq('is_active', true)
      .maybeSingle()

    if (accountError || !account) {
      console.error('Account lookup error:', accountError)
      return new Response(
        JSON.stringify({ error: 'Account not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decrypt the access token
    const { data: decryptedToken, error: decryptError } = await supabase.rpc('decrypt_sensitive_data', {
      encrypted_data: account.access_token_encrypted
    })

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'
    let plaidRemoveSuccess = false

    if (decryptError || !decryptedToken) {
      console.warn('Token decryption failed, skipping Plaid API call. Will still deactivate in database.', decryptError)
      // Continue to database cleanup without calling Plaid API
    } else {
      // Call Plaid's item/remove endpoint only if we have the token
      try {
        const removeResponse = await fetch(`${plaidApiHost}/item/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
            'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
          },
          body: JSON.stringify({
            access_token: decryptedToken,
          }),
        })

        if (removeResponse.ok) {
          plaidRemoveSuccess = true
          console.log('Successfully removed item from Plaid')
        } else {
          const removeData = await removeResponse.json()
          console.error('Plaid item removal error:', removeData)
          // Continue with database cleanup even if Plaid call fails
        }
      } catch (plaidError) {
        console.error('Plaid API call failed:', plaidError)
        // Continue with database cleanup even if Plaid call fails
      }
    }

    // Deactivate all accounts for this item in our database
    const { error: updateError } = await supabase
      .from('plaid_accounts')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', user_id)
      .eq('item_id', item_id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update account status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get affected stocks from this Plaid item
    const { data: affectedStocks, error: stocksError } = await supabase
      .from('user_stocks')
      .select('id, symbol, company_name, shares')
      .eq('user_id', user_id)
      .eq('plaid_item_id', item_id)
      .eq('source', 'plaid_sync')

    if (stocksError) {
      console.error('Error fetching affected stocks:', stocksError)
    }

    // Parse cleanup action from request body (default to 'remove')
    let cleanupAction = 'remove'
    try {
      const body = await req.text()
      if (body) {
        const parsed = JSON.parse(body)
        cleanupAction = parsed.cleanup_action || 'remove'
      }
    } catch (e) {
      // Use default cleanup action
    }

    let cleanupMessage = ''
    const affectedCount = affectedStocks?.length || 0

    // Handle cleanup based on user choice
    if (affectedCount > 0) {
      if (cleanupAction === 'remove') {
        // Remove all Plaid-synced stocks from this item
        const { error: deleteError } = await supabase
          .from('user_stocks')
          .delete()
          .eq('user_id', user_id)
          .eq('plaid_item_id', item_id)
          .eq('source', 'plaid_sync')

        if (deleteError) {
          console.error('Error removing stocks:', deleteError)
          cleanupMessage = ` Warning: Could not remove ${affectedCount} associated holdings.`
        } else {
          cleanupMessage = ` Removed ${affectedCount} associated holdings.`
        }
      } else if (cleanupAction === 'convert') {
        // Convert Plaid-synced stocks to manual
        const { error: convertError } = await supabase
          .from('user_stocks')
          .update({ 
            source: 'manual',
            plaid_item_id: null,
            plaid_account_id: null 
          })
          .eq('user_id', user_id)
          .eq('plaid_item_id', item_id)
          .eq('source', 'plaid_sync')

        if (convertError) {
          console.error('Error converting stocks:', convertError)
          cleanupMessage = ` Warning: Could not convert ${affectedCount} associated holdings.`
        } else {
          cleanupMessage = ` Converted ${affectedCount} holdings to manual tracking.`
        }
      } else if (cleanupAction === 'keep') {
        // Convert source to manual to prevent sync errors
        const { error: convertError } = await supabase
          .from('user_stocks')
          .update({ 
            source: 'manual',
            plaid_item_id: null,
            plaid_account_id: null 
          })
          .eq('user_id', user_id)
          .eq('plaid_item_id', item_id)
          .eq('source', 'plaid_sync')

        if (convertError) {
          console.error('Error converting stocks to manual:', convertError)
          cleanupMessage = ` Warning: Could not update ${affectedCount} associated holdings.`
        } else {
          cleanupMessage = ` Converted ${affectedCount} holdings to manual tracking.`
        }
      }
    }

    // Log the disconnection
    try {
      await supabase.rpc('log_plaid_access', {
        p_user_id: user_id,
        p_action: 'item_disconnected',
        p_account_id: item_id,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log disconnection:', logError)
    }

    console.log(`Successfully disconnected item ${item_id} for user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully disconnected ${account.institution_name || 'institution'}.${cleanupMessage}`,
        affected_stocks: affectedStocks || [],
        cleanup_action: cleanupAction
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