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

    // Get company overview for basic info
    const overviewResponse = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
    )
    const overviewData = await overviewResponse.json()

    if (overviewData.Note || overviewData['Error Message']) {
      return new Response(
        JSON.stringify({ 
          error: overviewData.Note || overviewData['Error Message'] || 'Failed to fetch company data' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get dividend data
    const dividendResponse = await fetch(
      `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${symbol}&apikey=${apiKey}`
    )
    const dividendData = await dividendResponse.json()

    // Get current stock price
    const priceResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    )
    const priceData = await priceResponse.json()

    const currentPrice = priceData['Global Quote']?.['05. price'] || null

    // Extract dividend information
    const dividendYield = overviewData.DividendYield || null
    const dividendPerShare = overviewData.DividendPerShare || null
    const exDividendDate = overviewData.ExDividendDate || null
    const dividendDate = overviewData.DividendDate || null

    // Calculate annual dividend estimate
    let annualDividend = null
    if (dividendPerShare && !isNaN(parseFloat(dividendPerShare))) {
      annualDividend = parseFloat(dividendPerShare)
    }

    const result = {
      symbol: symbol.toUpperCase(),
      companyName: overviewData.Name || 'Unknown Company',
      currentPrice: currentPrice ? parseFloat(currentPrice) : null,
      dividendYield: dividendYield ? parseFloat(dividendYield) : null,
      dividendPerShare: dividendPerShare ? parseFloat(dividendPerShare) : null,
      annualDividend,
      exDividendDate,
      dividendDate,
      sector: overviewData.Sector || null,
      industry: overviewData.Industry || null,
      marketCap: overviewData.MarketCapitalization || null,
      peRatio: overviewData.PERatio || null,
    }

    console.log('Dividend data result:', result)

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