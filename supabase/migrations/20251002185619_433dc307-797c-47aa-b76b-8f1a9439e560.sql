-- Drop and recreate the plaid_accounts_safe view with proper security settings
DROP VIEW IF EXISTS public.plaid_accounts_safe;

CREATE VIEW public.plaid_accounts_safe
WITH (security_barrier = true, security_invoker = true)
AS
SELECT
  id,
  user_id,
  account_id,
  item_id,
  account_name,
  account_type,
  institution_name,
  institution_id,
  is_active,
  is_encrypted,
  encryption_version,
  token_last_rotated,
  token_expires_at,
  access_count,
  created_at,
  updated_at
FROM public.plaid_accounts;

COMMENT ON VIEW public.plaid_accounts_safe IS 'Safe view of plaid_accounts that excludes access_token_encrypted field. Security is enforced through the underlying plaid_accounts table RLS policies.';