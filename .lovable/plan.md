
## What’s happening (root cause)
Your dashboard calls the `sync-dividends` Supabase Edge Function right after a Plaid connection completes (and also when you click “Refresh Holdings”).

Right now, that function is **not deployed**, so the browser request fails at the network layer (“Failed to fetch”), which Supabase JS surfaces as `FunctionsFetchError`. Because it never reaches the function, **no stocks can be inserted into `user_stocks`**.

### Evidence from your current session
- Browser tried: `POST https://fdvpmommvnakoxggnjvt.supabase.co/functions/v1/sync-dividends`
- It failed with: `Failed to fetch`
- Direct function test confirms it’s missing: `404 NOT_FOUND {"message":"Requested function was not found"}`

So the “Sync Failed” toast is expected until `sync-dividends` is deployed.

## Implementation plan (no code changes required)
### 1) Deploy the missing Edge Function
- Deploy: `sync-dividends`

This will make the endpoint exist so the dashboard can successfully call it.

### 2) Verify the endpoint is reachable
After deployment, we’ll do a quick direct invoke test (authenticated) to confirm it’s no longer 404 and returns a JSON response (success/partial failure/failure).

### 3) Test end-to-end from the UI
On `/dashboard`:
- Click **Refresh Holdings** (or reconnect once)
- Expectation:
  - The sync call completes (no “Failed to fetch”)
  - Stocks are inserted/updated in `user_stocks`
  - The portfolio table repopulates after the sync finishes (DividendDashboard reloads `user_stocks` after sync)

### 4) If stocks still don’t appear (next debugging steps)
If the function is deployed but returns an error:
- Check `sync-dividends` Edge Function logs for:
  - Plaid holdings fetch issues
  - token decryption RPC issues (`get_decrypted_access_token`)
  - insert/update errors on `user_stocks`
- Confirm the response body from `sync-dividends` (it returns structured fields like `success`, `partial_failure`, `errors`, `syncedStocks`, etc.)

### 5) Recommended follow-up (separate fix, not required for syncing to start)
Your Plaid connection currently reports partial failure due to:
- `duplicate key value violates unique constraint "plaid_accounts_item_id_key"`

That indicates `plaid_accounts.item_id` is incorrectly marked UNIQUE (it prevents storing multiple investment accounts under one institution/item). Sync can still work with only one stored account, but this causes confusing “partial failure” messaging and could limit multi-account metadata.

After sync is working, we should:
- Remove the `UNIQUE` constraint on `plaid_accounts.item_id` (keep it indexed, not unique)
- This will allow all investment accounts for an institution to be stored cleanly.

## Expected outcome
- “Sync Failed” stops immediately (because the function exists and can be called).
- Stocks from Plaid holdings get added into `user_stocks` and appear in the portfolio list.
