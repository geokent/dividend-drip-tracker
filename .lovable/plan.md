

# Fix: Missing Stock ID in Dashboard Mapping

## Problem
Two stock mapping locations in `DividendDashboard.tsx` omit `id: stock.id`, causing the edit handler to receive `undefined` and show "Unable to edit stock. Please refresh the page."

## Changes (single file: `src/components/DividendDashboard.tsx`)

### Edit 1 -- Initial fetch mapping (~line 97)
```
Before:
const formattedStocks = stocks.map(stock => ({
  symbol: stock.symbol,
  ...

After:
const formattedStocks = stocks.map(stock => ({
  id: stock.id,
  symbol: stock.symbol,
  ...
```

### Edit 2 -- Sync investments reload mapping (~line 596)
```
Before:
const formattedStocks = fetchedStocks.map(stock => ({
  symbol: stock.symbol,
  ...

After:
const formattedStocks = fetchedStocks.map(stock => ({
  id: stock.id,
  symbol: stock.symbol,
  ...
```

No other files or database changes needed. Both edits are single-line additions.

