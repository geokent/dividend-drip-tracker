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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active Plaid accounts for the user
    const { data: accounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (accountsError) {
      console.error('Accounts fetch error:', accountsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch accounts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalNewDividends = 0

    for (const account of accounts || []) {
      try {
        // Get transactions from the last 90 days
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const transactionsResponse = await fetch('https://production.plaid.com/transactions/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
            'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
          },
          body: JSON.stringify({
            access_token: account.access_token,
            start_date: startDate,
            end_date: endDate,
          }),
        })

        const transactionsData = await transactionsResponse.json()

        if (!transactionsResponse.ok) {
          console.error('Plaid transactions error:', transactionsData)
          continue
        }

        // Filter for dividend transactions
        const dividendTransactions = transactionsData.transactions.filter((tx: any) => 
          tx.category?.includes('Deposit') && 
          (tx.name?.toLowerCase().includes('dividend') || 
           tx.merchant_name?.toLowerCase().includes('dividend') ||
           tx.category?.includes('Dividend'))
        )

        for (const tx of dividendTransactions) {
          // Check if transaction already exists
          const { data: existing } = await supabase
            .from('dividend_transactions')
            .select('id')
            .eq('transaction_id', tx.transaction_id)
            .single()

          if (!existing) {
            // Extract symbol from transaction name if possible
            const symbolMatch = tx.name?.match(/([A-Z]{1,5})\s+dividend/i)
            const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : null

            const { error: insertError } = await supabase
              .from('dividend_transactions')
              .insert({
                user_id: user_id,
                plaid_account_id: account.id,
                transaction_id: tx.transaction_id,
                amount: tx.amount,
                date: tx.date,
                symbol: symbol,
                company_name: tx.merchant_name || tx.name,
                description: tx.name,
              })

            if (!insertError) {
              totalNewDividends++
            } else {
              console.error('Insert error:', insertError)
            }
          }
        }
      } catch (error) {
        console.error(`Error processing account ${account.account_id}:`, error)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newDividends: totalNewDividends,
        message: `Synced ${totalNewDividends} new dividend transactions`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})