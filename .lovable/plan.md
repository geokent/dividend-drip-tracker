

# Fix: "AI-Powered Analysis" Badge Misleading Cursor

## Problem
The "AI-Powered Analysis BETA" badge at the top of the Income Projections page uses `cursor-help` (the `?` cursor), which implies it is clickable. Users naturally try to click it, but nothing happens -- it is only a tooltip trigger that shows information on hover.

## Fix

### File: `src/pages/FutureIncomeProjects.tsx` (line 668)

Change `cursor-help` to `cursor-default` on the badge's wrapper `div`. This removes the misleading `?` cursor while keeping the hover tooltip fully functional.

**Before:**
```
cursor-help hover:shadow-lg transition-all duration-300 group
```

**After:**
```
cursor-default hover:shadow-lg transition-all duration-300 group
```

## Result
- The tooltip still appears on hover, explaining what "AI-Powered Analysis" means
- The cursor no longer suggests the element is clickable
- No functional changes -- purely a UX improvement
