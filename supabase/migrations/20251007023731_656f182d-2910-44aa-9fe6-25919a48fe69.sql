-- Drop the overly restrictive SELECT policies that block account visibility
DROP POLICY IF EXISTS "Authenticated users can view their own plaid accounts with vali" ON public.plaid_accounts;
DROP POLICY IF EXISTS "Authenticated users can access encrypted tokens with strict val" ON public.plaid_accounts;

-- Create a simple, straightforward SELECT policy for viewing account info
CREATE POLICY "Users can view their own plaid accounts" 
ON public.plaid_accounts 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  AND is_active = true
);