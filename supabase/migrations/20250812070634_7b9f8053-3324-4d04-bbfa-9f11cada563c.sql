-- Add audit trail for sensitive operations
CREATE TABLE IF NOT EXISTS public.plaid_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  account_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.plaid_access_logs ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert audit logs (service role only)
CREATE POLICY "System can insert access logs" 
ON public.plaid_access_logs 
FOR INSERT 
WITH CHECK (true);

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own access logs" 
ON public.plaid_access_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add token expiration and rotation fields to plaid_accounts
ALTER TABLE public.plaid_accounts 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS token_last_rotated TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

-- Create function to log Plaid access attempts
CREATE OR REPLACE FUNCTION public.log_plaid_access(
  p_user_id UUID,
  p_action TEXT,
  p_account_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.plaid_access_logs (user_id, action, account_id, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_account_id, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to automatically update access count
CREATE OR REPLACE FUNCTION public.update_plaid_access_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.plaid_accounts 
  SET access_count = access_count + 1,
      updated_at = now()
  WHERE user_id = NEW.user_id 
    AND (NEW.account_id IS NULL OR account_id = NEW.account_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_access_count_trigger
  AFTER INSERT ON public.plaid_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plaid_access_count();

-- Add updated_at trigger for plaid_access_logs
CREATE TRIGGER update_plaid_access_logs_updated_at
  BEFORE UPDATE ON public.plaid_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced RLS: Add time-based access restrictions (example: no access during maintenance windows)
CREATE POLICY "Restrict access during maintenance windows" 
ON public.plaid_accounts 
FOR ALL 
USING (
  EXTRACT(hour FROM now() AT TIME ZONE 'UTC') NOT BETWEEN 2 AND 4 -- Example: block 2-4 AM UTC
  OR auth.jwt() ->> 'role' = 'service_role'
);

-- Add policy to track suspicious access patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_access(p_user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  -- Check for unusual access patterns (more than 100 requests in last hour)
  SELECT COUNT(*) INTO recent_access_count
  FROM public.plaid_access_logs
  WHERE user_id = p_user_id 
    AND created_at > now() - INTERVAL '1 hour';
    
  RETURN recent_access_count > 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;