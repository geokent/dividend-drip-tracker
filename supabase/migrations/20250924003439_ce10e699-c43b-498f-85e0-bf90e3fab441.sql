-- Add new fields to user_stocks table for enhanced dividend tracking
ALTER TABLE public.user_stocks 
ADD COLUMN IF NOT EXISTS next_ex_dividend_date date,
ADD COLUMN IF NOT EXISTS dividend_frequency text DEFAULT 'unknown';

-- Add index for dividend frequency filtering
CREATE INDEX IF NOT EXISTS idx_user_stocks_dividend_frequency 
ON public.user_stocks(dividend_frequency);

-- Add index for next dividend date filtering (for upcoming dividends feature)
CREATE INDEX IF NOT EXISTS idx_user_stocks_next_ex_dividend_date 
ON public.user_stocks(next_ex_dividend_date) 
WHERE next_ex_dividend_date IS NOT NULL;