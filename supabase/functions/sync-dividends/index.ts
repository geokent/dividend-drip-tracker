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

    // Get only ACTIVE Plaid accounts for the user
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('account_id, item_id, account_name, account_type, institution_name, institution_id, user_id, is_active')
      .eq('user_id', user_id)
      .eq('is_active', true)

    console.log(`Found ${accounts?.length || 0} accounts for user ${user_id}`)

    if (accountsError) {
      console.error('Accounts fetch error:', accountsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch accounts',
          details: accountsError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!accounts || accounts.length === 0) {
      console.log(`No active accounts found for user ${user_id}`)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No active accounts found',
          message: 'Please connect your investment account first before syncing.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate account connectivity before proceeding
    const accountValidations = []
    for (const account of accounts) {
      try {
        const { data: connectivity } = await supabase.rpc('validate_plaid_account_connectivity', {
          p_user_id: user_id,
          p_item_id: account.item_id
        })
        accountValidations.push({
          item_id: account.item_id,
          institution_name: account.institution_name,
          connectivity: connectivity
        })
        
        if (!connectivity?.fully_connected) {
          console.warn(`Account connectivity issue for ${account.institution_name}: ${JSON.stringify(connectivity)}`)
        }
      } catch (error) {
        console.error(`Failed to validate connectivity for ${account.institution_name}:`, error)
      }
    }

    let totalNewDividends = 0
    let reconciledStocks = 0
    let newStocks = 0
    let successfulSyncs = 0
    let failedSyncs = 0
    let removedStocks = 0
    const syncErrors = []
    const globalSymbols = new Set<string>()

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
          failedSyncs++
          syncErrors.push(`${account.account_name || account.account_id}: Failed to decrypt access token`)
          
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
          failedSyncs++
          syncErrors.push(`${account.account_name || account.account_id}: Failed to fetch holdings from Plaid`)
          
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

          // Filter out non-equity holdings (currency, cash, money market)
          const securityType = (sec?.type || sec?.security_type || '').toLowerCase()
          if (securityType.includes('currency') || securityType.includes('cash') || securityType.includes('money market')) {
            console.log(`Skipping non-equity holding: ${ticker} (type: ${securityType})`)
            continue
          }

          const symbol = String(ticker).toUpperCase()
          
          // Skip synthetic tickers like CUR:USD
          if (symbol.includes(':')) {
            console.log(`Skipping synthetic ticker: ${symbol}`)
            continue
          }

          const companyName = sec?.name || symbol
          const currentPrice = holding.institution_price || 0
          const quantity = holding.quantity || 0
          
          // Skip holdings with zero or negative quantity
          if (quantity <= 0) {
            console.log(`Skipping ${symbol} - zero quantity (${quantity} shares)`)
            continue
          }
          
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
        
        // Add all symbols from this account to the global set
        for (const symbol of holdingsMap.keys()) {
          globalSymbols.add(symbol)
        }
        console.log(`Global symbols now has ${globalSymbols.size} total symbols after account ${account.account_id}`)

        let reconciledStocks = 0
        let newStocks = 0
        
        // Process aggregated holdings
        for (const [symbol, aggregatedHolding] of holdingsMap) {
          console.log(`Processing aggregated holding: ${symbol} - ${aggregatedHolding.quantity} total shares at $${aggregatedHolding.currentPrice}`)
          
          // Enrich company name if Plaid provided only a ticker or very short name
          const needsEnrichment = !aggregatedHolding.companyName || aggregatedHolding.companyName === symbol || aggregatedHolding.companyName.length <= 4;
          if (needsEnrichment) {
            try {
              const { data: enriched, error: enrichError } = await supabase.functions.invoke('get-dividend-data', {
                body: { symbol }
              });
              if (!enrichError && enriched?.companyName) {
                aggregatedHolding.companyName = enriched.companyName;
              }
            } catch (e) {
              console.error(`Name enrichment failed for ${symbol}:`, e);
            }
          }
          
          // Normalize company name to single line, trimmed to 80 chars
          if (aggregatedHolding.companyName) {
            aggregatedHolding.companyName = aggregatedHolding.companyName.split('\n')[0].trim().slice(0, 80)
          }
          
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
              const previousSource = existingStock.source
              
              // Smart reconciliation: Update existing stock with Plaid data
              const { error: updateError } = await supabase
                .from('user_stocks')
                .update(stockData)
                .eq('id', existingStock.id)

              if (updateError) {
                console.error(`Error updating stock ${symbol}:`, updateError)
              } else {
                // Update reconciliation metadata if it was a manual entry
                if (previousSource === 'manual') {
                  const { error: metadataError } = await supabase.rpc('update_reconciliation_metadata', {
                    p_user_id: user_id,
                    p_symbol: symbol,
                    p_reconciliation_type: 'manual_to_plaid',
                    p_previous_source: previousSource
                  })
                  
                  if (metadataError) {
                    console.error(`Error updating reconciliation metadata for ${symbol}:`, metadataError)
                  } else {
                    console.log(`Reconciled manual entry ${symbol}: ${existingStock.shares} -> ${aggregatedHolding.quantity} shares`)
                    reconciledStocks++
                  }
                } else {
                  console.log(`Updated Plaid stock ${symbol} with ${aggregatedHolding.quantity} total shares (was ${existingStock.shares})`)
                }
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
                newStocks++
                totalNewDividends++
              }
            }
          } catch (error) {
            console.error(`Error processing aggregated stock ${symbol}:`, error)
            continue
          }
        }
        
        // Cleanup: Remove Plaid-sourced stocks that are no longer held
        console.log(`Checking for sold positions to remove...`)
        const syncedSymbols = Array.from(holdingsMap.keys())
        const { data: existingPlaidStocks, error: fetchError } = await supabase
          .from('user_stocks')
          .select('id, symbol')
          .eq('user_id', user_id)
          .eq('source', 'plaid_sync')
          .eq('plaid_item_id', account.item_id)

        if (fetchError) {
          console.error('Error fetching existing Plaid stocks for cleanup:', fetchError)
        } else if (existingPlaidStocks && existingPlaidStocks.length > 0) {
          for (const stock of existingPlaidStocks) {
            if (!syncedSymbols.includes(stock.symbol)) {
              // Stock no longer held in brokerage - delete it
              const { error: deleteError } = await supabase
                .from('user_stocks')
                .delete()
                .eq('id', stock.id)
              
              if (deleteError) {
                console.error(`Error deleting sold position ${stock.symbol}:`, deleteError)
              } else {
                console.log(`Removed sold position: ${stock.symbol}`)
                removedStocks++
              }
            }
          }
        } else {
          console.log('No Plaid-sourced stocks found for cleanup check')
        }
        
        // Mark this account as successfully synced
        successfulSyncs++
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
        failedSyncs++
        syncErrors.push(`${account.account_name || account.account_id}: ${(error as Error).message}`)
        continue
      }
    }

    // Global cleanup: Remove any Plaid-sourced stocks no longer held in ANY active account
    console.log(`Running global cleanup. Global symbols set contains ${globalSymbols.size} symbols`)
    const { data: allPlaidStocks, error: globalFetchError } = await supabase
      .from('user_stocks')
      .select('id, symbol')
      .eq('user_id', user_id)
      .eq('source', 'plaid_sync')

    if (globalFetchError) {
      console.error('Error fetching all Plaid stocks for global cleanup:', globalFetchError)
    } else if (allPlaidStocks && allPlaidStocks.length > 0) {
      console.log(`Found ${allPlaidStocks.length} total Plaid-synced stocks in database`)
      for (const stock of allPlaidStocks) {
        if (!globalSymbols.has(stock.symbol)) {
          // Stock no longer held in ANY active account - delete it
          const { error: deleteError } = await supabase
            .from('user_stocks')
            .delete()
            .eq('id', stock.id)
          
          if (deleteError) {
            console.error(`Error deleting stock ${stock.symbol} (id: ${stock.id}):`, deleteError)
          } else {
            console.log(`Global cleanup removed: ${stock.symbol} (id: ${stock.id})`)
            removedStocks++
          }
        }
      }
    } else {
      console.log('No Plaid-sourced stocks found for global cleanup')
    }
    console.log(`Global cleanup complete. Removed ${removedStocks} total stocks`)

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

    // Build response message based on success/failure rates
    const totalAccounts = accounts.length
    let message = ''
    let responseData = {
      syncedStocks: totalNewDividends,
      reconciledStocks: reconciledStocks,
      newStocks: newStocks,
      removedStocks: removedStocks,
      accountsProcessed: totalAccounts,
      successfulSyncs: successfulSyncs,
      failedSyncs: failedSyncs,
      accountValidations: accountValidations
    }

    if (failedSyncs === 0 && successfulSyncs > 0) {
      // Complete success
      message = `Successfully synced ${totalNewDividends} stocks from your portfolio`
      if (reconciledStocks > 0) {
        message += ` (${reconciledStocks} manual entries reconciled with brokerage data)`
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          ...responseData,
          message: message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (successfulSyncs > 0 && failedSyncs > 0) {
      // Partial success
      message = `Synced ${totalNewDividends} stocks successfully from ${successfulSyncs} account${successfulSyncs > 1 ? 's' : ''}, but ${failedSyncs} inactive account${failedSyncs > 1 ? 's' : ''} couldn't sync.`
      
      return new Response(
        JSON.stringify({ 
          success: true,
          partial_failure: true,
          ...responseData,
          errors: syncErrors,
          message: message,
          warning: 'Some accounts failed to sync. Your portfolio may not be fully up to date.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Complete failure
      message = 'Failed to sync any accounts. Please check your connection and try again.'
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Sync failed',
          ...responseData,
          errors: syncErrors,
          message: message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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