
-- Ensure pgcrypto is enabled (safe if it already exists)
create extension if not exists pgcrypto;

-- Fix encryption function to explicitly use pgcrypto/public-qualified calls
create or replace function public.encrypt_sensitive_data(data text, key_name text default 'PLAID_ENCRYPTION_KEY')
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  encryption_key text;
  iv_bytes bytea;
  encrypted_with_iv bytea;
begin
  -- Use configured key if present; otherwise a default (will be replaced by edge functions in the future)
  encryption_key := coalesce(current_setting('app.encryption_key', true), 'default_key_replace_in_production');

  -- Generate random IV using pgcrypto, qualified to work with empty search_path
  iv_bytes := public.gen_random_bytes(16);

  -- Encrypt data (AES-CBC) with IV prepended, using pgcrypto functions
  encrypted_with_iv := iv_bytes || public.encrypt(
    data::bytea,
    public.digest(encryption_key, 'sha256'),
    'aes-cbc'
  );

  return encode(encrypted_with_iv, 'base64');
end;
$function$;

-- Fix decryption function similarly
create or replace function public.decrypt_sensitive_data(encrypted_data text, key_name text default 'PLAID_ENCRYPTION_KEY')
returns text
language plpgsql
security definer
set search_path to ''
as $function$
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
  decrypted_bytes := public.decrypt(
    encrypted_bytes,
    public.digest(encryption_key, 'sha256'),
    'aes-cbc'
  );

  return convert_from(decrypted_bytes, 'UTF8');
exception
  when others then
    raise log 'Decryption failed for data: %', SQLERRM;
    return null;
end;
$function$;
