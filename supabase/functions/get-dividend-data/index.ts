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

// Analyze dividend frequency from Yahoo Finance data
function analyzeYahooDividendFrequency(dividends: { date: string; amount: number }[]): string {
  if (dividends.length < 2) return 'Unknown';
  
  // Get dates from last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const recentDividends = dividends.filter(d => new Date(d.date) > oneYearAgo);
  const count = recentDividends.length;
  
  if (count >= 11 && count <= 13) return 'Monthly';
  if (count >= 3 && count <= 5) return 'Quarterly';
  if (count === 2) return 'Semi-Annual';
  if (count === 1) return 'Annual';
  if (count > 13) return 'Monthly';
  
  return 'Monthly'; // Default for ETFs like QQQI/SPYI
}

// Estimate next dividend date from dividend history
function estimateNextDividendDate(dividends: { date: string; amount: number }[], frequency: string): string | null {
  if (dividends.length === 0) return null;
  
  const lastDividend = dividends[0];
  const lastDate = new Date(lastDividend.date);
  
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

// Fetch sector data from Yahoo Finance quoteSummary
async function fetchYahooSector(symbol: string): Promise<{ sector: string | null; industry: string | null }> {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status !== 200) {
      console.log(`Yahoo quoteSummary status: ${response.status}`);
      return { sector: null, industry: null };
    }
    
    const data = await response.json();
    const assetProfile = data?.quoteSummary?.result?.[0]?.assetProfile;
    
    if (assetProfile) {
      console.log(`Yahoo sector for ${symbol}: ${assetProfile.sector}, industry: ${assetProfile.industry}`);
      return {
        sector: assetProfile.sector || null,
        industry: assetProfile.industry || null
      };
    }
    
    return { sector: null, industry: null };
  } catch (error) {
    console.error(`Error fetching Yahoo sector for ${symbol}:`, error);
    return { sector: null, industry: null };
  }
}

