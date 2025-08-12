-- Drop the problematic security definer view and recreate it properly
DROP VIEW IF EXISTS public.plaid_accounts_safe;

-- Create a regular view without security definer (this respects RLS policies)
CREATE VIEW public.plaid_accounts_safe AS
SELECT 
  id,
  user_id,
  account_id,
  account_name,
  account_type,
  institution_name,
  institution_id,
  is_active,
  token_last_rotated,
  access_count,
  encryption_version,
  is_encrypted,
  created_at,
  updated_at
FROM public.plaid_accounts;

-- The view will automatically inherit RLS policies from the underlying table
-- Grant access to the safe view
GRANT SELECT ON public.plaid_accounts_safe TO authenticated;