-- Fix search path security warnings by adding SECURITY DEFINER and search_path settings to all functions
DROP FUNCTION IF EXISTS public.update_plaid_access_count();
DROP FUNCTION IF EXISTS public.detect_suspicious_access(UUID);
DROP FUNCTION IF EXISTS public.log_plaid_access(UUID, TEXT, TEXT, INET, TEXT);

-- Recreate functions with proper security settings
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate access count function with proper security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate suspicious access detection function with proper security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate the trigger with the updated function
DROP TRIGGER IF EXISTS update_access_count_trigger ON public.plaid_access_logs;
CREATE TRIGGER update_access_count_trigger
  AFTER INSERT ON public.plaid_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plaid_access_count();