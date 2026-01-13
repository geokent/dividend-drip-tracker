import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe JSON parser that handles non-JSON responses gracefully
async function safeJsonParse(response: Response, label: string): Promise<{ ok: boolean; data: any; text: string; status: number }> {
  const status = response.status;
  const text = await response.text();
  
  console.log(`${label} response status: ${status}, first 200 chars: ${text.substring(0, 200)}`);
  
  try {
    const data = JSON.parse(text);
    return { ok: true, data, text, status };
  } catch {
    return { ok: false, data: null, text, status };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      console.error('FMP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching data for symbol: ${symbol}`);
    
    // Using FMP's stable endpoints (required since Aug 2025)
    const [priceResponse, dividendsResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/stable/dividends?symbol=${symbol}&apikey=${apiKey}`)
    ]);

    // Safe parse both responses
    const [priceResult, dividendsResult] = await Promise.all([
      safeJsonParse(priceResponse, 'Price'),
      safeJsonParse(dividendsResponse, 'Dividends')
    ]);

    // Log parsed data for debugging
    console.log('Price data:', JSON.stringify(priceResult.data, null, 2));
    console.log('Dividends data:', JSON.stringify(dividendsResult.data, null, 2));

    // Check for API errors in the response
    if (priceResult.data?.['Error Message']) {
      console.log('API Error:', priceResult.data['Error Message']);
      return new Response(
        JSON.stringify({ error: `FMP API Error: ${priceResult.data['Error Message']}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (dividendsResult.data?.['Error Message']) {
      console.log('API Error:', dividendsResult.data['Error Message']);
      return new Response(
        JSON.stringify({ error: `FMP API Error: ${dividendsResult.data['Error Message']}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle non-JSON responses (like "Premium required" text)
    if (!priceResult.ok) {
      console.log('Price response was not valid JSON:', priceResult.text.substring(0, 100));
      return new Response(
        JSON.stringify({ error: `FMP API returned invalid response for price data: ${priceResult.text.substring(0, 100)}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!dividendsResult.ok) {
      console.log('Dividends response was not valid JSON:', dividendsResult.text.substring(0, 100));
      return new Response(
        JSON.stringify({ error: `FMP API returned invalid response for dividend data: ${dividendsResult.text.substring(0, 100)}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle HTTP error status codes
    if (priceResult.status === 401 || priceResult.status === 403) {
      return new Response(
        JSON.stringify({ error: 'FMP API access denied. Please check your API key.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (priceResult.status === 429) {
      return new Response(
        JSON.stringify({ error: 'FMP API rate limit reached. Please try again later.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceData = priceResult.data;
    const dividendsData = dividendsResult.data;

    // Handle empty or invalid price data
    // Stable API returns an array, check if it has data
    const quoteData = Array.isArray(priceData) ? priceData[0] : priceData;
    
    if (!quoteData || (Array.isArray(priceData) && priceData.length === 0)) {
      console.log('No price data found for symbol:', symbol);
      return new Response(
        JSON.stringify({ error: `Stock not found. Could not find data for ${symbol}.` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract basic stock info from quote data
    const stockData: any = {
      symbol: quoteData.symbol || symbol,
      companyName: quoteData.name || quoteData.companyName || symbol,
      currentPrice: quoteData.price || null,
      dividendYield: null,
      dividendPerShare: null,
      annualDividend: null,
      exDividendDate: null,
      dividendDate: null,
      nextExDividendDate: null,
      dividendFrequency: null,
      sector: quoteData.sector || null,
      industry: quoteData.industry || null,
      marketCap: quoteData.marketCap || null,
      peRatio: quoteData.pe || quoteData.peRatio || null,
    };

    // Helper function to analyze dividend frequency
    const analyzeDividendFrequency = (dividends: any[]): string => {
      if (dividends.length < 2) return 'Unknown';
      
      // Get dates from last year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const recentDividends = dividends.filter(d => new Date(d.date || d.paymentDate) > oneYearAgo);
      const count = recentDividends.length;
      
      if (count >= 11 && count <= 13) return 'Monthly';
      if (count >= 3 && count <= 5) return 'Quarterly';
      if (count === 2) return 'Semi-Annual';
      if (count === 1) return 'Annual';
      if (count > 13) return 'Monthly';
      
      return 'Quarterly'; // Default assumption
    };

    // Helper function to estimate next dividend date
    const estimateNextDividendDate = (dividends: any[], frequency: string): string | null => {
      if (dividends.length === 0) return null;
      
      const lastDividend = dividends[0];
      const lastDate = new Date(lastDividend.date || lastDividend.paymentDate);
      
      let monthsToAdd = 3; // Default quarterly
      switch (frequency) {
        case 'Monthly': monthsToAdd = 1; break;
        case 'Quarterly': monthsToAdd = 3; break;
        case 'Semi-Annual': monthsToAdd = 6; break;
        case 'Annual': monthsToAdd = 12; break;
      }
      
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
      
      // If estimated date is in the past, keep adding intervals
      const now = new Date();
      while (nextDate < now) {
        nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
      }
      
      return nextDate.toISOString().split('T')[0];
    };

    // Handle both new stable format (array) and legacy format (object with .historical)
    let dividendHistory: any[] | null = null;
    if (dividendsData) {
      if (Array.isArray(dividendsData)) {
        // New stable format: returns array directly
        dividendHistory = dividendsData;
        console.log(`Found ${dividendsData.length} dividend records (stable format)`);
      } else if (dividendsData.historical && Array.isArray(dividendsData.historical)) {
        // Legacy format: object with .historical array
        dividendHistory = dividendsData.historical;
        console.log(`Found ${dividendsData.historical.length} dividend records (legacy format)`);
      }
    }
    
    if (dividendHistory && dividendHistory.length > 0) {
      // Sort by date descending (most recent first)
      const sortedDividends = dividendHistory.sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.paymentDate || a.exDividendDate || 0);
        const dateB = new Date(b.date || b.paymentDate || b.exDividendDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Analyze frequency
      const frequency = analyzeDividendFrequency(sortedDividends);
      stockData.dividendFrequency = frequency;
      
      // Get most recent dividend data
      const latestDividend = sortedDividends[0];
      
      // Handle different field names in the API response
      const dividendAmount = latestDividend.dividend || latestDividend.adjDividend || latestDividend.amount || 0;
      stockData.dividendPerShare = dividendAmount;
      
      // Calculate annual dividend based on frequency
      let multiplier = 4; // Default quarterly
      switch (frequency) {
        case 'Monthly': multiplier = 12; break;
        case 'Quarterly': multiplier = 4; break;
        case 'Semi-Annual': multiplier = 2; break;
        case 'Annual': multiplier = 1; break;
      }
      stockData.annualDividend = dividendAmount * multiplier;
      
      // Calculate yield if we have price and annual dividend
      if (stockData.currentPrice && stockData.annualDividend) {
        stockData.dividendYield = (stockData.annualDividend / stockData.currentPrice) * 100;
      }
      
      // Set dividend dates - handle different field names
      stockData.exDividendDate = latestDividend.exDividendDate || latestDividend.date || null;
      stockData.dividendDate = latestDividend.paymentDate || latestDividend.date || null;
      
      // Estimate next ex-dividend date
      stockData.nextExDividendDate = estimateNextDividendDate(sortedDividends, frequency);
      
      console.log('Processed dividend data:', {
        frequency,
        latestDividend: dividendAmount,
        annualDividend: stockData.annualDividend,
        yield: stockData.dividendYield
      });
    } else {
      console.log('No dividend history found for symbol:', symbol);
    }

    console.log('Final stock data:', stockData);

    return new Response(
      JSON.stringify(stockData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-dividend-data:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
