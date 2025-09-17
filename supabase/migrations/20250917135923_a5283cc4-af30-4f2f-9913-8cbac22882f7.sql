-- Create table for exit intent leads
CREATE TABLE public.exit_intent_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  guide_sent BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT
);

-- Create index for email lookups
CREATE INDEX idx_exit_intent_leads_email ON public.exit_intent_leads(email);
CREATE INDEX idx_exit_intent_leads_created_at ON public.exit_intent_leads(created_at DESC);