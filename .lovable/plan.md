
# Fix: Deploy plaid-exchange-token Function

## Problem
The `plaid-exchange-token` edge function exists in your codebase and is properly configured in `supabase/config.toml`, but it's **not deployed** to Supabase. When you complete the Plaid Link flow, the app tries to call this function and gets a 404 Not Found error.

## Evidence
- Direct test of the function returns: `404 NOT_FOUND - Requested function was not found`
- The function code exists at `supabase/functions/plaid-exchange-token/index.ts`
- The function is configured in `supabase/config.toml` (line 72-73)

## Solution
Deploy the `plaid-exchange-token` edge function. No code changes needed.

## Action
Deploy:
- `plaid-exchange-token`

## Expected Result
After deployment, completing the Plaid Link authentication will successfully exchange the token and store your investment accounts.
