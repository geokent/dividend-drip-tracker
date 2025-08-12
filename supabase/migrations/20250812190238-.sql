-- CRITICAL SECURITY FIX: Restrict access to plaid_accounts to only account owners
-- The current "Prevent direct access to encrypted tokens" policy allows ALL authenticated users
-- to read banking access tokens, which is a serious security vulnerability

-- Drop the overly permissive policy that allows all authenticated users access
DROP POLICY IF EXISTS "Prevent direct access to encrypted tokens" ON public.plaid_accounts;

-- Recreate the policy to only allow users to access their own accounts
CREATE POLICY "Prevent direct access to encrypted tokens" 
ON public.plaid_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also ensure the access_token and access_token_encrypted columns are properly protected
-- Add a more restrictive policy specifically for sensitive token columns
CREATE POLICY "Restrict sensitive token access to account owners" 
ON public.plaid_accounts 
FOR SELECT 
USING (auth.uid() = user_id AND (access_token IS NULL OR access_token_encrypted IS NULL OR auth.uid() = user_id));