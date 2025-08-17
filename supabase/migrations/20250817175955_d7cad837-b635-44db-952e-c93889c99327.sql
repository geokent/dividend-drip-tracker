-- Security hardening: remove plaintext Plaid access tokens and clean up policies

-- 1) Encrypt any remaining plaintext tokens before dropping the column
DO $$
BEGIN
  -- Only run if the access_token column still exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plaid_accounts' AND column_name = 'access_token'
  ) THEN
    -- Encrypt any tokens that don't have an encrypted value yet
    UPDATE public.plaid_accounts
    SET 
      access_token_encrypted = public.encrypt_sensitive_data(access_token),
      is_encrypted = TRUE,
      encryption_version = 1,
      token_last_rotated = now(),
      updated_at = now()
    WHERE access_token IS NOT NULL
      AND (access_token_encrypted IS NULL OR access_token_encrypted = '');
  END IF;
END $$;

-- 2) Drop any RLS policy that references the plaintext column
DROP POLICY IF EXISTS "Restrict sensitive token access to account owners" ON public.plaid_accounts;

-- 3) Drop the plaintext access_token column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plaid_accounts' AND column_name = 'access_token'
  ) THEN
    ALTER TABLE public.plaid_accounts DROP COLUMN access_token;
  END IF;
END $$;

-- 4) Ensure clean RLS policies for secure access
-- Create a simple, secure policy for user access (drop first if exists)
DROP POLICY IF EXISTS "Users can view their own Plaid accounts" ON public.plaid_accounts;
CREATE POLICY "Users can view their own Plaid accounts"
ON public.plaid_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- 5) Normalize encryption flags to reflect current state
UPDATE public.plaid_accounts
SET is_encrypted = TRUE,
    encryption_version = COALESCE(encryption_version, 1)
WHERE access_token_encrypted IS NOT NULL AND is_encrypted IS DISTINCT FROM TRUE;