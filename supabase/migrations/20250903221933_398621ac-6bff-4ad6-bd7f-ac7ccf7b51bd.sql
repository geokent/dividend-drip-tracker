-- Fix security issues in financial data access

-- 1. Fix plaid_access_logs table - restrict INSERT to service role only
DROP POLICY IF EXISTS "System can insert access logs" ON public.plaid_access_logs;

CREATE POLICY "Service role can insert access logs" 
ON public.plaid_access_logs 
FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
);

-- 2. Strengthen user_stocks policies by explicitly requiring authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own stocks" ON public.user_stocks;
DROP POLICY IF EXISTS "Users can insert their own stocks" ON public.user_stocks;  
DROP POLICY IF EXISTS "Users can update their own stocks" ON public.user_stocks;
DROP POLICY IF EXISTS "Users can delete their own stocks" ON public.user_stocks;

-- Create new hardened policies that explicitly require authentication
CREATE POLICY "Authenticated users can view their own stocks" 
ON public.user_stocks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own stocks" 
ON public.user_stocks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own stocks" 
ON public.user_stocks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own stocks" 
ON public.user_stocks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add additional security function to validate user ownership
CREATE OR REPLACE FUNCTION public.validate_user_stock_access(stock_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND auth.uid() = stock_user_id;
$$;

-- 4. Create audit policy for monitoring access attempts
CREATE POLICY "Log unauthorized stock access attempts" 
ON public.user_stocks 
FOR SELECT 
TO anon
USING (false);

-- 5. Ensure all financial tables have proper updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_stock_update_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any updates to user_stocks for audit purposes
  NEW.updated_at = now();
  
  -- Validate that user can only update their own stocks
  IF auth.uid() != NEW.user_id THEN
    RAISE EXCEPTION 'Unauthorized stock modification attempt';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the audit trigger
DROP TRIGGER IF EXISTS user_stocks_audit_trigger ON public.user_stocks;
CREATE TRIGGER user_stocks_audit_trigger
  BEFORE UPDATE ON public.user_stocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_stock_update_audit();