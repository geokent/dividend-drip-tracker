

# Plaid Integration Fix Plan

## Problem Summary
The Plaid integration appears broken because of a state synchronization bug. The user has an active Plaid account in the database (Charles Schwab), but the UI shows "Connect Account" instead of "Unlink Account" because no stocks were synced from that account.

## Root Causes

### 1. Connection Detection Logic Too Strict
**File:** `src/components/DividendDashboard.tsx` (lines 155-156)

The code requires both an active `plaid_accounts` record AND matching stocks in `user_stocks` with that `plaid_item_id`. If the sync failed or returned no investment positions, the account appears disconnected even though it's still linked.

**Current logic:**
```typescript
const activeItemIds = new Set(syncedStocks?.map(s => s.plaid_item_id) || []);
const activeAccounts = accounts.filter(account => account.is_active && activeItemIds.has(account.item_id));
```

### 2. Error Message Not Properly Parsed  
**File:** `src/components/PlaidLinkButton.tsx` (line 125)

The error check `error.message?.includes('Free tier limit reached')` fails because Supabase wraps the response as `FunctionsHttpError` without exposing the JSON body in the message.

---

## Solution

### Fix 1: Update Connection Detection Logic
Change the filter to consider accounts as "connected" if they have `is_active = true`, regardless of whether stocks exist:

```typescript
// Before: Required both active account AND synced stocks
const activeAccounts = accounts.filter(account => account.is_active && activeItemIds.has(account.item_id));

// After: Active account is sufficient to show as connected
const activeAccounts = accounts.filter(account => account.is_active);
```

This needs to be applied in multiple places in `DividendDashboard.tsx`:
- Line 156 (loadConnectedAccounts function)
- Line 302 (Plaid success handler)
- Line 699 (handlePlaidSuccess)
- Line 799 (handleStaleAccountsCleanup)

### Fix 2: Improve Error Handling for Edge Function Responses
Update `PlaidLinkButton.tsx` to properly extract the error message from the edge function response:

```typescript
// In createLinkToken function, after the invoke call:
if (error) {
  console.error('Link token creation error:', error);
  
  // Try to get the actual response body from the error context
  let errorMessage = 'Failed to initialize bank connection. Please try again.';
  
  try {
    // For FunctionsHttpError, check the context for response body
    if (error.context?.response) {
      const responseBody = await error.context.response.json();
      if (responseBody?.error === 'Free tier limit reached' || responseBody?.message?.includes('one institution')) {
        errorMessage = 'Free tier allows only one connected institution. Please disconnect your current institution first.';
      }
    }
  } catch (parseError) {
    // Fallback to checking error message string
    if (error.message?.includes('403')) {
      errorMessage = 'Free tier allows only one connected institution. Please disconnect your current institution first.';
    }
  }
  
  toast.error(errorMessage, { id: 'plaid-init' });
  return;
}
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/DividendDashboard.tsx` | Update 4 locations to remove the `activeItemIds.has()` requirement from the filter |
| `src/components/PlaidLinkButton.tsx` | Improve error handling to parse 403 responses and show the correct "free tier limit" message |

---

## Expected Outcome
1. Users with an active `plaid_accounts` record will see "Unlink Account" button instead of "Connect Account"
2. If a user tries to connect when already connected, they'll see a clear message about the free tier limit
3. The UI state will match the database state

