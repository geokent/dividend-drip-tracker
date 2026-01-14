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

// Fetch data from Tiingo API (fallback for ETFs that require premium FMP access)
async function fetchFromTiingo(symbol: string, apiKey: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Token ${apiKey}`
  };
  
  console.log(`Attempting Tiingo fallback for symbol: ${symbol}`);
  
  try {
    // Tiingo IEX endpoint for real-time price data
    const priceUrl = `https://api.tiingo.com/iex/${symbol.toLowerCase()}`;
    // Tiingo distributions endpoint for dividend history
    const dividendUrl = `https://api.tiingo.com/tiingo/corporate-actions/${symbol.toLowerCase()}/distributions`;
    
    const [priceResponse, dividendResponse] = await Promise.all([
      fetch(priceUrl, { headers }),
      fetch(dividendUrl, { headers })
    ]);

    console.log(`Tiingo price response status: ${priceResponse.status}`);
    console.log(`Tiingo dividend response status: ${dividendResponse.status}`);

    // Check if Tiingo found the symbol
    if (priceResponse.status === 404) {
      console.log('Tiingo: Symbol not found');
      return { success: false, error: `Symbol ${symbol} not found on Tiingo` };
    }

    if (priceResponse.status !== 200) {
      const errorText = await priceResponse.text();
      console.log('Tiingo price error:', errorText);
      return { success: false, error: `Tiingo API error: ${errorText.substring(0, 100)}` };
    }

    const priceData = await priceResponse.json();
    let dividendData: any[] = [];
    
    if (dividendResponse.status === 200) {
      dividendData = await dividendResponse.json();
    } else {
      console.log('Tiingo dividend data not available, continuing with price only');
    }

    console.log('Tiingo price data:', JSON.stringify(priceData, null, 2));
    console.log('Tiingo dividend data count:', dividendData?.length || 0);

    // Tiingo IEX returns array with single element for single symbol
    const quote = Array.isArray(priceData) ? priceData[0] : priceData;
    
    if (!quote) {
      return { success: false, error: `No price data found for ${symbol} on Tiingo` };
    }

    // Build normalized stock data
    const stockData: any = {
      symbol: symbol.toUpperCase(),
      companyName: quote.ticker?.toUpperCase() || symbol.toUpperCase(),
      currentPrice: quote.last || quote.prevClose || quote.tngoLast || null,
      dividendYield: null,
      dividendPerShare: null,
      annualDividend: null,
      exDividendDate: null,
      dividendDate: null,
      nextExDividendDate: null,
      dividendFrequency: null,
      sector: null,
      industry: null,
      marketCap: null,
      peRatio: null,
    };

    // Process dividend data if available
    if (dividendData && dividendData.length > 0) {
      // Sort by exDate descending (most recent first)
      const sortedDividends = dividendData.sort((a: any, b: any) => {
        const dateA = new Date(a.exDate || 0);
        const dateB = new Date(b.exDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Analyze frequency from recent dividends
      const frequency = analyzeTiingoDividendFrequency(sortedDividends);
      stockData.dividendFrequency = frequency;

      // Get most recent dividend
      const latestDividend = sortedDividends[0];
      const dividendAmount = latestDividend.divCash || latestDividend.dividend || 0;
      stockData.dividendPerShare = dividendAmount;

      // Calculate annual dividend based on frequency
      let multiplier = 12; // Default monthly for most ETFs like QQQI/SPYI
      switch (frequency) {
        case 'Monthly': multiplier = 12; break;
        case 'Quarterly': multiplier = 4; break;
        case 'Semi-Annual': multiplier = 2; break;
        case 'Annual': multiplier = 1; break;
      }
      stockData.annualDividend = dividendAmount * multiplier;

      // Calculate yield
      if (stockData.currentPrice && stockData.annualDividend) {
        stockData.dividendYield = (stockData.annualDividend / stockData.currentPrice) * 100;
      }

      // Set dividend dates
      stockData.exDividendDate = latestDividend.exDate || null;
      stockData.dividendDate = latestDividend.payDate || null;

      // Estimate next ex-dividend date
      stockData.nextExDividendDate = estimateNextDividendDateFromTiingo(sortedDividends, frequency);

      console.log('Tiingo processed dividend data:', {
        frequency,
        latestDividend: dividendAmount,
        annualDividend: stockData.annualDividend,
        yield: stockData.dividendYield
      });
    }

    return { success: true, data: stockData };

  } catch (error) {
    console.error('Tiingo fetch error:', error);
    return { success: false, error: `Tiingo API error: ${error.message}` };
  }
}

// Analyze dividend frequency from Tiingo data
function analyzeTiingoDividendFrequency(dividends: any[]): string {
  if (dividends.length < 2) return 'Unknown';
  
  // Get dates from last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const recentDividends = dividends.filter(d => new Date(d.exDate) > oneYearAgo);
  const count = recentDividends.length;
  
  if (count >= 11 && count <= 13) return 'Monthly';
  if (count >= 3 && count <= 5) return 'Quarterly';
  if (count === 2) return 'Semi-Annual';
  if (count === 1) return 'Annual';
  if (count > 13) return 'Monthly';
  
  return 'Monthly'; // Default for ETFs like QQQI/SPYI
}

// Estimate next dividend date from Tiingo data
function estimateNextDividendDateFromTiingo(dividends: any[], frequency: string): string | null {
  if (dividends.length === 0) return null;
  
  const lastDividend = dividends[0];
  const lastDate = new Date(lastDividend.exDate);
  
  let monthsToAdd = 1; // Default monthly
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
}

// Helper function to analyze dividend frequency (for FMP data)
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

// Helper function to estimate next dividend date (for FMP data)
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

    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    const tiingoApiKey = Deno.env.get('TIINGO_API_KEY');
    
    if (!fmpApiKey) {
      console.error('FMP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching data for symbol: ${symbol}`);
    
    // Using FMP's stable endpoints (required since Aug 2025)
    const [priceResponse, dividendsResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${fmpApiKey}`),
      fetch(`https://financialmodelingprep.com/stable/dividends?symbol=${symbol}&apikey=${fmpApiKey}`)
    ]);

    // Safe parse both responses
    const [priceResult, dividendsResult] = await Promise.all([
      safeJsonParse(priceResponse, 'Price'),
      safeJsonParse(dividendsResponse, 'Dividends')
    ]);

    // Log parsed data for debugging
    console.log('FMP Price data:', JSON.stringify(priceResult.data, null, 2));
    console.log('FMP Dividends data:', JSON.stringify(dividendsResult.data, null, 2));

    // Check if FMP requires premium for this symbol (402 status or premium-related messages)
    const needsFallback = 
      priceResult.status === 402 || 
      dividendsResult.status === 402 ||
      (priceResult.text && priceResult.text.toLowerCase().includes('premium')) ||
      (dividendsResult.text && dividendsResult.text.toLowerCase().includes('premium'));

    if (needsFallback) {
      console.log('FMP returned premium-required, attempting Tiingo fallback...');
      
      if (!tiingoApiKey) {
        return new Response(
          JSON.stringify({ 
            error: `${symbol} requires premium FMP access. Please configure TIINGO_API_KEY for ETF support.` 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const tiingoResult = await fetchFromTiingo(symbol, tiingoApiKey);
      
      if (tiingoResult.success) {
        console.log('Tiingo fallback successful for:', symbol);
        return new Response(
          JSON.stringify(tiingoResult.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('Tiingo fallback failed:', tiingoResult.error);
        return new Response(
          JSON.stringify({ error: tiingoResult.error || `Unable to find data for ${symbol}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for API errors in the FMP response
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
      
      // Try Tiingo fallback for invalid JSON responses too
      if (tiingoApiKey) {
        console.log('Attempting Tiingo fallback for non-JSON FMP response...');
        const tiingoResult = await fetchFromTiingo(symbol, tiingoApiKey);
        if (tiingoResult.success) {
          return new Response(
            JSON.stringify(tiingoResult.data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ error: `FMP API returned invalid response for price data: ${priceResult.text.substring(0, 100)}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!dividendsResult.ok) {
      console.log('Dividends response was not valid JSON:', dividendsResult.text.substring(0, 100));
      // Continue with price data only - dividends might not be available
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
    const dividendsData = dividendsResult.ok ? dividendsResult.data : null;

    // Handle empty or invalid price data
    // Stable API returns an array, check if it has data
    const quoteData = Array.isArray(priceData) ? priceData[0] : priceData;
    
    if (!quoteData || (Array.isArray(priceData) && priceData.length === 0)) {
      console.log('No FMP price data found for symbol:', symbol);
      
      // Try Tiingo fallback for symbols not found in FMP
      if (tiingoApiKey) {
        console.log('Attempting Tiingo fallback for symbol not found in FMP...');
        const tiingoResult = await fetchFromTiingo(symbol, tiingoApiKey);
        if (tiingoResult.success) {
          return new Response(
            JSON.stringify(tiingoResult.data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
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
