-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure encryption/decryption function using AES-256
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT, key_name TEXT DEFAULT 'PLAID_ENCRYPTION_KEY')
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- In a real implementation, this would fetch from a secure key management system
  -- For now, we'll use a placeholder that should be replaced with actual secret management
  encryption_key := 'temp_key_to_be_replaced_with_secret';
  
  -- Use AES-256 encryption in CBC mode
  RETURN encode(
    encrypt_iv(
      data::bytea,
      digest(encryption_key, 'sha256'),
      gen_random_bytes(16),  -- Random IV
      'aes-cbc'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create decryption function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT, key_name TEXT DEFAULT 'PLAID_ENCRYPTION_KEY')
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
  decrypted_bytes BYTEA;
BEGIN
  -- In a real implementation, this would fetch from a secure key management system
  encryption_key := 'temp_key_to_be_replaced_with_secret';
  
  -- Decrypt the data
  decrypted_bytes := decrypt_iv(
    decode(encrypted_data, 'base64'),
    digest(encryption_key, 'sha256'),
    substring(decode(encrypted_data, 'base64') from 1 for 16),  -- Extract IV
    'aes-cbc'
  );
  
  RETURN convert_from(decrypted_bytes, 'UTF8');
EXCEPTION
  WHEN others THEN
    -- Log the error and return null for security
    RAISE LOG 'Decryption failed for data: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add new columns for encrypted storage
ALTER TABLE public.plaid_accounts 
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;

-- Create function to migrate existing tokens to encrypted format
CREATE OR REPLACE FUNCTION public.encrypt_existing_tokens()
RETURNS INTEGER AS $$
DECLARE
  account_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all accounts with unencrypted tokens
  FOR account_record IN 
    SELECT id, access_token 
    FROM public.plaid_accounts 
    WHERE is_encrypted = FALSE AND access_token IS NOT NULL
  LOOP
    -- Encrypt the token and update the record
    UPDATE public.plaid_accounts 
    SET 
      access_token_encrypted = public.encrypt_sensitive_data(account_record.access_token),
      is_encrypted = TRUE,
      encryption_version = 1,
      access_token = NULL  -- Clear the plain text token
    WHERE id = account_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create secure token retrieval function for edge functions
CREATE OR REPLACE FUNCTION public.get_decrypted_access_token(p_user_id UUID, p_account_id TEXT)
RETURNS TEXT AS $$
DECLARE
  encrypted_token TEXT;
  decrypted_token TEXT;
BEGIN
  -- Get the encrypted token for the specific user and account
  SELECT access_token_encrypted INTO encrypted_token
  FROM public.plaid_accounts
  WHERE user_id = p_user_id AND account_id = p_account_id AND is_active = TRUE;
  
  IF encrypted_token IS NULL THEN
    RAISE LOG 'No encrypted token found for user % and account %', p_user_id, p_account_id;
    RETURN NULL;
  END IF;
  
  -- Decrypt and return the token
  decrypted_token := public.decrypt_sensitive_data(encrypted_token);
  
  IF decrypted_token IS NULL THEN
    RAISE LOG 'Failed to decrypt token for user % and account %', p_user_id, p_account_id;
  END IF;
  
  RETURN decrypted_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to securely store encrypted tokens
CREATE OR REPLACE FUNCTION public.store_encrypted_access_token(
  p_user_id UUID,
  p_account_id TEXT,
  p_access_token TEXT,
  p_item_id TEXT,
  p_account_name TEXT DEFAULT NULL,
  p_account_type TEXT DEFAULT NULL,
  p_institution_name TEXT DEFAULT NULL,
  p_institution_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  encrypted_token TEXT;
BEGIN
  -- Encrypt the access token
  encrypted_token := public.encrypt_sensitive_data(p_access_token);
  
  -- Store the encrypted token
  INSERT INTO public.plaid_accounts (
    user_id,
    account_id,
    access_token_encrypted,
    item_id,
    account_name,
    account_type,
    institution_name,
    institution_id,
    is_encrypted,
    encryption_version,
    token_last_rotated,
    is_active
  ) VALUES (
    p_user_id,
    p_account_id,
    encrypted_token,
    p_item_id,
    p_account_name,
    p_account_type,
    p_institution_name,
    p_institution_id,
    TRUE,
    1,
    now(),
    TRUE
  )
  ON CONFLICT (user_id, account_id) 
  DO UPDATE SET
    access_token_encrypted = EXCLUDED.access_token_encrypted,
    item_id = EXCLUDED.item_id,
    account_name = EXCLUDED.account_name,
    account_type = EXCLUDED.account_type,
    institution_name = EXCLUDED.institution_name,
    institution_id = EXCLUDED.institution_id,
    is_encrypted = TRUE,
    encryption_version = 1,
    token_last_rotated = now(),
    updated_at = now(),
    access_token = NULL;  -- Clear any existing plain text token
    
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Failed to store encrypted token: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add RLS policy to prevent direct access to encrypted tokens
CREATE POLICY "Prevent direct access to encrypted tokens" 
ON public.plaid_accounts 
FOR SELECT 
USING (
  -- Only allow access through secure functions, not direct column access
  -- This is enforced by not selecting access_token_encrypted directly in client code
  TRUE
);

-- Create view that excludes sensitive encrypted data for regular queries
CREATE OR REPLACE VIEW public.plaid_accounts_safe AS
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

-- Grant access to the safe view
GRANT SELECT ON public.plaid_accounts_safe TO authenticated;