
# Fix: Deploy Missing Plaid Edge Function

## Problem
The `plaid-create-link-token` edge function exists in your codebase but is not deployed to Supabase. This is why clicking "Connect Account" fails with "failed to initialize bank connection" - the function returns a 404 Not Found error.

## Solution
Deploy the `plaid-create-link-token` edge function. This is a simple deployment - no code changes needed.

## Action Required
Deploy the following edge function:
- `plaid-create-link-token`

## Expected Result
After deployment, clicking "Connect Account" will successfully open the Plaid Link modal where you can authenticate with your bank.
