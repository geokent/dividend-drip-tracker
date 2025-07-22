-- Create table for storing Plaid account connections
CREATE TABLE public.plaid_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT,
  account_subtype TEXT,
  mask TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Create table for storing dividend transactions from Plaid
CREATE TABLE public.dividend_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plaid_account_id UUID NOT NULL REFERENCES public.plaid_accounts(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  symbol TEXT,
  company_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.plaid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plaid_accounts
CREATE POLICY "Users can view their own Plaid accounts" 
ON public.plaid_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Plaid accounts" 
ON public.plaid_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Plaid accounts" 
ON public.plaid_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Plaid accounts" 
ON public.plaid_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for dividend_transactions
CREATE POLICY "Users can view their own dividend transactions" 
ON public.dividend_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dividend transactions" 
ON public.dividend_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dividend transactions" 
ON public.dividend_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dividend transactions" 
ON public.dividend_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_plaid_accounts_updated_at
BEFORE UPDATE ON public.plaid_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dividend_transactions_updated_at
BEFORE UPDATE ON public.dividend_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_plaid_accounts_user_id ON public.plaid_accounts(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON public.plaid_accounts(item_id);
CREATE INDEX idx_dividend_transactions_user_id ON public.dividend_transactions(user_id);
CREATE INDEX idx_dividend_transactions_date ON public.dividend_transactions(date);
CREATE INDEX idx_dividend_transactions_symbol ON public.dividend_transactions(symbol);