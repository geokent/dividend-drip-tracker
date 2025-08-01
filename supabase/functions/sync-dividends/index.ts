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

    // Get all active Plaid accounts for the user
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*')
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

    for (const account of accounts || []) {
      try {
        // Get stock holdings from Plaid
        const holdingsResponse = await fetch('https://production.plaid.com/investments/holdings/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
            'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
          },
          body: JSON.stringify({
            access_token: account.access_token,
          }),
        })

        const holdingsData = await holdingsResponse.json()

        if (!holdingsResponse.ok) {
          console.error('Plaid holdings error:', holdingsData)
          continue
        }

        console.log(`Found ${holdingsData.holdings?.length || 0} holdings for account ${account.account_id}`)

        // Process each holding
        for (const holding of holdingsData.holdings || []) {
          // Skip if no ticker symbol
          if (!holding.security?.ticker_symbol) {
            continue
          }

          const symbol = holding.security.ticker_symbol.toUpperCase()
          
          try {
            // Get dividend data for this stock
            console.log(`Fetching dividend data for symbol: ${symbol}`)
            const { data: dividendData, error: dividendError } = await supabase.functions.invoke('get-dividend-data', {
              body: { symbol }
            })

            console.log(`Dividend data response for ${symbol}:`, { data: dividendData, error: dividendError })

            if (dividendError) {
              console.error(`Error getting dividend data for ${symbol}:`, dividendError)
              continue
            }

            if (dividendData) {
              console.log(`Processing dividend data for ${symbol}:`, dividendData)
              
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
                shares: holding.quantity || 0,
                company_name: dividendData.companyName,
                current_price: dividendData.currentPrice,
                dividend_yield: dividendData.dividendYield,
                dividend_per_share: dividendData.dividendPerShare,
                annual_dividend: dividendData.annualDividend,
                ex_dividend_date: dividendData.exDividendDate,
                dividend_date: dividendData.dividendDate,
                sector: dividendData.sector,
                industry: dividendData.industry,
                market_cap: dividendData.marketCap,
                pe_ratio: dividendData.peRatio,
                last_synced: new Date().toISOString(),
              }

              if (existingStock) {
                // Update existing stock
                const { error: updateError } = await supabase
                  .from('user_stocks')
                  .update(stockData)
                  .eq('id', existingStock.id)

                if (updateError) {
                  console.error(`Error updating stock ${symbol}:`, updateError)
                } else {
                  console.log(`Updated stock ${symbol} with ${holding.quantity} shares`)
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
                  console.log(`Inserted new stock ${symbol} with ${holding.quantity} shares`)
                  totalNewDividends++
                }
              }
            } else {
              console.log(`No dividend data returned for ${symbol}`)
            }
          } catch (error) {
            console.error(`Error processing stock ${symbol}:`, error)
            continue
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
        continue
      }
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