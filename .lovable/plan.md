
# Keep Separate Entries for Manual and Plaid Stocks

## Overview
Allow the same stock symbol to exist twice in your portfolio - once from manual entry and once from connected brokerage. This supports users who have the same stock in multiple brokerages.

## Changes Required

### 1. Update sync-dividends Edge Function
**File:** `supabase/functions/sync-dividends/index.ts`

Currently, the function checks if a symbol exists for the user regardless of source:
```typescript
const { data: existingStock } = await supabase
  .from('user_stocks')
  .select('*')
  .eq('user_id', user_id)
  .eq('symbol', symbol)
  .maybeSingle()  // Only expects one row
```

**Change to:** Look for existing Plaid entries from the same institution only:
```typescript
const { data: existingPlaidStock } = await supabase
  .from('user_stocks')
  .select('*')
  .eq('user_id', user_id)
  .eq('symbol', symbol)
  .eq('source', 'plaid_sync')
  .eq('plaid_item_id', account.item_id)
  .maybeSingle()
```

This means:
- If no Plaid entry exists for this symbol/institution combo, INSERT a new row (even if manual entry exists)
- If a Plaid entry exists for this symbol/institution, UPDATE it
- Manual entries are completely untouched

### 2. Update PortfolioTable Display
**File:** `src/components/PortfolioTable.tsx`

Add visual distinction for duplicate symbols:
- Show the source clearly (already partially implemented with institution name)
- Consider grouping or showing subtotals for same symbols
- Add a badge or indicator when the same symbol appears from multiple sources

### 3. Remove or Update Reconciliation Logic
The current reconciliation metadata update (lines 377-391) can be removed since we're keeping entries separate rather than merging.

## Technical Details

### Database Impact
- No schema changes needed - `user_stocks` already supports multiple rows per symbol
- The current unique constraint is on `id` (UUID), not on `(user_id, symbol)`, so duplicates are allowed

### Edge Cases Handled
- Same stock in Schwab (Plaid) + manual entry = 2 rows
- Same stock in Schwab + Fidelity (future Plaid connections) = 2 Plaid rows (different item_ids)
- Re-syncing updates existing Plaid entry, doesn't create duplicates

## Expected Result After Fix
| Symbol | Source | Shares | Institution |
|--------|--------|--------|-------------|
| DIVO   | Manual | 460.1  | (user added) |
| DIVO   | Plaid  | 46.5   | Schwab |
| JEPQ   | Manual | 732.7  | (user added) |
| JEPQ   | Plaid  | 880.5  | Schwab |
| O      | Plaid  | 150.0  | Schwab |

All 8 Schwab stocks will appear, plus your manual entries remain unchanged.
