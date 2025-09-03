-- Additional hardening for all financial data tables

-- 1. Strengthen plaid_accounts table policies
DROP POLICY IF EXISTS "Users can view their own Plaid accounts" ON public.plaid_accounts;
DROP POLICY IF EXISTS "Users can insert their own Plaid accounts" ON public.plaid_accounts;
DROP POLICY IF EXISTS "Users can update their own Plaid accounts" ON public.plaid_accounts;
DROP POLICY IF EXISTS "Users can delete their own Plaid accounts" ON public.plaid_accounts;

-- Create super strict policies for plaid_accounts with additional validation
CREATE POLICY "Authenticated users can view their own plaid accounts with validation" 
ON public.plaid_accounts 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  AND is_active = true 
  AND NOT public.detect_suspicious_access(auth.uid())
);

CREATE POLICY "Authenticated users can insert their own plaid accounts with validation" 
ON public.plaid_accounts 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND NOT public.detect_suspicious_access(auth.uid())
);

CREATE POLICY "Authenticated users can update their own plaid accounts with validation" 
ON public.plaid_accounts 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id 
  AND NOT public.detect_suspicious_access(auth.uid())
);

CREATE POLICY "Service role only can delete plaid accounts" 
ON public.plaid_accounts 
FOR DELETE 
TO service_role
USING (true);

-- 2. Strengthen dividend_transactions policies  
DROP POLICY IF EXISTS "Users can view their own dividend transactions" ON public.dividend_transactions;
DROP POLICY IF EXISTS "Users can insert their own dividend transactions" ON public.dividend_transactions;
DROP POLICY IF EXISTS "Users can update their own dividend transactions" ON public.dividend_transactions;
DROP POLICY IF EXISTS "Users can delete their own dividend transactions" ON public.dividend_transactions;

CREATE POLICY "Authenticated users can view their own dividend transactions" 
ON public.dividend_transactions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own dividend transactions" 
ON public.dividend_transactions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update dividend transactions" 
ON public.dividend_transactions 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Service role can delete dividend transactions" 
ON public.dividend_transactions 
FOR DELETE 
TO service_role
USING (true);

-- 3. Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_financial_access(
  table_name TEXT,
  operation TEXT,
  user_id_accessed UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if it's a different user or suspicious activity
  IF auth.uid() != user_id_accessed OR public.detect_suspicious_access(auth.uid()) THEN
    -- In a real implementation, this would go to a secure audit log
    RAISE LOG 'SECURITY: Financial data access - Table: %, Operation: %, User: %, Target: %', 
      table_name, operation, auth.uid(), user_id_accessed;
  END IF;
END;
$$;

-- 4. Add data masking for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_financial_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Return masked version for logging/debugging
  IF LENGTH(data) > 8 THEN
    RETURN LEFT(data, 4) || '****' || RIGHT(data, 4);
  ELSE
    RETURN '****';
  END IF;
END;
$$;

-- 5. Create additional validation for high-value transactions
CREATE OR REPLACE FUNCTION public.validate_high_value_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Flag transactions over $10,000 for additional review
  IF NEW.amount > 10000 THEN
    -- Log high-value transaction
    PERFORM public.log_financial_access('dividend_transactions', 'high_value_insert', NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply high-value transaction trigger
DROP TRIGGER IF EXISTS high_value_transaction_trigger ON public.dividend_transactions;
CREATE TRIGGER high_value_transaction_trigger
  BEFORE INSERT ON public.dividend_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_high_value_transaction();