-- Activate existing investment accounts for the user so they can sync their holdings
UPDATE plaid_accounts 
SET is_active = true, updated_at = now()
WHERE account_type = 'investment';