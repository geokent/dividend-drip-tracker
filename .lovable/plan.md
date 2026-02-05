
# Fix: Deploy get-dividend-data Edge Function

## Problem
The `sync-dividends` function successfully pulled 8 stocks from your Plaid account, but pricing and dividend data are missing because the `get-dividend-data` edge function is **not deployed**.

### Evidence from logs
```
Failed to fetch Alpha Vantage data for O: FunctionsHttpError: Edge Function returned a non-2xx status code
status: 404, statusText: "Not Found"
url: ".../functions/v1/get-dividend-data"
```

The sync inserted stocks with share counts but couldn't fetch pricing because the pricing function doesn't exist.

## Solution
Deploy the `get-dividend-data` edge function (no code changes needed).

## After Deployment
Click **Refresh Holdings** to re-sync. This time:
1. `sync-dividends` will fetch holdings from Plaid (already working)
2. For each stock, it will call `get-dividend-data` (will now work)
3. Pricing, dividend yield, and annual dividend data will be populated

## Action
Deploy:
- `get-dividend-data`

## Expected Result
All 8 stocks (O, JEPI, VICI, STAG, MAIN, JEPQ, SPYI, DIVO) will have complete pricing and dividend data after clicking "Refresh Holdings".
