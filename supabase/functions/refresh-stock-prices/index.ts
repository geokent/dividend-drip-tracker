import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's tracked stocks
    const { data: userStocks, error: fetchError } = await supabase
      .from('user_stocks')
      .select('*')
      .eq('user_id', user_id);

    if (fetchError) {
      console.error('Error fetching user stocks:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user stocks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userStocks || userStocks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No stocks to refresh', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!alphaVantageKey) {
      console.error('Alpha Vantage API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Process stocks in batches to avoid rate limits
    for (const stock of userStocks) {
      try {
        console.log(`Refreshing data for ${stock.symbol}...`);

        // Get comprehensive dividend data
        const { data: dividendData, error: dividendError } = await supabase.functions.invoke('get-dividend-data', {
          body: { symbol: stock.symbol }
        });

        if (dividendError) {
          console.error(`Error fetching dividend data for ${stock.symbol}:`, dividendError);
          errors.push(`Error fetching dividend data for ${stock.symbol}: ${dividendError.message}`);
          continue;
        }

        if (dividendData.error) {
          console.error(`API error for ${stock.symbol}:`, dividendData.error);
          errors.push(`API error for ${stock.symbol}: ${dividendData.error}`);
          continue;
        }

        // Update the stock with comprehensive data
        const { error: updateError } = await supabase
          .from('user_stocks')
          .update({ 
            current_price: dividendData.currentPrice,
            company_name: dividendData.companyName,
            dividend_yield: dividendData.dividendYield,
            dividend_per_share: dividendData.dividendPerShare,
            annual_dividend: dividendData.annualDividend,
            ex_dividend_date: dividendData.exDividendDate,
            dividend_date: dividendData.dividendDate,
            next_ex_dividend_date: dividendData.nextExDividendDate,
            dividend_frequency: dividendData.dividendFrequency,
            sector: dividendData.sector,
            industry: dividendData.industry,
            market_cap: dividendData.marketCap ? parseFloat(dividendData.marketCap) : null,
            pe_ratio: dividendData.peRatio ? parseFloat(dividendData.peRatio) : null,
            last_synced: new Date().toISOString()
          })
          .eq('id', stock.id);

        if (updateError) {
          console.error(`Error updating ${stock.symbol}:`, updateError);
          errors.push(`Error updating ${stock.symbol}: ${updateError.message}`);
        } else {
          updatedCount++;
          console.log(`Successfully updated ${stock.symbol}: $${dividendData.currentPrice}`);
        }

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing ${stock.symbol}:`, error);
        errors.push(`Error processing ${stock.symbol}: ${error.message}`);
      }
    }

    const response = {
      message: `Refreshed data for ${updatedCount} out of ${userStocks.length} stocks`,
      updated: updatedCount,
      total: userStocks.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Data refresh completed:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in refresh-stock-prices function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});