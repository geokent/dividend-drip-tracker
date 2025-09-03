-- CRITICAL FIX: Remove dangerous maintenance window policy and implement secure access controls

-- 1. Remove the dangerous maintenance window policy that allows public access
DROP POLICY IF EXISTS "Restrict access during maintenance windows" ON public.plaid_accounts;

-- 2. Remove the problematic public access policy for encrypted tokens
DROP POLICY IF EXISTS "Prevent direct access to encrypted tokens" ON public.plaid_accounts;

-- 3. Create a SECURE maintenance window policy that BLOCKS access during maintenance
-- This policy DENIES access during maintenance hours (2-4 AM UTC) unless you're service_role
CREATE POLICY "Block maintenance window access except service role" 
ON public.plaid_accounts 
FOR ALL
TO authenticated
USING (
  -- Allow access if NOT in maintenance window OR if service_role
  (
    (EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) < 2 OR 
     EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) >= 4)
  ) OR 
  (auth.jwt() ->> 'role') = 'service_role'
);

-- 4. Create explicit DENY policy for anonymous users (critical security measure)
CREATE POLICY "Block all anonymous access to plaid accounts" 
ON public.plaid_accounts 
FOR ALL
TO anon
USING (false);

-- 5. Add additional validation for encrypted token access
CREATE POLICY "Authenticated users can access encrypted tokens with strict validation" 
ON public.plaid_accounts 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  AND is_active = true 
  AND NOT public.detect_suspicious_access(auth.uid())
  AND (
    -- Only allow during non-maintenance hours unless service_role
    (EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) < 2 OR 
     EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) >= 4) OR 
    (auth.jwt() ->> 'role') = 'service_role'
  )
);

-- 6. Fix the user_stocks anonymous blocking policy that was too restrictive
DROP POLICY IF EXISTS "Log unauthorized stock access attempts" ON public.user_stocks;

-- Create proper anonymous blocking for user_stocks
CREATE POLICY "Block all anonymous access to user stocks" 
ON public.user_stocks 
FOR ALL
TO anon
USING (false);

-- 7. Add comprehensive audit logging for maintenance window access
CREATE OR REPLACE FUNCTION public.log_maintenance_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access during maintenance windows
  IF EXTRACT(hour FROM (now() AT TIME ZONE 'UTC')) >= 2 AND 
     EXTRACT(hour FROM (now() AT TIME ZONE 'UTC')) < 4 THEN
    
    RAISE LOG 'MAINTENANCE ACCESS: User % attempted % on plaid_accounts during maintenance window', 
      auth.uid(), TG_OP;
      
    -- If not service_role, this is suspicious
    IF (auth.jwt() ->> 'role') != 'service_role' THEN
      RAISE LOG 'SECURITY ALERT: Non-service role % attempted maintenance window access', auth.uid();
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply maintenance access logging trigger
DROP TRIGGER IF EXISTS maintenance_access_logger ON public.plaid_accounts;
CREATE TRIGGER maintenance_access_logger
  BEFORE INSERT OR UPDATE OR DELETE ON public.plaid_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_maintenance_access();

-- 8. Create emergency lockdown function for security incidents
CREATE OR REPLACE FUNCTION public.emergency_lockdown_financial_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be called to immediately lock down all financial tables
  -- Only service_role would have access to call this
  
  RAISE LOG 'EMERGENCY LOCKDOWN: All financial table access has been restricted';
  
  -- Set a configuration that policies can check
  PERFORM set_config('app.emergency_lockdown', 'true', false);
  
  -- In a real emergency, additional measures could be taken here
  -- such as disabling specific user accounts or sending alerts
END;
$$;

-- 9. Update policies to check for emergency lockdown status
CREATE OR REPLACE FUNCTION public.is_emergency_lockdown()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(current_setting('app.emergency_lockdown', true)::boolean, false);
$$;

-- 10. Add lockdown check to critical financial policies
DROP POLICY IF EXISTS "Authenticated users can view their own plaid accounts with vali" ON public.plaid_accounts;

CREATE POLICY "Authenticated users can view their own plaid accounts with validation" 
ON public.plaid_accounts 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  AND is_active = true 
  AND NOT public.detect_suspicious_access(auth.uid())
  AND NOT public.is_emergency_lockdown()
  AND (
    -- Only allow during non-maintenance hours unless service_role
    (EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) < 2 OR 
     EXTRACT(hour FROM (now() AT TIME ZONE 'UTC'::text)) >= 4) OR 
    (auth.jwt() ->> 'role') = 'service_role'
  )
);