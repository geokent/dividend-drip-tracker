-- Add explicit SELECT policy for exit_intent_leads to restrict read access to service_role only
-- This prevents unauthorized users from viewing marketing lead data (emails, IPs, etc.)

CREATE POLICY "Service role can read exit intent leads"
ON public.exit_intent_leads
FOR SELECT
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add comment for documentation
COMMENT ON POLICY "Service role can read exit intent leads" ON public.exit_intent_leads IS 
'Restricts SELECT access to service_role only to protect marketing lead data from unauthorized access';