

# Remove "Refresh Holdings" Button from Portfolio Table

## Problem
The "Refresh Holdings" button in the Portfolio Holdings card header adds visual clutter, making the top of the card feel too busy.

## Change

### File: `src/components/PortfolioTable.tsx`

Remove the "Refresh Holdings" button block (lines ~176-198) -- the entire `TooltipProvider` wrapper containing the refresh button that appears when `onSyncInvestments && isConnected`.

The button's props (`onSyncInvestments`, `isSyncing`, `lastSyncedAt`) can optionally be cleaned up from the component interface, but since they may be used elsewhere or re-added later, I will leave the props in place and only remove the rendered button.

## Result
- Cleaner, less busy card header
- Brokerage data still syncs automatically via existing flows
- No functional loss -- users can still trigger a sync by reconnecting or refreshing the page
