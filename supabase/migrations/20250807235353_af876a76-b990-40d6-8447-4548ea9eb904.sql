-- Add plaid_account_id column to link stocks to specific brokerage accounts
ALTER TABLE public.user_stocks 
ADD COLUMN plaid_account_id UUID REFERENCES public.plaid_accounts(id) ON DELETE SET NULL;