-- Enable RLS on exit_intent_leads table
ALTER TABLE public.exit_intent_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert leads (for exit intent capture)
CREATE POLICY "Anyone can submit exit intent leads" 
ON public.exit_intent_leads 
FOR INSERT 
WITH CHECK (true);

-- Only service role can view/manage leads
CREATE POLICY "Service role can manage exit intent leads" 
ON public.exit_intent_leads 
FOR ALL 
USING ((auth.jwt() ->> 'role') = 'service_role');