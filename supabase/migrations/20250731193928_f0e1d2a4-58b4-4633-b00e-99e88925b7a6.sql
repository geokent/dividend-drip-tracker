-- Create user_stocks table for tracking user's stock positions
CREATE TABLE public.user_stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  shares NUMERIC NOT NULL DEFAULT 0,
  company_name TEXT,
  current_price NUMERIC,
  dividend_yield NUMERIC,
  dividend_per_share NUMERIC,
  annual_dividend NUMERIC,
  ex_dividend_date DATE,
  dividend_date DATE,
  sector TEXT,
  industry TEXT,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  last_synced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.user_stocks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stocks" 
ON public.user_stocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stocks" 
ON public.user_stocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks" 
ON public.user_stocks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks" 
ON public.user_stocks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stocks_updated_at
BEFORE UPDATE ON public.user_stocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();