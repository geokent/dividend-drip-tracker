-- Add source tracking columns to user_stocks table
ALTER TABLE public.user_stocks 
ADD COLUMN source text DEFAULT 'manual' CHECK (source IN ('manual', 'plaid_sync')),
ADD COLUMN plaid_item_id text,
ADD COLUMN plaid_account_id text;

-- Create index for efficient querying by plaid_item_id
CREATE INDEX idx_user_stocks_plaid_item_id ON public.user_stocks(plaid_item_id) WHERE plaid_item_id IS NOT NULL;

-- Backfill existing data - identify likely Plaid-synced stocks
UPDATE public.user_stocks 
SET source = 'plaid_sync' 
WHERE last_synced > created_at + INTERVAL '1 minute';

-- Add comment for documentation
COMMENT ON COLUMN public.user_stocks.source IS 'Tracks whether stock was added manually or via Plaid sync';
COMMENT ON COLUMN public.user_stocks.plaid_item_id IS 'Plaid item ID that this stock was synced from';
COMMENT ON COLUMN public.user_stocks.plaid_account_id IS 'Plaid account ID that this stock was synced from';