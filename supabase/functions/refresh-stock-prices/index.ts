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
        console.log(`Refreshing price for ${stock.symbol}...`);

        // Fetch current stock quote
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${alphaVantageKey}`;
        const quoteResponse = await fetch(quoteUrl);
        
        if (!quoteResponse.ok) {
          console.error(`Failed to fetch quote for ${stock.symbol}: ${quoteResponse.status}`);
          errors.push(`Failed to fetch quote for ${stock.symbol}`);
          continue;
        }

        const quoteData = await quoteResponse.json();
        
        // Check for API errors or rate limits
        if (quoteData.Note || quoteData['Error Message']) {
          console.error(`API error for ${stock.symbol}:`, quoteData.Note || quoteData['Error Message']);
          errors.push(`API error for ${stock.symbol}: ${quoteData.Note || quoteData['Error Message']}`);
          continue;
        }

        const globalQuote = quoteData['Global Quote'];
        if (!globalQuote) {
          console.error(`No quote data found for ${stock.symbol}`);
          errors.push(`No quote data found for ${stock.symbol}`);
          continue;
        }

        const currentPrice = parseFloat(globalQuote['05. price']);
        
        if (isNaN(currentPrice)) {
          console.error(`Invalid price data for ${stock.symbol}:`, globalQuote['05. price']);
          errors.push(`Invalid price data for ${stock.symbol}`);
          continue;
        }

        // Update the stock price in the database
        const { error: updateError } = await supabase
          .from('user_stocks')
          .update({ 
            current_price: currentPrice,
            last_synced: new Date().toISOString()
          })
          .eq('id', stock.id);

        if (updateError) {
          console.error(`Error updating ${stock.symbol}:`, updateError);
          errors.push(`Error updating ${stock.symbol}: ${updateError.message}`);
        } else {
          updatedCount++;
          console.log(`Successfully updated ${stock.symbol}: $${currentPrice}`);
        }

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing ${stock.symbol}:`, error);
        errors.push(`Error processing ${stock.symbol}: ${error.message}`);
      }
    }

    const response = {
      message: `Refreshed prices for ${updatedCount} out of ${userStocks.length} stocks`,
      updated: updatedCount,
      total: userStocks.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Price refresh completed:', response);

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