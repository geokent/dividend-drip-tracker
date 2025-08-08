-- Create table for storing Plaid account connections
CREATE TABLE public.plaid_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  account_id TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT,
  institution_name TEXT,
  institution_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Enable Row Level Security
ALTER TABLE public.plaid_accounts ENABLE ROW LEVEL SECURITY;

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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_plaid_accounts_updated_at
BEFORE UPDATE ON public.plaid_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_plaid_accounts_user_id ON public.plaid_accounts(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON public.plaid_accounts(item_id);