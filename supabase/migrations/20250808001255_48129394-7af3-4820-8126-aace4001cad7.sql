-- Remove plaid_account_id column from dividend_transactions table
ALTER TABLE public.dividend_transactions DROP COLUMN IF EXISTS plaid_account_id;

-- Drop the plaid_accounts table completely
DROP TABLE IF EXISTS public.plaid_accounts;