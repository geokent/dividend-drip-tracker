-- Phase 1: Critical Security Fixes

-- 1. Protect Plaid Token Access
-- Create a safe view that excludes encrypted token data
CREATE OR REPLACE VIEW public.plaid_accounts_safe AS
SELECT 
  id,
  user_id,
  account_id,
  item_id,
  account_name,
  account_type,
  institution_name,
  institution_id,
  is_active,
  is_encrypted,
  encryption_version,
  token_last_rotated,
  token_expires_at,
  access_count,
  created_at,
  updated_at
FROM public.plaid_accounts;

COMMENT ON VIEW public.plaid_accounts_safe IS 
'Safe view of plaid_accounts that excludes access_token_encrypted. Use this for client queries.';

-- Grant SELECT on safe view to authenticated users
GRANT SELECT ON public.plaid_accounts_safe TO authenticated;

-- 2. Protect Financial Audit Logs from deletion/tampering
CREATE POLICY "Only service role can delete audit logs"
ON public.plaid_access_logs
FOR DELETE
USING ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Only service role can update audit logs"
ON public.plaid_access_logs
FOR UPDATE
USING ((auth.jwt() ->> 'role') = 'service_role');

-- 3. Create rate limiting infrastructure
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint_created 
ON public.rate_limit_log(ip_address, endpoint, created_at DESC);

-- Enable RLS on rate_limit_log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limit logs
CREATE POLICY "Service role can manage rate limit logs"
ON public.rate_limit_log
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Rate limit check function (5 requests per hour for public endpoints)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address inet,
  p_endpoint text,
  p_max_requests integer DEFAULT 5,
  p_window_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count integer;
  is_limited boolean;
BEGIN
  -- Count requests from this IP in the time window
  SELECT COUNT(*) INTO request_count
  FROM public.rate_limit_log
  WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;
  
  -- Check if limit exceeded
  is_limited := request_count >= p_max_requests;
  
  -- Log this request if not limited
  IF NOT is_limited THEN
    INSERT INTO public.rate_limit_log (ip_address, endpoint)
    VALUES (p_ip_address, p_endpoint);
  ELSE
    -- Log the rate limit violation
    RAISE LOG 'SECURITY: Rate limit exceeded - IP: %, Endpoint: %, Count: %', 
      p_ip_address, p_endpoint, request_count;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', NOT is_limited,
    'request_count', request_count,
    'limit', p_max_requests,
    'window_minutes', p_window_minutes,
    'retry_after_minutes', CASE 
      WHEN is_limited THEN p_window_minutes - EXTRACT(EPOCH FROM (now() - (
        SELECT created_at FROM public.rate_limit_log
        WHERE ip_address = p_ip_address AND endpoint = p_endpoint
        ORDER BY created_at DESC LIMIT 1
      )))::integer / 60
      ELSE 0
    END
  );
END;
$$;

-- Cleanup function for old rate limit logs (run via cron or periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_log
  WHERE created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'Cleaned up % old rate limit log entries', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Log token access for audit purposes
CREATE OR REPLACE FUNCTION public.log_token_access(
  p_user_id uuid,
  p_account_id text,
  p_access_type text DEFAULT 'decrypt'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive token access
  RAISE LOG 'SECURITY: Token access - User: %, Account: %, Type: %', 
    p_user_id, p_account_id, p_access_type;
  
  -- Record in plaid_access_logs
  PERFORM public.log_plaid_access(
    p_user_id,
    'token_decryption',
    p_account_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- Update get_decrypted_access_token to include audit logging
CREATE OR REPLACE FUNCTION public.get_decrypted_access_token(p_user_id uuid, p_account_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  encrypted_token TEXT;
  decrypted_token TEXT;
BEGIN
  -- Log the token access attempt
  PERFORM public.log_token_access(p_user_id, p_account_id, 'decrypt_request');
  
  -- Get the encrypted token for the specific user and account
  SELECT access_token_encrypted INTO encrypted_token
  FROM public.plaid_accounts
  WHERE user_id = p_user_id AND account_id = p_account_id AND is_active = TRUE;
  
  IF encrypted_token IS NULL THEN
    RAISE LOG 'SECURITY: No encrypted token found for user % and account %', p_user_id, p_account_id;
    RETURN NULL;
  END IF;
  
  -- Decrypt and return the token
  decrypted_token := public.decrypt_sensitive_data(encrypted_token);
  
  IF decrypted_token IS NULL THEN
    RAISE LOG 'SECURITY: Failed to decrypt token for user % and account %', p_user_id, p_account_id;
  ELSE
    -- Log successful decryption
    PERFORM public.log_token_access(p_user_id, p_account_id, 'decrypt_success');
  END IF;
  
  RETURN decrypted_token;
END;
$$;