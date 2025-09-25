-- Drop and recreate the store_encrypted_access_token function with better error handling
DROP FUNCTION IF EXISTS public.store_encrypted_access_token(uuid,text,text,text,text,text,text,text);

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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  encrypted_token TEXT;
  error_details TEXT;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE LOG 'store_encrypted_access_token: user_id is null';
    RETURN jsonb_build_object('success', false, 'error', 'user_id cannot be null');
  END IF;
  
  IF p_account_id IS NULL OR p_account_id = '' THEN
    RAISE LOG 'store_encrypted_access_token: account_id is null or empty for user %', p_user_id;
    RETURN jsonb_build_object('success', false, 'error', 'account_id cannot be null or empty');
  END IF;
  
  IF p_access_token IS NULL OR p_access_token = '' THEN
    RAISE LOG 'store_encrypted_access_token: access_token is null or empty for user % account %', p_user_id, p_account_id;
    RETURN jsonb_build_object('success', false, 'error', 'access_token cannot be null or empty');
  END IF;
  
  IF p_item_id IS NULL OR p_item_id = '' THEN
    RAISE LOG 'store_encrypted_access_token: item_id is null or empty for user % account %', p_user_id, p_account_id;
    RETURN jsonb_build_object('success', false, 'error', 'item_id cannot be null or empty');
  END IF;

  -- Encrypt the access token
  BEGIN
    encrypted_token := public.encrypt_sensitive_data(p_access_token);
    IF encrypted_token IS NULL OR encrypted_token = '' THEN
      RAISE LOG 'store_encrypted_access_token: encryption returned null/empty for user % account %', p_user_id, p_account_id;
      RETURN jsonb_build_object('success', false, 'error', 'Failed to encrypt access token');
    END IF;
  EXCEPTION
    WHEN others THEN
      error_details := SQLERRM;
      RAISE LOG 'store_encrypted_access_token: encryption failed for user % account %: %', p_user_id, p_account_id, error_details;
      RETURN jsonb_build_object('success', false, 'error', 'Encryption failed: ' || error_details);
  END;
  
  -- Store the encrypted token
  BEGIN
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
      
    RAISE LOG 'store_encrypted_access_token: successfully stored account % for user % with item %', p_account_id, p_user_id, p_item_id;
    RETURN jsonb_build_object('success', true, 'message', 'Account stored successfully');
    
  EXCEPTION
    WHEN unique_violation THEN
      error_details := SQLERRM;
      RAISE LOG 'store_encrypted_access_token: unique violation for user % account %: %', p_user_id, p_account_id, error_details;
      RETURN jsonb_build_object('success', false, 'error', 'Account already exists: ' || error_details);
    WHEN check_violation THEN
      error_details := SQLERRM;
      RAISE LOG 'store_encrypted_access_token: check violation for user % account %: %', p_user_id, p_account_id, error_details;
      RETURN jsonb_build_object('success', false, 'error', 'Data validation failed: ' || error_details);
    WHEN others THEN
      error_details := SQLERRM;
      RAISE LOG 'store_encrypted_access_token: database error for user % account %: %', p_user_id, p_account_id, error_details;
      RETURN jsonb_build_object('success', false, 'error', 'Database error: ' || error_details);
  END;
END;
$function$;

-- Add a helper function to validate plaid account connectivity
CREATE OR REPLACE FUNCTION public.validate_plaid_account_connectivity(p_user_id uuid, p_item_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  account_count INTEGER;
  encrypted_count INTEGER;
  active_count INTEGER;
BEGIN
  -- Check how many accounts are stored for this item
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE access_token_encrypted IS NOT NULL AND is_encrypted = true) as encrypted,
    COUNT(*) FILTER (WHERE is_active = true) as active
  INTO account_count, encrypted_count, active_count
  FROM public.plaid_accounts 
  WHERE user_id = p_user_id AND item_id = p_item_id;
  
  RETURN jsonb_build_object(
    'total_accounts', account_count,
    'encrypted_accounts', encrypted_count,
    'active_accounts', active_count,
    'fully_connected', (account_count > 0 AND account_count = encrypted_count AND account_count = active_count)
  );
END;
$function$;