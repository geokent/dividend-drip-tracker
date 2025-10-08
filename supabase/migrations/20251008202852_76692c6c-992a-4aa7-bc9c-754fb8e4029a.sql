-- Fix security issue: Restrict SELECT access on exit_intent_leads to service role only
-- This prevents competitors or malicious actors from stealing marketing leads

-- First, drop the redundant SELECT policy (the ALL policy already covers SELECT)
DROP POLICY IF EXISTS "Service role can read exit intent leads" ON public.exit_intent_leads;

-- Add explicit deny policy for SELECT operations for all non-service-role users
-- This ensures that anonymous and authenticated users cannot read the leads
CREATE POLICY "Block all non-service-role SELECT access on exit intent leads"
  ON public.exit_intent_leads
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- The existing policies remain:
-- 1. "Anyone can submit exit intent leads" (INSERT) - allows the exit intent modal to work
-- 2. "Service role can manage exit intent leads" (ALL) - allows edge functions to read/manage leads

-- Add a comment to document this security measure
COMMENT ON TABLE public.exit_intent_leads IS 'Marketing leads captured from exit intent modal. SELECT access restricted to service_role only to prevent lead theft.';
