-- Create ETF cache table for storing enriched ETF metadata
CREATE TABLE public.etf_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  etf_name TEXT,
  etf_type TEXT, -- e.g., 'Dividend', 'Growth', 'Bond', 'Sector', 'Index', 'Covered Call'
  category TEXT,
  asset_class TEXT,
  sector_focus TEXT,
  expense_ratio NUMERIC,
  dividend_yield NUMERIC,
  aum NUMERIC,
  holdings_count INTEGER,
  top_holdings JSONB,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Create index for faster lookups
CREATE INDEX idx_etf_cache_symbol ON public.etf_cache(symbol);
CREATE INDEX idx_etf_cache_expires_at ON public.etf_cache(expires_at);

-- Enable RLS
ALTER TABLE public.etf_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (cache is not user-specific)
CREATE POLICY "Anyone can read ETF cache"
ON public.etf_cache
FOR SELECT
USING (true);

-- Only service role can modify cache
CREATE POLICY "Service role can manage ETF cache"
ON public.etf_cache
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role');

-- Create trigger to update updated_at
CREATE TRIGGER update_etf_cache_updated_at
BEFORE UPDATE ON public.etf_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();