// Fetch data from Yahoo Finance (fallback for ETFs that require premium FMP access)
async function fetchFromYahoo(symbol: string): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log(`Attempting Yahoo Finance fallback for symbol: ${symbol}`);
  
  try {
    // Fetch quote data AND sector data in parallel
    const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    const [quoteResponse, sectorResult] = await Promise.all([
      fetch(quoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }),
      fetchYahooSector(symbol)
    ]);
    
    console.log(`Yahoo quote response status: ${quoteResponse.status}`);
    
    if (quoteResponse.status !== 200) {
      const errorText = await quoteResponse.text();
      console.log('Yahoo quote error:', errorText.substring(0, 200));
      return { success: false, error: `Yahoo Finance: Symbol ${symbol} not found` };
    }
    
    const quoteData = await quoteResponse.json();
    const meta = quoteData?.chart?.result?.[0]?.meta;
    
    if (!meta) {
      console.log('Yahoo: No meta data in response');
      return { success: false, error: `Yahoo Finance: No data for ${symbol}` };
    }
    
    console.log('Yahoo quote meta:', JSON.stringify({
      symbol: meta.symbol,
      shortName: meta.shortName,
      regularMarketPrice: meta.regularMarketPrice
    }));
    
    // Fetch dividend history from Yahoo Finance (last 2 years)
    const now = Math.floor(Date.now() / 1000);
    const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60);
    const divUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${twoYearsAgo}&period2=${now}&interval=1d&events=div`;
    
    const divResponse = await fetch(divUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`Yahoo dividend response status: ${divResponse.status}`);
    
    let dividends: { date: string; amount: number }[] = [];
    
    if (divResponse.status === 200) {
      const divData = await divResponse.json();
      const events = divData?.chart?.result?.[0]?.events?.dividends;
      
      if (events) {
        dividends = Object.values(events).map((d: any) => ({
          date: new Date(d.date * 1000).toISOString().split('T')[0],
          amount: d.amount
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log(`Yahoo dividend count: ${dividends.length}`);
        if (dividends.length > 0) {
          console.log('Most recent dividend:', dividends[0]);
        }
      } else {
        console.log('Yahoo: No dividend events in response');
      }
    }
    
    // Build normalized stock data with sector from quoteSummary
    const stockData: any = {
      symbol: symbol.toUpperCase(),
      companyName: meta.shortName || meta.longName || symbol.toUpperCase(),
      currentPrice: meta.regularMarketPrice || null,
      dividendYield: null,
      dividendPerShare: null,
      annualDividend: null,
      exDividendDate: null,
      dividendDate: null,
      nextExDividendDate: null,
      dividendFrequency: null,
      sector: sectorResult.sector,
      industry: sectorResult.industry,
      marketCap: null,
      peRatio: null,
    };
    
    // Process dividend data if available
    if (dividends.length > 0) {
      const frequency = analyzeYahooDividendFrequency(dividends);
      stockData.dividendFrequency = frequency;
      stockData.dividendPerShare = dividends[0].amount;
      
      // Calculate annual dividend based on frequency
      let multiplier = 12; // Default monthly for ETFs
      switch (frequency) {
        case 'Monthly': multiplier = 12; break;
        case 'Quarterly': multiplier = 4; break;
        case 'Semi-Annual': multiplier = 2; break;
        case 'Annual': multiplier = 1; break;
      }
      stockData.annualDividend = dividends[0].amount * multiplier;
      
      // Calculate yield
      if (stockData.currentPrice && stockData.annualDividend) {
        stockData.dividendYield = (stockData.annualDividend / stockData.currentPrice) * 100;
      }
      
      stockData.exDividendDate = dividends[0].date;
      stockData.nextExDividendDate = estimateNextDividendDate(dividends, frequency);
      
      console.log('Yahoo processed dividend data:', {
        frequency,
        latestDividend: dividends[0].amount,
        annualDividend: stockData.annualDividend,
        yield: stockData.dividendYield
      });
    }
    
    console.log('Yahoo Finance fallback successful for:', symbol);
    return { success: true, data: stockData };
    
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error);
    return { success: false, error: `Yahoo Finance error: ${error.message}` };
  }
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
const estimateFMPNextDividendDate = (dividends: any[], frequency: string): string | null => {
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

    // Check for FMP errors that require fallback
    const fmpPriceError = priceResult.data?.['Error Message'];
    const fmpDividendsError = dividendsResult.data?.['Error Message'];

    // Check if FMP requires premium OR has hit rate limits
    const needsFallback = 
      priceResult.status === 402 || 
      priceResult.status === 429 ||
      dividendsResult.status === 402 ||
      dividendsResult.status === 429 ||
      (priceResult.text && priceResult.text.toLowerCase().includes('premium')) ||
      (dividendsResult.text && dividendsResult.text.toLowerCase().includes('premium')) ||
      (fmpPriceError?.toLowerCase().includes('limit')) ||
      (fmpDividendsError?.toLowerCase().includes('limit'));

    if (needsFallback) {
      console.log('FMP requires premium or rate limited, attempting Yahoo Finance fallback...');
      
      const yahooResult = await fetchFromYahoo(symbol);
      
      if (yahooResult.success) {
        return new Response(
          JSON.stringify(yahooResult.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('Yahoo Finance fallback failed:', yahooResult.error);
        return new Response(
          JSON.stringify({ error: yahooResult.error || `Unable to find data for ${symbol}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for other API errors in the FMP response (non-limit related)
    if (fmpPriceError) {
      console.log('API Error:', fmpPriceError);
      return new Response(
        JSON.stringify({ error: `FMP API Error: ${fmpPriceError}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (fmpDividendsError) {
      console.log('API Error:', fmpDividendsError);
      return new Response(
        JSON.stringify({ error: `FMP API Error: ${fmpDividendsError}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle non-JSON responses (like "Premium required" text)
    if (!priceResult.ok) {
      console.log('Price response was not valid JSON:', priceResult.text.substring(0, 100));
      
      // Try Yahoo Finance fallback for invalid JSON responses too
      console.log('Attempting Yahoo Finance fallback for non-JSON FMP response...');
      const yahooResult = await fetchFromYahoo(symbol);
      if (yahooResult.success) {
        return new Response(
          JSON.stringify(yahooResult.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
      
      // Try Yahoo Finance fallback for symbols not found in FMP
      console.log('Attempting Yahoo Finance fallback for symbol not found in FMP...');
      const yahooResult = await fetchFromYahoo(symbol);
      if (yahooResult.success) {
        return new Response(
          JSON.stringify(yahooResult.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
      stockData.nextExDividendDate = estimateFMPNextDividendDate(sortedDividends, frequency);
      
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
