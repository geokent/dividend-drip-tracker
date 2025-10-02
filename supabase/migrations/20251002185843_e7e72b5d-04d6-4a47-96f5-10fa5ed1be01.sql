-- Remove unsafe or redundant view to eliminate RLS ambiguity
DROP VIEW IF EXISTS public.plaid_accounts_safe CASCADE;

-- Optional: explicitly REVOKE any lingering privileges (in case of replication delays)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'plaid_accounts_safe'
  ) THEN
    REVOKE ALL ON public.plaid_accounts_safe FROM PUBLIC, anon, authenticated;
  END IF;
END $$;