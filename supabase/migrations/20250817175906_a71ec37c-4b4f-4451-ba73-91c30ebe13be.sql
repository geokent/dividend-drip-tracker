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
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'plaid_accounts' 
      AND policyname = 'Restrict sensitive token access to account owners'
  ) THEN
    EXECUTE 'DROP POLICY "Restrict sensitive token access to account owners" ON public.plaid_accounts';
  END IF;
END $$;

-- 3) Drop the plaintext access_token column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plaid_accounts' AND column_name = 'access_token'
  ) THEN
    EXECUTE 'ALTER TABLE public.plaid_accounts DROP COLUMN access_token';
  END IF;
END $$;

-- 4) Ensure a clear, safe SELECT policy remains for owners only (idempotent)
--    This avoids accidental broad access and keeps behavior consistent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'plaid_accounts' 
      AND policyname = 'Users can view their own Plaid accounts'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view their own Plaid accounts"
      ON public.plaid_accounts
      FOR SELECT
      USING (auth.uid() = user_id);
    $$;
  END IF;
END $$;

-- 5) Optional: normalize flags to reflect encryption state
UPDATE public.plaid_accounts
SET is_encrypted = TRUE,
    encryption_version = COALESCE(encryption_version, 1)
WHERE access_token_encrypted IS NOT NULL AND is_encrypted IS DISTINCT FROM TRUE;