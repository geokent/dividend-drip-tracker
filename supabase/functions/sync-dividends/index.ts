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
    
    // Extract request metadata for security logging
    const xForwardedFor = req.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Check for suspicious access patterns before proceeding
    const { data: suspiciousAccess } = await supabase.rpc('detect_suspicious_access', {
      p_user_id: user_id
    })
    
    if (suspiciousAccess) {
      console.warn(`Suspicious access pattern detected for user ${user_id}`)
      try {
        await supabase.rpc('log_plaid_access', {
          p_user_id: user_id,
          p_action: 'suspicious_sync_blocked',
          p_account_id: null,
          p_ip_address: clientIP,
          p_user_agent: userAgent
        })
      } catch (logError) {
        console.error('Failed to log suspicious access:', logError)
      }
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log sync attempt
    try {
      await supabase.rpc('log_plaid_access', {
        p_user_id: user_id,
        p_action: 'sync_attempt',
        p_account_id: null,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log sync attempt:', logError)
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active Plaid accounts for the user (without sensitive token data)
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('account_id, item_id, account_name, account_type, institution_name, institution_id, user_id')
      .eq('user_id', user_id)
      .eq('is_active', true)

    console.log(`Found ${accounts?.length || 0} active accounts for user ${user_id}`)

    if (accountsError) {
      console.error('Accounts fetch error:', accountsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accounts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalNewDividends = 0

    // Use production environment
    const plaidApiHost = 'https://production.plaid.com'
    
    console.log(`Using Plaid production environment`)

    for (const account of accounts || []) {
      try {
        // Log account access for audit trail
        try {
          await supabase.rpc('log_plaid_access', {
            p_user_id: user_id,
            p_action: 'account_data_accessed',
            p_account_id: account.account_id,
            p_ip_address: clientIP,
            p_user_agent: userAgent
          })
        } catch (logError) {
          console.error('Failed to log account access:', logError)
        }
        
        // Securely get decrypted access token
        const { data: decryptedToken, error: tokenError } = await supabase.rpc('get_decrypted_access_token', {
          p_user_id: user_id,
          p_account_id: account.account_id
        })
        
        if (tokenError || !decryptedToken) {
          console.error(`Failed to get access token for account ${account.account_id}:`, tokenError)
          try {
            await supabase.rpc('log_plaid_access', {
              p_user_id: user_id,
              p_action: 'token_decryption_failed',
              p_account_id: account.account_id,
              p_ip_address: clientIP,
              p_user_agent: userAgent
            })
          } catch (logError) {
            console.error('Failed to log token decryption failure:', logError)
          }
          continue
        }
        
        // Get stock holdings from Plaid using decrypted token
        const holdingsResponse = await fetch(`${plaidApiHost}/investments/holdings/get`, {
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

        const holdingsData = await holdingsResponse.json()

        if (!holdingsResponse.ok) {
          console.error('Plaid holdings error:', holdingsData)
          try {
            await supabase.rpc('log_plaid_access', {
              p_user_id: user_id,
              p_action: 'holdings_fetch_failed',
              p_account_id: account.account_id,
              p_ip_address: clientIP,
              p_user_agent: userAgent
            })
          } catch (logError) {
            console.error('Failed to log holdings fetch failure:', logError)
          }
          continue
        }

        console.log(`Found ${holdingsData.holdings?.length || 0} holdings for account ${account.account_id}`)

        // Build a lookup of securities by security_id to resolve ticker symbols
        const securitiesById = new Map<string, any>()
        for (const sec of holdingsData.securities || []) {
          if (sec?.security_id) securitiesById.set(sec.security_id, sec)
        }

        // Create a map to aggregate holdings by symbol across all accounts
        const holdingsMap = new Map<string, { symbol: string; companyName: string; currentPrice: number; quantity: number }>()

        // Process each holding and aggregate by symbol
        for (const holding of holdingsData.holdings || []) {
          const sec = securitiesById.get(holding.security_id)
          const ticker = sec?.ticker_symbol || sec?.sedol || sec?.cusip || null
          if (!ticker) {
            console.log(`Skipping holding with no resolvable ticker symbol. security_id=${holding.security_id}`)
            continue
          }

          const symbol = String(ticker).toUpperCase()
          const companyName = sec?.name || symbol
          const currentPrice = holding.institution_price || 0
          const quantity = holding.quantity || 0
          
          console.log(`Processing holding: ${symbol} - ${quantity} shares at $${currentPrice} from security ${holding.security_id}`)
          
          // Aggregate quantities by symbol
          if (holdingsMap.has(symbol)) {
            const existing = holdingsMap.get(symbol)!
            existing.quantity += quantity
            if (currentPrice > 0) {
              existing.currentPrice = currentPrice
            }
          } else {
            holdingsMap.set(symbol, {
              symbol,
              companyName,
              currentPrice,
              quantity
            })
          }
        }

        console.log(`Aggregated ${holdingsMap.size} unique symbols from ${holdingsData.holdings?.length || 0} holdings`)

        // Process aggregated holdings
        for (const [symbol, aggregatedHolding] of holdingsMap) {
          console.log(`Processing aggregated holding: ${symbol} - ${aggregatedHolding.quantity} total shares at $${aggregatedHolding.currentPrice}`)
          
          try {
            // Check if this stock is already tracked by the user
            const { data: existingStock, error: selectError } = await supabase
              .from('user_stocks')
              .select('*')
              .eq('user_id', user_id)
              .eq('symbol', symbol)
              .maybeSingle()

            if (selectError) {
              console.error(`Error checking existing stock ${symbol}:`, selectError)
              continue
            }

            const stockData = {
              user_id: user_id,
              symbol: symbol,
              shares: aggregatedHolding.quantity,
              company_name: aggregatedHolding.companyName,
              current_price: aggregatedHolding.currentPrice,
              source: 'plaid_sync',
              plaid_item_id: account.item_id,
              plaid_account_id: account.account_id,
              last_synced: new Date().toISOString(),
            }

            if (existingStock) {
              // Update existing stock with aggregated quantity
              const { error: updateError } = await supabase
                .from('user_stocks')
                .update(stockData)
                .eq('id', existingStock.id)

              if (updateError) {
                console.error(`Error updating stock ${symbol}:`, updateError)
              } else {
                console.log(`Updated stock ${symbol} with ${aggregatedHolding.quantity} total shares (was ${existingStock.shares})`)
                totalNewDividends++
              }
            } else {
              // Insert new stock
              const { error: insertError } = await supabase
                .from('user_stocks')
                .insert(stockData)

              if (insertError) {
                console.error(`Error inserting stock ${symbol}:`, insertError)
              } else {
                console.log(`Inserted new stock ${symbol} with ${aggregatedHolding.quantity} shares`)
                totalNewDividends++
              }
            }
          } catch (error) {
            console.error(`Error processing aggregated stock ${symbol}:`, error)
            continue
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
        continue
      }
    }

    // Log successful sync completion
    try {
      await supabase.rpc('log_plaid_access', {
        p_user_id: user_id,
        p_action: 'sync_completed',
        p_account_id: null,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log sync completion:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        syncedStocks: totalNewDividends,
        message: `Synced ${totalNewDividends} stocks from your portfolio`
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