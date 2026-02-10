

# Fix Dividend Calendar: Correct Date and Add Annual Income

## Findings Summary

1. **Annual dividend data is accurate** -- the math checks out for all active stocks (monthly x12, quarterly x4). Stale entries with 0 shares are already filtered out.
2. **Duplicate merging works correctly** -- manual + Plaid entries for the same symbol are combined into one calendar row with summed shares/payouts. This is the right behavior for a calendar view.
3. **Date fix is safe** -- the hardcoded date only affects two filter locations. No other features are impacted.

---

## Changes

### File: `src/pages/DividendCalendar.tsx`

### 1. Fix Hardcoded Date (2 locations)

Replace `new Date("2026-01-21")` with `new Date()` on lines 837 and 876 so the calendar filters from today's actual date.

### 2. Add Annual Portfolio Income Stat

Add a calculation that sums `annual_dividend * shares` across all user stocks (the raw `userStocks` array, before filtering), giving the true yearly income figure. Display this as a new stat card labeled "Annual Portfolio Income."

This uses the already-fetched `userStocks` state, so no additional database queries are needed. The deduplication for the annual total will sum across manual + Plaid entries naturally since both contribute their `annual_dividend * shares`.

### 3. Clarify "Your Expected Income" Label

Rename the existing "Your Expected Income" card to "Income in Range" so users understand it reflects only the currently filtered time window, not total annual income.

---

## Technical Details

- **No database changes** required
- **No edge function changes** required  
- Only `src/pages/DividendCalendar.tsx` is modified (3 small edits)
- Annual income calculation: `userStocks.reduce((sum, s) => sum + (Number(s.annual_dividend || 0) * Number(s.shares || 0)), 0)`

