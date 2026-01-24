import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FMP_API_KEY = Deno.env.get('FMP_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Supported index endpoints
const INDEX_ENDPOINTS: Record<string, string> = {
  sp500: 'sp500_constituent',
  nasdaq100: 'nasdaq_constituent',
  dowjones: 'dowjones_constituent'
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
    const source = body.source || 'sp500'
    const limit = body.limit || 50
    const offset = body.offset || 0
    const dryRun = body.dryRun || false
    
    // Validate source
    if (!INDEX_ENDPOINTS[source]) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid source: ${source}. Valid options: ${Object.keys(INDEX_ENDPOINTS).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Starting bulk import: source=${source}, limit=${limit}, offset=${offset}, dryRun=${dryRun}`)
    
    // Step 1: Fetch index constituents
    const indexEndpoint = INDEX_ENDPOINTS[source]
    const indexResponse = await fetch(
      `https://financialmodelingprep.com/api/v3/${indexEndpoint}?apikey=${FMP_API_KEY}`
    )
    const indexStocks = await indexResponse.json()
    
    if (!Array.isArray(indexStocks)) {
      throw new Error(`Failed to fetch ${source} list: ` + JSON.stringify(indexStocks))
    }
    
    console.log(`Found ${indexStocks.length} stocks in ${source}`)
    
    // Step 2: Process stocks in batches
    const stocksToProcess = indexStocks.slice(offset, offset + limit)
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
        
        const quoteData = await quoteResponse.json()
        const dividendsData = await dividendsResponse.json()
        
        const quote = Array.isArray(quoteData) ? quoteData[0] : quoteData
        const dividends = Array.isArray(dividendsData) ? dividendsData : []
        
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
          company_name: stock.name || quote.name || stock.symbol,
          sector: stock.sector || quote.sector || 'Unknown',
          dividend_yield: parseFloat(dividendYield.toFixed(2)),
          dividend_amount: latestDividend,
          annual_dividend: annualDividend,
          frequency: frequency,
          payout_ratio: null,
          years_of_growth: stock.dividendYearsGrowth || null,
          is_dividend_aristocrat: (stock.dividendYearsGrowth || 0) >= 25,
          is_dividend_king: (stock.dividendYearsGrowth || 0) >= 50,
          next_ex_date: nextExDate,
          next_payment_date: nextPaymentDate,
        })
        
        // Rate limit: ~2 stocks per second (4 API calls)
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (stockError) {
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
          stocksToAdd: dividendStocks.length,
          stocksSkipped: skippedStocks.length,
          skippedStocks: skippedStocks,
          previewData: dividendStocks.slice(0, 5), // Show first 5 as preview
          apiCallsUsed: apiCallCount,
          nextOffset: offset + limit,
          hasMore: offset + limit < indexStocks.length,
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
        hasMore: offset + limit < indexStocks.length,
        message: `Added ${dividendStocks.length} dividend stocks from ${source} (offset ${offset}-${offset + limit})`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Bulk import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
