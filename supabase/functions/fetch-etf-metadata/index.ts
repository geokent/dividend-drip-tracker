import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ETF type classification based on name and category keywords
function classifyETFType(name: string, category: string | null): string {
  const nameLower = (name || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  const combined = `${nameLower} ${categoryLower}`;
  
  // Covered call / income strategies
  if (combined.includes('covered call') || combined.includes('premium income') || 
      combined.includes('buywrite') || combined.includes('option income')) {
    return 'Covered Call';
  }
  
  // High dividend / income focus
  if (combined.includes('high dividend') || combined.includes('dividend growth') ||
      combined.includes('dividend yield') || combined.includes('dividend appreciation') ||
      combined.includes('dividend aristocrat') || combined.includes('dividend income')) {
    return 'Dividend';
  }
  
  // Bond / Fixed income
  if (combined.includes('bond') || combined.includes('treasury') || 
      combined.includes('fixed income') || combined.includes('corporate debt') ||
      combined.includes('municipal') || combined.includes('aggregate')) {
    return 'Bond';
  }
  
  // Sector-specific
  if (combined.includes('technology') || combined.includes('tech sector')) return 'Sector - Technology';
  if (combined.includes('healthcare') || combined.includes('health care')) return 'Sector - Healthcare';
  if (combined.includes('financial') || combined.includes('banking')) return 'Sector - Financials';
  if (combined.includes('energy') || combined.includes('oil') || combined.includes('gas')) return 'Sector - Energy';
  if (combined.includes('real estate') || combined.includes('reit')) return 'REIT';
  if (combined.includes('utilities')) return 'Sector - Utilities';
  if (combined.includes('consumer') || combined.includes('retail')) return 'Sector - Consumer';
  if (combined.includes('industrial')) return 'Sector - Industrials';
  
  // Growth
  if (combined.includes('growth') || combined.includes('momentum')) {
    return 'Growth';
  }
  
  // Value
  if (combined.includes('value')) {
    return 'Value';
  }
  
  // Index tracking
  if (combined.includes('s&p 500') || combined.includes('nasdaq') || 
      combined.includes('dow jones') || combined.includes('total market') ||
      combined.includes('index')) {
    return 'Index';
  }
  
  // International
  if (combined.includes('international') || combined.includes('emerging') ||
      combined.includes('global') || combined.includes('foreign') ||
      combined.includes('developed markets')) {
    return 'International';
  }
  
  return 'ETF';
}

// Determine sector focus from ETF data
function determineSectorFocus(etfData: any): string | null {
  const name = (etfData.name || '').toLowerCase();
  const category = (etfData.category || '').toLowerCase();
  
  // Check for explicit sector mentions
  if (name.includes('technology') || category.includes('technology')) return 'Technology';
  if (name.includes('healthcare') || category.includes('healthcare')) return 'Healthcare';
  if (name.includes('financial') || category.includes('financial')) return 'Financials';
  if (name.includes('energy') || category.includes('energy')) return 'Energy';
  if (name.includes('real estate') || category.includes('real estate') || name.includes('reit')) return 'Real Estate';
  if (name.includes('utilities') || category.includes('utilities')) return 'Utilities';
  if (name.includes('consumer') || category.includes('consumer')) return 'Consumer';
  if (name.includes('industrial') || category.includes('industrial')) return 'Industrials';
  if (name.includes('materials') || category.includes('materials')) return 'Materials';
  if (name.includes('communication') || category.includes('communication')) return 'Communication Services';
  
  return null;
}

serve(async (req) => {
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

    const upperSymbol = symbol.toUpperCase();
    console.log(`Fetching ETF metadata for: ${upperSymbol}`);

    // Initialize Supabase client with service role for cache operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('etf_cache')
      .select('*')
      .eq('symbol', upperSymbol)
      .single();

    if (cached && !cacheError) {
      const expiresAt = new Date(cached.expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        console.log(`Cache hit for ${upperSymbol}, expires: ${expiresAt.toISOString()}`);
        return new Response(
          JSON.stringify({ 
            source: 'cache',
            data: cached 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Cache expired for ${upperSymbol}`);
    }

    // Step 2: Fetch from FMP API
    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    if (!fmpApiKey) {
      console.error('FMP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ETF profile
    const profileUrl = `https://financialmodelingprep.com/api/v3/etf-holder/${upperSymbol}?apikey=${fmpApiKey}`;
    const infoUrl = `https://financialmodelingprep.com/api/v3/etf-info?symbol=${upperSymbol}&apikey=${fmpApiKey}`;
    
    console.log(`Fetching FMP data for ${upperSymbol}`);
    
    const [profileResponse, infoResponse] = await Promise.all([
      fetch(profileUrl),
      fetch(infoUrl)
    ]);

    let etfHolders = [];
    let etfInfo: any = null;
    
    if (profileResponse.ok) {
      etfHolders = await profileResponse.json();
      console.log(`Got ${etfHolders?.length || 0} holders for ${upperSymbol}`);
    }
    
    if (infoResponse.ok) {
      const infoData = await infoResponse.json();
      etfInfo = Array.isArray(infoData) ? infoData[0] : infoData;
      console.log(`ETF info for ${upperSymbol}:`, etfInfo ? 'found' : 'not found');
    }

    // Fallback: try quote endpoint for basic info
    if (!etfInfo) {
      const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${upperSymbol}?apikey=${fmpApiKey}`;
      const quoteResponse = await fetch(quoteUrl);
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        if (quoteData && quoteData[0]) {
          etfInfo = {
            symbol: upperSymbol,
            name: quoteData[0].name,
            price: quoteData[0].price
          };
        }
      }
    }

    // Step 3: Classify ETF and build metadata
    const etfName = etfInfo?.name || etfInfo?.etfName || upperSymbol;
    const category = etfInfo?.assetClass || etfInfo?.category || null;
    const etfType = classifyETFType(etfName, category);
    const sectorFocus = determineSectorFocus({ name: etfName, category });
    
    // Get top holdings (first 10)
    const topHoldings = Array.isArray(etfHolders) 
      ? etfHolders.slice(0, 10).map((h: any) => ({
          asset: h.asset,
          shares: h.sharesNumber,
          weight: h.weightPercentage
        }))
      : [];

    const metadata = {
      symbol: upperSymbol,
      etf_name: etfName,
      etf_type: etfType,
      category: category,
      asset_class: etfInfo?.assetClass || 'Equity',
      sector_focus: sectorFocus,
      expense_ratio: etfInfo?.expenseRatio || null,
      dividend_yield: etfInfo?.dividendYield || null,
      aum: etfInfo?.aum || etfInfo?.totalAssets || null,
      holdings_count: etfInfo?.holdingsCount || etfHolders?.length || null,
      top_holdings: topHoldings.length > 0 ? topHoldings : null,
      raw_data: etfInfo || null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    console.log(`Classified ${upperSymbol} as: ${etfType}, sector: ${sectorFocus || 'N/A'}`);

    // Step 4: Upsert to cache
    const { error: upsertError } = await supabase
      .from('etf_cache')
      .upsert(metadata, { onConflict: 'symbol' });

    if (upsertError) {
      console.error('Cache upsert error:', upsertError);
    } else {
      console.log(`Cached metadata for ${upperSymbol}`);
    }

    // Return enriched metadata
    return new Response(
      JSON.stringify({ 
        source: 'api',
        data: metadata 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-etf-metadata:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
