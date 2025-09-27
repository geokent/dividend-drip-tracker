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
    
    // With paid tier, we can use more comprehensive endpoints including dedicated DIVIDENDS API
    const [overviewResponse, priceResponse, timeSeriesResponse, dividendsResponse] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`),
      // Try TIME_SERIES_MONTHLY_ADJUSTED for dividend data
      fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}&apikey=${apiKey}`),
      // Use dedicated DIVIDENDS API for better dividend information
      fetch(`https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${apiKey}`)
    ]);

    const [overviewData, priceData, timeSeriesData, dividendsData] = await Promise.all([
      overviewResponse.json(),
      priceResponse.json(),
      timeSeriesResponse.json(),
      dividendsResponse.json()
    ]);

    console.log('Overview data:', JSON.stringify(overviewData, null, 2));
    console.log('Price data:', JSON.stringify(priceData, null, 2));
    console.log('Time series data keys:', Object.keys(timeSeriesData));
    console.log('Dividends data:', JSON.stringify(dividendsData, null, 2));

    // Check for API errors in any response
    if (overviewData['Error Message'] || priceData['Error Message'] || timeSeriesData['Error Message'] || dividendsData['Error Message']) {
      const errorMsg = overviewData['Error Message'] || priceData['Error Message'] || timeSeriesData['Error Message'] || dividendsData['Error Message'];
      console.log('API Error:', errorMsg);
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting
    if (overviewData.Note || priceData.Note || timeSeriesData.Note || dividendsData.Note) {
      const noteMsg = overviewData.Note || priceData.Note || timeSeriesData.Note || dividendsData.Note;
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
    
    // Helper functions for enhanced dividend analysis
    const analyzeDividendFrequency = (dividendHistory: any[]) => {
      if (!dividendHistory || dividendHistory.length < 2) return 'unknown';
      
      const dates = dividendHistory.map((d: any) => new Date(d.exDividendDate).getTime());
      dates.sort((a: number, b: number) => b - a); // Most recent first
      
      const daysBetween: number[] = [];
      for (let i = 0; i < Math.min(dates.length - 1, 4); i++) {
        const diff = Math.abs(dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
        daysBetween.push(diff);
      }
      
      if (daysBetween.length === 0) return 'unknown';
      
      const avgDays = daysBetween.reduce((sum, days) => sum + days, 0) / daysBetween.length;
      
      if (avgDays >= 350) return 'annual';
      if (avgDays >= 80 && avgDays <= 100) return 'quarterly';
      if (avgDays >= 25 && avgDays <= 35) return 'monthly';
      return 'irregular';
    };
    
    const estimateNextDividendDate = (lastExDate, frequency) => {
      if (!lastExDate) return null;
      
      const lastDate = new Date(lastExDate);
      const today = new Date();
      
      let nextDate = new Date(lastDate);
      
      switch (frequency) {
        case 'quarterly':
          nextDate.setMonth(lastDate.getMonth() + 3);
          break;
        case 'monthly':
          nextDate.setMonth(lastDate.getMonth() + 1);
          break;
        case 'annual':
          nextDate.setFullYear(lastDate.getFullYear() + 1);
          break;
        default:
          // For irregular or unknown, estimate quarterly as most common
          nextDate.setMonth(lastDate.getMonth() + 3);
      }
      
      // If estimated date is in the past, add another period
      while (nextDate <= today) {
        switch (frequency) {
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'annual':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            nextDate.setMonth(nextDate.getMonth() + 3);
        }
      }
      
      return nextDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    };

    // Enhanced dividend parsing using dedicated DIVIDENDS API
    let dividendYield = null;
    let dividendPerShare = null;
    let annualDividend = null;
    let exDividendDate = null;
    let dividendDate = null;
    let nextExDividendDate = null;
    let dividendFrequency = 'unknown';
    
    console.log('Processing dividend data from DIVIDENDS API...');
    
    // First, try to extract data from the dedicated DIVIDENDS API
    if (dividendsData && dividendsData.data && Array.isArray(dividendsData.data)) {
      console.log(`Found ${dividendsData.data.length} dividend records from DIVIDENDS API`);
      
      const sortedDividends = dividendsData.data.sort((a, b) => 
        new Date(b.exDividendDate || b.ex_dividend_date) - new Date(a.exDividendDate || a.ex_dividend_date)
      );
      
      // Analyze frequency
      dividendFrequency = analyzeDividendFrequency(sortedDividends);
      console.log('Detected dividend frequency:', dividendFrequency);
      
      if (sortedDividends.length > 0) {
        const mostRecent = sortedDividends[0];
        
        // Extract dates (handle different field name formats and sanitize "None" values)
        const rawExDividendDate = mostRecent.exDividendDate || mostRecent.ex_dividend_date || null;
        const rawDividendDate = mostRecent.paymentDate || mostRecent.payment_date || mostRecent.dividendDate || null;
        
        // Sanitize date values - set to null if "None", empty, or invalid
        exDividendDate = (rawExDividendDate && rawExDividendDate !== 'None' && rawExDividendDate !== '') ? rawExDividendDate : null;
        dividendDate = (rawDividendDate && rawDividendDate !== 'None' && rawDividendDate !== '') ? rawDividendDate : exDividendDate;
        
        // Extract dividend amount
        dividendPerShare = parseFloat(mostRecent.amount || mostRecent.dividend_amount || mostRecent.dividendAmount || 0);
        
        // Calculate annual dividend based on frequency and recent payments
        if (dividendPerShare > 0) {
          const recentYear = sortedDividends.filter(d => {
            const divDate = new Date(d.exDividendDate || d.ex_dividend_date);
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return divDate >= oneYearAgo;
          });
          
          if (recentYear.length > 0) {
            annualDividend = recentYear.reduce((sum, d) => 
              sum + parseFloat(d.amount || d.dividend_amount || d.dividendAmount || 0), 0
            );
          } else {
            // Estimate based on frequency
            switch (dividendFrequency) {
              case 'quarterly':
                annualDividend = dividendPerShare * 4;
                break;
              case 'monthly':
                annualDividend = dividendPerShare * 12;
                break;
              case 'annual':
                annualDividend = dividendPerShare;
                break;
              default:
                annualDividend = dividendPerShare * 4; // Default to quarterly estimate
            }
          }
        }
        
        // Estimate next ex-dividend date
        nextExDividendDate = estimateNextDividendDate(exDividendDate, dividendFrequency);
        
        console.log('Extracted from DIVIDENDS API:', {
          exDividendDate,
          dividendDate,
          dividendPerShare,
          annualDividend,
          frequency: dividendFrequency,
          nextEstimated: nextExDividendDate
        });
      }
    }
    
    // Fallback to overview data if DIVIDENDS API didn't provide complete data
    if (!dividendYield && overviewData.DividendYield && overviewData.DividendYield !== 'None' && overviewData.DividendYield !== '0') {
      dividendYield = parseFloat(overviewData.DividendYield) * 100; // Convert to percentage
    }
    
    if (!dividendPerShare && overviewData.DividendPerShare && overviewData.DividendPerShare !== 'None' && overviewData.DividendPerShare !== '0') {
      dividendPerShare = parseFloat(overviewData.DividendPerShare);
      if (!annualDividend) {
        annualDividend = dividendPerShare; // Overview DividendPerShare is TTM
      }
    }
    
    if (!exDividendDate && overviewData.ExDividendDate && overviewData.ExDividendDate !== 'None' && overviewData.ExDividendDate !== '') {
      exDividendDate = overviewData.ExDividendDate;
    }
    
    // Additional fallback to time series data if still missing key data
    if ((!dividendYield || !dividendPerShare) && timeSeriesData['Monthly Adjusted Time Series']) {
      console.log('Fallback: extracting dividend data from time series...');
      const monthlyData = timeSeriesData['Monthly Adjusted Time Series'];
      const months = Object.keys(monthlyData).sort().reverse(); // Most recent first
      
      let recentDividends = [];
      for (let i = 0; i < Math.min(12, months.length); i++) {
        const monthData = monthlyData[months[i]];
        const dividend = parseFloat(monthData['7. dividend amount'] || '0');
        if (dividend > 0) {
          recentDividends.push(dividend);
        }
      }
      
      if (recentDividends.length > 0) {
        const totalDividends = recentDividends.reduce((sum, div) => sum + div, 0);
        if (!annualDividend) annualDividend = totalDividends;
        if (!dividendPerShare) dividendPerShare = recentDividends[0];
        
        console.log('Fallback extraction from time series:', {
          recentDividends,
          annualDividend,
          dividendPerShare
        });
      }
    }
    
    // Calculate yield if we have price and annual dividend
    if (!dividendYield && currentPrice && annualDividend) {
      dividendYield = (annualDividend / currentPrice) * 100;
    }
    
    // Special handling for ETFs and investment funds
    const assetType = overviewData.AssetType || 'Common Stock';
    console.log('Asset type:', assetType);
    
    // Log final dividend analysis
    console.log('Final enhanced dividend data:', {
      dividendYield,
      dividendPerShare,
      annualDividend,
      exDividendDate,
      dividendDate,
      nextExDividendDate,
      frequency: dividendFrequency,
      assetType
    });

    // Extract other company data
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
      dividendDate,
      nextExDividendDate,
      dividendFrequency,
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