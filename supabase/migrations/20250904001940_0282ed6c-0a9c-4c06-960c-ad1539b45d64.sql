-- Fix crypto functions to use proper pgcrypto schema references
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text, key_name text DEFAULT 'PLAID_ENCRYPTION_KEY'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  encryption_key text;
  iv_bytes bytea;
  encrypted_with_iv bytea;
begin
  -- Use configured key if present; otherwise a default (will be replaced by edge functions in the future)
  encryption_key := coalesce(current_setting('app.encryption_key', true), 'default_key_replace_in_production');

  -- Generate random IV using pgcrypto, qualified to work with empty search_path
  iv_bytes := extensions.gen_random_bytes(16);

  -- Encrypt data (AES-CBC) with IV prepended, using pgcrypto functions
  encrypted_with_iv := iv_bytes || extensions.encrypt(
    data::bytea,
    extensions.digest(encryption_key, 'sha256'),
    'aes-cbc'
  );

  return encode(encrypted_with_iv, 'base64');
end;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text, key_name text DEFAULT 'PLAID_ENCRYPTION_KEY'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  encryption_key text;
  encrypted_with_iv bytea;
  iv_bytes bytea;
  encrypted_bytes bytea;
  decrypted_bytes bytea;
begin
  encryption_key := coalesce(current_setting('app.encryption_key', true), 'default_key_replace_in_production');

  -- Decode base64 and split IV + ciphertext
  encrypted_with_iv := decode(encrypted_data, 'base64');
  iv_bytes := substring(encrypted_with_iv from 1 for 16);
  encrypted_bytes := substring(encrypted_with_iv from 17);

  -- Decrypt using pgcrypto functions (AES-CBC)
  decrypted_bytes := extensions.decrypt(
    encrypted_bytes,
    extensions.digest(encryption_key, 'sha256'),
    'aes-cbc'
  );

  return convert_from(decrypted_bytes, 'UTF8');
exception
  when others then
    raise log 'Decryption failed for data: %', SQLERRM;
    return null;
end;
$function$;