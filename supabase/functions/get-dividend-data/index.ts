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
    
    // With paid tier, we can use more comprehensive endpoints
    const [overviewResponse, priceResponse, timeSeriesResponse] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`),
      // Try TIME_SERIES_MONTHLY_ADJUSTED for dividend data
      fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}&apikey=${apiKey}`)
    ]);

    const [overviewData, priceData, timeSeriesData] = await Promise.all([
      overviewResponse.json(),
      priceResponse.json(),
      timeSeriesResponse.json()
    ]);

    console.log('Overview data:', JSON.stringify(overviewData, null, 2));
    console.log('Price data:', JSON.stringify(priceData, null, 2));
    console.log('Time series data keys:', Object.keys(timeSeriesData));

    // Check for API errors in any response
    if (overviewData['Error Message'] || priceData['Error Message'] || timeSeriesData['Error Message']) {
      const errorMsg = overviewData['Error Message'] || priceData['Error Message'] || timeSeriesData['Error Message'];
      console.log('API Error:', errorMsg);
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting
    if (overviewData.Note || priceData.Note || timeSeriesData.Note) {
      const noteMsg = overviewData.Note || priceData.Note || timeSeriesData.Note;
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
    
    // Parse dividend data with enhanced paid tier capabilities
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
    
    // Enhanced dividend extraction from time series data (paid tier feature)
    if ((!dividendYield || !dividendPerShare) && timeSeriesData['Monthly Adjusted Time Series']) {
      console.log('Extracting dividend data from time series...');
      const monthlyData = timeSeriesData['Monthly Adjusted Time Series'];
      const months = Object.keys(monthlyData).sort().reverse(); // Most recent first
      
      // Look for dividend payments in recent months
      let recentDividends = [];
      for (let i = 0; i < Math.min(12, months.length); i++) {
        const monthData = monthlyData[months[i]];
        const dividend = parseFloat(monthData['7. dividend amount'] || '0');
        if (dividend > 0) {
          recentDividends.push(dividend);
        }
      }
      
      if (recentDividends.length > 0) {
        // Calculate annual dividend from recent payments
        const totalDividends = recentDividends.reduce((sum, div) => sum + div, 0);
        annualDividend = totalDividends;
        
        // Calculate dividend per share (most recent)
        dividendPerShare = recentDividends[0];
        
        // Calculate yield if we have current price
        if (currentPrice && annualDividend) {
          dividendYield = (annualDividend / currentPrice) * 100;
        }
        
        console.log('Extracted from time series:', {
          recentDividends,
          annualDividend,
          calculatedYield: dividendYield
        });
      }
    }
    
    // Special handling for ETFs and investment funds
    const assetType = overviewData.AssetType || 'Common Stock';
    console.log('Asset type:', assetType);
    
    // Log what we found
    console.log('Final dividend data extracted:', {
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