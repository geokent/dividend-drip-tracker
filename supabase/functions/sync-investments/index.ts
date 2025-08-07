import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Plaid configuration
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = 'production';

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error('Missing Plaid configuration');
      return new Response(
        JSON.stringify({ error: 'Plaid configuration not found' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Determine Plaid API URL
    const plaidUrl = PLAID_ENV === 'production' 
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

    // Get user's active Plaid accounts
    const { data: plaidAccounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('account_type', 'investment');

    if (accountsError) {
      console.error('Error fetching Plaid accounts:', accountsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accounts' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!plaidAccounts || plaidAccounts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active investment accounts found',
          synced: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${plaidAccounts.length} investment accounts to sync`);

    let totalHoldings = 0;
    let syncedStocks = 0;

    // Process each investment account
    for (const account of plaidAccounts) {
      try {
        console.log(`Syncing holdings for account: ${account.account_name}`);

        // Get holdings for this account
        const holdingsRequest = {
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: account.access_token
        };

        const holdingsResponse = await fetch(`${plaidUrl}/investments/holdings/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(holdingsRequest)
        });

        const holdingsData = await holdingsResponse.json();

        if (!holdingsResponse.ok) {
          console.error(`Error getting holdings for account ${account.account_id}:`, holdingsData);
          continue;
        }

        console.log(`Found ${holdingsData.holdings?.length || 0} holdings for account ${account.account_name}`);
        totalHoldings += holdingsData.holdings?.length || 0;

        // Process each holding
        for (const holding of holdingsData.holdings || []) {
          const security = holdingsData.securities?.find((s: any) => s.security_id === holding.security_id);
          
          if (!security || !security.ticker_symbol) {
            console.log(`Skipping holding without ticker symbol:`, security?.name || 'Unknown');
            continue;
          }

          const symbol = security.ticker_symbol;
          const shares = parseFloat(holding.quantity) || 0;

          if (shares <= 0) {
            console.log(`Skipping ${symbol} with zero or negative shares: ${shares}`);
            continue;
          }

          // Get dividend data for this stock
          try {
            const { data: dividendData, error: dividendError } = await supabase.functions.invoke('get-dividend-data', {
              body: { symbol }
            });

            if (dividendError || dividendData.error) {
              console.log(`Could not get dividend data for ${symbol}:`, dividendError || dividendData.error);
              continue;
            }

            // Check if stock already exists
            const { data: existingStock } = await supabase
              .from('user_stocks')
              .select('id, shares')
              .eq('user_id', user.id)
              .eq('symbol', symbol)
              .single();

            const stockData = {
              user_id: user.id,
              symbol: dividendData.symbol,
              company_name: dividendData.companyName,
              current_price: dividendData.currentPrice,
              dividend_yield: dividendData.dividendYield,
              dividend_per_share: dividendData.dividendPerShare,
              annual_dividend: dividendData.annualDividend,
              ex_dividend_date: dividendData.exDividendDate,
              dividend_date: dividendData.dividendDate,
              sector: dividendData.sector,
              industry: dividendData.industry,
              market_cap: dividendData.marketCap ? parseFloat(dividendData.marketCap) : null,
              pe_ratio: dividendData.peRatio ? parseFloat(dividendData.peRatio) : null,
              shares: shares,
              last_synced: new Date().toISOString()
            };

            if (existingStock) {
              // For existing stocks, only update shares if they're currently 0 (meaning manually added without shares)
              // Otherwise preserve manually set share counts
              const finalStockData = {
                ...stockData,
                shares: existingStock.shares > 0 ? existingStock.shares : shares
              };

              const { error: updateError } = await supabase
                .from('user_stocks')
                .update(finalStockData)
                .eq('id', existingStock.id);

              if (updateError) {
                console.error(`Error updating stock ${symbol}:`, updateError);
              } else {
                console.log(`Updated ${symbol}: preserved ${existingStock.shares} shares (Plaid has ${shares})`);
                syncedStocks++;
              }
            } else {
              // Insert new stock
              const { error: insertError } = await supabase
                .from('user_stocks')
                .insert(stockData);

              if (insertError) {
                console.error(`Error inserting stock ${symbol}:`, insertError);
              } else {
                console.log(`Added ${symbol}: ${shares} shares`);
                syncedStocks++;
              }
            }

          } catch (error) {
            console.error(`Error processing stock ${symbol}:`, error);
          }
        }

      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error);
      }
    }

    console.log(`Sync complete: ${syncedStocks} stocks synced from ${totalHoldings} total holdings`);

    return new Response(
      JSON.stringify({ 
        success: true,
        totalHoldings,
        syncedStocks,
        message: `Successfully synced ${syncedStocks} dividend-paying stocks`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});