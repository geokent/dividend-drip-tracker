-- Create saved_scenarios table for premium users to save and compare strategies
CREATE TABLE public.saved_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_investment INTEGER NOT NULL,
  portfolio_growth_rate DECIMAL(5,4) NOT NULL,
  dividend_growth_rate INTEGER NOT NULL,
  additional_yearly_contribution INTEGER DEFAULT 0,
  reinvest_dividends BOOLEAN DEFAULT true,
  monthly_expenses INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

-- Users can only see their own scenarios
CREATE POLICY "Users can view own scenarios" ON public.saved_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios" ON public.saved_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios" ON public.saved_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios" ON public.saved_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_scenarios_updated_at
  BEFORE UPDATE ON public.saved_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();