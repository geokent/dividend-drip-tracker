-- Drop the existing overly permissive policy that allows ALL operations with true
DROP POLICY IF EXISTS "dividend_data_modify_policy" ON public.dividend_data;

-- Create restrictive policy: Only service_role can modify dividend data
CREATE POLICY "Service role can modify dividend data"
ON public.dividend_data
FOR ALL
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));