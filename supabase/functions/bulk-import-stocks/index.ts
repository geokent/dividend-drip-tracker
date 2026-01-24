import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Well-known dividend stocks (Dividend Aristocrats & popular dividend payers)
// This avoids needing the premium FMP constituent API
const DIVIDEND_STOCK_LISTS: Record<string, { symbol: string; name: string; sector: string }[]> = {
  aristocrats: [
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
    { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Defensive' },
    { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer Defensive' },
    { symbol: 'MMM', name: '3M Company', sector: 'Industrials' },
    { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
    { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
    { symbol: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer Defensive' },
    { symbol: 'CLX', name: 'Clorox', sector: 'Consumer Defensive' },
    { symbol: 'ED', name: 'Consolidated Edison', sector: 'Utilities' },
    { symbol: 'CVX', name: 'Chevron', sector: 'Energy' },
    { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
    { symbol: 'EMR', name: 'Emerson Electric', sector: 'Industrials' },
    { symbol: 'GPC', name: 'Genuine Parts', sector: 'Consumer Cyclical' },
    { symbol: 'HRL', name: 'Hormel Foods', sector: 'Consumer Defensive' },
    { symbol: 'ITW', name: 'Illinois Tool Works', sector: 'Industrials' },
    { symbol: 'KMB', name: 'Kimberly-Clark', sector: 'Consumer Defensive' },
    { symbol: 'LOW', name: "Lowe's", sector: 'Consumer Cyclical' },
    { symbol: 'MCD', name: "McDonald's", sector: 'Consumer Cyclical' },
    { symbol: 'MDT', name: 'Medtronic', sector: 'Healthcare' },
    { symbol: 'NUE', name: 'Nucor', sector: 'Basic Materials' },
    { symbol: 'PPG', name: 'PPG Industries', sector: 'Basic Materials' },
    { symbol: 'SWK', name: 'Stanley Black & Decker', sector: 'Industrials' },
    { symbol: 'SYY', name: 'Sysco', sector: 'Consumer Defensive' },
    { symbol: 'TGT', name: 'Target', sector: 'Consumer Defensive' },
    { symbol: 'WMT', name: 'Walmart', sector: 'Consumer Defensive' },
    { symbol: 'WBA', name: 'Walgreens Boots Alliance', sector: 'Healthcare' },
    { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials' },
    { symbol: 'ADP', name: 'Automatic Data Processing', sector: 'Technology' },
    { symbol: 'AFL', name: 'Aflac', sector: 'Financial Services' },
    { symbol: 'BEN', name: 'Franklin Resources', sector: 'Financial Services' },
    { symbol: 'CINF', name: 'Cincinnati Financial', sector: 'Financial Services' },
    { symbol: 'DOV', name: 'Dover', sector: 'Industrials' },
    { symbol: 'FRT', name: 'Federal Realty Investment Trust', sector: 'Real Estate' },
    { symbol: 'GD', name: 'General Dynamics', sector: 'Industrials' },
    { symbol: 'IBM', name: 'IBM', sector: 'Technology' },
    { symbol: 'LEG', name: 'Leggett & Platt', sector: 'Consumer Cyclical' },
    { symbol: 'MKC', name: 'McCormick & Company', sector: 'Consumer Defensive' },
    { symbol: 'NDSN', name: 'Nordson', sector: 'Industrials' },
    { symbol: 'PNR', name: 'Pentair', sector: 'Industrials' },
    { symbol: 'SHW', name: 'Sherwin-Williams', sector: 'Basic Materials' },
    { symbol: 'SPGI', name: 'S&P Global', sector: 'Financial Services' },
    { symbol: 'T', name: 'AT&T', sector: 'Communication Services' },
    { symbol: 'VZ', name: 'Verizon', sector: 'Communication Services' },
    { symbol: 'O', name: 'Realty Income', sector: 'Real Estate' },
    { symbol: 'MAIN', name: 'Main Street Capital', sector: 'Financial Services' },
    { symbol: 'STAG', name: 'STAG Industrial', sector: 'Real Estate' },
    { symbol: 'AGNC', name: 'AGNC Investment', sector: 'Real Estate' },
    { symbol: 'EPD', name: 'Enterprise Products Partners', sector: 'Energy' },
    { symbol: 'MO', name: 'Altria Group', sector: 'Consumer Defensive' },
  ],
  popular: [
    { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical' },
    { symbol: 'V', name: 'Visa', sector: 'Financial Services' },
    { symbol: 'MA', name: 'Mastercard', sector: 'Financial Services' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services' },
    { symbol: 'BAC', name: 'Bank of America', sector: 'Financial Services' },
    { symbol: 'WFC', name: 'Wells Fargo', sector: 'Financial Services' },
    { symbol: 'C', name: 'Citigroup', sector: 'Financial Services' },
    { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financial Services' },
    { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services' },
    { symbol: 'BLK', name: 'BlackRock', sector: 'Financial Services' },
    { symbol: 'SCHW', name: 'Charles Schwab', sector: 'Financial Services' },
    { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
    { symbol: 'CVS', name: 'CVS Health', sector: 'Healthcare' },
    { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
    { symbol: 'MRK', name: 'Merck', sector: 'Healthcare' },
    { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare' },
    { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare' },
    { symbol: 'AMGN', name: 'Amgen', sector: 'Healthcare' },
    { symbol: 'GILD', name: 'Gilead Sciences', sector: 'Healthcare' },
    { symbol: 'UPS', name: 'United Parcel Service', sector: 'Industrials' },
    { symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials' },
    { symbol: 'HON', name: 'Honeywell', sector: 'Industrials' },
    { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Industrials' },
    { symbol: 'DE', name: 'Deere & Company', sector: 'Industrials' },
    { symbol: 'BA', name: 'Boeing', sector: 'Industrials' },
    { symbol: 'DUK', name: 'Duke Energy', sector: 'Utilities' },
    { symbol: 'SO', name: 'Southern Company', sector: 'Utilities' },
    { symbol: 'NEE', name: 'NextEra Energy', sector: 'Utilities' },
    { symbol: 'D', name: 'Dominion Energy', sector: 'Utilities' },
    { symbol: 'AEP', name: 'American Electric Power', sector: 'Utilities' },
    { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
    { symbol: 'OXY', name: 'Occidental Petroleum', sector: 'Energy' },
    { symbol: 'PSX', name: 'Phillips 66', sector: 'Energy' },
    { symbol: 'VLO', name: 'Valero Energy', sector: 'Energy' },
    { symbol: 'SPG', name: 'Simon Property Group', sector: 'Real Estate' },
    { symbol: 'PLD', name: 'Prologis', sector: 'Real Estate' },
    { symbol: 'AMT', name: 'American Tower', sector: 'Real Estate' },
    { symbol: 'CCI', name: 'Crown Castle', sector: 'Real Estate' },
  ],
  custom: [] // Will be populated from request body
}

// Analyze dividend frequency from history
function analyzeDividendFrequency(dividends: any[]): string {
  if (dividends.length < 2) return 'Quarterly'
  
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  const recentDividends = dividends.filter(d => new Date(d.date || d.paymentDate) > oneYearAgo)
  const count = recentDividends.length
  
  if (count >= 11) return 'Monthly'
  if (count >= 3 && count <= 5) return 'Quarterly'
  if (count === 2) return 'Semi-Annual'
  if (count === 1) return 'Annual'
  
  return 'Quarterly'
}

// Estimate next ex-dividend date
function estimateNextExDate(dividends: any[], frequency: string): string {
  if (dividends.length === 0) {
    const future = new Date()
    future.setMonth(future.getMonth() + 1)
    return future.toISOString().split('T')[0]
  }
  
  const lastDate = new Date(dividends[0].date || dividends[0].paymentDate)
  let monthsToAdd = 3
  
  switch (frequency) {
    case 'Monthly': monthsToAdd = 1; break
    case 'Quarterly': monthsToAdd = 3; break
    case 'Semi-Annual': monthsToAdd = 6; break
    case 'Annual': monthsToAdd = 12; break
  }
  
  const nextDate = new Date(lastDate)
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
  
  const now = new Date()
  while (nextDate < now) {
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
  }
  
  return nextDate.toISOString().split('T')[0]
}

// Estimate payment date (typically 2-4 weeks after ex-date)
function estimatePaymentDate(exDate: string): string {
  const date = new Date(exDate)
  date.setDate(date.getDate() + 21) // ~3 weeks after ex-date
  return date.toISOString().split('T')[0]
}

interface SkippedStock {
  symbol: string
  reason: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  try {
    // Parse parameters
    const body = await req.json().catch(() => ({}))
    const source = body.source || 'aristocrats' // aristocrats, popular, custom, or all
    const limit = body.limit || 50
    const offset = body.offset || 0
    const dryRun = body.dryRun || false
    const customSymbols = body.symbols || [] // For custom source
    
    console.log(`Starting bulk import: source=${source}, limit=${limit}, offset=${offset}, dryRun=${dryRun}`)
    
    // Build stock list based on source
    let stockList: { symbol: string; name: string; sector: string }[] = []
    
    if (source === 'custom' && customSymbols.length > 0) {
      stockList = customSymbols.map((s: string) => ({ symbol: s.toUpperCase(), name: s.toUpperCase(), sector: 'Unknown' }))
    } else if (source === 'all') {
      // Combine aristocrats and popular, removing duplicates
      const combined = [...DIVIDEND_STOCK_LISTS.aristocrats, ...DIVIDEND_STOCK_LISTS.popular]
      const seen = new Set<string>()
      stockList = combined.filter(s => {
        if (seen.has(s.symbol)) return false
        seen.add(s.symbol)
        return true
      })
    } else if (DIVIDEND_STOCK_LISTS[source]) {
      stockList = DIVIDEND_STOCK_LISTS[source]
    } else {
      return new Response(
        JSON.stringify({ 
          error: `Invalid source: ${source}. Valid options: aristocrats, popular, all, custom` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Processing ${stockList.length} stocks from source: ${source}`)
    
    // Process stocks in batches
    const stocksToProcess = stockList.slice(offset, offset + limit)
    const dividendStocks: any[] = []
    const skippedStocks: SkippedStock[] = []
    let apiCallCount = 0
    
    for (const stock of stocksToProcess) {
      try {
        // Use stable endpoints (matching get-dividend-data function)
        const [quoteResponse, dividendsResponse] = await Promise.all([
          fetch(`https://financialmodelingprep.com/stable/quote?symbol=${stock.symbol}&apikey=${FMP_API_KEY}`),
          fetch(`https://financialmodelingprep.com/stable/dividends?symbol=${stock.symbol}&apikey=${FMP_API_KEY}`)
        ])
        apiCallCount += 2
        
        const quoteText = await quoteResponse.text()
        const dividendsText = await dividendsResponse.text()
        
        // Handle potential non-JSON responses
        let quote: any = null
        let dividends: any[] = []
        
        try {
          const quoteData = JSON.parse(quoteText)
          quote = Array.isArray(quoteData) ? quoteData[0] : quoteData
        } catch {
          console.log(`Skipping ${stock.symbol}: Invalid quote response - ${quoteText.slice(0, 50)}`)
          skippedStocks.push({ symbol: stock.symbol, reason: 'Invalid quote response' })
          continue
        }
        
        try {
          const dividendsData = JSON.parse(dividendsText)
          dividends = Array.isArray(dividendsData) ? dividendsData : []
        } catch {
          // Continue with empty dividends - stock might still be valid
          dividends = []
        }
        
        if (!quote || !quote.price) {
          console.log(`Skipping ${stock.symbol}: No price data`)
          skippedStocks.push({ symbol: stock.symbol, reason: 'No price data' })
          continue
        }
        
        // Calculate dividend metrics
        const latestDividend = dividends[0]?.dividend || dividends[0]?.amount || 0
        
        if (latestDividend <= 0) {
          console.log(`Skipping ${stock.symbol}: No dividend`)
          skippedStocks.push({ symbol: stock.symbol, reason: 'No dividend' })
          continue
        }
        
        const frequency = analyzeDividendFrequency(dividends)
        let multiplier = 4
        switch (frequency) {
          case 'Monthly': multiplier = 12; break
          case 'Quarterly': multiplier = 4; break
          case 'Semi-Annual': multiplier = 2; break
          case 'Annual': multiplier = 1; break
        }
        
        const annualDividend = latestDividend * multiplier
        const dividendYield = (annualDividend / quote.price) * 100
        const nextExDate = estimateNextExDate(dividends, frequency)
        const nextPaymentDate = estimatePaymentDate(nextExDate)
        
        dividendStocks.push({
          ticker: stock.symbol,
          company_name: quote.name || stock.name,
          sector: quote.sector || stock.sector || 'Unknown',
          dividend_yield: parseFloat(dividendYield.toFixed(2)),
          dividend_amount: latestDividend,
          annual_dividend: annualDividend,
          frequency: frequency,
          payout_ratio: null,
          years_of_growth: null,
          is_dividend_aristocrat: source === 'aristocrats' || DIVIDEND_STOCK_LISTS.aristocrats.some(a => a.symbol === stock.symbol),
          is_dividend_king: false,
          next_ex_date: nextExDate,
          next_payment_date: nextPaymentDate,
        })
        
        // Rate limit: ~2 stocks per second
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (stockError: any) {
        console.error(`Error processing ${stock.symbol}:`, stockError)
        skippedStocks.push({ symbol: stock.symbol, reason: `Error: ${stockError.message}` })
      }
    }
    
    console.log(`Prepared ${dividendStocks.length} dividend stocks, skipped ${skippedStocks.length}`)
    
    // Step 3: Insert or return dry run results
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          source: source,
          stocksToAdd: dividendStocks.length,
          stocksSkipped: skippedStocks.length,
          skippedStocks: skippedStocks,
          previewData: dividendStocks.slice(0, 5), // Show first 5 as preview
          apiCallsUsed: apiCallCount,
          nextOffset: offset + limit,
          hasMore: offset + limit < stockList.length,
          totalInSource: stockList.length,
          message: `DRY RUN: Would add ${dividendStocks.length} dividend stocks from ${source}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Actual insert
    if (dividendStocks.length > 0) {
      const { error } = await supabase
        .from('dividend_data')
        .upsert(dividendStocks, { 
          onConflict: 'ticker',
          ignoreDuplicates: false 
        })
      
      if (error) throw error
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        dryRun: false,
        source: source,
        stocksAdded: dividendStocks.length,
        stocksSkipped: skippedStocks.length,
        skippedStocks: skippedStocks,
        apiCallsUsed: apiCallCount,
        nextOffset: offset + limit,
        hasMore: offset + limit < stockList.length,
        totalInSource: stockList.length,
        message: `Added ${dividendStocks.length} dividend stocks from ${source} (offset ${offset}-${offset + limit})`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
