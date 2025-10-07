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
    
    // Optimized: Only fetch time-sensitive data (price and dividends)
    const [priceResponse, dividendsResponse] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${apiKey}`)
    ]);

    const [priceData, dividendsData] = await Promise.all([
      priceResponse.json(),
      dividendsResponse.json()
    ]);

    console.log('Price data:', JSON.stringify(priceData, null, 2));
    console.log('Dividends data:', JSON.stringify(dividendsData, null, 2));

    // Check for API errors
    if (priceData['Error Message'] || dividendsData['Error Message']) {
      const errorMsg = priceData['Error Message'] || dividendsData['Error Message'];
      console.log('API Error:', errorMsg);
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting
    if (priceData.Note || dividendsData.Note) {
      const noteMsg = priceData.Note || dividendsData.Note;
      console.log('API Note (rate limit):', noteMsg);
      return new Response(
        JSON.stringify({ error: 'API rate limit reached. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract price data
    const quote = priceData['Global Quote'];
    const currentPrice = quote?.['05. price'] ? parseFloat(quote['05. price']) : null;
    
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
    
    const estimateNextDividendDate = (lastExDate: string, frequency: string) => {
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
      
      const sortedDividends = dividendsData.data.sort((a: any, b: any) =>
        new Date(b.exDividendDate || b.ex_dividend_date).getTime() - new Date(a.exDividendDate || a.ex_dividend_date).getTime()
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
          const recentYear = sortedDividends.filter((d: any) => {
            const divDate = new Date(d.exDividendDate || d.ex_dividend_date);
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return divDate >= oneYearAgo;
          });
          
          if (recentYear.length > 0) {
            annualDividend = recentYear.reduce((sum: number, d: any) => 
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
    
    // Calculate yield if we have price and annual dividend
    if (!dividendYield && currentPrice && annualDividend) {
      dividendYield = (annualDividend / currentPrice) * 100;
    }
    
    // Log final dividend analysis
    console.log('Final dividend data:', {
      dividendYield,
      dividendPerShare,
      annualDividend,
      exDividendDate,
      dividendDate,
      nextExDividendDate,
      frequency: dividendFrequency
    });

    const result = {
      symbol: symbol.toUpperCase(),
      currentPrice,
      dividendYield,
      dividendPerShare,
      annualDividend,
      exDividendDate,
      dividendDate,
      nextExDividendDate,
      dividendFrequency,
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