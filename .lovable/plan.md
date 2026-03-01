

# Fix: Show Navigation Links for Logged-Out Users

## Problem
The Header component hides Dividend Calendar, Income Projections, and Dashboard from the navigation when logged out because they have `requireAuth: true`. Only "Stock Screener" is visible to unauthenticated users, making the nav bar look empty.

Looking at `App.tsx`, Dividend Calendar and Income Projections are actually public routes (no `ProtectedRoute` wrapper), so they should be visible to everyone. Dashboard is the only truly protected route.

## Solution
In `src/components/Header.tsx`, change `requireAuth` to `false` for Dividend Calendar and Income Projections so they appear in the nav for all users. Keep Dashboard as `requireAuth: true` since it's behind a `ProtectedRoute`.

### Change (lines 12-17)
```typescript
const navigation = [
  { name: "Dashboard", href: "/dashboard", requireAuth: true },
  { name: "Dividend Calendar", href: "/dividend-calendar", requireAuth: false },
  { name: "Stock Screener", href: "/stock-screener", requireAuth: false },
  { name: "Income Projections", href: "/future-income-projects", requireAuth: false },
];
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Set `requireAuth: false` for Dividend Calendar and Income Projections |
