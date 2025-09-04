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

    const { user_id, item_id } = await req.json()
    
    // Extract request metadata for security logging
    const xForwardedFor = req.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    if (!user_id || !item_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or item_id' }),
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

    if (decryptError || !decryptedToken) {
      console.error('Token decryption error:', decryptError)
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'

    // Call Plaid's item/remove endpoint to disconnect the item
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

    const removeData = await removeResponse.json()

    if (!removeResponse.ok) {
      console.error('Plaid item removal error:', removeData)
      // Continue with database cleanup even if Plaid call fails
    } else {
      console.log('Successfully removed item from Plaid')
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
        message: `Successfully disconnected ${account.institution_name || 'institution'}`
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