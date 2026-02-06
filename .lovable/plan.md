
# Fix: Improve Plaid Link Error Handling

## Problem
When the user is already connected to an institution, clicking "Connect Account" shows a confusing "Plaid Link error: undefined" toast because:
1. The edge function returns 403 (free tier limit reached)
2. The component handles the 403 gracefully but doesn't set `isLoading` back to false in all cases
3. The `usePlaidLink` hook receives an invalid token and throws an error with no `message` property
4. The error `useEffect` shows `error.message` which is `undefined`

## Solution
Two small changes to `PlaidLinkButton.tsx`:

### Change 1: Suppress Plaid SDK initialization errors (lines 103-110)
The Plaid SDK error is redundant when we've already shown a user-friendly error from `createLinkToken`. Only show Plaid SDK errors if they're meaningful.

```typescript
// Before:
useEffect(() => {
  if (error) {
    console.error('Plaid Link initialization error:', error);
    toast.error(`Plaid Link error: ${error.message}`);
    setIsLoading(false);
  }
}, [error]);

// After:
useEffect(() => {
  if (error) {
    console.error('Plaid Link initialization error:', error);
    // Only show error toast if it has a meaningful message
    // Suppress generic errors when token creation already failed
    if (error.message && !error.message.includes('undefined')) {
      toast.error(`Connection issue: ${error.message}`);
    }
    setIsLoading(false);
    setLinkToken(null); // Clear invalid token
  }
}, [error]);
```

### Change 2: Ensure loading state is reset after 403 error (line 148-149)
Add explicit loading state reset after showing the free tier error message.

```typescript
// After line 148 (toast.error for free tier limit):
toast.error(errorMessage, { id: 'plaid-init' });
setIsLoading(false); // Ensure loading stops
return;
```

## Files Changed
- `src/components/PlaidLinkButton.tsx` - 2 small edits

## Result
- No more confusing "undefined" error toasts
- User sees clear "Free tier allows only one connected institution" message
- Loading spinner stops properly
- Clean, professional user experience
