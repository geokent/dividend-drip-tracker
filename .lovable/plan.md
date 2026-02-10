
# Fix Sector Display Logic in Dividend Calendar

## Problem
The code on lines 750 and 777 converts valid "ETF" sector labels to "Unknown", making the Sector column useless for ETF-heavy portfolios. The fix preserves the column and makes it valuable for all users.

## Changes (all in `src/pages/DividendCalendar.tsx`)

### 1. Stop converting "ETF" to "Unknown" (lines 750, 777)

**Line 750** (Plaid data path):
```
Before: sector: (stock.sector && stock.sector !== 'ETF') ? stock.sector : 'Unknown',
After:  sector: stock.sector || '-',
```

**Line 777** (fallback data path):
```
Before: sector: (div.sector && div.sector !== 'ETF') ? div.sector : 'Unknown',
After:  sector: div.sector || '-',
```

This keeps "ETF" as-is, keeps valid sectors like "Real Estate" as-is, and shows "-" for null/empty values.

### 2. Update dynamicSectors filter logic (lines 822-834)

Update to exclude "-" from the filter list (it's a display placeholder, not a filterable category), and stop special-casing "Unknown":

```typescript
const dynamicSectors = useMemo(() => {
  const sectorSet = new Set<string>();
  dataSource.forEach(entry => {
    if (entry.sector && entry.sector !== '-') {
      sectorSet.add(entry.sector);
    }
  });
  return ['All Sectors', ...Array.from(sectorSet).sort()];
}, [dataSource]);
```

This means "ETF" will now appear as a filter option alongside any real sectors.

### 3. Add diversification tip below the table (after line 1189)

Add a small tip note after the table card:

```tsx
<p className="text-xs text-muted-foreground text-center mt-2 mb-6">
  Tip: Diversify across sectors to reduce risk
</p>
```

## Result
- ETFs show "ETF" instead of "Unknown"
- Individual stocks show their real sector (e.g., "Real Estate", "Technology")
- Null/empty sectors show "-" (clean, not misleading)
- Sector filter includes "ETF" as a selectable option
- Users can filter to see only ETFs or only specific sectors
- Subtle diversification tip added

## Files Changed
- `src/pages/DividendCalendar.tsx` -- 4 small edits
