import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe JSON parsing helper
async function safeParseJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.log('Non-JSON response:', text.substring(0, 200));
    return null;
  }
}

// ETF type classification based on name and category keywords
function classifyETFType(name: string, category: string | null): string {
  const nameLower = (name || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  const combined = `${nameLower} ${categoryLower}`;
  
  // Covered call / income strategies - detect JEPQ, JEPI, SPYI, QQQI patterns
  if (combined.includes('covered call') || combined.includes('premium income') || 
      combined.includes('buywrite') || combined.includes('option income') ||
      combined.includes('equity premium income')) {
    return 'Covered Call';
  }
  
  // High dividend / income focus
  if (combined.includes('high dividend') || combined.includes('dividend growth') ||
      combined.includes('dividend yield') || combined.includes('dividend appreciation') ||
      combined.includes('dividend aristocrat') || combined.includes('dividend income') ||
      combined.includes('dividend equity')) {
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

// Known ETF classifications for common dividend ETFs (fallback)
const knownETFs: Record<string, { etfType: string; sectorFocus: string | null; name: string }> = {
  'SCHD': { etfType: 'Dividend', sectorFocus: null, name: 'Schwab US Dividend Equity ETF' },
  'JEPQ': { etfType: 'Covered Call', sectorFocus: 'Technology', name: 'JPMorgan Nasdaq Equity Premium Income ETF' },
  'JEPI': { etfType: 'Covered Call', sectorFocus: null, name: 'JPMorgan Equity Premium Income ETF' },
  'SPYI': { etfType: 'Covered Call', sectorFocus: null, name: 'NEOS S&P 500 High Income ETF' },
  'QQQI': { etfType: 'Covered Call', sectorFocus: 'Technology', name: 'NEOS Nasdaq-100 High Income ETF' },
  'DIVO': { etfType: 'Covered Call', sectorFocus: null, name: 'Amplify CWP Enhanced Dividend Income ETF' },
  'FDVV': { etfType: 'Dividend', sectorFocus: null, name: 'Fidelity High Dividend ETF' },
  'VIG': { etfType: 'Dividend', sectorFocus: null, name: 'Vanguard Dividend Appreciation ETF' },
  'VYM': { etfType: 'Dividend', sectorFocus: null, name: 'Vanguard High Dividend Yield ETF' },
  'DGRO': { etfType: 'Dividend', sectorFocus: null, name: 'iShares Core Dividend Growth ETF' },
  'HDV': { etfType: 'Dividend', sectorFocus: null, name: 'iShares Core High Dividend ETF' },
  'NOBL': { etfType: 'Dividend', sectorFocus: null, name: 'ProShares S&P 500 Dividend Aristocrats ETF' },
  'SDY': { etfType: 'Dividend', sectorFocus: null, name: 'SPDR S&P Dividend ETF' },
  'DVY': { etfType: 'Dividend', sectorFocus: null, name: 'iShares Select Dividend ETF' },
  'QYLD': { etfType: 'Covered Call', sectorFocus: 'Technology', name: 'Global X NASDAQ 100 Covered Call ETF' },
  'XYLD': { etfType: 'Covered Call', sectorFocus: null, name: 'Global X S&P 500 Covered Call ETF' },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, force } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const upperSymbol = symbol.toUpperCase();
    console.log(`Fetching ETF metadata for: ${upperSymbol}${force ? ' (force refresh)' : ''}`);

    // Initialize Supabase client with service role for cache operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Check cache first (unless force refresh)
    if (!force) {
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
    }

    // Step 2: Check known ETFs first (quick fallback)
    const knownETF = knownETFs[upperSymbol];
    let etfName = knownETF?.name || upperSymbol;
    let etfType = knownETF?.etfType || 'ETF';
    let sectorFocus = knownETF?.sectorFocus || null;
    let etfInfo: any = null;
    let etfHolders: any[] = [];

    // Step 3: Try FMP API for additional data
    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    if (fmpApiKey) {
      // Use stable endpoints as per FMP's updated API
      const quoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${upperSymbol}&apikey=${fmpApiKey}`;
      const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${upperSymbol}&apikey=${fmpApiKey}`;
      
      console.log(`Fetching FMP data for ${upperSymbol}`);
      
      const [quoteResponse, profileResponse] = await Promise.all([
        fetch(quoteUrl),
        fetch(profileUrl)
      ]);

      console.log(`FMP quote status: ${quoteResponse.status}, profile status: ${profileResponse.status}`);
      
      if (quoteResponse.ok) {
        const quoteData = await safeParseJson(quoteResponse);
        if (quoteData && Array.isArray(quoteData) && quoteData[0]) {
          etfInfo = { ...etfInfo, ...quoteData[0] };
          etfName = quoteData[0].name || etfName;
          console.log(`FMP quote for ${upperSymbol}: ${etfName}`);
        }
      }
      
      if (profileResponse.ok) {
        const profileData = await safeParseJson(profileResponse);
        if (profileData && Array.isArray(profileData) && profileData[0]) {
          etfInfo = { ...etfInfo, ...profileData[0] };
          etfName = profileData[0].companyName || etfInfo?.name || etfName;
          console.log(`FMP profile for ${upperSymbol}:`, profileData[0].companyName || 'no name');
        }
      }

      // Try ETF-specific endpoint if available
      const etfInfoUrl = `https://financialmodelingprep.com/api/v3/etf-info?symbol=${upperSymbol}&apikey=${fmpApiKey}`;
      try {
        const etfInfoResponse = await fetch(etfInfoUrl);
        if (etfInfoResponse.ok) {
          const etfInfoData = await safeParseJson(etfInfoResponse);
          if (etfInfoData && Array.isArray(etfInfoData) && etfInfoData[0]) {
            etfInfo = { ...etfInfo, ...etfInfoData[0] };
            console.log(`FMP ETF info for ${upperSymbol}:`, etfInfoData[0].etfName || 'found');
            etfName = etfInfoData[0].etfName || etfName;
          }
        }
      } catch (e) {
        console.log(`ETF info endpoint not available for ${upperSymbol}`);
      }
    }

    // Step 4: Classify ETF if not already known
    if (!knownETF) {
      const category = etfInfo?.sector || etfInfo?.industry || null;
      etfType = classifyETFType(etfName, category);
      sectorFocus = determineSectorFocus({ name: etfName, category });
    }

    const metadata = {
      symbol: upperSymbol,
      etf_name: etfName,
      etf_type: etfType,
      category: etfInfo?.sector || etfInfo?.industry || null,
      asset_class: etfInfo?.assetClass || 'Equity',
      sector_focus: sectorFocus,
      expense_ratio: etfInfo?.expenseRatio || null,
      dividend_yield: etfInfo?.dividendYield || etfInfo?.lastDiv ? (etfInfo.lastDiv / (etfInfo.price || 1)) * 100 : null,
      aum: etfInfo?.aum || etfInfo?.marketCap || null,
      holdings_count: etfInfo?.holdingsCount || etfHolders?.length || null,
      top_holdings: etfHolders.length > 0 ? etfHolders.slice(0, 10) : null,
      raw_data: etfInfo || null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    console.log(`Classified ${upperSymbol}: type=${etfType}, sector=${sectorFocus || 'N/A'}, name=${etfName}`);

    // Step 5: Upsert to cache
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
        source: knownETF ? 'known' : (etfInfo ? 'api' : 'classified'),
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
