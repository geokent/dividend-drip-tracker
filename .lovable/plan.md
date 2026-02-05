

# Fix Plaid Disconnect When Token Decryption Fails

## Problem
When you try to unlink your Plaid account, the edge function fails with "Failed to decrypt access token" (500 error). This happens because:

1. Your access token was encrypted with a key that no longer matches
2. The disconnect function **requires** decryption to succeed before proceeding
3. This blocks you from unlinking the account, even though unlinking doesn't actually require the token

## Solution
Make the disconnect operation **resilient to decryption failures**. If we can't decrypt the token, we simply skip calling Plaid's API and proceed with deactivating the account in our database.

---

## Code Change

**File:** `supabase/functions/plaid-disconnect-item/index.ts`

**Current behavior (lines 85-91):**
```typescript
if (decryptError || !decryptedToken) {
  console.error('Token decryption error:', decryptError)
  return new Response(  // <-- BLOCKS the entire operation
    JSON.stringify({ error: 'Failed to decrypt access token' }),
    { status: 500, ... }
  )
}
```

**New behavior:**
```typescript
let plaidRemoveSuccess = false;

if (decryptError || !decryptedToken) {
  console.warn('Token decryption failed, skipping Plaid API call. Will still deactivate in database.', decryptError);
  // Continue to database cleanup without calling Plaid API
} else {
  // Call Plaid's item/remove endpoint only if we have the token
  const removeResponse = await fetch(`${plaidApiHost}/item/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID') ?? '',
      'PLAID-SECRET': Deno.env.get('PLAID_SECRET') ?? '',
    },
    body: JSON.stringify({ access_token: decryptedToken }),
  });
  
  if (removeResponse.ok) {
    plaidRemoveSuccess = true;
    console.log('Successfully removed item from Plaid');
  } else {
    console.error('Plaid item removal error:', await removeResponse.json());
    // Continue with database cleanup even if Plaid call fails
  }
}

// Always proceed to deactivate the account in our database
```

---

## Why This is Safe

| Scenario | What Happens |
|----------|--------------|
| Token decrypts successfully | Calls Plaid API to revoke, then deactivates in DB |
| Token decryption fails | Skips Plaid API, still deactivates in DB |
| Plaid API call fails | Logs error, still deactivates in DB |

In all cases, the account gets deactivated in your database, which is what matters for the UI. The Plaid API call is a "nice to have" for security (revokes the token on Plaid's side), but not required for the disconnect to work.

---

## Expected Result
After this fix:
1. You'll be able to click "Unlink Account" and it will succeed
2. The account will be deactivated in the database
3. You can then reconnect with a fresh token that will encrypt/decrypt properly

