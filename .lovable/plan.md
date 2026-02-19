

# Make Future Income Projects Page Publicly Accessible

## Change

Remove the `<ProtectedRoute>` wrapper from the `/future-income-projects` route in `src/App.tsx` so Googlebot (and unauthenticated visitors) can access the page.

### `src/App.tsx` (lines 44-46)

**Before:**
```tsx
<Route path="/future-income-projects" element={
  <ProtectedRoute>
    <FutureIncomeProjects />
  </ProtectedRoute>
} />
```

**After:**
```tsx
<Route path="/future-income-projects" element={<FutureIncomeProjects />} />
```

## Why this is safe
- The component already checks for `user` and gracefully handles `null` (skips DB queries, shows zeroed-out projection tools)
- No sensitive data is exposed to unauthenticated visitors
- Matches the pattern used by `/dividend-calendar` and `/stock-screener`

