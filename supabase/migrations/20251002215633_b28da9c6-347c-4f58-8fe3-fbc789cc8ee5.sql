-- Drop unique constraint to allow duplicate stock symbols per user
-- This enables users to manually add stocks that are already synced from Plaid
ALTER TABLE public.user_stocks DROP CONSTRAINT IF EXISTS user_stocks_user_id_symbol_key;