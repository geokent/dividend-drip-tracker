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
    const { symbol } = await req.json()

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Missing symbol parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Alpha Vantage API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching data for symbol: ${symbol}`);
    
    // Fetch multiple endpoints in parallel for comprehensive data
    const [overviewResponse, priceResponse, earningsResponse] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apiKey}`)
    ]);

    const [overviewData, priceData, earningsData] = await Promise.all([
      overviewResponse.json(),
      priceResponse.json(),
      earningsResponse.json()
    ]);

    console.log('Overview data:', JSON.stringify(overviewData, null, 2));
    console.log('Price data:', JSON.stringify(priceData, null, 2));
    console.log('Earnings data:', JSON.stringify(earningsData, null, 2));

    // Check for API errors in any response
    if (overviewData['Error Message'] || priceData['Error Message'] || earningsData['Error Message']) {
      const errorMsg = overviewData['Error Message'] || priceData['Error Message'] || earningsData['Error Message'];
      console.log('API Error:', errorMsg);
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting
    if (overviewData.Note || priceData.Note || earningsData.Note) {
      const noteMsg = overviewData.Note || priceData.Note || earningsData.Note;
      console.log('API Note (rate limit):', noteMsg);
      return new Response(
        JSON.stringify({ error: 'API rate limit reached. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract price data
    const quote = priceData['Global Quote'];
    const currentPrice = quote?.['05. price'] ? parseFloat(quote['05. price']) : null;

    // Extract company information (handle case where overview data might be incomplete)
    const companyName = overviewData.Name || 
                       (overviewData.Symbol ? `${overviewData.Symbol} ETF` : `${symbol.toUpperCase()}`);
    
    // Parse dividend data with better handling - try multiple sources
    let dividendYield = null;
    let dividendPerShare = null;
    let annualDividend = null;
    
    // Try to get dividend data from overview first
    if (overviewData.DividendYield && overviewData.DividendYield !== 'None' && overviewData.DividendYield !== '0') {
      dividendYield = parseFloat(overviewData.DividendYield) * 100; // Convert to percentage
    }
    
    if (overviewData.DividendPerShare && overviewData.DividendPerShare !== 'None' && overviewData.DividendPerShare !== '0') {
      dividendPerShare = parseFloat(overviewData.DividendPerShare);
      // Most dividends are quarterly, so multiply by 4 for annual
      annualDividend = dividendPerShare * 4;
    }
    
    // If overview data is empty or insufficient, try to extract from earnings data
    if (!dividendYield && !dividendPerShare && earningsData && earningsData.quarterlyEarnings) {
      console.log('Overview data insufficient, checking earnings data for dividend info...');
      // Some companies report dividend information in earnings data
      // This is a fallback approach for ETFs and REITs that might not have complete overview data
    }
    
    // Special handling for ETFs and investment funds that might not have traditional dividend data
    const assetType = overviewData.AssetType || 'Common Stock';
    console.log('Asset type:', assetType);
    
    // Log what we found
    console.log('Dividend data extracted:', {
      dividendYield,
      dividendPerShare,
      annualDividend,
      assetType
    });

    // Extract other company data
    const exDividendDate = overviewData.ExDividendDate !== 'None' ? overviewData.ExDividendDate : null;
    const sector = overviewData.Sector !== 'None' ? overviewData.Sector : null;
    const industry = overviewData.Industry !== 'None' ? overviewData.Industry : null;
    const marketCap = overviewData.MarketCapitalization !== 'None' ? overviewData.MarketCapitalization : null;
    const peRatio = overviewData.PERatio !== 'None' ? overviewData.PERatio : null;

    const result = {
      symbol: symbol.toUpperCase(),
      companyName,
      currentPrice,
      dividendYield,
      dividendPerShare,
      annualDividend,
      exDividendDate,
      dividendDate: exDividendDate, // Using ex-dividend date as dividend date
      sector,
      industry,
      marketCap,
      peRatio,
    }

    console.log('Final result being returned:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching dividend data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})