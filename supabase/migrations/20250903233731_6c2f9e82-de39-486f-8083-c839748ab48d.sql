-- Fix the store_encrypted_access_token function to remove reference to dropped access_token column
CREATE OR REPLACE FUNCTION public.store_encrypted_access_token(
  p_user_id uuid, 
  p_account_id text, 
  p_access_token text, 
  p_item_id text, 
  p_account_name text DEFAULT NULL::text, 
  p_account_type text DEFAULT NULL::text, 
  p_institution_name text DEFAULT NULL::text, 
  p_institution_id text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  encrypted_token TEXT;
BEGIN
  -- Encrypt the access token
  encrypted_token := public.encrypt_sensitive_data(p_access_token);
  
  -- Store the encrypted token (removed access_token = NULL from the UPDATE)
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
    updated_at = now();
    
  RETURN TRUE;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Failed to store encrypted token: %', SQLERRM;
    RETURN FALSE;
END;
$function$;